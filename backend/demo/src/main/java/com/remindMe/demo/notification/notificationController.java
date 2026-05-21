package com.remindMe.demo.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class notificationController {

    private final notificationService notificationService;

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<notificationEntity>> getUnread(
            @PathVariable String userId) {
        try {
            List<notificationEntity> notifs = notificationService.getUnread(userId);
            if (notifs.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404
            }
            return ResponseEntity.ok(notifs); // 200
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

    @PutMapping("/read/{userId}")
    public ResponseEntity<Void> markRead(
            @PathVariable String userId) {
        try {
            notificationService.markAllRead(userId);
            return ResponseEntity.ok().build(); // 200
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

    @PutMapping("/read/all/{userId}")
    public ResponseEntity<Void> markAllRead(
            @PathVariable String userId) {
        try {
            notificationService.markAllRead(userId);
            return ResponseEntity.ok().build(); // 200
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

    @GetMapping("/all/{userId}")
    public ResponseEntity<List<notificationEntity>> getAll(
            @PathVariable String userId) {
        try {
            List<notificationEntity> notifs = notificationService.getAll(userId);
            if (notifs.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404
            }
            return ResponseEntity.ok(notifs); // 200
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }
}