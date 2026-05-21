package com.remindMe.demo.payment;

import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.remindMe.demo.User.premiumUser;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.User.userRepository;
import com.remindMe.demo.payment.dto.paymentRequest;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@Service
public class paymentService {

    @Autowired
    private paymentRepository paymentRepository;

    @Autowired
    private userRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @Transactional
    public String payment(paymentRequest paymentRequest) {

        userEntity user = userRepository.findById(paymentRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        if (user instanceof premiumUser) {
            throw new RuntimeException("User sudah premium");
        }

        paymentEntity payment = new paymentEntity();
        payment.setUser(user);
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());

        payment.setPaymentDate(LocalDate.now());
        paymentRepository.save(payment);

        entityManager.createNativeQuery(
                "UPDATE users SET type = 'PREMIUM', premium_date = ?, premium_expiry_date = ? WHERE id = ?")
                .setParameter(1, LocalDate.now())
                .setParameter(2, LocalDate.now().plusDays(30))
                .setParameter(3, user.getId())
                .executeUpdate();

        return "Payment berhasil";
    }
}
