package com.remindMe.demo.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class paymentRequest {
    private String userId;
    private String paymentMethod;
}
