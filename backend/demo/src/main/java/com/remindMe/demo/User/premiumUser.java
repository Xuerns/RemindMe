package com.remindMe.demo.User;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("PREMIUM") // ini kita set value dari column "type" yang ada di userEntity
public class premiumUser extends userEntity {
    
    @Column(name = "premium_date")
    private LocalDate premiumDate;

    @Override
    public boolean canAccessAnalytics() {
        return true; // Sesuai dengan requirement yang sudah kita buat, analytics cuman buat premium user
    }

    @Override
    public int getMaxSubscriptions() {
        return Integer.MAX_VALUE; // Ini nilainya unlimited, mungkin masih mau didiskusikan apakah ada batasanya atau engga
    }

    @Override
    public boolean canExportReport() {
        return true; // Ini fitur masih 50 / 50, kalau keburu mungkin bisa kita implementasiin
    }
}
