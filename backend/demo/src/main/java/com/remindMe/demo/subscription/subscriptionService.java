package com.remindMe.demo.subscription;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
// import java.util.List;

@Service // Menandakan bahwa class ini adalah Service component di Spring Boot
@RequiredArgsConstructor // Lombok: otomatis membuat constructor untuk inject repositor

public class subscriptionService{
    private final subscriptionRepository subscriptionRepo;
    
    public void updateSubscription(String id, subscriptionEntity sub){
        subscriptionEntity existSub = subscriptionRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Subscription dengan ID " + id + " tidak ditemukan"));
        existSub.setName(sub.getName());
        existSub.setCategory(sub.getCategory());
        existSub.setPrice(sub.getPrice());
        existSub.setActive(sub.isActive());
        existSub.setDuDate(sub.getDuDate());
        subscriptionRepo.save(existSub);
    }
    
    public void getAll(String userId){

    }
}

