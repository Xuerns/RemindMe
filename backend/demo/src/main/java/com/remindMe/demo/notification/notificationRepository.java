package com.remindMe.demo.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface notificationRepository
        extends JpaRepository<notificationEntity,String> {

    List<notificationEntity> findByUser_IdAndIsSentFalse(String userId);
    List<notificationEntity> findByUser_Id(String userId);

}