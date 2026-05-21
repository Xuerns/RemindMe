package com.remindMe.demo.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


// Ini bisa dibiarin kosong, karena emang biasanya udah ada method defaultnya dati JpaRepository
@Repository
public interface userRepository extends JpaRepository<userEntity, String> {
    Optional<userEntity> findByEmail(String email);
    Optional<userEntity> findById(String id);
}