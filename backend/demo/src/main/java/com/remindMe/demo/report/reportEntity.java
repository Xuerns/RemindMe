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

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class reportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Sesuai class diagram: userId String
    @Column(name = "user_id", nullable = false)
    private String userId;

    // Sesuai class diagram: month int
    @Column(nullable = false)
    private int month;

    // Sesuai class diagram: year int
    @Column(nullable = false)
    private int year;

    // Sesuai class diagram: generatedAt Date
    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date generatedAt;

    /*
     Banyak report bisa dimiliki oleh satu user.
    */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonIgnore
    private userEntity user;

    // Satu report bisa berisi banyak subscription. Satu subscription juga bisa muncul di beberapa report.
    @ManyToMany
    @JoinTable(
            name = "report_subscriptions",
            joinColumns = @JoinColumn(name = "report_id"),
            inverseJoinColumns = @JoinColumn(name = "subscription_id")
    )
    @JsonIgnoreProperties({"reports", "notifications", "user", "hibernateLazyInitializer", "handler"})
    private List<subscriptionEntity> subscriptions = new ArrayList<>();

    // Sesuai class diagram: calcMonthlyTotal() : double, Menjumlahkan semua price dari subscription yang masuk ke report.
    @JsonProperty("monthlyTotal")
    public double calcMonthlyTotal() {
        if (subscriptions == null || subscriptions.isEmpty()) {
            return 0;
        }

        return subscriptions.stream()
                .mapToDouble(subscriptionEntity::getPrice)
                .sum();
    }

    @JsonProperty("totalAmount")
    public double getTotalAmount() {
        return calcMonthlyTotal();
    }

    // Sesuai class diagram: getSummaryByCategory() : Map, Mengelompokkan pengeluaran berdasarkan kategori.
    @JsonProperty("summaryByCategory")
    public Map<String, Double> getSummaryByCategory() {
        if (subscriptions == null || subscriptions.isEmpty()) {
            return Map.of();
        }

        return subscriptions.stream()
                .collect(groupingBy(
                        subscription -> subscription.getCategory() == null || subscription.getCategory().isBlank()
                                ? "Lainnya"
                                : subscription.getCategory(),
                        LinkedHashMap::new,
                        summingDouble(subscriptionEntity::getPrice)
                ));
    }

    // Sesuai class diagram: getSavingsTips() : List, Memberikan rekomendasi berdasarkan total pengeluaran.
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

}
