package com.community.management.service;

import com.community.management.entity.Announcement;
import com.community.management.entity.User;
import com.community.management.exception.ResourceNotFoundException;
import com.community.management.repository.AnnouncementRepository;
import com.community.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByPostedAtDesc();
    }

    public Announcement create(Announcement announcement) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        String email = authentication.getName();

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + email));

        announcement.setPostedBy(admin);
        announcement.setPostedAt(java.time.LocalDateTime.now());

        return announcementRepository.save(announcement);
    }

    public void delete(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Announcement not found: " + id);
        }

        announcementRepository.deleteById(id);
    }
}