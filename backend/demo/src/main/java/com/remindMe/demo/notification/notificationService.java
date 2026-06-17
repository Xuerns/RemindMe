package com.remindMe.demo.notification;

import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.User.userRepository;
import com.remindMe.demo.subscription.subscriptionEntity;
import lombok.RequiredArgsConstructor;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

import com.remindMe.demo.subscription.subscriptionRepository;

@Service 
@RequiredArgsConstructor
public class notificationService{
    private final notificationRepository notificationRepo;
    private final userRepository userRepository;
    private final subscriptionRepository subscriptionRepo;

    public void scheduleReminder(subscriptionEntity sub) {
        LocalDate today = LocalDate.now();
        LocalDate duDate = sub.getDuDate();
        long daysLeft = today.until(duDate).getDays();

        if (daysLeft == 7 || daysLeft == 3 || daysLeft == 1){
            boolean alreadyExists = notificationRepo
                .existsBySubscription_IdAndScheduledAt(sub.getId(),today);

            if(!alreadyExists){
                 notificationEntity notif = new notificationEntity();
                 notif.setUser(sub.getUser());
                 notif.setSubscription(sub);
                 notif.setMessage("Subscription \"" + sub.getName() +  "\" kamu akan jatuh tempo dalam " + daysLeft + " hari!");
                 notif.setScheduledAt(today);    
                 notificationRepo.save(notif);
            }
        }
    }
    @Scheduled(cron = "0 0 7 * * *")
    public void checkAllSubscriptions() {
        List<subscriptionEntity> allSubs = subscriptionRepo.findAll();
        for (subscriptionEntity sub : allSubs) {
            if (sub.isActive()) {
                scheduleReminder(sub);
            }
        }
    }

    public void sendInApp(String userId,String message){
        userEntity user = userRepository.findById(userId)   
                .orElseThrow(() -> new RuntimeException("User not found: " + userId)); 
                
        notificationEntity notif = new notificationEntity();
        notif.setUser(user);
        notif.setMessage(message);
        notif.setScheduledAt(LocalDate.now());
        // notif.markAsSent();
        notificationRepo.save(notif);
    }

    public List<notificationEntity> getUnread(String userId) {
        return notificationRepo.findByUser_IdAndIsSentFalseOrderByScheduledAtDesc(userId);
    }

    public void markAllRead(String userId){
        List<notificationEntity> notifs = notificationRepo.findByUser_Id(userId);
        notifs.forEach(notificationEntity::markAsSent);
        notificationRepo.saveAll(notifs);
    }
    public void deleteNotif(String notifId) {
        notificationRepo.deleteById(notifId);
    }

    public void clearAll(String userId) {
        List<notificationEntity> notifs = notificationRepo.findByUser_Id(userId);
        notificationRepo.deleteAll(notifs);
    }

    public List<notificationEntity> getAll(String userId) {
        return notificationRepo.findByUser_IdOrderByScheduledAtDesc(userId);
    }
}   