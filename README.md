<p align="center">
  <h1 align="center">RemindMe</h1>
  <p align="center">
    <em>Your serene productivity companion — manage subscriptions with calm and clarity.</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17"/>
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React"/>
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
</p>

---

## Tentang Project

**RemindMe** adalah aplikasi web full-stack untuk **manajemen langganan (subscription tracker)** yang membantu pengguna melacak, mengelola, dan menganalisis pengeluaran langganan digital mereka secara efisien. Aplikasi ini dirancang dengan estetika _Soft-Minimalist Tech_ yang memadukan efisiensi sistematis dengan kehangatan visual yang ramah, menargetkan profesional muda dan mahasiswa yang menginginkan kejelasan dan ketenangan emosional dalam mengelola keuangan mereka.

### Masalah yang Diselesaikan

Di era digital, banyak orang berlangganan berbagai layanan — Spotify, Netflix, Adobe, dan lainnya — tanpa menyadari total pengeluaran bulanan mereka. RemindMe hadir untuk:

- **Melacak** semua langganan aktif dalam satu tempat
- **Mengingatkan** pengguna sebelum tanggal jatuh tempo pembayaran
- **Menganalisis** pola pengeluaran langganan bulanan & tahunan
- **Membantu** membuat keputusan finansial yang lebih bijak

---

## Fitur Utama

### Dashboard

- Sapaan dinamis berdasarkan waktu (Pagi / Siang / Sore / Malam)
- Kartu ringkasan: Total pengeluaran bulanan, tagihan segera, proyeksi tahunan, jumlah langganan aktif
- Daftar tagihan yang akan jatuh tempo dengan indikator urgensi berwarna
- Tips keuangan harian yang berganti otomatis

### Manajemen Langganan

- Tambah, edit, dan hapus langganan
- Top 3 langganan termahal ditampilkan secara visual
- Tabel lengkap dengan pagination
- Filter berdasarkan status (Paid / Upcoming) dan periode pembayaran
- Pencarian berdasarkan nama langganan
- Kategorisasi: Music, Entertainment, Productivity, Creative, Design, Storage, Development

### Notifikasi

- Pengingat otomatis sebelum tanggal jatuh tempo
- Penjadwalan notifikasi berdasarkan tanggal pembayaran

### Analitik (Premium)

- Laporan pengeluaran bulanan
- Ringkasan per kategori
- Tips penghematan berdasarkan total pengeluaran

### Riwayat Langganan

- Pencatatan riwayat dengan status: Active, Inactive, Canceled, Expired, Upgraded, Downgraded
- Tracking waktu mulai dan selesai langganan

### Profil Pengguna

- Manajemen profil dan foto profil
- Sistem keanggotaan dua tier: **Regular** dan **Premium**

### Sistem Premium

- User Regular: Maksimal 5 langganan, tanpa akses analitik
- User Premium: Langganan tak terbatas, akses penuh fitur analitik
- Upgrade dengan sistem pembayaran (Bank Transfer / E-Wallet / Kartu)
- Manajemen masa berlaku premium

---

## Tech Stack

### Backend

| Teknologi           | Versi  | Keterangan                         |
| ------------------- | ------ | ---------------------------------- |
| **Java**            | 17     | Bahasa pemrograman utama           |
| **Spring Boot**     | 4.0.6  | Framework backend                  |
| **Spring Security** | -      | Autentikasi & otorisasi            |
| **Spring Data JPA** | -      | ORM & akses database               |
| **MySQL**           | -      | Database relasional                |
| **JWT (jjwt)**      | 0.11.5 | Token-based authentication         |
| **Lombok**          | -      | Mengurangi boilerplate code        |
| **Maven**           | -      | Build tool & dependency management |

### Frontend

| Teknologi        | Versi  | Keterangan                        |
| ---------------- | ------ | --------------------------------- |
| **Next.js**      | 16.2.4 | React framework dengan App Router |
| **React**        | 19.2.4 | UI library                        |
| **TypeScript**   | 5.x    | Type-safe JavaScript              |
| **Tailwind CSS** | 4.x    | Utility-first CSS framework       |
| **Zustand**      | 5.0.14 | State management                  |
| **Lucide React** | 1.16.0 | Ikon                              |
| **jwt-decode**   | 4.0.0  | Decode JWT di client-side         |

---

## Database Schema

Aplikasi menggunakan **MySQL** dengan entitas berikut:

| Model                   | Deskripsi                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **User**                | Data pengguna dengan tipe `REGULAR` atau `PREMIUM` (polymorphism via Single Table Inheritance)       |
| **Subscription**        | Langganan digital pengguna dengan status `PAID` / `UPCOMING` dan periode pembayaran                  |
| **Notification**        | Pengingat otomatis yang dijadwalkan berdasarkan tanggal jatuh tempo langganan                        |
| **Report**              | Laporan analitik bulanan dengan ringkasan per kategori dan tips penghematan (Premium)                |
| **SubscriptionHistory** | Riwayat perubahan langganan dengan status: Active, Inactive, Canceled, Expired, Upgraded, Downgraded |
| **Payment**             | Data pembayaran upgrade premium (Bank Transfer, E-Wallet, Kartu)                                     |

## Kontributor

Dikembangkan oleh **Tim RemindMe**.

---
