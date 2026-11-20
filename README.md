# README — PORTOFOLIO PROYEK AKHIR
# Aviako Risk Register Assistant (RiskRegen)

**Kapita Selekta: AI Engineering (Ganjil 2026/2027)**  
- **Nama Mahasiswa :** Micka Mayulia Utama  
- **NIM            :** 10231053  
- **Kode Peserta K :** 5  
- **Program Studi  :** Sistem Informasi / Teknologi Informasi  

---

## 1. Ringkasan Eksekutif & Persoalan Nyata

### Siapa yang Mengalami Persoalan Ini?
Manajer operasional dan staf non-IT pada organisasi pengguna TI (seperti pengelola bandara Aviako Sepinggan) yang **tidak memiliki divisi IT internal** dan bergantung penuh pada vendor pihak ketiga.

### Bagaimana Persoalan Diselesaikan Sekarang?
Risiko dan insiden TI dicatat tidak teratur, tersebar di chat WhatsApp, email komplain, dan notulen rapat tanpa register risiko formal. Evaluasi kemungkinan (*likelihood*) dan dampak (*impact*) dilakukan secara tebak-tebakan subjektif tanpa acuan kerangka baku.

### Mengapa Cara Sekarang Belum Cukup?
- Tidak ada catatan register risiko TI yang dapat diaudit regulator (POJK/Kemenhub/ISO).
- Tidak ada dasar kuantitatif objektif untuk memprioritaskan penanganan dan penalti SLA vendor.
- Risiko terulang terus-menerus karena ketiadaan dokumentasi mitigasi terstandar.

### Mengapa AI Generatif (Bukan Basis Data / Aturan Biasa)?
Masukan pengguna berbentuk **teks bebas tidak terstruktur** (catatan insiden, keluhan operasional, kronologi bahasa alami) yang sarat ambiguitas. Sistem membutuhkan pemahaman bahasa untuk mengekstrak kandidat risiko, mengategorikan taksonomi secara kontekstual, menelusuri rujukan standar (*RAG Grounding*), dan membedah efek domino insiden ke berbagai dimensi risiko.

---

## 2. Angka Lingkup Peserta ($K = 5$)
Dihitung berdasarkan rumus Lampiran B Modul Perkuliahan:
- **Dokumen Rujukan Minimum :** $5 + (5 \\bmod 4) = 5 + 1 =$ **6 dokumen** *(Sistem menerapkan 8 dokumen rujukan)*
- **Kasus Uji Minimum       :** $12 + (5 \\bmod 6) = 12 + 5 =$ **17 kasus uji**
- **Tool Minimum            :** $2 + (5 \\bmod 2) = 2 + 1 =$ **3 tool** *(Sistem mengimplementasikan 4 tool)*
- **Mode Output Tambahan    :** $K$ ganjil $\rightarrow$ **Tidak wajib**

---

## 3. Arsitektur Sistem & Alur Kerja (End-to-End)

```text
                     [Input Catatan Insiden Pengguna]
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   LAPIS 1: Input Sanitization & Guardrails (Regex)    │
       │   (Blokir jailbreak, prompt injection & out-of-scope)  │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   DIVERSITY-AWARE MULTI-DOCUMENT RAG RETRIEVAL         │
       │   (Ambil klausul ISO 31000/27005, COBIT, POJK & SOP)   │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   LAPIS 2: LLM Reasoning & Multi-Risk Decomposition   │
       │   (Bedah 4-7 risiko dimensi: Operasional, SLA, SDM)   │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   LAPIS 3: Deterministik Tools Execution (Backend)     │
       │   - Tool 1: hitungSkorRisiko (Likelihood x Impact)     │
       │   - Tool 2: hitungDendaSlaVendor (Kalkulator Finansial)│
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   LAPIS 4: Output Validation & Retry Loop             │
       │   (Validasi skema JSON baku, auto-retry jika cacat)    │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   LAPIS 5: Human-in-the-Loop Approval Gate             │
       │   - Status: awaiting_human_approval                   │
       │   - Render Matriks 5x5 Interaktif & Multi-Sitasi Dok   │
       │   - Ekspor CSV / Simpan Permanen ke registers.json    │
       └────────────────────────────────────────────────────────┘
```

---

## 4. Struktur Direktori Proyek

```text
Project-Kapita/
├── README.md                           <- Panduan portofolio utama & alur produk
├── catatan-pemakaian.md                <- Log kumulatif biaya token Minggu 1-16
├── fer.md                              <- Lembar tema proyek resmi
│
├── p.utama/                            <- Source code & berkas arsitektur produk
│   ├── backend/                        <- Server API Express & tools deterministik
│   │   ├── server.js                   <- Logika RAG, routing, agent, guardrails
│   │   ├── data/
│   │   │   ├── documents.json          <- Indeks metadata & teks 8 dokumen rujukan
│   │   │   ├── sessions.json           <- Riwayat sesi analisis pengguna
│   │   │   ├── registers.json          <- Basis data register risiko terverifikasi
│   │   │   └── agent_tasks.json        <- State memory luar percakapan
│   │   └── uploads/                    <- File fisik PDF/dokumen rujukan
│   ├── frontend/                       <- Web UI React + Vite + Recharts
│   │   └── src/
│   │       ├── App.jsx                 <- State controller & router peran (User/Admin)
│   │       ├── index.css               <- Styling responsive & glassmorphism
│   │       └── components/             <- Pemisahan komponen antarmuka modular
│   │           ├── LoginPortal.jsx     <- Portal login peran (Staf vs Admin + 1-klik)
│   │           ├── Navbar.jsx          <- Navbar atas, badge peran, & kontrol logout
│   │           ├── AnalysisView.jsx    <- Form analisis insiden & matriks 5x5
│   │           ├── RecordsView.jsx     <- Draf laporan staf & Master Register admin
│   │           ├── AdminDocsView.jsx   <- Knowledge base & upload dokumen acuan RAG
│   │           ├── SettingsView.jsx    <- Konfigurasi API OpenRouter & model default
│   │           └── DocumentModal.jsx   <- Modal baca dokumen rujukan & toast popup
│   ├── instruksi/
│   │   ├── v1.md                       <- System prompt awal baseline
│   │   ├── v2.md                       <- System prompt terstruktur + few-shot
│   │   ├── CATATAN.md                  <- Riwayat versi perubahan prompt
│   │   ├── tools.md                    <- Dokumentasi 4 tool & batasan akses
│   │   └── guardrails.md               <- Rincian 5 lapis pertahanan sistem
│   ├── set-uji/
│   │   └── 17-kasus-uji.md             <- 17 Kasus Uji Acuan Pakar (P1-P5)
│   ├── analisis-workflow-vs-agen.md    <- Analisis 5 dimensi & biaya Workflow vs Agent
│   ├── rancangan-rag.md                <- 6 keputusan desain RAG beralasan
│   ├── laporan-evaluasi.md             <- Hasil evaluasi, kalibrasi, & hemat 37.5%
│   ├── kajian-risiko.md                <- Kajian 5 risiko, bias, & batas etika
│   └── refleksi.md                     <- Refleksi personal 1 halaman penuh untuk UAS
│
└── week/                               <- Catatan proses mingguan resmi (Lampiran C)
    ├── 10231053-m1/catatan-proses.md   <- Minggu 1: Lanskap AI Engineering
    ├── 10231053-m2/catatan-proses.md   <- Minggu 2: Token, Biaya, Suhu
    ├── 10231053-m3/catatan-proses.md   <- Minggu 3: OpenRouter Gateway & Model
    ├── 10231053-m4/catatan-proses.md   <- Minggu 4: Prompt Terstruktur & Versi
    ├── 10231053-m5/catatan-proses.md   <- Minggu 5: Structured JSON Schema
    ├── 10231053-m6/catatan-proses.md   <- Minggu 6: Tool Calling Deterministik
    ├── 10231053-m7/catatan-proses.md   <- Minggu 7: Chunking & RAG Architecture
    ├── 10231053-m08/                   <- Minggu 8: UTS (rancangan-sistem.md & PPT.pdf)
    ├── 10231053-m9/catatan-proses.md   <- Minggu 9: RAG Utuh & 2 Angka Baseline
    ├── 10231053-m10/catatan-proses.md  <- Minggu 10: Workflow vs Agent & ReAct Loop
    ├── 10231053-m11/catatan-proses.md  <- Minggu 11: Bounded Agent & Memory Luar
    ├── 10231053-m12/catatan-proses.md  <- Minggu 12: Studi Kasus ASDOS-AI & Peer Review
    ├── 10231053-m13/catatan-proses.md  <- Minggu 13: 5 Lapis Guardrails & Penetrasi
    ├── 10231053-m14/catatan-proses.md  <- Minggu 14: Evaluasi 17 Kasus Uji Pakar
    └── 10231053-m15/catatan-proses.md  <- Minggu 15: Etika, Bias, & Residual Risk
```

---

## 5. Fitur Unggulan Sistem

1. **Visualisasi Matriks Risiko 5 × 5 Interaktif per ID Risiko:**
   Bukan sekadar chart jumlah agregat, melainkan pemetaan koordinat nyata Likelihood ($L = 1..5$) $\times$ Impact ($I = 1..5$) lengkap dengan pewarnaan zona risiko baku ISO (Merah, Oranye, Hijau) serta pin badge tiap ID risiko (`R001`, `R002`, dst).
2. **Dekomposisi Multi-Dimensi (Rantai Risiko):**
   Mampu membedah 1 laporan insiden puncak gunung es menjadi 4 hingga 7 butir risiko turunan (aspek operasional, infrastruktur, kepatuhan POJK, SLA kontrak, dan reputasi).
3. **Diversity-Aware Multi-Document RAG:**
   Menghindari masalah *chunk starvation* dengan mengambil kuota seimbang dari standar internasional (ISO/COBIT) dan regulasi lokal (POJK/SOP) sekaligus dalam satu risiko.
4. **Guardrail Ambiguitas (Anti-Halusinasi Skor):**
   Jika input deskriptif tidak memuat indikator waktu/frekuensi kuantitatif, nilai likelihood & impact wajib diset `null` dan berstatus `perlu_verifikasi`. Sistem menolak menebak angka tanpa bukti.
5. **Lima Lapis Pertahanan Keamanan (Defense-in-Depth):**
   Input Sanitizer (HTTP 403) $\rightarrow$ Strict Prompt Boundary $\rightarrow$ Sandboxed Read-Only Tools $\rightarrow$ JSON Schema Retry Loop $\rightarrow$ Human-in-the-Loop Approval Gate.
6. **Pemisahan Peran & Portal Autentikasi Pengguna (Role-Based Access):**
   - **Staf / User Portal:** Antarmuka bersih tanpa konfigurasi teknis rumit, difokuskan pada input insiden operasional, simulasi matriks 5×5, dan penyimpanan draf.
   - **Administrator Portal:** Dilengkapi otentikasi PIN/Password (`admin123`), akses pengelolaan *Knowledge Base* dokumen acuan RAG, manajemen master register seluruh organisasi, serta pengaturan API gateway LLM.
   - **Mode Demo Cepat (1-Klik):** Tersedia tombol pintas instan untuk demo pengujian di depan dosen tanpa perlu mengetik kredensial manual.
7. **Standar Industri ERM / Resiko.ai (Inherent Risk vs Residual Risk & Risk Owner):**
   - **Inherent Risk (Risiko Awal):** Menghitung keparahan risiko pada saat insiden pertama kali terjadi sebelum adanya kontrol.
   - **Residual Risk (Target Pasca-Mitigasi):** Memproyeksikan penurunan tingkat kemungkinan dan dampak secara kuantitatif setelah langkah mitigasi ISO/COBIT diterapkan.
   - **Penetapan Risk Owner:** Menunjuk otomatis unit kerja/personel penanggung jawab mitigasi (misal: Unit Operasional TI, Tim Legal, atau Vendor Pengelola).
   - **Ekspor CSV Lengkap:** Ekspor data tabular mencakup seluruh atribut Inherent Risk, Residual Risk, Risk Owner, dan multi-sitasi regulasi.

---

## 6. Panduan Menjalankan Sistem (Lokal)

### Prasyarat
- Node.js versi 18+ terpasang di komputer.
- Kredensial API Key OpenRouter (dapat menggunakan model free-tier seperti `dots-studio/dots-3-note-preview:free`).

### Langkah 1 — Menjalankan Backend API
```powershell
cd "d:\Kuliah\Semester 7\KAPITA\Project\Project-Kapita\p.utama\backend"
npm install
npm run dev
```
> Server backend akan aktif di `http://localhost:5000`.

### Langkah 2 — Menjalankan Frontend Web
Buka terminal baru:
```powershell
cd "d:\Kuliah\Semester 7\KAPITA\Project\Project-Kapita\p.utama\frontend"
npm install
npm run dev
```
> Buka browser di `http://localhost:5173`. Masukkan API Key pada menu Pengaturan jika belum terisi di file `.env`.

---

## 7. Pernyataan Batas Penggunaan & Etika Profesional
- Sistem ini adalah **asisten pendukung penyusunan draf rekomendasi risiko**, bukan sistem pengambil keputusan otonom.
- Seluruh nilai skor dan mitigasi wajib ditinjau oleh pejabat berwenang sebelum disahkan ke register resmi organisasi.
- Sistem **dilarang keras digunakan** untuk sistem penunjang keselamatan jiwa langsung (*life-critical systems*) atau dasar pemutusan kontrak/hukum tanpa penyelidikan audit forensik resmi.


