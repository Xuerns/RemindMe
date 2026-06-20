package com.remindMe.demo.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface reportRepository extends JpaRepository<reportEntity, String> {

    Optional<reportEntity> findByUserIdAndMonthAndYear(String userId, int month, int year);

    List<reportEntity> findByUserId(String userId);

    @Modifying
    @Transactional
    @Query(value= "DELETE FROM report_subscriptions WHERE subscription_id = :subscriptionId", nativeQuery = true)
    void deleteBySubscriptionId(@Param("subscriptionId") String SubscriptionId);
}