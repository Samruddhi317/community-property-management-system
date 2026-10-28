
package com.community.management.service;

import com.community.management.entity.Booking;
import com.community.management.entity.User;
import com.community.management.exception.ResourceNotFoundException;
import com.community.management.repository.BookingRepository;
import com.community.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    public List<Booking> getByUser(Long userId) {
        return bookingRepository.findByBookedByIdOrderByStartTimeDesc(userId);
    }

    public Booking create(Booking booking) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalStateException("User is not authenticated");
        }

        String email = authentication.getName();

        User resident = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + email));

        checkRoomAvailability(booking);

        booking.setBookedBy(resident);

        return bookingRepository.save(booking);
    }

    public Booking updateStatus(Long id, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found: " + id));

        if (status == Booking.BookingStatus.APPROVED) {
            checkRoomAvailability(booking);
        }

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    private void checkRoomAvailability(Booking requestedBooking) {
        boolean conflict =
                bookingRepository
                        .existsByRoomNameAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                                requestedBooking.getRoomName(),
                                Booking.BookingStatus.APPROVED,
                                requestedBooking.getEndTime(),
                                requestedBooking.getStartTime()
                        );

        if (conflict) {
            throw new IllegalStateException(
                    "This room is already booked for the selected time."
            );
        }
    }

    // Resident can cancel only their own pending booking
    public void cancel(Long id) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException(
                    "Please log in to cancel a booking."
            );
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found: " + id));

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (booking.getBookedBy() == null
                || !booking.getBookedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You can cancel only your own bookings."
            );
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending bookings can be cancelled."
            );
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}
