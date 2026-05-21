package com.remindMe.demo.report;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.subscription.subscriptionEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.File;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summingDouble;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reports")
public class reportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Sesuai class diagram: Report punya userId
    @Transient
    private String userId;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    // Sesuai class diagram: generatedAt
    @Column(nullable = false)
    private LocalDate generatedAt;

    // Relasi ke user tetap dipertahankan untuk kebutuhan database
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private userEntity user;

    // Report mengumpulkan banyak subscription
    @ManyToMany
    @JoinTable(
            name = "report_subscriptions",
            joinColumns = @JoinColumn(name = "report_id"),
            inverseJoinColumns = @JoinColumn(name = "subscription_id")
    )
    @JsonIgnoreProperties({"reports", "notifications", "user", "subscriptionCatalog"})
    private List<subscriptionEntity> subscriptions = new ArrayList<>();

    @JsonProperty("monthlyTotal")
    public double calcMonthlyTotal() {
        if (subscriptions == null) {
            return 0;
        }

        return subscriptions.stream()
                .filter(subscriptionEntity::isActive)
                .mapToDouble(subscriptionEntity::getPrice)
                .sum();
    }

    @JsonProperty("summaryByCategory")
    public Map<String, Double> getSummaryByCategory() {
        if (subscriptions == null) {
            return Map.of();
        }

        return subscriptions.stream()
                .filter(subscriptionEntity::isActive)
                .collect(groupingBy(
                        subscription -> subscription.getCategory() == null
                                ? "Lainnya"
                                : subscription.getCategory(),
                        summingDouble(subscriptionEntity::getPrice)
                ));
    }

    @JsonProperty("savingsTips")
    public List<String> getSavingsTips() {
        double total = calcMonthlyTotal();

        if (subscriptions == null || subscriptions.isEmpty()) {
            return List.of("Belum ada data subscription untuk dianalisis.");
        }

        if (total == 0) {
            return List.of("Tidak ada pengeluaran aktif pada periode ini.");
        }

        if (total > 500000) {
            return List.of(
                    "Pengeluaran langganan cukup tinggi. Pertimbangkan untuk meninjau kembali layanan yang jarang digunakan.",
                    "Cek kategori dengan pengeluaran terbesar dan prioritaskan langganan yang paling penting."
            );
        }

        return List.of(
                "Pengeluaran langganan masih dalam batas wajar.",
                "Tetap evaluasi langganan secara berkala agar tidak ada biaya yang terbuang."
        );
    }

    public File exportToPdf() {
        throw new UnsupportedOperationException("Fitur export PDF belum diimplementasikan.");
    }
}