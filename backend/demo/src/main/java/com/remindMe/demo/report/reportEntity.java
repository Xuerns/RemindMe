package com.remindMe.demo.report;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.subscription.subscriptionEntity;

@Entity
@Table(name = "reports")
public class reportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private LocalDate generatedDate;

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
    private List<subscriptionEntity> subscriptions = new ArrayList<>(); 
}