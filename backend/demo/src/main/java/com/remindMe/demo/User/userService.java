package com.remindMe.demo.User;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jakarta.persistence.EntityManager;

@Service
public class userService {

    @Autowired
    private userRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    // GET PROFILE BY ID
    public userEntity getUserProfile(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
    }

    // UPDATE PROFILE
    public userEntity updateUserProfile(String id, userEntity updatedUser) {

        userEntity existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());

        return userRepository.save(existingUser);
    }

    // GET USER BY EMAIL
    public Optional<userEntity> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Ini Buat Cek Apakah user masih premium atau tidak
    @Transactional
    public boolean checkVerifyPremium(String id) {
        userEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("user tidak ditemukan"));

        if (user instanceof premiumUser) {
            premiumUser premUser = (premiumUser) user;

            if (premUser.isPremiumActive()) {
                return true;
            } else {
                entityManager.createNativeQuery(
                        "UPDATE users SET type = 'REGULAR' WHERE id = ?")
                        .setParameter(1, id)
                        .executeUpdate();

                return false;
            }
        }
        return false;
    }
}