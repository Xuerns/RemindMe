package com.remindMe.demo.history;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class historyService {
    private final historyRepository historyRepo;
    
    //method ambil history by userId
    public List<historyEntity>getHistoryByUser(String userId){
        return historyRepo.findByUser_Id(userId);
    }
    
    //method simpan history
    public historyEntity addHistory(historyEntity history){
        return historyRepo.save(history);
    }
    
    //method ambil semua history
    public List<historyEntity>getAllHistory(){
        return historyRepo.findAll();
    }
}
