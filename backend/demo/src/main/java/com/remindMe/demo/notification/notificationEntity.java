package com.remindMe.demo.notification;

import jakarta.persistence.*;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.subscription.subscriptionEntity;

@Entity
@Table(name = "notifications")
public class notificationEntity {

    @Id
    private String id;

    private String message;

    @Temporal(TemporalType.DATE)
    private Date scheduledDate;

    private boolean isSent;

    // MANY TO ONE → user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private userEntity user;

    // MANY TO ONE → subscription
    @ManyToOne
    @JoinColumn(name = "subscription_id")
    private subscriptionEntity subscription;
}