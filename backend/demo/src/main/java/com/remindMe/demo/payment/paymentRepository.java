package com.remindMe.demo.payment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface paymentRepository extends JpaRepository<paymentEntity, String> {
    
}
