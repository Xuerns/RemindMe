package com.remindMe.demo.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class notificationController {

    private final notificationService notificationService;

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<notificationEntity>> getUnread(
            @PathVariable String userId) {
        try {
            List<notificationEntity> notifs = notificationService.getUnread(userId);
            return ResponseEntity.ok(notifs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
            return ResponseEntity.ok(notifs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{notifId}")
    public ResponseEntity<Void> deleteNotif(
          @PathVariable String notifId) {
        try {
          notificationService.deleteNotif(notifId);
          return ResponseEntity.ok().build(); // 200
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<Void> clearAll(
           @PathVariable String userId) {
        try {
          notificationService.clearAll(userId);
          return ResponseEntity.ok().build(); // 200
        } catch (Exception e) {
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }
}