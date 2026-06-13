package com.remindMe.demo.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface historyRepository extends JpaRepository<historyEntity, String>{
    // History by user ID, diurutkan dari yang terbaru dicatat (terbaru di atas)
    List<historyEntity> findByUser_IdOrderByRecordedAtDesc(String userId);
    
    // Fallback: tanpa urutan
    List<historyEntity> findByUser_Id(String userId);
} 
