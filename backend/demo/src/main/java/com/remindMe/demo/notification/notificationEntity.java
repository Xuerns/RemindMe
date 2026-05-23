package com.remindMe.demo.notification;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.subscription.subscriptionEntity;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "notifications")
public class notificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;


    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private LocalDate scheduledAt;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isSent;

    // MANY TO ONE → user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private userEntity user;

    // MANY TO ONE → subscription
    @ManyToOne
    @JoinColumn(name = "subscription_id")
    private subscriptionEntity subscription;

    public void markAsSent() { 
        this.isSent = true;
    }
}