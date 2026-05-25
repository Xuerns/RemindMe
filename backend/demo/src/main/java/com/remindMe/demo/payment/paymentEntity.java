package com.remindMe.demo.payment;

import java.time.LocalDate;

import com.remindMe.demo.User.userEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "payment")
public class paymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private LocalDate paymentDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private userEntity user;

    @Column(nullable = false)
    private String paymentMethod;

    @Column
    private String noTelpon;

    @Column
    private String bankName;

    @Column
    private String accountName;

    @Column
    private String cardNumber;

    @Column
    private String cardExpired;
}
