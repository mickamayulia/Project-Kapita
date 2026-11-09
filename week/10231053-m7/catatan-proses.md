# CATATAN PROSES — MINGGU 7

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 16 Oktober 2026 <br>
Waktu yang saya habiskan minggu ini : 6 jam

---

## 1. Yang saya kerjakan minggu ini
Saya merancang arsitektur Retrieval-Augmented Generation (RAG) untuk grounded knowledge risk register. Pada tahap READ, saya melakukan chunking manual dokumen ISO 31000 per klausul. Pada tahap BREAK, saya menguji 5 parameter chunking dan batas similarity. Pada tahap FIX, saya mendiagnosis 4 kesalahan fatal rancangan RAG zonasi. Pada tahap BUILD, saya menyusun dokumen `rancangan-rag.md` lengkap dengan 6 keputusan desain beralasan dan analisis multi-dokumen untuk tantangan wajib.

## 2. Tahap READ
Aturan chunking manual:  
*"Dokumen dipotong berbasis batas semantik klausul/sub-bab (bukan jumlah karakter kaku), dengan panjang 300–500 kata per chunk."*

Tabel 5 Chunk Pertama Dokumen ISO 31000:2018:
| # | Ringkasan isi chunk | Bisa dipahami tanpa chunk lain? | Apa yang hilang kalau dibaca terpisah |
|---|---|---|---|
| 1 | Ruang Lingkup & Definisi Risiko (Klausul 1 & 3) | Ya | Rincian panduan implementasi praktis |
| 2 | Prinsip Manajemen Risiko (Klausul 4: Terintegrasi, Terstruktur, Disesuaikan) | Ya | Hubungan prinsip terhadap peran pimpinan |
| 3 | Kerangka Kerja - Kepemimpinan & Komitmen (Klausul 5.1 & 5.2) | Ya | Keterkaitan ke alokasi sumber daya operasional |
| 4 | Proses - Identifikasi Risiko (Klausul 6.4.2) | Ya | Kriteria pembobotan likelihood dan impact |
| 5 | Proses - Analisis & Evaluasi Risiko (Klausul 6.4.3 & 6.4.4) | Sebagian | Definisi level toleransi risiko organisasi |

Tiga pertanyaan yang jawabannya ADA di dokumen:
1. *"Apa definisi risiko menurut standar ISO?"* $\rightarrow$ Chunk 1.
2. *"Mengapa pimpinan puncak wajib menunjukkan komitmen manajemen risiko?"* $\rightarrow$ Chunk 3.
3. *"Apa saja yang harus diidentifikasi dalam analisis sumber risiko?"* $\rightarrow$ Chunk 4.

Satu pertanyaan yang jawabannya TIDAK ADA (namun terdengar ada):
*"Berapa batas nominal kerugian finansial yang mewajibkan lapor ke dewan direksi menurut ISO 31000?"* (ISO 31000 hanya memberikan panduan prinsip kualitatif, bukan nominal uang).

## 3. Tahap BREAK
Percobaan pengujian chunking & pencarian:

| # | Percobaan | Prediksi saya | Hasil sebenarnya | Prediksi tepat? |
|---|---|---|---|---|
| 1 | Chunk sangat kecil (± 1 kalimat) | Kehilangan konteks makna | Chunk terpilih tepat di kata kunci, namun model bingung konteks klausul induknya | ya |
| 2 | Chunk sangat besar (± 3 halaman) | Pencarian kurang tajam & token boros | Terbawa banyak teks yang tidak relevan sehingga latensi naik ke 3.9 detik | ya |
| 3 | Tanpa overlap vs dengan overlap | Dengan overlap lebih utuh | Tanpa overlap kalimat definisi terpotong di perbatasan; dengan overlap konteks utuh | ya |
| 4 | Pertanyaan memakai istilah sinonim yang tidak ada di teks | Keyword search gagal, semantic lolos | Pencarian teks biasa (grep) 0 hasil; semantic embedding menemukan klausul terkait | ya |
| 5 | Pertanyaan yang jawabannya tidak ada di dokumen | Sistem tetap mengembalikan chunk acak | Sistem mengembalikan chunk dengan kemiripan rendah (score: 0.28) | ya |

Analisis Percobaan Nomor 5:
Sistem tetap mengembalikan chunk meskipun tidak ada jawaban, namun skor kemiripannya sangat rendah ($\approx 0.28$). Tanpa batasan nilai ambang minimum (*threshold*), chunk tidak relevan ini akan tetap dipaksakan masuk ke konteks, menyebabkan model berhalusinasi. Maka dari itu, sistem wajib menerapkan threshold minimum (misal similarity $\ge 0.65$ atau token match $\ge 2$).

## 4. Tahap FIX
Analisis 4 Kesalahan Rancangan RAG Zonasi:
1. **Kesalahan 1:** Chunking setiap 2.000 huruf tanpa overlap.  
   *Masalah:* Kalimat pasal terpotong sembarangan di tengah kalimat tanpa kesinambungan.  
   *Perbaikan:* Chunking per pasal/klausul dengan overlap 100 huruf.
2. **Kesalahan 2:** Metadata kosong (hanya teks murni).  
   *Masalah:* Model tidak bisa menyebutkan nomor pasal atau nama dokumen perda rujukan.  
   *Perbaikan:* Tambahkan metadata `perda_id`, `nomor_pasal`, dan `tahun`.
3. **Kesalahan 3:** Mengambil 3 chunk teratas tanpa batas kemiripan (*no threshold*).  
   *Masalah:* Jika perda zonasi kawasan tersebut tidak ada di database, sistem tetap mengambil 3 perda wilayah lain dan memaksakannya ke model.  
   *Perbaikan:* Berikan batas threshold kemiripan. Jika di bawah threshold, sistem mengembalikan status "Dokumen zonasi tidak ditemukan".
4. **Kesalahan 4 (Paling Merugikan Pengguna):**  
   Instruksi: *"Kalau konteks kurang, gunakan pengetahuanmu sendiri."*  
   *Mengapa Paling Berbahaya:* Ini adalah kesalahan etis paling fatal. Model akan mencampuradukkan peraturan hukum resmi dengan halusinasi pengetahuan publiknya. Pengguna mengira izin zonasi yang dikeluarkan sah menurut hukum setempat, padahal mengarang, yang berakibat sanksi hukum/denda bagi pengguna.  
   *Perbaikan:* Ganti dengan aturan tegas: "Jika informasi tidak tercantum di konteks rujukan, tolak dengan kalimat 'Informasi tidak ditemukan di dokumen rujukan resmi'."

## 5. Tahap BUILD
Dokumen `p.utama/rancangan-rag.md` telah dibuat lengkap memuat:
1. Daftar 8 dokumen rujukan sah ($K=17$).
2. Tabel 6 keputusan desain RAG lengkap dengan alasannya.
3. Contoh prompt grounding context.
4. System prompt dengan aturan strict context boundary.
5. 10 pertanyaan uji (6 ada, 2 tersebar di 2 dokumen, 2 tidak ada).
6. Skema JSON dengan metadata sitasi sumber.

## 6. Tantangan wajib
Tantangan dijawab secara mendalam pada Bagian 7 dokumen `rancangan-rag.md`:
- Menjelaskan masalah *chunk starvation* di mana dokumen pertama memonopoli Top-3 chunk.
- Merumuskan dua solusi: **Maximal Marginal Relevance (Diversity-Aware per dokumen)** dan **Query Decomposition**, lengkap dengan estimasi biayanya (0 rupiah hingga Rp 1 per pemanggilan).

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas / pola Lampiran A) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
| 1 | Menyusun 10 kasus uji RAG | Lampiran A Bagian C | Menyesuaikan skenario ke operasional bandara & vendor | Dicek ke dokumen internal sintetis |
| 2 | Menganalisis trade-off chunking | Prompt evaluasi RAG | Menyesuaikan ukuran chunk ke panjang klausul ISO | Dihitung rata-rata kata per klausul |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
Model sempat menyarankan menaikkan $N$ chunk menjadi 10 chunk per pertanyaan tanpa mempertimbangkan biaya token dan risiko lost-in-the-middle pada prompt panjang.

Bagian karya minggu ini yang paling sulit saya jelaskan bila ditanya :
Bagaimana membuktikan secara matematis bahwa semantic embedding bisa menghasilkan *false positive similarity* pada teks yang mirip gaya bahasanya tapi berbeda substansi aturannya.

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
| Perancangan arsitektur RAG & uji chunk | dots-studio/dots-3-note-preview:free | ~8.000 token | Rp 0 (Free Tier) |

Total minggu ini : Rp 0  
Total kumulatif  : Rp 42  

## 9. Daftar periksa mandiri
- [x] Chunking manual dilakukan dan aturannya tertulis
- [x] Sepuluh pertanyaan uji tersusun sesuai komposisi
- [x] Lima percobaan BREAK dengan prediksi lebih dulu, nomor 5 dicatat nilai kemiripannya
- [x] Keempat kesalahan rancangan ditemukan, termasuk yang paling merugikan pengguna
- [x] `rancangan-rag.md` lengkap enam bagian, setiap keputusan disertai alasan
- [x] Tantangan wajib terjawab dengan dua cara beserta biayanya

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Mempersiapkan slide presentasi 8 slide dan dokumen `rancangan-sistem.md` untuk Ujian Tengah Semester (Minggu 8).  
Rencana konkret minggu depan : Menyusun materi presentasi UTS dan mempertahankan keputusan desain di Minggu 8.
