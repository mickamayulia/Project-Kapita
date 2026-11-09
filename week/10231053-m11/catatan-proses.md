# CATATAN PROSES — MINGGU 11

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 13 November 2026 <br>
Waktu yang saya habiskan minggu ini : 7 jam

---

## 1. Yang saya kerjakan minggu ini
Saya mengimplementasikan arsitektur agentic multi-langkah pada backend (`server.js` endpoint `POST /api/agent/investigate`), menerapkan memory state tugas di luar percakapan (`data/agent_tasks.json`), memasang batas langkah kaku (`maxSteps=4`), mengintegrasikan 3 tool operasional, dan mendokumentasikan trace eksekusi yang transparan untuk observability.

## 2. Tahap READ
Trace Tugas Gagal yang Dianalisis:
| Langkah | Yang dilakukan | Apakah masuk akal? | Titik ini penyebab kegagalan? |
|---|---|---|---|
| 1 | Mencari klausul sanksi vendor di dokumen rujukan | Ya, sesuai tujuan | Tidak |
| 2 | Menghitung denda SLA berdasarkan teks "vendor terlambat beberapa hari" | Tidak, durasi tidak spesifik dalam angka jam/menit | **Ya (Titik Awal Kegagalan)** |
| 3 | Model mengarang angka keterlambatan 48 jam dan memanggil kalkulator | Masuk akal di mata model, namun halusinasi fakta | Tidak (hanya akibat dari langkah 2) |
| 4 | Menghasilkan register risiko dengan denda Rp 240.000.000 | Format rapi namun berbasis data fiktif | Langkah terlihatnya kegagalan |

Titik Awal Kegagalan: Langkah 2. Agent berasumsi bahwa ia wajib memanggil tool perhitungan denda meskipun data waktu di teks masukan bersifat ambigu/kualitatif ("beberapa hari").

## 3. Tahap BREAK
Model & gateway: OpenRouter (dots-studio/dots-3-note-preview:free), 13 November 2026

| # | Percobaan | Prediksi saya | Hasil sebenarnya | Prediksi tepat? |
|---|---|---|---|---|
| 1 | Jalankan tugas sama 3x, bandingkan urutan langkah | Urutan langkah konsisten karena bounded workflow | Urutan 4 langkah identik di ketiga eksekusi (Step 1 Retrieve $\rightarrow$ Step 2 Calc $\rightarrow$ Step 3 Synth $\rightarrow$ Step 4 Approval) | ya |
| 2 | Hentikan tugas di tengah jalan, lanjutkan dari state luar | Bisa dilanjutkan via `agent_tasks.json` | State taskId berhasil dimuat ulang dari JSON tanpa mengulang pemanggilan API | ya |
| 3 | Beri tugas yang datanya tidak lengkap | Agent meminta verifikasi durasi | Kalkulator mengembalikan nilai default batas toleransi & menandai `perlu_verifikasi` | ya |
| 4 | Ukur pertumbuhan token tiap langkah | Token naik proporsional per langkah | Step 1: 450 token, Step 2: 700 token, Step 3: 1.850 token. Konteks tetap hemat karena diringkas | ya |
| 5 | Buat satu tool kembalikan hasil salah tapi masuk akal | Agent meloloskan tanpa sadar | Agent menelan hasil kalkulasi tanpa validasi ulang kewajaran | ya |
| 6 | Beri 2 tugas sekaligus dalam 1 permintaan | Agent hanya mengerjakan tugas pertama | Agent mengekstrak risiko utama vendor dan mengabaikan tugas kedua | ya |

Perbedaan Urutan Langkah pada Percobaan Nomor 1:
Karena menggunakan arsitektur *Bounded Agent* dengan routing terarah, ketiga eksekusi menghasilkan urutan langkah yang 100% konsisten. Hal ini memberikan nilai kehandalan dan auditabilitas yang sangat tinggi untuk evaluasi.

## 4. Tahap FIX
Analisis Agent yang Berputar Tanpa Henti (Looping):
1. **Tiga Kemungkinan Penyebab Utama:**
   - (1) Kriteria berhenti ambigu (model tidak tahu kapan informasi dianggap "cukup").
   - (2) Tool mengembalikan respons yang sama tanpa memicu perubahan state (*no state change detection*).
   - (3) Model berasumsi harus menemukan tepat 3 dokumen, padahal di database hanya tersedia 1 dokumen.
2. **Cara Membuktikan Diagnosis:**
   - Cek parameter input query di log trace: jika query sama berulang 3x berturut-turut, itu bukti model terjebak dalam ketiadaan kriteria berhenti.
3. **Dua Cara Mencegah Pengulangan & Kekurangannya:**
   - Cara 1: *Hard Step Limit* (maksimal 4 langkah). Kekurangan: tugas kompleks bisa terhenti sebelum tuntas.
   - Cara 2: *Deduplication Filter* (tolak pemanggilan tool jika argumen sama persis dengan langkah sebelumnya). Kekurangan: mencegah retry sah saat terjadi transient network error.

## 5. Tahap BUILD
1. Arsitektur Bounded Agent berhasil dibangun pada `server.js` dengan mematuhi kriteria batas langkah (`maxSteps=4`), memory state luar (`data/agent_tasks.json`), dan 3 tool terintegrasi.
2. Mengumpulkan 3 trace lengkap:
   - **Trace 1 (Berhasil):** Audit downtime server 90 menit (menghasilkan pinalti SLA Rp 5.000.000 dan register R-VENDOR-01).
   - **Trace 2 (Gagal/Ditolak):** Permintaan dengan input injeksi berhasil ditolak di Step 0 oleh Input Sanitizer.
   - **Trace 3 (Batas Langkah):** Investigasi multi-dokumen mencapai Step 4 dan beralih ke state `awaiting_human_approval`.

## 6. Tantangan wajib
**Hasil:** Tercapai.  
- **Tugas yang Gagal Awalnya:** Pada input *"Vendor lambat tangani keluhan staf"*, agent memaksakan memanggil tool kalkulasi denda dan gagal karena tidak ada angka menit.
- **Perbaikan Tanpa Tool Baru:** Memperbaiki deskripsi instruksi: *"Hanya panggil kalkulator denda bila teks masukan memuat indikator waktu eksplisit (menit/jam). Bila tidak ada, lewati kalkulator dan fokus pada klausul SOP layanan."*
- **Hasil Trace Sesudah Perbaikan:** Agent melewati pemanggilan kalkulator denda dan langsung melakukan retrieval terhadap SOP eskalasi layanan dengan sukses.

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas / pola Lampiran A) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
| 1 | Merancang skema memory state luar | Prompt Lampiran A Bagian E | Menambahkan flag `requiresHumanApproval` | Dicek di `data/agent_tasks.json` |
| 2 | Uji coba penanganan loop agent | Script simulasi agent loop | Menambahkan pembatas `maxSteps` | Diuji pada endpoint POST /api/agent/investigate |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
Model sempat menyarankan menyimpan riwayat percakapan mentah ke dalam state tugas, padahal hal tersebut membuat ukuran file state membengkak secara tidak efisien.

Bagian karya minggu ini yang paling sulit saya jelaskan bila ditanya :
Bagaimana mekanisme memory luar memisahkan antara state eksekusi teknis dengan riwayat percakapan pengguna.

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
| Uji coba endpoint Agent & 3 Trace Lengkap | dots-studio/dots-3-note-preview:free | ~11.000 token | Rp 0 (Free Tier) |

Total minggu ini : Rp 0  
Total kumulatif  : Rp 42  

## 9. Daftar periksa mandiri
- [x] Trace tugas yang gagal diuraikan dan titik awal kegagalan ditentukan
- [x] Enam percobaan BREAK dengan prediksi lebih dulu
- [x] Nomor 1 dijalankan 3x dan konsistensi urutan langkah dicatat
- [x] Tiga kemungkinan penyebab loop dan cara membuktikannya tertulis
- [x] Seluruh kriteria sukses 11.2 terpenuhi (state luar, max steps, 3 tool)
- [x] Tiga trace lengkap dikumpulkan di sistem
- [x] **Luaran Blok D bagian 1** siap

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Menyiapkan telaah kritis studi kasus praktisi dunia nyata untuk Minggu 12.  
Rencana konkret minggu depan : Mengerjakan analisis studi kasus ASDOS-AI dan peer review di Minggu 12.

