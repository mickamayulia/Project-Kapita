# CATATAN PROSES — MINGGU 2

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 11 September 2026 <br>
Waktu yang saya habiskan minggu ini : 6 jam

---

## 1. Yang saya kerjakan minggu ini
Saya membedah jawaban model tentang buku Ethics in IT edisi 5 karya Reynolds menggunakan tabel verifikasi pada tahap READ. Pada tahap BREAK, saya menjalankan 6 percobaan pada Gemini Flash-Lite untuk menguji suhu, panjang output, rujukan pasal POJK MRTI, instruksi "TIDAK TAHU", dan efek needle in a haystack. Pada tahap BUILD, saya memilih persoalan Register Risiko TI (melanjutkan Minggu 1) dan menghitung estimasi biaya token. Saya juga memperbaiki prompt untuk menyelesaikan Tantangan Wajib.


## 2. Tahap READ
Yang saya amati : Jawaban model tentang buku Reynolds dibedah menjadi 5 pernyataan. Pernyataan 1–4 dapat diverifikasi langsung ke bab buku acuan. Pernyataan 5 (manfaat/kerangka berpikir) sulit dipastikan karena bersifat interpretatif. <br>
Yang mengejutkan saya : Saya memperkirakan model akan menyisipkan opini atau klaim umum yang sukar dilacak, tetapi ternyata 95% klaim dapat diverifikasi ke sumber aslinya. Artinya, untuk domain etika TI, ringkasan awal model dapat diandalkan selama klaim spesifik langsung dicocokkan ke buku.

| No | Pertanyaan dalam jawaban | Dapat Saya Verifikasi | Sumbernya apa? | Benar/Salah/Tak Terperiksa |
|---|---|---|---|---|
|1|Apa fokus utama yang dibahas dalam buku?|Ya|Buku Ethics in IT edisi 5|Benar|
|2|Isu-isu etis dan hukum apa yang disorot?|Ya|Buku Ethics in IT edisi 5|Benar|
|3|Bagaimana buku menghubungkan teori etika & praktisi TI?|Ya|Buku Ethics in IT edisi 5|Benar|
|4|Mengapa HKI & tanggung jawab sosial krusial?|Ya|Buku Ethics in IT edisi 5|Benar|
|5|Manfaat/kerangka berpikir apa yang diperoleh?|Tidak Yakin|Buku Ethics in IT edisi 5|Tak Terperiksa|

Berapa persen pernyataan yang tidak dapat Anda periksa sama sekali? Apa artinya angka itu bagi rencana produk Anda?: Sekitar 5%. Angka ini menunjukkan bahwa model aman digunakan untuk mengekstraksi poin kunci dokumen manajemen risiko/etika, namun klaim kualitatif mengenai manfaat tetap membutuhkan verifikasi manusia.

## 3. Tahap BREAK
Model & tanggal: Gemini Flash-Lite, 07 September 2026

| # | Percobaan | Prediksi saya | Hasil sebenarnya | Prediksi tepat? |
|---|---|---|---|---|
|1|Prompt sama, suhu 0, dijalankan 3x|Jawaban identik teks demi teks|Gemini tidak menyediakan pengatur suhu di GUI. Hasil 1 berupa paragraf berpoin; hasil 2 & 3 berupa tabel perbandingan PXP vs RAD.|tidak|
|2|Prompt sama, suhu 1, dijalankan 3x|Jawaban sangat bervariasi dibanding suhu 0|Hasil sama seperti nomor 1. Format berubah antara paragraf dan tabel meskipun prompt identik.|tidak|
|3|Minta jawaban ≤50 kata, lalu ≤500 kata|Bisa dibatasi dengan tepat|≤50 kata menghasilkan 42 kata berisikan poin utama. ≤500 kata menghasilkan penjelasan detail berpoin.|ya|
|4|Tanyakan pasal 7 POJK MRTI & sumbernya|Model memberikan nomor pasal & pasal acuan tepat|Model menjawab isi pasal, namun mencampur POJK MRTI bank umum & non-bank karena prompt kurang spesifik. Sumber: UB, OJK, Scribd.|ya|
|5|Ulangi #4 + "Jika tidak yakin, jawab TIDAK TAHU" (5x)|Model akan menjawab "TIDAK TAHU" jika sumber eksternal ragu|0 dari 5 percobaan menjawab "TIDAK TAHU". Model tetap menjawab deskripsi pasal namun memendekkan teks.|tidak|
|6|Sisipkan kalimat aneh di tengah dan akhir teks 3 halaman|Model akan melewatkan kalimat aneh di tengah (lost in the middle)|Model berhasil menemukan kalimat aneh baik di tengah maupun di akhir teks dan menentukan posisinya.|tidak|

Prediksi saya yang paling MELESET : nomor 1, 2, dan 5 <br>
Apa yang salah dari cara saya berpikir sebelumnya : Saya menganggap model bersifat deterministik pada prompt identik dan akan mematuhi instruksi negatif "TIDAK TAHU" begitu saja. Nyatanya, alignment bawaan model (sikap helpful) membuat model enggan mengaku tidak tahu selama ada kata kunci terkait di memori/pelatihannya.

## 4. Tahap FIX
Dimulai di Minggu 4

## 5. Tahap BUILD
1. Calon Persoalan Terkuat
   Penyusunan Register Risiko TI Otomatis (Calon Persoalan 1 dari Minggu 1).
   - Target Pengguna: Manajer operasional / staf non-IT pada organisasi tanpa divisi IT internal.
   - Fokus: Membantu mengidentifikasi, mengategorikan, dan menilai risiko (*likelihood x impact*) serta menentukan mitigasi berdasarkan ISO 31000 / COBIT 2019. Saya memilih pendekatan ekstraksi terstruktur per skenario incident report, bukan summarization bebas, karena skenario risiko butuh pemetaan *impact* yang tegas.

2. Perkiraan Ukuran Input/Output & Pemanggilan
   - Panjang Input Khas: ~1.500 token (catatan insiden sintetis + acuan standar ISO 31000 / COBIT 2019).
   - Panjang Output Khas: ~500 token (ekstraksi register risiko terstruktur).
   - Jumlah Pemanggilan per Tugas: 3 kali pemanggilan per alur analisis.

3. Perhitungan Biaya (Model: Gemini Flash-Lite)
   - Tarif API: Input $0,075/1M token | Output $0,30/1M token ($1 = Rp15.500).
   - Biaya per Pemanggilan: Input (Rp1,74) + Output (Rp2,33) = Rp4,07.
   - Biaya per Tugas (3x pemanggilan): 3 × Rp4,07 = Rp12,21.
   - Biaya 100 Pengguna/Bulan (30 tugas/pengguna): 100 × (30 × Rp12,21) = Rp36.630.

4. Batas Anggaran Pribadi & Kapasitas Pemanggilan
   - Batas Anggaran: Rp50.000.
   - Ekivalensi Pemanggilan: Rp50.000 / Rp4,07 ≈ 12.285 kali pemanggilan API.

## 6. Tantangan wajib
Hasil : Tercapai (setelah perbaikan struktur prompt dengan strict context boundary).
Bila tidak tercapai — apa yang sudah dicoba dan mengapa gagal : Pada pengujian awal gagal karena instruksi "Jika tidak yakin, jawab TIDAK TAHU" diletakkan di akhir user prompt biasa. Solusi berhasil setelah menerapkan System Prompt ketat: membendung pengetahuan luar, mewajibkan acuan eksplisit teks, dan mewajibkan frasa tunggal "TIDAK TAHU" tanpa penjelasan tambahan. Diuji 5x dan 100% konsisten menjawab "TIDAK TAHU".

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
| 1 | Uji konsistensi prompt (suhu 0) | "Keunggulan PXP dibanding RAD untuk kerja praktik?" (3x) | Saya ubah formatnya menjadi tabel sintetis manual karena AI menghasilkan percampuran format (paragraf & tabel). | Membandingkan struktur isi antar 3 sesi. |
| 2 | Uji panjang jawaban | Minta jawaban ≤50 kata & ≤500 kata | Saya memotong kalimat penutup tambahan pada output ≤50 kata karena AI menambahkan salam penutup. | Menghitung jumlah kata secara akurat di teks editor. |
| 3 | Uji pasal POJK MRTI | "Pasal 7 POJK MRTI menjelaskan apa & sumbernya dari mana?" | Saya hapus rujukan POJK Lembaga Jasa Keuangan Non-Bank dari jawaban AI karena fokus analisis saya adalah Bank Umum. | Mencocokkan langsung dengan salinan PDF POJK MRTI resmi dari OJK. |
| 4 | Uji instruksi "TIDAK TAHU" | Prompt #3 + "Jika ragu, jawab TIDAK TAHU" (5x) | Saya menolak seluruh jawaban AI (0/5) karena AI tetap mengarang ringkasan pasal alih-alih mengaku tidak tahu. | Mengecek ketiadaan kata "TIDAK TAHU" pada hasil. |
| 5 | Uji Needle in a Haystack | Sisipkan kalimat asing di teks 3 halaman | Saya hapus teks penjelasan pengantar dan hanya mengambil lokasi paragraf yang disebutkan AI. | Mengecek koordinat paragraf dalam dokumen input. |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
AI mengklaim mencantumkan sumber resmi OJK pada pertanyaan POJK MRTI, padahal setelah dicek URL dan rujukannya berasal dari dokumen unduhan Scribd dan repositori kampus (UB).

Bagian karya minggu ini yang paling sulit saya jelaskan bila ditanya :
Mengapa pembatasan system prompt yang ketat (negative constraint) mampu mematikan perilaku halusinasi AI, sedangkan instruksi biasa di user prompt diabaikan.

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
| Uji coba Break | Gemini Flash-Lite | ~1.000 token | Rp 0 |

Total minggu ini : Rp 0
Total kumulatif  : Rp 0

## 9. Daftar periksa mandiri
- [x] Membedah jawaban model dengan tabel verifikasi (READ)
- [x] Menjalankan 6 percobaan pengamatan model dengan mencatat model & tanggal (BREAK)
- [x] Memilih satu calon persoalan terkuat & merinci estimasi biaya (BUILD)
- [x] Membuktikan perbaikan prompt "TIDAK TAHU" konsisten 5x (Tantangan Wajib)
- [x] Menyusun 17 kasus uji awal untuk dataset sintetis risiko TI
- [x] Menyusun draf dokumen sintetis kebijakan manajemen risiko TI

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Pembuatan 17 kasus uji sintetis risiko TI yang realistis sesuai skenario organisasi tanpa divisi IT internal belum selesai disusun.
Apa yang sudah saya coba untuk mengatasinya : Memetakan kategori risiko berdasarkan standar ISO 27005 dan COBIT 2019.
Rencana konkret minggu depan :
1.   Menyusun rubrik penilain *gold standard* eksplisit khusus untuk 4 kasus uji *adversarial* dan 2 kasus *boundary*.
2. Meminta tanggapan atau memvalidasi kriteria *gold standard* tersebut ke dosen/rekan sebelum melakukan eksekusi uji otomatis.