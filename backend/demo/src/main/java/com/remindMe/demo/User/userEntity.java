package com.remindMe.demo.user;

import jakarta.persistence.*;
import java.util.List;
import com.remindMe.demo.subscription.subscriptionEntity;
import com.remindMe.demo.report.reportEntity;
import com.remindMe.demo.notification.notificationEntity;

@Entity
@Table(name = "users")
public class userEntity {

    @Id
    private String id;

    private String username;
    private String email;
    private String password;
    private String type;

    // MANY TO MANY (user_subscriptions)
    @ManyToMany
    @JoinTable(
        name = "user_subscriptions",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "subscription_id")
    )
    private List<subscriptionEntity> subscriptions;

    // ONE TO MANY → notifications
    @OneToMany(mappedBy = "user")
    private List<notificationEntity> notifications;

    // ONE TO MANY → reports
    @OneToMany(mappedBy = "user")
    private List<reportEntity> reports;
}