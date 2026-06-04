package com.remindMe.demo.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface reportRepository extends JpaRepository<reportEntity, String> {

    Optional<reportEntity> findByUserIdAndMonthAndYear(String userId, int month, int year);

    List<reportEntity> findByUserId(String userId);
}