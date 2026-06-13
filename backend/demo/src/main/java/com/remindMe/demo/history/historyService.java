package com.remindMe.demo.history;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class historyService {
    private final historyRepository historyRepo;
    
    //method ambil history by userId, diurutkan terbaru di atas
    public List<historyEntity>getHistoryByUser(String userId){
        return historyRepo.findByUser_IdOrderByRecordedAtDesc(userId);
    }
    
    //method simpan history (saveAndFlush agar langsung ditulis ke DB)
    public historyEntity addHistory(historyEntity history){
        return historyRepo.saveAndFlush(history);
    }
    
    //method ambil semua history
    public List<historyEntity>getAllHistory(){
        return historyRepo.findAll();
    }
}
