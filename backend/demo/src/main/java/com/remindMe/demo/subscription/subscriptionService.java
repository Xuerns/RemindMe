package com.remindMe.demo.subscription;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.remindMe.demo.subscription.DTO.subscriptionRequest;
import com.remindMe.demo.User.userRepository;
import com.remindMe.demo.notification.notificationService;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.history.historyService;
import com.remindMe.demo.history.historyEntity;
import com.remindMe.demo.history.historyRepository;

import java.util.UUID; //untuk generate id yang varchar(255)
import java.util.List;
import java.time.LocalDate;


@Service // Menandakan bahwa class ini adalah Service component di Spring Boot
@RequiredArgsConstructor // Lombok: otomatis membuat constructor untuk inject repositor

public class subscriptionService {
    private final subscriptionRepository subscriptionRepo;
    private final userRepository userRepo;
    private final notificationService notificationService;
    private final historyService historyService;

    public void updateSubscription(String id, subscriptionRequest request) {
        subscriptionEntity existSub = subscriptionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription dengan ID " + id + " tidak ditemukan"));
        existSub.setName(request.getName());
        existSub.setCategory(request.getCategory());
        existSub.setPrice(request.getPrice());
        existSub.setActive(request.isActive());
        existSub.setDuDate(request.getDuDate());
        existSub.setStatus(subscriptionEntity.statusSubs.valueOf(request.getStatus()));
        existSub.setPeriod(subscriptionEntity.periodSubs.valueOf(request.getPeriod()));
        subscriptionRepo.save(existSub);
        try{
            notificationService.scheduleReminder(existSub);
        }catch(Exception e){

        }
    }

    public List<subscriptionEntity> getAll(String userId) {
        return subscriptionRepo.findByUserIdOrderByDuDate(userId);
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
    public subscriptionEntity addSubscription(subscriptionRequest request) {
        subscriptionEntity sub = new subscriptionEntity();

        sub.setName(request.getName());
        sub.setCategory(request.getCategory());
        sub.setPrice(request.getPrice());
        sub.setDuDate(request.getDuDate());
        sub.setStatus(subscriptionEntity.statusSubs.valueOf(request.getStatus()));
        sub.setActive(request.isActive());
        sub.setPeriod(subscriptionEntity.periodSubs.valueOf(request.getPeriod()));
        userEntity user = userRepo.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
        sub.setUser(user);
        // return subscriptionRepo.save(sub);
        subscriptionEntity saved = subscriptionRepo.save(sub);
        try{ 
            notificationService.scheduleReminder(saved);
        }catch(Exception E){

        }     

        try{
            historyEntity history = new historyEntity();
            history.setName(saved.getName());
            history.setCategory(saved.getCategory());
            history.setPrice(saved.getPrice());
            
            LocalDate paymentDate = saved.getDuDate();
            history.setStartDate(paymentDate);

            LocalDate calculatedEndDate = paymentDate;
            if (saved.getPeriod() != null){
                String periodName = saved.getPeriod().name();
                if (periodName.contains("THREE")){
                    calculatedEndDate = paymentDate.plusMonths(3);
                }else if (periodName.contains("SIX")){
                    calculatedEndDate = paymentDate.plusMonths(6);
                }else if (periodName.contains("TWELVE")){
                    calculatedEndDate = paymentDate.plusMonths(12);
                }
            }
            history.setEndDate(calculatedEndDate);
            history.setStatus(historyEntity.statusHistory.ACTIVE);
            history.setUser(user);

            historyService.addHistory(history);
        } catch(Exception e){
            System.out.println("Gagal menyimpan riwayat: " + e.getMessage());
        }

        return saved;
    }

    public String deleteSubscription(String id) {
        if(!subscriptionRepo.existsById(id)){
            throw new RuntimeException("Subscription tidak ditemukan");
        }
        subscriptionRepo.deleteById(id);
        return "Subscription dengan id:"+ id +"berhasil dihapus!";
    }
}
