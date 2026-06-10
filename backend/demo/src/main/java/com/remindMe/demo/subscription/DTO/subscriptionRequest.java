package com.remindMe.demo.subscription.DTO;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class subscriptionRequest {
    private String name;
    private String category;
    private double price;
    private LocalDate duDate;
    private String period;
    private String status;
    private boolean active;
    private String userId;
}
