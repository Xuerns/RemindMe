package com.remindMe.demo.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface historyRepository extends JpaRepository<historyEntity, String>{
    //history by ID user
    List<historyEntity> findByUser_Id(String userId);
    
} 
