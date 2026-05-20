package com.remindMe.demo.subscription;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;




@RestController // Menandakan class ini adalah REST API Controller
@RequestMapping("/api/subscriptions") // Base URL untuk semua endpoint di class ini
@RequiredArgsConstructor // Lombok otomatis membuatkan constructor untuk dependency injection
public class subscriptionController{
    private final subscriptionService subscriptionService;

    @PutMapping("/{id}")
    public ResponseEntity<String> updateSubscription(@PathVariable String id, @RequestBody subscriptionEntity sub) {
        subscriptionService.updateSubscription(id, sub);
        return ResponseEntity.ok("Subscription berhasil diupdate!");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<subscriptionEntity>> getSubscription(@PathVariable String userId) {
        List<subscriptionEntity> subscription = subscriptionService.getAll(userId);
        return ResponseEntity.ok(subscription);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<subscriptionEntity>> searchSubscription(@RequestParam String keyword) {
        List <subscriptionEntity> results = subscriptionService.search(keyword);
        return ResponseEntity.ok(results);
    }
    
}