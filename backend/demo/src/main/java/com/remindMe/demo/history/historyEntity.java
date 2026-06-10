package com.remindMe.demo.history;

import jakarta.persistence.*;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.remindMe.demo.User.userEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subscription_histories")
public class historyEntity{

    //status History
    public enum statusHistory{
        ACTIVE,
        CANCELED,
        EXPIRED,
        UPGRADED,
        DOWNGRADED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    //Relasi ke user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private userEntity user;

    //atribute history
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private statusHistory status;

}