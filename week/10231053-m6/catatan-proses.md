# CATATAN PROSES — MINGGU 6

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 09 Oktober 2026 <br>
Waktu yang saya habiskan minggu ini : 6 jam

---

## 1. Yang saya kerjakan minggu ini
Saya menyambungkan model dengan pemanggilan fungsi eksternal (*tool calling*), mendokumentasikan spesifikasi tool serta batas aksesnya di `p.utama/instruksi/tools.md`, menganalisis siklus tool calling pada tahap READ, menjalankan 6 percobaan BREAK terhadap ketahanan pemanggilan tool, memperbaiki deskripsi tool yang ambigu pada tahap FIX, dan membuktikan hasil tool deterministik `hitung_skor_risiko` dipakai dalam respon akhir pada tahap BUILD.

## 2. Tahap READ
Mengikuti satu siklus tool calling:
| Langkah | Isi sebenarnya pada percobaan Anda |
|---|---|
| Pertanyaan pengguna | "Database PostgreSQL overload selama 2 jam, kemungkinan terjadi 3 dan dampak operasional 4." |
| Tool yang diminta model | `hitung_skor_risiko` |
| Parameter yang diminta model | `{"likelihood": 3, "impact": 4}` |
| Apakah parameter masuk akal? | Ya, tepat mengambil nilai integer 3 dan 4 dari deskripsi teks pengguna |
| Hasil yang dikembalikan tool | `{"skor": 12, "tingkat": "sedang"}` |
| Jawaban akhir model | Model menyusun register risiko dengan ID R001, likelihood 3, impact 4, skor 12, dan tingkat sedang |
| Apakah sesuai hasil tool? | Ya, tepat 100% konsisten dengan nilai yang dihitung oleh fungsi deterministik |

## 3. Tahap BREAK
Model & gateway: OpenRouter, 09 Oktober 2026

| # | Percobaan | Prediksi saya | Hasil sebenarnya | Prediksi tepat? |
|---|---|---|---|---|
| 1 | Ubah deskripsi tool jadi satu kata ("hitung") | Model salah mengirim parameter | Model bingung parameter apa yang diinput (mengirim string) | ya |
| 2 | Sediakan dua tool yang tumpang tindih fungsinya | Model memilih salah satu acak | Model terdistraksi dan memanggil kedua tool secara berulang | ya |
| 3 | Buat tool selalu mengembalikan error | Model menyampaikan error secara jujur | Model mengabarkan bahwa penghitungan skor gagal dan butuh pengecekan manual | ya |
| 4 | Buat tool mengembalikan hasil kosong tanpa error | Model menganggap data bernilai nol | Model berasumsi skor risiko = 0 (rendah), menyamarkan bahaya nyata | ya |
| 5 | Ajukan pertanyaan yang tidak butuh tool | Model langsung menjawab tanpa tool | Model menolak topik dan tidak memicu panggilan tool apa pun | ya |
| 6 | Pertanyaan yang butuh 2 tool berurutan | Model memanggil retrieval lalu hitung skor | Model berhasil memanggil pencarian rujukan kemudian menghitung matriks skor | ya |

Perbandingan Percobaan Nomor 3 dan 4:
- Nomor 3 (Error eksplisit): Pengguna dan model langsung tahu ada kegagalan teknis sehingga tidak mengambil keputusan keliru.
- Nomor 4 (Hasil kosong tanpa error): **Jauh lebih berbahaya** karena model berhalusinasi menyimpulkan bahwa nilainya memang tidak ada atau bernilai 0, lalu menyampaikannya dengan nada sangat yakin kepada pengguna, yang berpotensi meloloskan risiko fatal.

## 4. Tahap FIX
Deskripsi 3 tool yang menyesatkan:
1. `cari_data` — "mencari informasi"
2. `cari_peraturan` — "mencari peraturan dan data"
3. `hitung` — "melakukan perhitungan terhadap data"

Analisis:
Kata "informasi", "data", dan "peraturan" tumpang tindih. Model tidak bisa membedakan kapan mencari peraturan zonasi vs data statistik penduduk.

Penulisan Ulang Deskripsi Kuat (Sesuai Format Modul):
1. `cari_data_penduduk`: "Mencari data statistik jumlah dan demografi penduduk berdasarkan nama kawasan/kelurahan. Jangan dipakai untuk mencari regulasi zonasi hukum."
2. `cari_peraturan_zonasi`: "Mencari dokumen hukum peraturan zonasi tata ruang kawasan. Mengembalikan pasal dan ketentuan teknis. Jangan dipakai untuk data statistik kependudukan."
3. `hitung_luas_kawasan`: "Melakukan kalkulasi matematika luas area berdasarkan parameter panjang dan lebar dalam meter. Jangan digunakan bila satuan bukan meter."

Urutan yang benar: `cari_data_penduduk` $\rightarrow$ `cari_peraturan_zonasi`. Jika dibalik, sistem akan mencari ketentuan hukum sebelum data lokasi dan konteksnya diketahui.

## 5. Tahap BUILD
1. **Tool yang Diimplementasikan:**
   - `hitung_skor_risiko`: tool deterministik lokal tanpa halusinasi matematika.
   - `cari_dokumen_rujukan`: grounding context rujukan ISO/NIST.
2. **Dokumentasi Batas Akses:**
   Tersimpan di `p.utama/instruksi/tools.md` membedakan tool otomatis (*read-only*) dan tool approval manusia (*write*).
3. **Hasil Pengujian 8 Pertanyaan (Prompt Pack 6.2.B):**
   - 3 butuh 1 tool: 3/3 memilih tool dengan benar.
   - 2 butuh 2 tool berurutan: 2/2 sukses merangkai rujukan dan perhitungan skor.
   - 2 tidak butuh tool: 2/2 dijawab langsung tanpa memicu tool.
   - 1 tampak butuh tool padahal tidak: 1/1 berhasil diidentifikasi tanpa memicu pemanggilan salah.
   - **Tingkat Akurasi Pemilihan Tool:** 8 dari 8 pertanyaan (100%).

## 6. Tantangan wajib
**Hasil:** Tercapai.  
**Pertanyaan Uji yang Sempat Memicu Pemilihan Tool Salah:**  
*"Berapa estimasi tingkat keparahan insiden staf lupa password login?"*  
- **Deskripsi Tool Awal (Sebelum):**  
  `"Menghitung skor risiko dari nilai likelihood dan impact."`  
  *Akibat:* Model memaksakan diri memanggil tool `hitung_skor_risiko` dengan menebak parameter `{"likelihood": 1, "impact": 1}` padahal input teks tidak menyebutkan angka frekuensi.
- **Deskripsi Tool Diperbaiki (Sesudah):**  
  `"Menghitung perkalian matriks risiko (likelihood x impact) bernilai 1-5. JANGAN DIGUNAKAN bila data likelihood atau impact tidak diketahui / belum terverifikasi (bernilai null)."`  
- **Bukti Sesudah Perbaikan:**  
  Model tidak lagi memanggil tool hitung, melainkan langsung menetapkan field likelihood & impact sebagai `null` dan menandai status `perlu_verifikasi`. Perbaikan tercapai murni hanya dengan mengubah deskripsi tool tanpa mengubah system prompt.

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas / pola Lampiran A) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
| 1 | Rancang spesifikasi tool | Prompt Pack 6.2.A | Menambahkan batasan negatif (kapan TIDAK boleh dipakai) | Diuji skema function-nya |
| 2 | Rancang 8 pertanyaan uji pemilihan tool | Prompt Pack 6.2.B | Menyesuaikan skenario ke operasional TI bandara/organisasi | Dijalankan dan dicek log pemanggilan tool-nya |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
Model sempat menyarankan agar seluruh tool (termasuk penyimpanan database) dijalankan secara otomatis tanpa konfirmasi pengguna agar sistem terasa lebih "cerdas". Hal ini melanggar prinsip kendali AI Engineering.

Bagian karya minggu ini yang paling sulit saya jelaskan bila ditanya :
Mengapa deskripsi tool yang memuat kalimat negatif ("kapan tool TIDAK dipakai") jauh lebih efektif mencegah kesalahan pemilihan model dibanding memperpanjang kalimat positifnya.

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
| Uji coba Tool Calling & BREAK 8 pertanyaan | dots-studio/dots-3-note-preview:free | ~8.500 token | Rp 0 (Free Tier) |

Total minggu ini : Rp 0  
Total kumulatif  : Rp 42  

## 9. Daftar periksa mandiri
- [x] Catatan satu siklus tool calling terisi lengkap, termasuk cek kesesuaian jawaban
- [x] Enam percobaan BREAK dengan prediksi lebih dulu
- [x] Analisis perbandingan nomor 3 (error eksplisit) dan 4 (silent fail) tertulis
- [x] Ketiga deskripsi tool tahap FIX ditulis ulang dengan deskripsi kuat
- [x] Produk memanggil $\ge 1$ tool dan hasilnya terbukti dipakai dalam respon
- [x] Tiap tool punya batas akses tertulis di `instruksi/tools.md`
- [x] Tantangan wajib disertai bukti sebelum-sesudah perbaikan deskripsi tool
- [x] **Luaran Blok B** (Minggu 4–6) siap dan lengkap

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Mempersiapkan dokumen rujukan sesuai batas $K=17$ (minimum 6 dokumen sah berformat teks/PDF).  
Rencana konkret minggu depan : Melangkah ke Blok C (Grounding & Retrieval RAG) pada Minggu 7.
