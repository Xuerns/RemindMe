package com.remindMe.demo.report;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class reportController {

    private final reportService reportService;

    public reportController(reportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/monthly")
    public reportEntity getMonthlyReport(
            @RequestParam String userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        return reportService.getMonthlyReport(userId, month, year);
    }

    @GetMapping("/yearly")
    public reportEntity getYearlyReport(
            @RequestParam String userId,
            @RequestParam int year
    ) {
        return reportService.getYearlyReport(userId, year);
    }

    @GetMapping("/monthly-total")
    public double calcMonthlyTotal(
            @RequestParam String userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        return reportService.calcMonthlyTotal(userId, month, year);
    }

    @GetMapping("/savings-tips")
    public List<String> getSavingsTips(
            @RequestParam String userId
    ) {
        return reportService.getSavingsTips(userId);
    }

    @GetMapping("/export-pdf")
    public ResponseEntity<String> exportPdf(
            @RequestParam String userId
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_IMPLEMENTED)
                .body("Fitur export PDF belum diimplementasikan.");
    }
}