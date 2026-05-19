package com.remindMe.demo.report;

import jakarta.persistence.*;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.List;
import java.util.Date;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.subscription.subscriptionEntity;

@Entity
@Table(name = "reports")
public class reportEntity {

    @Id
    private String id;

    private int month;
    private int year;

    @Temporal(TemporalType.DATE);
    private Date generatedDate;

    // MANY TO ONE → user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private userEntity user;

    // MANY TO MANY (report_subscriptions)
    @ManyToMany
    @JoinTable(
        name = "report_subscriptions",
        joinColumns = @JoinColumn(name = "report_id"),
        inverseJoinColumns = @JoinColumn(name = "subscription_id")
    )
    private List<subscriptionEntity> subscriptions;
}