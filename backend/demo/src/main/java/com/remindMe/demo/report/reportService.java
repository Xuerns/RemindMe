package com.remindMe.demo.report;

import com.remindMe.demo.subscription.subscriptionEntity;
import com.remindMe.demo.subscription.subscriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.time.LocalDate;
import java.util.List;

@Service
public class reportService {

    private final subscriptionRepository subscriptionRepository;

    public reportService(subscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public reportEntity getMonthlyReport(String userId, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<subscriptionEntity> subscriptions =
                subscriptionRepository.findByUser_IdAndDuDateBetweenAndIsActiveTrue(
                        userId,
                        startDate,
                        endDate
                );

        reportEntity report = new reportEntity();
        report.setUserId(userId);
        report.setMonth(month);
        report.setYear(year);
        report.setGeneratedDate(LocalDate.now());
        report.setSubscriptions(subscriptions);

        return report;
    }

    public reportEntity getYearlyReport(String userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<subscriptionEntity> subscriptions =
                subscriptionRepository.findByUser_IdAndDuDateBetweenAndIsActiveTrue(
                        userId,
                        startDate,
                        endDate
                );

        reportEntity report = new reportEntity();
        report.setUserId(userId);
        report.setMonth(0); // 0 artinya laporan tahunan
        report.setYear(year);
        report.setGeneratedDate(LocalDate.now());
        report.setSubscriptions(subscriptions);

        return report;
    }

    public double calcMonthlyTotal(String userId, int month, int year) {
        reportEntity report = getMonthlyReport(userId, month, year);
        return report.calcMonthlyTotal();
    }

    public List<String> getSavingsTips(String userId) {
        List<subscriptionEntity> subscriptions =
                subscriptionRepository.findByUser_IdAndIsActiveTrue(userId);

        reportEntity report = new reportEntity();
        report.setUserId(userId);
        report.setMonth(0);
        report.setYear(LocalDate.now().getYear());
        report.setGeneratedDate(LocalDate.now());
        report.setSubscriptions(subscriptions);

        return report.getSavingsTips();
    }

    public File exportPdf(String userId) {
        throw new ResponseStatusException(
                HttpStatus.NOT_IMPLEMENTED,
                "Fitur export PDF belum diimplementasikan."
        );
    }
}