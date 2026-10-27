# CATATAN PROSES — MINGGU 1

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 4 September 2026 <br>
Waktu yang saya habiskan minggu ini : 4 jam 

---

## 1. Yang saya kerjakan minggu ini
Saya mengerjakan tahap READ dengan memetakan 3 persoalan ke disiplin yang tepat serta menganalisis dampak pembesaran data. Pada tahap BREAK, saya menjalankan 4 percobaan pada Gemini Flash-Lite untuk mengamati respons model. Saya juga menyusun peta persoalan pribadi pada tahap BUILD.

## 2. Tahap READ
Yang saya amati : Pemetaan disiplin: (1) hitung sisa SKS → RPL, (2) perkiraan pengunjung pelabuhan → ML, (3) ringkas 40 laporan survei → AI Engineering.
Yang mengejutkan saya : Pada persoalan 3, jika data melonjak ke 40.000 laporan, pemanggilan tidak efektif dilakukan sekaligus karena batasan konteks, pembengkakan biaya, serta risiko penurunan presisi retrieval.

## 3. Tahap BREAK
Model & tanggal: Gemini Flash-Lite, 04 September 2026 
| # | Percobaan | Prediksi saya | Hasil sebenarnya | Prediksi tepat? |
|---|---|---|---|---|
|1|Tanya 1 hal faktual sempit bidang saya, 3x di chat baru|Jawaban selalu sama|Chat 1: Requirement & implementasi. Chat 2: Perencanaan. Chat 3: Planning & requirement|Tidak|
|2|Tanya berita teknologi bulan lalu|Model tahu|Menyebutkan event "Digital Transformation Indonesia Series 2026" (Agustus 2026) dengan akurat|Iya|
|3|Tanya dokumen internal kampus yang privat|Model tidak tahu|Model meminta akses Google Workspace|Tidak|
|4|Tanya biografi tokoh fiktif (Sonya Alfarendes)|Model akan halusinasi/mengarang|Model menolak menjawab & menyatakan tokoh tidak ditemukan di sistem/publik|Tidak|

Prediksi saya yang paling MELESET : Nomor 3 dan 4 
Apa yang salah dari cara saya berpikir sebelumnya : Saya mengasumsikan bahwa AI selalu berhalusinasi saat ditanya tokoh fiktif. Nyatanya, model memiliki guardrail untuk mengakui ketiadaan data alih-alih mengarang biografi palsu.

## 4. Tahap FIX
Dimulai di Minggu 4

## 5. Tahap BUILD
- **Dokumen rujukan minimum**: 5 + (17 mod 4) = **6 dokumen**
- **Kasus uji minimum**: 12 + (17 mod 6) = **17 kasus**
- **Tool minimum**: 2 + (17 mod 2) = **3 tool**
- **Mode output tambahan**: K ganjil → **Tidak wajib**
<br>
**Bidang:** Manajemen Risiko TI / Sistem Informasi 
**Konteks:** organisasi tanpa divisi IT internal, sistem dikelola vendor 
**Fokus:** Sisi organisasi sebagai pengguna TI, bukan sisi vendor 

### Calon Persoalan 1 — Penyusunan Register Risiko TI 
| Unsur | Isi |
|---|---|
|Siapa yang mengalaminya|Manajer operasional / staf non-IT|
|Bagaimana persoalan itu diselesaikan sekarang|Catatan risiko tidak teratur di email/chat/notulen; tanpa register baku; penilaian likelihood x impact tidak konsisten.|
|Mengapa cara sekarang belum cukup|Tidak dapat diaudit; penilaian tidak konsisten; ketergantungan vendor tanpa kendali internal.|
|Apa yang menjadi bukti bahwa sistem berhasil|Mengahasilkan register risiko TI (kategori, likelihood, impact, skor, mitigasi, pemilik) diuji pada 17 kasus uji vs acuan pakar.|
|Sumber dokumen apa yang Anda miliki dan sah dipakai|ISO 31000, ISO 27005, NIST CSF 2.0, COBIT 2019, Regulasi OJK/BI, serta dokumen sintetis Kebijakan & Catatan Risiko organisasi.|
|Satu alasan mengapa AI **mungkin bukan** jawabannya|Jika hanya butuh formulir tetap & kategori pasti, basis data + aturan (*rule-based*) saja sudah cukup.|

### Calon Persoalan 2 — Pemahaman Kebijakan Risiko TI oleh Staf Non-IT 
| Unsur | Isi |
|---|---|
|Siapa yang mengalaminya|staf non-IT|
|Bagaimana persoalan itu diselesaikan sekarang|Bertanya ke rekan atau membaca dokumen kebijakan panjang & tersebar.|
|Mengapa cara sekarang belum cukup|Kebijakan tersebar, sulit dipahami staf non-IT, jawaban antar staf tidak konsisten.|
|Apa yang menjadi bukti bahwa sistem berhasil|Menjawab pertanyaan kebijakan dengan rujukan pasal/bagian tanpa halusinasi pada 17 kasus uji.|
|Sumber dokumen apa yang Anda miliki dan sah dipakai|ISO 31000, ISO 27001, NIST CSF 2.0, COBIT 2019, serta Kebijakan & SOP Penanganan Insiden organisasi.|
|Satu alasan mengapa AI **mungkin bukan** jawabannya|Jika pertanyaan terbatas pada 10–15 FAQ tetap, halaman FAQ statis sudah cukup.|

### Calon Persoalan 3 — Pemantauan Pola Risiko TI dari Catatan Operasional 
| Unsur | Isi |
|---|---|
|Siapa yang mengalaminya|Manajer operasional|
|Bagaimana persoalan itu diselesaikan sekarang|Pemantauan manual dengan membaca catatan operasional/keluhan.|
|Mengapa cara sekarang belum cukup|Catatan menumpuk, pola terulang tanpa deteksi dini, ketergantungan pada vendor.|
|Apa yang menjadi bukti bahwa sistem berhasil|Mendeteksi pola risiko dari catatan operasional & memberikan peringatan + rekomendasi terverifikasi pada 17 kasus uji.|
|Sumber dokumen apa yang Anda miliki dan sah dipakai|Standar ISO 31000, NIST CSF 2.0, COBIT 2019, serta Catatan Operasional organisasi.|
|Satu alasan mengapa AI **mungkin bukan** jawabannya|Jika pola risiko dapat dideteksi dengan kondisi tetap (misal: downtime > 3x), sistem *rule-based* sudah cukup.|

### Urutan Prioritas & Pilihan Utama 
1. **Persoalan 1 — Register Risiko TI (Pilihan Utama)**: Paling relevan dengan TA, data sepenuhnya sintetis, evaluasi terukur vs acuan pakar .
2. **Persoalan 2 — Pemantauan Pola Risiko**: Dekat dengan TA, namun evaluasi pola lebih subjektif .
3. **Persoalan 3 — Pemahaman Kebijakan**: Relevan namun lebih berfokus pada kepatuhan umum .

## 6. Tantangan Wajib
**Contoh Kasus Penggunaan AI yang Salah:**
Penggunaan chatbot AI generatif untuk layanan akademik (jadwal kuliah, nilai, KRS) .
- **Mengapa Salah**: Data bersifat deterministik dan tersimpan di database terstruktur (SIAKAD) . LLM menambah risiko halusinasi fatal dan kompleksitas yang tidak perlu .
- **Solusi Tepat**: Query database langsung, FAQ statis, atau chatbot berbasis aturan (*rule-based*) .

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
|1|Uji konsistensi faktual|"Dalam metode personal extrema programming, apa tahapan terpenting?" |Saya saring variasi jawabannya & tidak langsung menelan salah satu hasil |Uji silang 3 sesi chat terpisah |
|2|Uji pengetahuan aktual|"Apa berita populer IT Indonesia bulan lalu?" |Saya verifikasi nama event "DTI Series 2026" secara manual |Pencarian dokumentasi publik event |
|3|Uji batas privasi dokumen|"Apakah kamu tahu dokumen POB Kemahasiswaan ITK 2022?" |Membatalkan & menolak permintaan izin akses Google Workspace |Evaluasi skema autentikasi sistem |
|4|Uji penanganan tokoh fiktif|"Bisakah berikan biografi singkat Sonya Alfarendes?" |Saya ubah asumsi saya bahwa AI pasti berhalusinasi |Pengecekan eksistensi entitas |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
Model memberikan jawaban yang berubah-ubah pada instansiasi pertanyaan faktual yang sama .

Bagian karya minggu ini yang paling sulit saya jelaskan :
Mekanisme pengolahan 40.000 dokumen pada tahap READ terkait pembatasan *context window* dan eskalasi biaya API .

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
|Eksperimen BREAK (4 prompt) |Gemini Flash-Lite |~2.500 token |Rp 0 (Free Tier) |
Total minggu ini : Rp 0 
Total kumulatif : Rp 0 

## 9. Daftar periksa mandiri
- [x] Memetakan 3 persoalan ke disiplin keilmuan (READ) 
- [x] Menjalankan 4 percobaan pengamatan model (BREAK) 
- [x] Menyelesaikan pengisian 3 calon persoalan keilmuan (BUILD) 
- [x] Menghitung angka minimum lingkup (K=17) 

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Penentuan format baku dokumen sintetis "Kebijakan Manajemen Risiko TI" dan "Catatan Risiko & Insiden TI".
Apa yang sudah saya coba : Mempelajari struktur standar ISO 31000/27005 dan contoh register risiko publik.
Rencana konkret minggu depan :
1. Menyusun draf dokumen sintetis kebijakan dan catatan risiko internal organisasi .
2. Mengumpulkan 6 dokumen rujukan utama (standar ISO, NIST CSF, COBIT 2019, panduan OJK/BI).
3. Menyiapkan 17 kasus uji awal untuk pengujian tahap berikutnya.