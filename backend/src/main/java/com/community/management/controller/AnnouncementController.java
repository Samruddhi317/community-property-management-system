package com.community.management.controller;

import com.community.management.entity.Announcement;
import com.community.management.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Map<String, Object>> result = announcementService.getAll()
                .stream()
                .map(a -> Map.<String, Object>of(
                        "id", a.getId(),
                        "title", a.getTitle(),
                        "content", a.getContent(),
                        "postedAt", a.getPostedAt(),
                        "postedBy", Map.of(
                                "fullName", a.getPostedBy().getFullName()
                        )
                ))
                .toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Announcement announcement) {

        Announcement saved = announcementService.create(announcement);

        Map<String, Object> result = Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "content", saved.getContent(),
                "postedAt", saved.getPostedAt(),
                "postedBy", Map.of(
                        "fullName", saved.getPostedBy().getFullName()
                )
        );

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}