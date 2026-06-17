package com.remindMe.demo.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface notificationRepository
        extends JpaRepository<notificationEntity,String> {


    List<notificationEntity> findByUser_Id(String userId);
    List<notificationEntity> findByUser_IdOrderByScheduledAtDesc(String userId);
    boolean existsBySubscription_IdAndScheduledAt(String subscriptionId, LocalDate scheduledAt);
    List<notificationEntity> findByUser_IdAndIsSentFalseOrderByScheduledAtDesc(String userId);

}