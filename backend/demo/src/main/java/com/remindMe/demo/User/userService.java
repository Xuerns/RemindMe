package com.remindMe.demo.User;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class userService {

    @Autowired
    private userRepository userRepository;

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
}