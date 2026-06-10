package com.remindMe.demo.report;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class reportController {

    private final reportService reportService;

    public reportController(reportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/access")
    public ResponseEntity<?> checkAnalyticsAccess(@RequestParam String userId) {
        boolean canAccess = reportService.canAccessAnalytics(userId);

        return ResponseEntity.ok(Map.of(
                "canAccessAnalytics", canAccess
        ));
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyReport(
            @RequestParam String userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        if (month < 1 || month > 12) {
            return ResponseEntity.badRequest().body("Bulan harus antara 1-12.");
        }

        if (year < 1) {
            return ResponseEntity.badRequest().body("Tahun tidak valid.");
        }

        return ResponseEntity.ok(reportService.getMonthlyReport(userId, month, year));
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyReport(
            @RequestParam String userId,
            @RequestParam int year
    ) {
        if (year < 1) {
            return ResponseEntity.badRequest().body("Tahun tidak valid.");
        }

        return ResponseEntity.ok(reportService.getYearlyReport(userId, year));
    }

    @GetMapping("/monthly-total")
    public ResponseEntity<?> calcMonthlyTotal(
            @RequestParam String userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        if (month < 1 || month > 12) {
            return ResponseEntity.badRequest().body("Bulan harus antara 1-12.");
        }

        if (year < 1) {
            return ResponseEntity.badRequest().body("Tahun tidak valid.");
        }

        return ResponseEntity.ok(reportService.calcMonthlyTotal(userId, month, year));
    }

    @GetMapping("/savings-tips")
    public ResponseEntity<?> getSavingsTips(
            @RequestParam String userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        if (month < 1 || month > 12) {
            return ResponseEntity.badRequest().body("Bulan harus antara 1-12.");
        }

        if (year < 1) {
            return ResponseEntity.badRequest().body("Tahun tidak valid.");
        }

        return ResponseEntity.ok(reportService.getSavingsTips(userId, month, year));
    }

    @GetMapping("/export-pdf")
    public ResponseEntity<Resource> exportPdf(
            @RequestParam String userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        if (month < 1 || month > 12) {
            return ResponseEntity.badRequest().build();
        }

        if (year < 1) {
            return ResponseEntity.badRequest().build();
        }

        File file = reportService.exportPdf(userId, month, year);
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=report-" + userId + "-" + month + "-" + year + ".pdf"
                )
                .body(resource);
    }
}