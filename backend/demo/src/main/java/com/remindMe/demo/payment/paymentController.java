package com.remindMe.demo.payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.remindMe.demo.payment.dto.paymentRequest;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class paymentController {
    
    @Autowired
    private paymentService paymentService;

    @PostMapping("/make")
    public ResponseEntity<?> makePayment(@RequestBody paymentRequest paymentRequest) {
        try {
            String res = paymentService.payment(paymentRequest);
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
