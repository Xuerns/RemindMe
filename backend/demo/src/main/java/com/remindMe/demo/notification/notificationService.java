package com.remindMe.demo.notification;

import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.User.userRepository;
import com.remindMe.demo.subscription.subscriptionEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service 
@RequiredArgsConstructor
public class notificationService{
    private final notificationRepository notificationRepo;
    private final userRepository userRepository;

    public void scheduleReminder(subscriptionEntity sub) {
        LocalDate today = LocalDate.now();
        long daysLeft = today.until(sub.getDuDate()).getDays();

        if (daysLeft >= 0 && daysLeft <= 7){
            notificationEntity notif = new notificationEntity();
            notif.setUser(sub.getUser());
            notif.setSubscription(sub);
            notif.setMessage("Subscription \"" + sub.getName() +  "\" kamu akan jatuh tempo dalam " + daysLeft + " hari!");
            notif.setScheduledAt(today);
            notif.markAsSent();
            notificationRepo.save(notif);

        }
    }

    public void sendInApp(String userId,String message){
        userEntity user = userRepository.findById(userId)   
                .orElseThrow(() -> new RuntimeException("User not found: " + userId)); 
                
        notificationEntity notif = new notificationEntity();
        notif.setUser(user);
        notif.setMessage(message);
        notif.setScheduledAt(LocalDate.now());
        notif.markAsSent();
        notificationRepo.save(notif);
    }

    public List<notificationEntity> getUnread(String userId) {
        return notificationRepo.findByUser_IdAndIsSentFalse(userId);
    }

    public void markAllRead(String userId){
        List<notificationEntity> notifs = notificationRepo.findByUser_Id(userId);
        notifs.forEach(notificationEntity::markAsSent);
        notificationRepo.saveAll(notifs);
    }
    public List<notificationEntity> getAll(String userId) {
        return notificationRepo.findByUser_Id(userId);
    }
}