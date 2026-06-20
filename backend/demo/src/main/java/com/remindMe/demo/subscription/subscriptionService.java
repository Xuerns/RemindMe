package com.remindMe.demo.subscription;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.remindMe.demo.subscription.DTO.subscriptionRequest;
import com.remindMe.demo.User.userRepository;
import com.remindMe.demo.notification.notificationService;
import com.remindMe.demo.report.reportRepository;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.history.historyService;
import com.remindMe.demo.history.historyEntity;

import java.util.List;
import java.time.LocalDate;


@Service // Menandakan bahwa class ini adalah Service component di Spring Boot
@RequiredArgsConstructor // Lombok: otomatis membuat constructor untuk inject repositor

public class subscriptionService {
    private final subscriptionRepository subscriptionRepo;
    private final userRepository userRepo;
    private final notificationService notificationService;
    private final historyService historyService;
    private final reportRepository reportRepository;

    // ─── HELPER: Hitung endDate berdasarkan periode ───────────────────────────
    public LocalDate calculateEndDate(LocalDate startDate, subscriptionEntity.periodSubs period) {
        if (period == null) return startDate;
        switch (period) {
            case THREE_MONTH:  return startDate.plusMonths(3);
            case SIX_MONTH:    return startDate.plusMonths(6);
            case TWELVE_MONTH: return startDate.plusMonths(12);
            case ONE_MONTH:    return startDate.plusMonths(1);
            case ONE_MINUTE:   return startDate.plusDays(1);
            default:           return startDate;
        }
    }

    // ─── HELPER: Beri nilai numerik pada periode untuk perbandingan ───────────
    // ONE_MINUTE=1, THREE_MONTH=2, SIX_MONTH=3, TWELVE_MONTH=4
    private int periodToValue(subscriptionEntity.periodSubs period) {
        if (period == null) return 0;
        switch (period) {
            case ONE_MINUTE:   return 1;
            case ONE_MONTH:    return 2;
            case THREE_MONTH:  return 3;
            case SIX_MONTH:    return 4;
            case TWELVE_MONTH: return 5;
            default:           return 0;
        }
    }

    // ─── HELPER: Tentukan status history berdasarkan endDate ─────────────────
    // Jika endDate sudah lewat hari ini → EXPIRED, belum lewat → ACTIVE
    private historyEntity.statusHistory resolveHistoryStatus(LocalDate endDate) {
        return LocalDate.now().isAfter(endDate)
                ? historyEntity.statusHistory.EXPIRED
                : historyEntity.statusHistory.ACTIVE;
    }

    // ─── HELPER: Simpan satu baris riwayat ke tabel history ──────────────────
    private void recordHistory(subscriptionEntity sub, userEntity user,
                               historyEntity.statusHistory status) {
        historyEntity history = new historyEntity();
        // Jangan set ID manual - biarkan @GeneratedValue UUID yang handle
        // agar JPA memanggil persist() bukan merge(), sehingga selalu INSERT baru
        history.setName(sub.getName());
        history.setCategory(sub.getCategory());
        history.setPrice(sub.getPrice());
        history.setUser(user);

        LocalDate startDate = sub.getDuDate();
        LocalDate endDate   = calculateEndDate(startDate, sub.getPeriod());

        history.setStartDate(startDate);
        history.setEndDate(endDate);
        history.setStatus(status);
        // Set recordedAt dengan timestamp tepat (jam:menit:detik) agar urutan selalu benar
        history.setRecordedAt(java.time.LocalDateTime.now());

        historyService.addHistory(history);
    }

    // ─── ADD SUBSCRIPTION ─────────────────────────────────────────────────────
    // History: status ditentukan dari tanggal (ACTIVE / EXPIRED)
    public subscriptionEntity addSubscription(subscriptionRequest request) {
        subscriptionEntity sub = new subscriptionEntity();
        sub.setName(request.getName());
        sub.setCategory(request.getCategory());
        sub.setPrice(request.getPrice());
        sub.setDuDate(request.getDuDate());
        sub.setStatus(subscriptionEntity.statusSubs.valueOf(request.getStatus()));
        sub.setActive(request.isActive());
        sub.setPeriod(subscriptionEntity.periodSubs.valueOf(request.getPeriod()));

        userEntity user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
        sub.setUser(user);

        subscriptionEntity saved = subscriptionRepo.save(sub);

        // Notifikasi (tidak boleh gagalkan proses utama)
        try { notificationService.scheduleReminder(saved); } catch (Exception ignored) {}

        // Catat history: status dari tanggal
        LocalDate endDate = calculateEndDate(saved.getDuDate(), saved.getPeriod());
        historyEntity.statusHistory histStatus = resolveHistoryStatus(endDate);
        recordHistory(saved, user, histStatus);

        return saved;
    }

    // ─── UPDATE SUBSCRIPTION ──────────────────────────────────────────────────
    // Logika isActive:
    //   - true → false (Inactive) : user tidak memperpanjang; catat history CANCELED
    //   - false → true (Active)   : reaktivasi; duDate di-reset ke hari ini (mulai periode baru); catat ACTIVE
    // Logika perubahan data lainnya (jika isActive tidak berubah):
    //   - Expired by date         → EXPIRED
    //   - Harga naik DAN periode naik → UPGRADED
    //   - Harga turun DAN periode turun → DOWNGRADED
    //   - Selain itu              → ACTIVE
    public void updateSubscription(String id, subscriptionRequest request) {
        subscriptionEntity existSub = subscriptionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription dengan ID " + id + " tidak ditemukan"));

        boolean wasActive = existSub.isActive();
        boolean nowActive = request.isActive();
        double  oldPrice  = existSub.getPrice();
        subscriptionEntity.periodSubs oldPeriod = existSub.getPeriod();

        existSub.setName(request.getName());
        existSub.setCategory(request.getCategory());
        existSub.setPrice(request.getPrice());
        existSub.setStatus(subscriptionEntity.statusSubs.valueOf(request.getStatus()));
        existSub.setPeriod(subscriptionEntity.periodSubs.valueOf(request.getPeriod()));
        existSub.setActive(nowActive);

        historyEntity.statusHistory histStatus;

        if (wasActive && !nowActive) {
            // ── Inactive: user memilih tidak perpanjang otomatis saat habis ──────
            existSub.setDuDate(request.getDuDate());
            histStatus = historyEntity.statusHistory.INACTIVE;

        } else if (!wasActive && nowActive) {
            // ── Reaktivasi: mulai periode baru mulai dari hari ini ───────────────
            existSub.setDuDate(LocalDate.now());
            histStatus = historyEntity.statusHistory.ACTIVE;

        } else {
            // ── Tidak ada perubahan isActive: edit data biasa ────────────────────
            existSub.setDuDate(request.getDuDate());

            LocalDate endDate = calculateEndDate(request.getDuDate(),
                    subscriptionEntity.periodSubs.valueOf(request.getPeriod()));

            if (LocalDate.now().isAfter(endDate)) {
                histStatus = historyEntity.statusHistory.EXPIRED;
            } else {
                int oldPeriodValue = periodToValue(oldPeriod);
                int newPeriodValue = periodToValue(subscriptionEntity.periodSubs.valueOf(request.getPeriod()));

                boolean priceUp   = request.getPrice() > oldPrice;
                boolean priceDown = request.getPrice() < oldPrice;
                boolean periodUp  = newPeriodValue > oldPeriodValue;
                boolean periodDown = newPeriodValue < oldPeriodValue;

                if (priceUp && periodUp)        histStatus = historyEntity.statusHistory.UPGRADED;
                else if (priceDown && periodDown) histStatus = historyEntity.statusHistory.DOWNGRADED;
                else                             histStatus = historyEntity.statusHistory.ACTIVE;
            }
        }

        subscriptionEntity saved = subscriptionRepo.save(existSub);

        // Notifikasi
        try { notificationService.scheduleReminder(saved); } catch (Exception ignored) {}

        // Catat history secara independen
        userEntity user = saved.getUser();
        try { recordHistory(saved, user, histStatus); } catch (Exception e) {
            System.out.println("[WARN] Gagal mencatat history update: " + e.getMessage());
        }
    }

    // ─── DELETE SUBSCRIPTION ──────────────────────────────────────────────────
    // History: status CANCELED, dicatat sebelum data dihapus
    public String deleteSubscription(String id) {
        subscriptionEntity sub = subscriptionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription tidak ditemukan"));

        userEntity user = sub.getUser();

        // Catat history terlebih dahulu sebelum dihapus
        // History dicatat secara independen — gagal history tidak gagalkan delete
        try { recordHistory(sub, user, historyEntity.statusHistory.CANCELED); } catch (Exception e) {
            System.out.println("[WARN] Gagal mencatat history delete: " + e.getMessage());
        }
        reportRepository.deleteBySubscriptionId(sub.getId());

        subscriptionRepo.deleteById(sub.getId());
        return "Subscription dengan id: " + id + " berhasil dihapus!";
    }

    // ─── QUERY METHODS ────────────────────────────────────────────────────────
    public List<subscriptionEntity> getAll(String userId) {
        return subscriptionRepo.findByUserIdOrderByDuDate(userId);
    }

    public List<subscriptionEntity> search(String keyword) {
        return subscriptionRepo.searchByKeyword(keyword);
    }

    public List<subscriptionEntity> getByCategory(String category) {
        return subscriptionRepo.findByCategory(category);
    }

    public List<subscriptionEntity> getTop3ByPrice(String userId) {
        return subscriptionRepo.findTop3ByUserIdOrderByPriceDesc(userId, PageRequest.of(0, 3));
    }

    public Double getTotalMonthly(String userId) {
        return subscriptionRepo.getTotalMonthlyByUserId(userId);
    }

    public Long countSubscriptions(String userId) {
        return subscriptionRepo.countByUserId(userId);
    }

    public void updateStatus(String id, String status) {
        subscriptionEntity sub = subscriptionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription tidak ditemukan"));
        sub.setStatus(subscriptionEntity.statusSubs.valueOf(status));
        subscriptionRepo.save(sub);
    }
}
