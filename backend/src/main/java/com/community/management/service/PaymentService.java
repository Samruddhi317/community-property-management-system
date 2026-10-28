
package com.community.management.service;

import com.community.management.entity.Payment;
import com.community.management.entity.User;
import com.community.management.exception.ResourceNotFoundException;
import com.community.management.repository.PaymentRepository;
import com.community.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    // Admin only: View all payments
    public List<Payment> getAllPayments() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Authentication required");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException(
                    "Only Admin can view all payments"
            );
        }

        return paymentRepository.findAll();
    }

    // Admin can view any user's payments.
    // Other authenticated users can view only their own payments.
    public List<Payment> getByUser(Long userId) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Authentication required");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            User loggedInUser = userRepository.findByEmail(
                    authentication.getName()
            ).orElseThrow(() ->
                    new ResourceNotFoundException("Logged-in user not found"));

            if (!loggedInUser.getId().equals(userId)) {
                throw new AccessDeniedException(
                        "You can only view your own payments"
                );
            }
        }

        return paymentRepository.findByPaidByIdOrderByCreatedAtDesc(userId);
    }

    // Create payment for a resident.
    @Transactional
    public Payment create(Payment payment) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Authentication required");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException(
                    "Only Admin can create payments"
            );
        }

        if (payment.getPaidBy() == null
                || payment.getPaidBy().getId() == null) {
            throw new IllegalArgumentException("Resident ID is required");
        }

        User resident = userRepository.findById(
                payment.getPaidBy().getId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("Resident not found"));

        payment.setPaidBy(resident);
        payment.setId(null);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setPaidAt(null);
        payment.setStatus(Payment.PaymentStatus.PENDING);

        return paymentRepository.save(payment);
    }

    // Only Admin can mark a payment as paid.
    @Transactional
    public Payment markAsPaid(Long id) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Authentication required");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException(
                    "Only Admin can mark a payment as paid"
            );
        }

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found: " + id
                        ));

        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            return payment;
        }

        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }
}
