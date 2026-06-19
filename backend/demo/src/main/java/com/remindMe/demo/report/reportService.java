package com.remindMe.demo.report;

import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.User.userRepository;
import com.remindMe.demo.subscription.subscriptionEntity;
import com.remindMe.demo.subscription.subscriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class reportService {

    private final subscriptionRepository subscriptionRepository;
    private final reportRepository reportRepository;
    private final userRepository userRepository;

    public reportService(
            subscriptionRepository subscriptionRepository,
            reportRepository reportRepository,
            userRepository userRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    public boolean canAccessAnalytics(String userId) {
        userEntity user = getUserOrThrow(userId);
        return user.canAccessAnalytics();
    }

    @Transactional
    public reportEntity getMonthlyReport(String userId, int month, int year) {
        userEntity user = getUserOrThrow(userId);// ngambil data user dari satabase
        validateAnalyticsAccess(user); // ngecek apakah user bisa akses analytics, kalau gak bisa bakal lempar error 403

        List<subscriptionEntity> filteredSubscriptions = subscriptionRepository.findByUserIdOrderByDuDate(userId) //Ambil data subscription dari database
                .stream()
                .filter(subscription -> subscription.isActive()) // Hanya subscription aktif yang dihitung.
                .filter(subscription -> subscription.getDuDate() != null) // Tanggal jatuh tempo tidak boleh kosong.
                .filter(subscription -> subscription.getDuDate().getMonthValue() == month
                        && subscription.getDuDate().getYear() == year) // Hanya subscription yang bulan dan tahunnya sesuai dengan filter Analytics.
                .toList();

        return saveOrUpdateReport(user, month, year, filteredSubscriptions);
    }

    @Transactional
    public reportEntity getYearlyReport(String userId, int year) {
        userEntity user = getUserOrThrow(userId);
        validateAnalyticsAccess(user);

        List<subscriptionEntity> filteredSubscriptions = subscriptionRepository.findByUserIdOrderByDuDate(userId)
                .stream()
                .filter(subscription -> subscription.isActive())
                .filter(subscription -> subscription.getDuDate() != null)
                .filter(subscription -> subscription.getDuDate().getYear() == year)
                .toList();

        // month = 0 artinya laporan tahunan
        return saveOrUpdateReport(user, 0, year, filteredSubscriptions);
    }

    @Transactional
    public double calcMonthlyTotal(String userId, int month, int year) {
        return getMonthlyReport(userId, month, year).calcMonthlyTotal();
    }

    @Transactional
    public List<String> getSavingsTips(String userId, int month, int year) {
        return getMonthlyReport(userId, month, year).getSavingsTips();
    }

    private userEntity getUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User dengan ID " + userId + " tidak ditemukan."
                ));
    }

    private void validateAnalyticsAccess(userEntity user) {
        if (!user.canAccessAnalytics()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Fitur Analytics hanya tersedia untuk Premium User."
            );
        }
    }

    private reportEntity saveOrUpdateReport(
            userEntity user,
            int month,
            int year,
            List<subscriptionEntity> subscriptions
    ) {
        reportEntity report = reportRepository
                .findByUserIdAndMonthAndYear(user.getId(), month, year)
                .orElseGet(reportEntity::new);

        report.setUserId(user.getId());
        report.setUser(user);
        report.setMonth(month);
        report.setYear(year);
        report.setGeneratedAt(new Date());
        report.setSubscriptions(new ArrayList<>(subscriptions));

        return reportRepository.save(report);
    }
}
