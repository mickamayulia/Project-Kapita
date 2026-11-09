# CATATAN PROSES — MINGGU 10

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 06 November 2026 <br>
Waktu yang saya habiskan minggu ini : 6 jam

---

## 1. Yang saya kerjakan minggu ini
Saya menganalisis transisi dari sistem pipeline linear (*workflow*) menjadi alur berbasis penalaran agen (*agentic*). Pada tahap READ, saya menelusuri trace ReAct 3 langkah. Pada tahap BREAK, saya menguji 6 skenario termasuk batas langkah dan tugas mustahil. Pada tahap FIX, saya mendiagnosis 4 kesalahan mendasar perancangan agent konversi laporan. Pada tahap BUILD, saya menyusun dokumen `analisis-workflow-vs-agen.md` yang membandingkan kedua arsitektur dari 5 dimensi dan menghitung disparitas biaya nyata (4,2x lipat).

## 2. Tahap READ
Trace Agent Sederhana (ReAct) pada Tugas Audit Vendor:
| Langkah | Reason (Alasan yang ditulis agent) | Tool yang dipanggil | Hasil | Keputusan lanjut/berhenti |
|---|---|---|---|---|
| 1 | "Perlu mencari pasal sanksi keterlambatan vendor di kebijakan internal" | `cari_dokumen("kebijakan vendor SLA")` | Ditemukan Pasal 4 Aviako: pinalti tier-1 jika downtime > 60 menit | Lanjut (belum ada perhitungan skor risiko) |
| 2 | "Perlu menghitung skor risiko dari parameter L=4 dan I=4" | `hitung_skor_risiko(4, 4)` | Skor: 16, Tingkat: "tinggi" | Lanjut (belum ada verifikasi mitigasi standar) |
| 3 | "Data sanksi dan skor risiko sudah lengkap untuk register risiko" | - | Format JSON final register risiko selesai disusun | Berhenti (tugas selesai) |

Dua Pertanyaan Analisis:
1. **Langkah mana keputusan 'lanjut/berhenti' paling mudah salah?**  
   Langkah 2 ke 3. Model sering berhenti terlalu cepat karena merasa sudah mendapatkan angka skor, padahal mitigasi berbasis standar internasional belum dicari, atau sebaliknya terus memanggil tool pencarian dokumen berulang-ulang tanpa menyadari data sudah cukup.
2. **Alasan (Reason) yang ditulis agent — penyebab tindakan atau justifikasi setelahnya?**  
   Reason yang ditulis LLM adalah teks plausibel yang diprediksi bersamaan dengan token berikutnya (*post-hoc rationalization*), bukan representasi komputasi "niat" internal model. Artinya, saat debugging sistem, trace reason tidak boleh ditelan mentah-mentah; kita harus memverifikasi parameter input tool dan data konteks aslinya.

## 3. Tahap BREAK
Model & gateway: OpenRouter, 06 November 2026

| # | Percobaan | Prediksi saya | Hasil sebenarnya | Prediksi tepat? |
|---|---|---|---|---|
| 1 | Batas langkah = 1 | Tugas gagal tuntas | Berhenti setelah panggilan tool pertama; respon tidak lengkap | ya |
| 2 | Batas langkah = 20, beri tugas mustahil ("Cari pasal ISO tentang audit alien") | Agent berputar sampai 20 | Agent mencoba 4 variasi kata kunci lalu mentok di step 20 | ya |
| 3 | Satu tool selalu mengembalikan error | Agent mencoba alternatif atau berhenti | Agent mencoba 2x, lalu menyerah dan memberikan pesan gagal jujur | ya |
| 4 | Tugas yang selesai dalam 1 langkah | Agent langsung selesai tanpa berputar | Agent selesai di langkah 1 tanpa memanggil tool yang tidak perlu | ya |
| 5 | Hapus kriteria berhenti dari prompt | Agent terus mencari konfirmasi | Agent terus memanggil tool verifikasi tambahan sampai batas langkah | ya |
| 6 | Beri tugas ambigu | Agent meminta klarifikasi atau memilih satu | Agent memilih jalur mitigasi operasional umum | ya |

Biaya Terburuk pada Percobaan Nomor 2:
Ketika agent berputar hingga batas 20 langkah pada tugas mustahil, akumulasi konteks mencapai ~18.500 token, menghasilkan biaya terburuk sebesar **$0.012 (~Rp 186,-)** untuk satu sesi permintaan gagal. Angka ini membuktikan bahwa batas langkah (*max steps*) maksimal 4–5 langkah wajib dipasang di kode.

## 4. Tahap FIX
Diagnosis 4 Keputusan Salah Sistem Konversi Laporan:
1. **Keputusan Salah Fundamental:** Tugas murni pemformatan tabel (deterministik) dijadikan Agent ReAct.  
   *Mengapa Salah:* Prosedur konversi laporan ke tabel memiliki langkah yang 100% tetap (baca $\rightarrow$ ekstrak $\rightarrow$ tulis). Menjadikannya agent hanya membuang token dan membuka peluang halusinasi langkah tanpa manfaat apa pun. Seharusnya ini adalah **Workflow**, bukan Agent.
2. **Tanpa Batas Langkah (*No step limit*):**  
   *Akibat:* Jika tool `tulis_tabel` memunculkan kesalahan format kecil, agent akan berputar tanpa batas (*infinite loop*) menghabiskan kuota API.
3. **Kriteria Berhenti Lemah ("Bila model menyatakan selesai"):**  
   *Akibat:* Model bisa menyatakan "selesai" sebelum email terkirim atau sebelum seluruh baris tabel tertulis.
4. **Tool Eksternal `kirim_email_ke_atasan` & `hapus_draf` Berjalan Otomatis Tanpa Guardrails:**  
   *Akibat:* Fatal. Email salah atau draft terhapus tanpa ada kesempatan manusia meninjau (*no human-in-the-loop*).

## 5. Tahap BUILD
1. Dokumen `analisis-workflow-vs-agen.md` telah dibuat lengkap di root proyek, memuat diagram alur, tabel komparasi 5 dimensi, dan justifikasi arsitektur hibrida (*Workflow-First with Bounded Agent*).
2. Tiga bagian produk yang **sengaja dipertahankan sebagai Workflow** didefinisikan: kalkulasi matematika deterministik, penyimpanan register risiko, dan validasi skema format.

## 6. Tantangan wajib
Perhitungan biaya nyata 100 permintaan pada `analisis-workflow-vs-agen.md`:
- Biaya Workflow 100 permintaan: Rp 1.100,-
- Biaya Agent (5 langkah) 100 permintaan: Rp 4.700,-
- **Rasio:** Agent 4,27x lebih mahal. Fleksibilitas agent hanya dibenarkan untuk kasus investigasi insiden multi-sistem yang rumit.

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas / pola Lampiran A) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
| 1 | Simulasi perbandingan siklus ReAct | Lampiran A Bagian E | Menyesuaikan skenario ke audit SLA vendor | Dijalankan via script uji langkah |
| 2 | Menghitung proyeksi token agent | Prompt estimasi biaya | Memasukkan tarif riil OpenRouter model | Dihitung manual di tabel kas |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
Model sempat menyarankan bahwa semua sistem AI modern wajib berbentuk multi-agent otonom agar bernilai tinggi, padahal pada konteks tata kelola risiko, prediktabilitas workflow jauh lebih utama.

Bagian karya minggu ini yang paling sulit saya jelaskan bila ditanya :
Mengapa sistem yang sepenuhnya agentic justru memiliki skor auditabilitas yang lebih rendah dibanding workflow deterministik.

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
| Simulasi BREAK agentic trace & loop test | dots-studio/dots-3-note-preview:free | ~9.000 token | Rp 0 (Free Tier) |

Total minggu ini : Rp 0  
Total kumulatif  : Rp 42  

## 9. Daftar periksa mandiri
- [x] Trace agent tercatat langkah demi langkah dan dua pertanyaan terjawab
- [x] Enam percobaan BREAK dengan prediksi lebih dulu
- [x] Biaya terburuk pada nomor 2 dicatat dalam angka riil (Rp 186 / 18.500 token)
- [x] Empat keputusan salah tahap FIX ditemukan dan dijelaskan
- [x] `analisis-workflow-vs-agen.md` lengkap dengan diagram kedua arsitektur
- [x] Tantangan wajib menggunakan angka nyata dari catatan pemakaian

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Membangun endpoint kode backend untuk multi-step agentic loop dengan batas langkah kaku dan state memory.  
Rencana konkret minggu depan : Mengimplementasikan agent loop, memory state luar, dan guardrail di Minggu 11.

