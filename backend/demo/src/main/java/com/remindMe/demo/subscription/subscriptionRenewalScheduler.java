package com.remindMe.demo.subscription;

import com.remindMe.demo.history.historyEntity;
import com.remindMe.demo.history.historyService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler yang berjalan setiap hari untuk memproses auto-renewal
 * subscription yang statusnya ACTIVE dan sudah melewati tanggal pembayaran.
 *
 * Logika:
 *   - isActive = true  → auto-renew: duDate digeser +periode, catat history ACTIVE
 *   - isActive = false → tidak diproses (akan expire secara alami)
 */
@Component
@RequiredArgsConstructor
public class subscriptionRenewalScheduler {

    private final subscriptionRepository subscriptionRepo;
    private final historyService historyService;
    private final subscriptionService subscriptionService;

    /**
     * Berjalan setiap hari pukul 00:05 WIB (cron = detik, menit, jam, hari, bulan, hari-minggu)
     * Untuk pengujian cepat, bisa ubah ke "0 * * * * *" (setiap menit)
     */
    @Scheduled(cron = "0 5 0 * * *")
    public void processAutoRenewals() {
        LocalDate today = LocalDate.now();
        List<subscriptionEntity> expiredActive = subscriptionRepo.findActiveSubscriptionsDueBefore(today);

        for (subscriptionEntity sub : expiredActive) {
            try {
                // Hitung duDate baru: duDate lama + periode
                LocalDate newDuDate = subscriptionService.calculateEndDate(sub.getDuDate(), sub.getPeriod());
                sub.setDuDate(newDuDate);
                subscriptionRepo.save(sub);

                // Catat history ACTIVE (perpanjangan otomatis)
                historyEntity history = new historyEntity();
                history.setName(sub.getName());
                history.setCategory(sub.getCategory());
                history.setPrice(sub.getPrice());
                history.setUser(sub.getUser());
                history.setStartDate(newDuDate);
                history.setEndDate(subscriptionService.calculateEndDate(newDuDate, sub.getPeriod()));
                history.setStatus(historyEntity.statusHistory.ACTIVE);
                history.setRecordedAt(LocalDateTime.now());
                historyService.addHistory(history);

                System.out.println("[AUTO-RENEW] " + sub.getName() + " diperpanjang → " + newDuDate);
            } catch (Exception e) {
                System.out.println("[AUTO-RENEW ERROR] " + sub.getName() + ": " + e.getMessage());
            }
        }
    }
}
