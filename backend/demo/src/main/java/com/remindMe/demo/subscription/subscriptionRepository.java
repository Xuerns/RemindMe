package com.remindMe.demo.subscription;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface subscriptionRepository extends JpaRepository<subscriptionEntity, String> {
    List<subscriptionEntity> findByUserIdOrderByDuDate(String userId);

    List<subscriptionEntity> findByCategory(String category);

    @Query("SELECT s FROM subscriptionEntity s WHERE s.user.id = :userId ORDER BY s.price DESC")
    List<subscriptionEntity> findTop3ByUserIdOrderByPriceDesc(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.price), 0) FROM subscriptionEntity s WHERE s.user.id = :userId")
    Double getTotalMonthlyByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(s) FROM subscriptionEntity s WHERE s.user.id = :userId")
    Long countByUserId(@Param("userId") String userId);

    @Query("SELECT s FROM subscriptionEntity s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<subscriptionEntity> searchByKeyword(@Param("keyword") String keyword);

    Optional<subscriptionEntity> findByName(String name); // Optional Agar aplikasi tidak langsung crash jika data tidak
                                                          // ditemukan
}