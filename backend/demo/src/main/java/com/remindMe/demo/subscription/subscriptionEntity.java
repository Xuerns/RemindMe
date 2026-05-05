package com.remindMe.demo.subscription;

import jakarta.persistence.*;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.List;
import java.util.Date;
import com.remindMe.demo.user.userEntity;
import com.remindMe.demo.report.reportEntity;
import com.remindMe.demo.notification.notificationEntity;

@Entity
@Table(name = "subscriptions")
public class subscriptionEntity {

    @Id
    private String id;

    private String name;
    private double price;

    @Temporal(TemporalType.DATE)
    private Date dueDate;

    private String category;
    private boolean isActive;

    // MANY TO MANY (user_subscriptions)
    @ManyToMany(mappedBy = "subscriptions")
    private List<userEntity> users;

    // MANY TO MANY (report_subscriptions)
    @ManyToMany(mappedBy = "subscriptions")
    private List<reportEntity> reports;

    // ONE TO MANY → notifications
    @OneToMany(mappedBy = "subscription")
    private List<notificationEntity> notifications;
}