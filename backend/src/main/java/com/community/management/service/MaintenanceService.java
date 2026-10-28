
package com.community.management.service;

import com.community.management.entity.MaintenanceRequest;
import com.community.management.entity.User;
import com.community.management.exception.ResourceNotFoundException;
import com.community.management.repository.MaintenanceRequestRepository;
import com.community.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MaintenanceRequest> getAll() {
        return maintenanceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRequest> getMyRequests() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalStateException("User is not authenticated");
        }

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Authenticated user not found"));

        return maintenanceRepository
                .findBySubmittedByIdOrderBySubmittedAtDesc(currentUser.getId());
    }

    @Transactional
    public MaintenanceRequest create(MaintenanceRequest request) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalStateException("User is not authenticated");
        }

        User resident = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found"));

        request.setId(null);
        request.setSubmittedBy(resident);
        request.setSubmittedAt(LocalDateTime.now());
        request.setStatus(MaintenanceRequest.RequestStatus.OPEN);
        request.setResolvedAt(null);

        return maintenanceRepository.save(request);
    }

    @Transactional
    public MaintenanceRequest updateStatus(
            Long id,
            MaintenanceRequest.RequestStatus status) {

        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Request not found: " + id));

        request.setStatus(status);

        if (status == MaintenanceRequest.RequestStatus.RESOLVED) {
            request.setResolvedAt(LocalDateTime.now());
        } else {
            request.setResolvedAt(null);
        }

        return maintenanceRepository.save(request);
    }
}
