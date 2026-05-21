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
        List<subscriptionEntity> allSubscriptions = subscriptionRepository.findByUserId(userId);

        List<subscriptionEntity> filteredSubscriptions = allSubscriptions.stream()
                .filter(subscription -> subscription.isActive())
                .filter(subscription -> subscription.getDuDate() != null)
                .filter(subscription -> subscription.getDuDate().getMonthValue() == month)
                .filter(subscription -> subscription.getDuDate().getYear() == year)
                .toList();

        reportEntity report = new reportEntity();
        report.setUserId(userId);
        report.setMonth(month);
        report.setYear(year);
        report.setGeneratedDate(LocalDate.now());
        report.setSubscriptions(filteredSubscriptions);

        return report;
    }

    public reportEntity getYearlyReport(String userId, int year) {
        List<subscriptionEntity> allSubscriptions = subscriptionRepository.findByUserId(userId);

        List<subscriptionEntity> filteredSubscriptions = allSubscriptions.stream()
                .filter(subscription -> subscription.isActive())
                .filter(subscription -> subscription.getDuDate() != null)
                .filter(subscription -> subscription.getDuDate().getYear() == year)
                .toList();

        reportEntity report = new reportEntity();
        report.setUserId(userId);
        report.setMonth(0); // 0 artinya laporan tahunan
        report.setYear(year);
        report.setGeneratedDate(LocalDate.now());
        report.setSubscriptions(filteredSubscriptions);

        return report;
    }

    public double calcMonthlyTotal(String userId, int month, int year) {
        reportEntity report = getMonthlyReport(userId, month, year);
        return report.calcMonthlyTotal();
    }

    public List<String> getSavingsTips(String userId) {
        List<subscriptionEntity> subscriptions = subscriptionRepository.findByUserId(userId);

        List<subscriptionEntity> activeSubscriptions = subscriptions.stream()
                .filter(subscription -> subscription.isActive())
                .toList();

        reportEntity report = new reportEntity();
        report.setUserId(userId);
        report.setMonth(0);
        report.setYear(LocalDate.now().getYear());
        report.setGeneratedDate(LocalDate.now());
        report.setSubscriptions(activeSubscriptions);

        return report.getSavingsTips();
    }

    public File exportPdf(String userId) {
        throw new ResponseStatusException(
                HttpStatus.NOT_IMPLEMENTED,
                "Fitur export PDF belum diimplementasikan."
        );
    }
}