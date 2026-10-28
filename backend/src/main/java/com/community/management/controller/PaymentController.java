
package com.community.management.controller;

import com.community.management.entity.Payment;
import com.community.management.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Admin only: View all payments
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Admin and Resident: View payment history
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RESIDENT')")
    public ResponseEntity<List<Payment>> getByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getByUser(userId));
    }

    // Admin only: Create payment
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> create(
            @RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.create(payment));
    }

    // Admin only: Mark payment as paid
    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> markAsPaid(
            @PathVariable Long id) {
        return ResponseEntity.ok(paymentService.markAsPaid(id));
    }
}
