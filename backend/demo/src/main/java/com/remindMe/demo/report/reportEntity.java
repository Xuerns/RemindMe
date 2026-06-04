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
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
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
     Relasi ke user tetap dipertahankan agar cocok dengan entity lain.
     Data user_id tetap disimpan lewat field userId di atas.
    */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonIgnore
    private userEntity user;

    // Sesuai class diagram: subscriptions List<Subscription>
    @ManyToMany
    @JoinTable(
            name = "report_subscriptions",
            joinColumns = @JoinColumn(name = "report_id"),
            inverseJoinColumns = @JoinColumn(name = "subscription_id")
    )
    @JsonIgnoreProperties({"reports", "notifications", "user", "hibernateLazyInitializer", "handler"})
    private List<subscriptionEntity> subscriptions = new ArrayList<>();

    // Sesuai class diagram: calcMonthlyTotal() : double
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

    // Sesuai class diagram: getSummaryByCategory() : Map
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

    // Sesuai class diagram: getSavingsTips() : List
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

    // Sesuai class diagram: exportToPdf() : File
    public File exportToPdf() {
        try {
            List<String> lines = new ArrayList<>();
            lines.add("RemindMe Report");
            lines.add("User ID: " + userId);
            lines.add("Period: " + (month == 0 ? "Yearly" : "Month " + month) + " " + year);
            lines.add("Generated At: " + generatedAt);
            lines.add("Total Amount: " + calcMonthlyTotal());
            lines.add(" ");
            lines.add("Summary by Category:");
            getSummaryByCategory().forEach((category, total) -> lines.add("- " + category + ": " + total));
            lines.add(" ");
            lines.add("Savings Tips:");
            getSavingsTips().forEach(tip -> lines.add("- " + tip));

            String filePrefix = "remindme-report-" + sanitizeFileName(userId) + "-" + year + "-" + month + "-";
            File pdfFile = File.createTempFile(filePrefix, ".pdf");
            Files.write(pdfFile.toPath(), buildSimplePdf(lines));
            return pdfFile;
        } catch (IOException e) {
            throw new UncheckedIOException("Gagal membuat file PDF report.", e);
        }
    }

    private byte[] buildSimplePdf(List<String> lines) {
        StringBuilder textStream = new StringBuilder();
        textStream.append("BT\n");
        textStream.append("/F1 12 Tf\n");
        textStream.append("14 TL\n");
        textStream.append("50 790 Td\n");

        int maxLines = Math.min(lines.size(), 50);
        for (int i = 0; i < maxLines; i++) {
            textStream.append("(").append(escapePdfText(lines.get(i))).append(") Tj\n");
            if (i < maxLines - 1) {
                textStream.append("T*\n");
            }
        }
        textStream.append("ET\n");

        byte[] streamBytes = textStream.toString().getBytes(StandardCharsets.ISO_8859_1);

        List<String> objects = List.of(
                "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
                "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
                "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
                "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
                "5 0 obj\n<< /Length " + streamBytes.length + " >>\nstream\n" + textStream + "endstream\nendobj\n"
        );

        StringBuilder pdf = new StringBuilder();
        pdf.append("%PDF-1.4\n");

        List<Integer> offsets = new ArrayList<>();
        for (String object : objects) {
            offsets.add(pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length);
            pdf.append(object);
        }

        int xrefOffset = pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length;

        pdf.append("xref\n");
        pdf.append("0 ").append(objects.size() + 1).append("\n");
        pdf.append("0000000000 65535 f \n");

        for (Integer offset : offsets) {
            pdf.append(String.format("%010d 00000 n \n", offset));
        }

        pdf.append("trailer\n");
        pdf.append("<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\n");
        pdf.append("startxref\n");
        pdf.append(xrefOffset).append("\n");
        pdf.append("%%EOF");

        return pdf.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private String escapePdfText(String text) {
        if (text == null) {
            return "";
        }

        return text
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }

    private String sanitizeFileName(String value) {
        if (value == null || value.isBlank()) {
            return "unknown-user";
        }

        return value.replaceAll("[^a-zA-Z0-9-_]", "-");
    }
}