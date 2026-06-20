package com.remindMe.demo.User;

import jakarta.persistence.*;
// Lombok = library
// Tujuan kita pake lombok itu biar mengurangi boilerplate, jadi geperlu nulis getter, setter, constructor satu satu
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import com.remindMe.demo.subscription.subscriptionEntity;
import com.remindMe.demo.report.reportEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.remindMe.demo.notification.notificationEntity;

@Getter // Ini Buat generate semua getter method (contohnya : getId(), getUsername())
@Setter // Ini Buat generate semua setter method (contohnya: setUsername(String
        // username), setEmail(String email))
@NoArgsConstructor // Ini Buat generate Contructor tanpa parameter
@AllArgsConstructor // Ini Buat generate Contructor dengan semua parameter
@Entity // Ini menandakan bahwa class ini sebuah entity yang merepresentasikan tabel
        // dalam database
@Table(name = "users") // Ini artinya nanti nama tablenya adalah "users"

// Konsep polymorphism dipakai disini, jadi nanti kita bisa punya 2 class yang
// extend
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // Ini kan kita dibedakan 2 tipe reguler dan premium, ini buat
                                                      // bikin "type" sebagai discriminator column yang nanti bisa kita
                                                      // pake buat bedain antara user reguler dan premium
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING) // Ini buat bikin column "type" yang
                                                                                  // nanti isinya bisa "REGULAR" atau
                                                                                  // "PREMIUM"
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type",
    defaultImpl = regularUser.class
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = regularUser.class, name = "REGULAR"),
    @JsonSubTypes.Type(value = premiumUser.class, name = "PREMIUM")
})
public abstract class userEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Ini biar idnya bagusan dikit, jelek kalau 1 angka doang wkwkwk
    private String id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
    @Lob
    @Column(name = "profile_picture", columnDefinition = "LONGTEXT")
    private String profilePicture;

    /*
     * ======== Penjelasan
     * =============================================================================
     * ===================================================
     * mappedBy: Arti dari mappedBy itu berarti relasi ini di kontrol / dimiliki
     * oleh field "user"
     * cascade = CascadeType: All: Artinya itu apapun yang terjadi / dilakukan
     * kepada user maka akan mempengaruhi subcription yang dimiliki user tersebut
     * tujuannya itu biar ketika kita hapus user maka semua subscription yang
     * dimiliki user akan terhapus juga
     * =============================================================================
     * =======================================================================
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<subscriptionEntity> userSubscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<reportEntity> userReports = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<notificationEntity> userNotifications = new ArrayList<>();

    public String getType() {
        return this instanceof premiumUser ? "PREMIUM" : "REGULAR";
    }

    public abstract boolean canAccessAnalytics();

    public abstract int getMaxSubscriptions();

}