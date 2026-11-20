# DOKUMENTASI TOOL & BATASAN AKSES
## Produk: Aviako Risk Register Assistant (RiskRegen)
**Target CPMK:** Sub-CPMK-2, Sub-CPMK-4, Sub-CPMK-6 (Blok B & Blok D)

Sesuai aturan Modul AI Engineering:
Setiap tool harus memiliki aturan tertulis mengenai kegunaan, parameter, kapan **tidak** boleh dipakai, serta batas aksesnya (*read-only* vs *write/external action*).

---

### Tool 1: `hitung_skor_risiko`
- **Kegunaan:** Menghitung skor perkalian matriks risiko deterministik ($\text{Likelihood} \times \text{Impact}$) dan mengklasifikasikan tingkat keparahan risiko (`rendah`, `sedang`, `tinggi`).
- **Parameter Input:**
  - `likelihood` (integer, 1 sampai 5)
  - `impact` (integer, 1 sampai 5)
- **Output:**
  - `skor`: integer hasil perkalian (1–25)
  - `tingkat`: `'rendah'` (skor < 7), `'sedang'` (skor 7–14), `'tinggi'` (skor $\ge$ 15).
- **Kapan TIDAK Boleh Dipakai:**
  - **JANGAN DIPAKAI** bila salah satu nilai `likelihood` atau `impact` tidak diketahui, bernilai `null`, atau masih dalam status ambigu (`perlu_verifikasi`).
  - **JANGAN DIPAKAI** untuk perhitungan di luar skala integer 1–5.
- **Batas Akses:** 
  - **Boleh Berjalan Otomatis (Read-Only):** Karena murni perhitungan matematis lokal tanpa efek samping (*side effect*) dan tidak mengubah data eksternal.

---

### Tool 2: `cari_dokumen_rujukan` (Diversity-Aware Multi-Document Retrieval)
- **Kegunaan:** Menemukan cuplikan teks dan nomor klausul rujukan yang relevan dari dokumen standar risiko (ISO 31000, ISO 27005, NIST CSF, COBIT 2019, POJK 13/2020, Kebijakan Internal) berdasarkan kata kunci masalah/insiden operasional secara berimbang lintas dokumen.
- **Parameter Input:**
  - `query` (teks pencarian kata kunci insiden)
- **Output:**
  - Maksimal 6 cuplikan teks relevan (maksimal 600 karakter per cuplikan) dengan rincian nama dokumen, bobot relevansi, dan teks kutipan asli.
- **Kapan TIDAK Boleh Dipakai:**
  - **JANGAN DIPAKAI** untuk mencari data pribadi pegawai atau dokumen di luar direktori dokumen rujukan resmi.
  - **JANGAN DIPAKAI** bila masukan pengguna sudah sangat jelas berupa instruksi penolakan/out-of-scope.
- **Batas Akses:** 
  - **Boleh Berjalan Otomatis (Read-Only):** Hanya membaca dokumen yang telah diunggah dan terverifikasi di sistem.

---

### Tool 3: `hitung_denda_sla_vendor` (Deterministik Finansial)
- **Kegunaan:** Menghitung denda penalti finansial dan menetapkan kategori sanksi keterlambatan vendor berdasarkan durasi downtime di luar batas toleransi SLA (60 menit).
- **Parameter Input:**
  - `downtimeMenit` (integer durasi insiden)
  - `tierVendor` (integer tier kontrak vendor, default 1)
- **Output:**
  - `{ kenaPinalti, downtimeTotalMenit, jamTerlambat, dendaRp, kategoriSanksi, catatan }`
- **Kapan TIDAK Boleh Dipakai:**
  - **JANGAN DIPAKAI** bila teks keluhan tidak memuat indikator waktu eksplisit (menit atau jam).
- **Batas Akses:** 
  - **Boleh Berjalan Otomatis (Read-Only):** Murni kalkulator matematis di sisi backend tanpa memotong saldo rekening/mengirim surat otomatis.

---

### Tool 4: `simpan_register_risiko` (Human-in-the-Loop)
- **Kegunaan:** Menyimpan data register risiko final yang telah diverifikasi ke dalam basis data register organisasi permanen (`registers.json`).
- **Parameter Input:**
  - `sessionId` (string ID sesi analisis)
  - `title` (string judul register risiko)
  - `daftar_risiko` (objek array risiko tervalidasi)
  - `status` (string status pengesahan: `final`)
- **Output:**
  - Status konfirmasi penyimpanan dan ID register baru (`REG-...`).
- **Kapan TIDAK Boleh Dipakai:**
  - **JANGAN DIPAKAI** secara otomatis tanpa persetujuan manual dari pengguna.
- **Batas Akses:** 
  - **WAJIB PERSETUJUAN MANUSIA (Human Approval):** Sesuai prinsip Blok B & Blok D, tool yang mengubah data atau menulis ke penyimpanan permanen tidak boleh berjalan otomatis.

