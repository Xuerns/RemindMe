
package com.remindMe.demo.subscription;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Flow.Subscription;

@RestController // Menandakan class ini adalah REST API Controller
@RequestMapping("/api/subscriptions") // Base URL untuk semua endpoint di class ini
@RequiredArgsConstructor // Lombok otomatis membuatkan constructor untuk dependency injection
public class subscriptionController {
    private final subscriptionService subscriptionService;
    @Autowired
    private subscriptionRepository subscriptionRepository;

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
        List<subscriptionEntity> results = subscriptionService.search(keyword);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/user/{userId}/top3")
    public ResponseEntity<List<subscriptionEntity>> getTop3(@PathVariable String userId) {
        return ResponseEntity.ok(subscriptionService.getTop3ByPrice(userId));
    }

    @GetMapping("/user/{userId}/total-monthly")
    public ResponseEntity<Double> getTotalMonthly(@PathVariable String userId) {
        return ResponseEntity.ok(subscriptionService.getTotalMonthly(userId));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> countSubscriptions(@PathVariable String userId) {
        return ResponseEntity.ok(subscriptionService.countSubscriptions(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable String id, @RequestParam String status) {
        subscriptionService.updateStatus(id, status);
        return ResponseEntity.ok("Status berhasil diupdate!");
    }

    @PostMapping("/add")
    public subscriptionEntity addSubscription(@RequestBody subscriptionEntity subscription) {

        return subscriptionService.addSubscription(subscription); // memasukkan isi dari subscription ke method add di
                                                                  // service
    }

    @DeleteMapping("/delete/{name}")
    public String deleteSubscription(@PathVariable String name) {
        return subscriptionService.deleteSubscription(name);
    }

}
