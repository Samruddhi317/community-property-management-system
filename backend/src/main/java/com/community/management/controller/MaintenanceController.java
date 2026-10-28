
package com.community.management.controller;

import com.community.management.entity.MaintenanceRequest;
import com.community.management.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    private Map<String, Object> toResponse(MaintenanceRequest request) {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", request.getId());
        result.put("title", request.getTitle());
        result.put("description", request.getDescription());
        result.put("status", request.getStatus());
        result.put("submittedAt", request.getSubmittedAt());
        result.put("resolvedAt", request.getResolvedAt());

        return result;
    }

    // Admin and Staff can view all maintenance requests
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Map<String, Object>> result = maintenanceService.getAll()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    // Authenticated user can view only their own requests
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMyRequests() {
        List<Map<String, Object>> result = maintenanceService
                .getMyRequests()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    // Authenticated user can submit a maintenance request
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody MaintenanceRequest request) {

        MaintenanceRequest saved = maintenanceService.create(request);

        return ResponseEntity.ok(toResponse(saved));
    }

    // Only Admin and Staff can update request status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceRequest.RequestStatus status) {

        MaintenanceRequest updated =
                maintenanceService.updateStatus(id, status);

        return ResponseEntity.ok(toResponse(updated));
    }
}
