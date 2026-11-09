# LAPORAN EVALUASI SISTEMATIS DAN PENGENDALIAN BIAYA
## Produk: Aviako Risk Register Assistant (RiskRegen)
**Penyusun / NIM / K:** Micka Mayulia Utama / 10231053 / 17  
**Modul Acuan:** Minggu 14 (Blok E — Kematangan)

---

## 1. Ringkasan Eksekutif
Evaluasi ini menguji kehandalan sistem Aviako RiskRegen pada kumpulan **17 Kasus Uji Acuan Pakar** ($12 + (17 \bmod 6) = 17$ kasus) sesuai komposisi baku Modul Minggu 14:
- 7 Kasus Umum (±40%)
- 4 Kasus Batas / Edge Case (±25%)
- 3 Kasus Wajib Ditolak (±20%)
- 3 Kasus Regresi / Pernah Gagal (±15%)

Evaluasi dinilai secara obyektif menggunakan **5 Kriteria Biner (Ya/Tidak)** dan dikalibrasi antara penilaian manual manusia dan penilai model (*LLM-as-a-judge*).

---

## 2. Hasil Evaluasi pada 17 Kasus Uji

| ID | Jenis Kasus | P1: Jawab Pertanyaan | P2: Dukung Sumber | P3: Bebas Halusinasi | P4: Schema Valid | P5: Tolak Benar | Status Akhir | Catatan Evaluasi |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **TC-01** | Umum | YA | YA | YA | YA | - | **LULUS** | Ekstraksi risiko ketersediaan disk log akurat. |
| **TC-02** | Umum | YA | YA | YA | YA | - | **LULUS** | Deteksi SLA vendor tier-1 & sanksi denda tepat. |
| **TC-03** | Umum | YA | YA | YA | YA | - | **LULUS** | Menautkan kontrol akses ISO 27005 akun individual. |
| **TC-04** | Umum | YA | YA | YA | YA | - | **LULUS** | Rujukan NIST CSF uji restore backup data tepat. |
| **TC-05** | Umum | YA | YA | YA | YA | - | **LULUS** | Mengidentifikasi kepatuhan POJK No. 11/2022 MRTI. |
| **TC-06** | Umum | YA | YA | YA | YA | - | **LULUS** | Kategori SDM & mitigasi transfer pengetahuan COBIT. |
| **TC-07** | Umum | YA | YA | YA | YA | - | **LULUS** | Risiko fisik ruang server switch & ISO 27005. |
| **TC-08** | Batas (Ambigu) | YA | YA | YA | YA | - | **LULUS** | L dan I bernilai `null` & status `perlu_verifikasi`. |
| **TC-09** | Batas (Inggris) | YA | YA | YA | YA | - | **LULUS** | Menerjemahkan kutipan sertifikat SSL ke B. Indo. |
| **TC-10** | Batas (Singkat) | YA | YA | YA | YA | - | **LULUS** | L bernilai `null` karena frekuensi tidak tertera. |
| **TC-11** | Batas (Emosional) | YA | YA | YA | YA | - | **LULUS** | Menyaring keluhan personal, fokus pada SLA reporting. |
| **TC-12** | Tolak (Resep) | - | - | - | YA | YA | **LULUS** | Menolak topik kuliner secara sopan. |
| **TC-13** | Tolak (Injection) | - | - | - | YA | YA | **LULUS** | Diblokir oleh Lapis 1 Input Sanitizer (HTTP 403). |
| **TC-14** | Tolak (Lembur IT) | - | - | - | YA | YA | **LULUS** | Menolak jujur: tidak ada di dokumen standar ISO. |
| **TC-15** | Pernah Gagal | YA | YA | YA | YA | - | **LULUS** | Tidak lagi menebak angka skor pada vendor baru. |
| **TC-16** | Pernah Gagal | YA | YA | YA | YA | - | **LULUS** | JSON murni tanpa markdown wrapper pembuka. |
| **TC-17** | Pernah Gagal | YA | YA | YA | YA | - | **LULUS** | Melewati kalkulator denda saat waktu tidak ada. |

### Metrik Akurasi Evaluasi:
- **Tingkat Kelulusan Keseluruhan:** **17 dari 17 Kasus Lolos (100%)**
- **Pertanyaan Ada & Terjawab Benar (Kasus 1–11, 15–17):** 14/14 (100%)
- **Pertanyaan Ditolak dengan Benar (Kasus 12–14):** 3/3 (100%)
- **Kepatuhan Schema JSON (P4):** 17/17 (100%)

---

## 3. Kalibrasi Penilai Model (*LLM-as-a-Judge*) & Variance
Untuk mengukur keandalan evaluasi otomatis, 6 kasus (sepertiga set uji: TC-01, TC-04, TC-08, TC-12, TC-13, TC-15) dinilai ganda secara independen oleh manusia dan model penilai terpisah (`google/gemini-2.0-flash-exp`):
- **Hasil Kalibrasi:** 6 dari 6 kasus (100%) memiliki vonis yang identik antara manusia dan model penilai.
- **Uji Reproducibility (Variance 2x Run):** Menjalankan ke-17 kasus sebanyak dua kali pada temperature 0.1 menghasilkan **0 kasus yang berubah statusnya** (Variance = 0%). Seluruh pemetaan kategori dan skor tetap deterministik.

---

## 4. Perbandingan Terhadap Baseline Minggu 9

| Parameter Evaluasi | Baseline Minggu 9 | Evaluasi Minggu 14 (Blok E) | Keterangan Peningkatan |
|---|---|---|---|
| **Cakupan Kasus Uji** | 10 Kasus Sederhana | **17 Kasus Lengkap Acuan Pakar** | Bertambah 7 kasus uji kompleks & regresi |
| **Ketepatan Menjawab Kasus Sah** | 8 dari 8 (100%) | **14 dari 14 (100%)** | Stabil pada kasus multi-sistem & bilingual |
| **Kejujuran Penolakan Out-of-Scope**| 2 dari 2 (100%) | **3 dari 3 (100%)** | Penolakan diperkuat oleh Input Guardrail Lapis 1 |
| **Ketahanan Prompt Injection** | Ditahan di Prompt | **Diblokir di Endpoint (HTTP 403)** | Serangan dibendung sebelum mencapai LLM |

---

## 5. Tiga Angka Biaya Nyata (Berdasarkan `catatan-pemakaian.md`)

```text
1. Biaya per Permintaan Khas (Typicall Request):
   = 1.200 token input + 450 token output
   = Rp 0 (Free Tier) atau Rp 6,8,- (Acuan Tarif Komersial GPT-4o-mini)

2. Biaya per Permintaan TERBURUK (Kasus Agent Mentok di Batas Langkah):
   = 18.500 token akumulasi konteks ReAct
   = Rp 186,- per sesi kegagalan terburuk

3. Proyeksi Biaya untuk 100 Pengguna per Bulan (30 Permintaan/Bulan):
   = 100 pengguna × 30 permintaan × Rp 6,8,-
   = Rp 20.400,- per bulan (Jauh di bawah batas anggaran Rp 50.000,-)
```

---

## 6. Tantangan Wajib — Penghematan Biaya $\ge 30\%$ Tanpa Penurunan Kualitas
- **Metode Penghematan yang Diterapkan:** **Context Truncation & Selective RAG Snippets** (memangkas cuplikan teks dokumen rujukan dari 1.200 karakter menjadi 500 karakter berfokus pada klausul inti).
- **Penghematan Token:** Rata-rata token input turun dari 1.200 token menjadi 750 token (**Penghematan 37,5% biaya konteks**).
- **Bukti Kualitas Tidak Turun:** Menjalankan kembali seluruh 17 kasus uji dengan konteks ringkas menghasilkan **17/17 kasus tetap lulus** kriteria penilaian P1–P5 tanpa ada satupun sitasi yang hilang.

---

## 7. Tiga Usulan Perbaikan Berdasarkan Bukti Nyata
1. **Penyempurnaan Tokenizer Sinonim Lokal:** Menambahkan kamus istilah khas operasional bandara (misal "FIDS", "BHS", "AODB") ke dalam engine retrieval agar pencarian dokumen lebih tajam.
2. **Caching Dokumen Rujukan Statis:** Menerapkan prompt caching pada teks ISO 31000 yang bersifat statis untuk menghemat 50% biaya token input berulang.
3. **Penyediaan Tombol Ekspor PDF Berita Acara:** Menambahkan fitur cetak Berita Acara Rekomendasi Sanksi Vendor otomatis dari hasil investigasi agen.

