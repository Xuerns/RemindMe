package com.remindMe.demo.subscription;

import jakarta.persistence.*;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.report.reportEntity;
import com.remindMe.demo.notification.notificationEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

// Kala mau liat penjelsan tentang code code yang dipakai ini, bisa liat ke userEntity.java
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subscriptions")
public class subscriptionEntity {

    public enum statusSubs {
        PAID,
        UPCOMING,
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private LocalDate duDate;

    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private boolean isActive;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private userEntity user;

    @Enumerated(EnumType.STRING)
    private statusSubs status;

    // MANY TO MANY (report_subscriptions)
    @ManyToMany(mappedBy = "subscriptions")
    private List<reportEntity> reports;

    // ONE TO MANY → notifications
    @OneToMany(mappedBy = "subscription")
    @JsonIgnore
    private List<notificationEntity> notifications;
}