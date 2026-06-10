package com.remindMe.demo.history;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")

public class historyController {
    private final historyService historyService;

    //ambil history by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<historyEntity>>getHistoryByUser(@PathVariable String userId) {
        List<historyEntity> historyList = historyService.getHistoryByUser(userId);
        return ResponseEntity.ok(historyList);
    }

    //mengambil semua history
    @GetMapping("/all")
    public ResponseEntity<List<historyEntity>>getAllHistory() {
        return ResponseEntity.o(historyService.getAllHistory());
    }
    
    
}
