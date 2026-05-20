package com.remindMe.demo.subscription;

import java.util.ArrayList;
import java.util.List;

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
@Table(name = "subscription_catalog")
public class subscriptionCatalog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column
    private String name;

    @Column
    private String category;

    @Column
    private double basePrice;

    @OneToMany(mappedBy = "subscriptionCatalog")
    private List<subscriptionEntity> subscriptions = new ArrayList<>();
}
