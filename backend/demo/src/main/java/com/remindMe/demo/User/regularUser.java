package com.remindMe.demo.User;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("REGULAR") // ini kita set value dari column "type" yang ada di userEntity
public class regularUser extends userEntity {
    
    @Override
    public boolean canAccessAnalytics() {
        return false; // yang boleh akses analytics hanya premium
    }

    @Override
    public int getMaxSubscriptions() {
        return 5; // Ini belum tau berapa sih batasan untuk user reguler
    }

    @Override
    public boolean canExportReport() {
        return false; // Ini fitur masih 50 / 50, kalau keburu mungkin bisa kita implementasiin
    }
}
