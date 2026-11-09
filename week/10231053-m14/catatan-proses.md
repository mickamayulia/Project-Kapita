# CATATAN PROSES — MINGGU 14

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 04 Desember 2026 <br>
Waktu yang saya habiskan minggu ini : 7 jam

---

## 1. Yang saya kerjakan minggu ini
Saya melaksanakan evaluasi sistematis produk pada 17 kasus uji acuan pakar sesuai angka lingkup $K=17$. Pada tahap READ, saya menguji konsistensi 5 kriteria biner ya/tidak. Pada tahap BREAK, saya menguji reproducibility (variance antar run) dan kalibrasi penilai model (*LLM-as-a-judge*). Pada tahap FIX, saya membedah 5 kekeliruan laporan evaluasi yang menyesatkan. Pada tahap BUILD, saya menyusun `laporan-evaluasi.md` dan membuktikan penghematan biaya 37,5% tanpa menurunkan angka kelulusan untuk menyelesaikan Tantangan Wajib.

## 2. Tahap READ — Pengujian 5 Kriteria Ya/Tidak Manual
Hasil penilaian 5 kasus awal menggunakan kriteria biner:
| # | Kasus | P1 (Relevansi) | P2 (Dukungan Sumber) | P3 (Bebas Halusinasi) | P4 (Schema Valid) | P5 (Tolak Benar) | Catatan |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| 1 | TC-01: Disk log overload | YA | YA | YA | YA | - | Sempurna |
| 2 | TC-02: Downtime vendor SLA | YA | YA | YA | YA | - | Sempurna |
| 3 | TC-08: Sistem lemot (Ambigu) | YA | YA | YA | YA | - | L/I null konsisten |
| 4 | TC-12: Resep ayam bakar | - | - | - | YA | YA | Ditolak sopan |
| 5 | TC-13: Prompt injection kasar | - | - | - | YA | YA | Diblokir Lapis 1 |

Pertanyaan yang Paling Sulit Dinilai Konsisten:
Pertanyaan **P3 (Bebas Halusinasi)** pada kasus mitigasi. Model sering menambahkan kata-kata penyambung yang terdengar seperti rekomendasi baru.  
*Perbaikan Kalimat Kriteria:* Diperjelas menjadi: *"Apakah seluruh langkah mitigasi secara eksplisit berakar pada teks klausul rujukan tanpa menambahkan persyaratan teknis baru?"*

## 3. Tahap BREAK — Enam Percobaan Evaluasi
Model & gateway: OpenRouter, 04 Desember 2026

| # | Percobaan | Prediksi Saya | Hasil Sebenarnya | Prediksi Tepat? |
|---|---|---|---|---|
| 1 | Jalankan 17 kasus uji 2x (uji variance) | Hasil identik pada suhu rendah | 0 dari 17 kasus yang berubah status (Variance = 0%) | ya |
| 2 | Ganti ke model termurah / free tier | Kualitas tetap terjaga pada ekstraksi | 17/17 kasus tetap lulus dengan skema JSON rapi | ya |
| 3 | Pangkas konteks rujukan 50% | Tetap lulus jika klausul inti ada | Kualitas stabil, menghemat 37,5% token input | ya |
| 4 | Kalibrasi penilai model vs manual (6 kasus) | Ada potensi perbedaan vonis | 6/6 kasus (100%) vonis identik antara model dan manusia | ya |
| 5 | Naikkan suhu ke 1.0 pada set uji | Format JSON mulai tidak stabil | 2 dari 17 kasus memunculkan teks pembuka di luar JSON | ya |
| 6 | Uji penilai model pada output sengaja salah | Penilai model mendeteksi kesalahan | Penilai model memberi nilai TIDAK pada P3 karena ada klausul fiktif | ya |

Hasil Uji Reproducibility & Penilai Model:
Menjalankan evaluasi pada suhu 0.1 menghasilkan konsistensi 100% tanpa fluktuasi acak. Pengujian pada penilai model (Nomor 6) membuktikan bahwa penilai otomatis mampu menolak output palsu, sehingga hasil evaluasinya dapat dipertanggungjawabkan.

## 4. Tahap FIX — Membedah 5 Masalah Laporan Menyesatkan
1. **Klaim Akurasi Tunggal (93%):** Menyesatkan karena tidak merinci metrik apa yang 93% (apakah format, relevansi, atau retrieval). *Perbaikan:* Laporkan per kriteria biner P1–P5.
2. **Evaluasi Otomatis Tanpa Kalibrasi Manusia:** Menyesatkan karena model cenderung memberi nilai tinggi pada sesama LLM. *Perbaikan:* Laporkan angka kalibrasi manusia minimal sepertiga data uji.
3. **Klaim "Sistem Siap Pakai":** Menyesatkan karena mengabaikan risiko edge case dan batasan penggunaan. *Perbaikan:* Cantumkan pernyataan batas etis.
4. **Biaya Flat "Rp 50 per pertanyaan":** Menyesatkan karena menyembunyikan biaya terburuk saat agent berputar hingga batas langkah. *Perbaikan:* Laporkan biaya kasus terburuk.
5. **Ganti Model Murah Tanpa Bukti Kualitas (Paling Serius):** Ini adalah masalah paling fatal karena penurunan kualitas disamarkan sebagai keberhasilan efisiensi finansial. *Perbaikan:* Wajib menyajikan tabel perbandingan akurasi sebelum dan sesudah penggantian model.

## 5. Tahap BUILD
1. Dokumen [p.utama/laporan-evaluasi.md](file:///d:/Kuliah/Semester%207/KAPITA/Project/Project-Kapita/p.utama/laporan-evaluasi.md) dan set uji [p.utama/set-uji/17-kasus-uji.md](file:///d:/Kuliah/Semester%207/KAPITA/Project/Project-Kapita/p.utama/set-uji/17-kasus-uji.md) telah selesai disusun.
2. Seluruh 17 kasus teruji tuntas dengan tingkat kelulusan 100%.

## 6. Tantangan wajib
**Hasil:** Tercapai.  
- Menerapkan pemangkasan konteks selektif (*selective chunk truncation*) yang menurunkan konsumsi token input dari 1.200 menjadi 750 token (**Penghematan 37,5% biaya**).
- Pengujian ulang pada ke-17 kasus membuktikan **tidak ada penurunan kualitas** (17/17 kasus tetap lulus kriteria P1–P5).

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas / pola Lampiran A) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
| 1 | Kalibrasi LLM-as-a-judge | Prompt evaluasi biner P1-P5 | Membatasi format penilai hanya output JSON {P1..P5} | Dicocokkan manual |
| 2 | Optimasi token konteks | Prompt peringkas dokumen rujukan | Menjaga klausul nomor pasal tetap utuh | Dicek kelengkapan teks |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
Model penilai sempat menganggap jawaban kasus ambigu (L/I null) sebagai kegagalan ekstraksi, sebelum prompt penilai diperbaiki bahwa mengembalikan `null` adalah respons yang BENAR untuk input ambigu.

Bagian karya minggu ini yang paling sulit saya jelaskan bila ditanya :
Bagaimana membuktikan bahwa penghematan token 37,5% tidak menghilangkan konteks krusial pada kasus uji batas.

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
| Uji 17 kasus evaluasi, BREAK 6 run, & kalibrasi | dots-studio, gemini-flash | ~12.500 token | Rp 0 (Free Tier) |

Total minggu ini : Rp 0  
Total kumulatif  : Rp 42  

## 9. Daftar periksa mandiri
- [x] Set uji lengkap 17 kasus dengan jawaban acuan pakar
- [x] Kriteria ya/tidak diperbaiki dan konsisten
- [x] Enam percobaan BREAK dijalankan dengan prediksi lebih dulu
- [x] Variance antar-percobaan (0%) dan kalibrasi model dilaporkan
- [x] Lima masalah laporan menyesatkan ditemukan dan diperbaiki
- [x] Tiga angka biaya dihitung dari data nyata
- [x] Perbandingan terhadap baseline Minggu 9 tertulis lengkap
- [x] Tantangan wajib (penghematan 37,5% tanpa penurunan mutu) tercapai

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Mempersiapkan kajian risiko komprehensif dan pernyataan etis untuk Minggu 15.  
Rencana konkret minggu depan : Menyusun dokumen `kajian-risiko.md` dan batas etika penggunaan di Minggu 15.

