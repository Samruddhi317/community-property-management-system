
package com.community.management.controller;

import com.community.management.entity.Booking;
import com.community.management.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    private Map<String, Object> toResponse(Booking booking) {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", booking.getId());
        result.put("roomName", booking.getRoomName());
        result.put("startTime", booking.getStartTime());
        result.put("endTime", booking.getEndTime());
        result.put("status", booking.getStatus());

        return result;
    }

    // Admin: View all bookings
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Map<String, Object>> result = bookingService.getAll()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    // View bookings by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getByUser(
            @PathVariable Long userId) {

        List<Map<String, Object>> result = bookingService.getByUser(userId)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    // Create booking
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Booking booking) {

        Booking saved = bookingService.create(booking);
        return ResponseEntity.ok(toResponse(saved));
    }

    // Admin: Approve or reject booking
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam Booking.BookingStatus status) {

        Booking updated = bookingService.updateStatus(id, status);
        return ResponseEntity.ok(toResponse(updated));
    }

    // Cancel booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        bookingService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
