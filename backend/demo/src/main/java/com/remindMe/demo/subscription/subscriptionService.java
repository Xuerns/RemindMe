package com.remindMe.demo.subscription;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.UUID; //untuk generate id yang varchar(255)
import java.util.List;

@Service // Menandakan bahwa class ini adalah Service component di Spring Boot
@RequiredArgsConstructor // Lombok: otomatis membuat constructor untuk inject repositor

public class subscriptionService {
    private final subscriptionRepository subscriptionRepo;

    public void updateSubscription(String id, subscriptionEntity sub) {
        subscriptionEntity existSub = subscriptionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription dengan ID " + id + " tidak ditemukan"));
        existSub.setName(sub.getName());
        existSub.setCategory(sub.getCategory());
        existSub.setPrice(sub.getPrice());
        existSub.setActive(sub.isActive());
        existSub.setDuDate(sub.getDuDate());
        existSub.setStatus(sub.getStatus());
        subscriptionRepo.save(existSub);
    }

    public List<subscriptionEntity> getAll(String userId) {
        return subscriptionRepo.findByUserId(userId);
    }

    public List<subscriptionEntity> search(String keyword) {
        return subscriptionRepo.searchByKeyword(keyword);
    }

    public List<subscriptionEntity> getByCategory(String category) {
        return subscriptionRepo.findByCategory(category);
    }

    public List<subscriptionEntity> getTop3ByPrice(String userId) {
        return subscriptionRepo.findTop3ByUserIdOrderByPriceDesc(userId, PageRequest.of(0, 3));
    }

    public Double getTotalMonthly(String userId) {
        return subscriptionRepo.getTotalMonthlyByUserId(userId);
    }

    public Long countSubscriptions(String userId) {
        return subscriptionRepo.countByUserId(userId);
    }

    public void updateStatus(String id, String status) {
        subscriptionEntity sub = subscriptionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription tidak ditemukan"));
        sub.setStatus(subscriptionEntity.statusSubs.valueOf(status));
        subscriptionRepo.save(sub);
    }

    // method untuk menambahkan subscription
    public subscriptionEntity addSubscription(subscriptionEntity sub) {
        if (sub.getId() == null || sub.getId().isEmpty()) {
            sub.setId(UUID.randomUUID().toString());

        }

        return subscriptionRepo.save(sub);
    }

    public String deleteSubscription(String name) {
        subscriptionEntity sub = subscriptionRepo.findByName(name)
                .orElseThrow(() -> new RuntimeException("Subscription dengan nama " + name + " tidak ditemukan"));

        String realId = sub.getId();

        subscriptionRepo.deleteById(realId);

        return "Subscription dengan nama: " + name + " berhasil dihapus!";
    }
}
