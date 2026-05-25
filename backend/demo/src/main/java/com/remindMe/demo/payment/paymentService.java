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

        String method = paymentRequest.getPaymentMethod();
        if (method == null || method.isBlank()) {
            throw new RuntimeException("Metode pembayaran tidak boleh kosong");
        }
        payment.setPaymentMethod(method);

        if (method.equalsIgnoreCase("gopay") || method.equalsIgnoreCase("ovo") || method.equalsIgnoreCase("dana")) {

            if (paymentRequest.getNoTelpon() == null || paymentRequest.getNoTelpon().isBlank()) {
                throw new RuntimeException("Data tidak lengkap, Silahkan isi nomor telpon kamu");
            }
            payment.setNoTelpon(paymentRequest.getNoTelpon());

        } else if (method.equalsIgnoreCase("tranferbank")) {

            if (paymentRequest.getBankName() == null || paymentRequest.getBankName().isBlank()) {
                throw new RuntimeException("Data tidak lengkap, Silahkan isi nama bank kamu");
            }

            if (paymentRequest.getAccountName() == null || paymentRequest.getAccountName().isBlank()) {
                throw new RuntimeException("Data tidak lengkap, Silahkan isi nama akun rekening kamu");
            }

            payment.setBankName(paymentRequest.getBankName());
            payment.setAccountName(paymentRequest.getAccountName());

        } else if (method.equalsIgnoreCase("creditcard")) {

            if (paymentRequest.getAccountName() == null || paymentRequest.getAccountName().isBlank()) {
                throw new RuntimeException("Data tidak lengkap, Silahkan isi nama akun rekening kamu");
            }

            if (paymentRequest.getCardNumber() == null || paymentRequest.getCardNumber().isBlank()) {
                throw new RuntimeException("Data tidak lengkap, Silahkan isi nomor kartu kamu");
            }

            if (paymentRequest.getCardExpired() == null || paymentRequest.getCardExpired().isBlank()) {
                throw new RuntimeException("Data tidak lengkap, Silahkan isi tanggal expired kartu kamu");
            }

            if (paymentRequest.getCVV() == null || paymentRequest.getCVV().isBlank()) {
                throw new RuntimeException("Data tidak lengkap, Silahkan isi CVV kartu kamu");
            }

            payment.setAccountName(paymentRequest.getAccountName());
            payment.setCardNumber(paymentRequest.getCardNumber());
            payment.setCardExpired(paymentRequest.getCardExpired());

        } else {
            throw new RuntimeException("Metode pembayaran tidak didukung");
        }

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
