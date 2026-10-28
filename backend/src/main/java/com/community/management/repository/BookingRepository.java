
package com.community.management.repository;

import com.community.management.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByBookedByIdOrderByStartTimeDesc(Long userId);

    boolean existsByRoomNameAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            String roomName,
            Booking.BookingStatus status,
            LocalDateTime requestedEndTime,
            LocalDateTime requestedStartTime
    );
}
