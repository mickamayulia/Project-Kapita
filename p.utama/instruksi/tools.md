# DOKUMENTASI TOOL & BATASAN AKSES (Minggu 6)
## Produk: Aviako Risk Register Assistant (RiskRegen)

Sesuai aturan Modul AI Engineering Minggu 6:
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

### Tool 2: `cari_dokumen_rujukan` (Internal Retrieval)
- **Kegunaan:** Menemukan cuplikan teks dan nomor klausul rujukan yang relevan dari dokumen standar risiko (ISO 31000, ISO 27005, NIST CSF, COBIT) berdasarkan kata kunci masalah/insiden operasional.
- **Parameter Input:**
  - `query` (teks pencarian kata kunci insiden)
- **Output:**
  - Cuplikan teks (maksimal 700 karakter) beserta nama dokumen dan klausul/bagian.
- **Kapan TIDAK Boleh Dipakai:**
  - **JANGAN DIPAKAI** untuk mencari data pribadi pegawai atau dokumen di luar direktori dokumen rujukan resmi.
  - **JANGAN DIPAKAI** bila masukan pengguna sudah sangat jelas berupa instruksi penolakan/out-of-scope.
- **Batas Akses:** 
  - **Boleh Berjalan Otomatis (Read-Only):** Hanya membaca dokumen yang telah diunggah dan terverifikasi di sistem.

---

### Tool 3: `simpan_register_risiko` (Human-in-the-Loop)
- **Kegunaan:** Menyimpan data register risiko final yang telah diverifikasi ke dalam file basis data register organisasi.
- **Parameter Input:**
  - `daftar_risiko` (objek array risiko tervalidasi)
- **Output:**
  - Status konfirmasi penyimpanan dan ID register.
- **Kapan TIDAK Boleh Dipakai:**
  - **JANGAN DIPAKAI** secara otomatis tanpa persetujuan manual dari pengguna.
- **Batas Akses:** 
  - **WAJIB PERSETUJUAN MANUSIA (Human Approval):** Sesuai prinsip Minggu 6, tool yang mengubah data atau menulis ke penyimpanan permanen tidak boleh berjalan otomatis.

