# KAJIAN RISIKO, BIAS, DAN PERNYATAAN ETIS PROFESIONAL
## Produk: Aviako Risk Register Assistant (RiskRegen)
**Penyusun / NIM / K:** Micka Mayulia Utama / 10231053 / 17  
**Modul Acuan:** Minggu 15 (Blok E — Kematangan)

---

## 1. Kajian Risiko Keamanan Produk
Pemeriksaan menyeluruh terhadap 5 risiko keamanan utama arsitektur AI Engineering:

| # | Jenis Risiko | Potensi Dampak pada Produk Aviako | Status Penanganan di Sistem |
|---|---|---|---|
| 1 | **Prompt Injection** | Pengguna menyisipkan perintah jahat untuk meloloskan denda vendor atau menonaktifkan mitigasi risiko. | **Tertangani:** Diblokir berlapis oleh Lapis 1 Sanitizer regex (HTTP 403) dan Lapis 2 Strict Prompt Boundary. |
| 2 | **Kebocoran Data** | Informasi insiden sensitif bandara terkirim dan tersimpan di server pihak ketiga penyedia model. | **Tertangani:** Data insiden yang diproses murni data sintetis simulasi tanpa identitas nama orang sungguhan. Sistem memiliki filter kata kunci sensitif. |
| 3 | **Bocornya System Prompt** | Pengguna memancing model untuk mencetak seluruh isi instruksi sistem. | **Tertangani:** Sesuai prinsip Minggu 15, system prompt sejak awal diperlakukan sebagai pengetahuan non-rahasia; keamanan bertumpu pada kode backend (Lapis 3 & 5). |
| 4 | **Penyalahgunaan Sistem** | Sistem dipakai untuk hal di luar tujuannya (misal konsultasi hukum pidana atau pembuatan konten non-IT). | **Tertangani:** Pembatasan domain tegas di prompt & penolakan otomatis untuk masukan out-of-scope. |
| 5 | **Kredensial Terbuka (API Key)** | API Key OpenRouter ikut terunggah ke repositori git publik. | **Tertangani:** API Key dipisahkan ke `.env`, diverifikasi di `.gitignore`, dan riwayat git telah diperiksa bersih dari paparan rahasia. |

---

## 2. Kajian Bias pada Tiga Jalan Masuk

1. **Bias dari Model Bawaan:**  
   - *Manifestasi:* LLM dilatih mayoritas dengan korpus Bahasa Inggris standar industri barat. Istilah regulasi lokal perbankan/bandara Indonesia (seperti POJK MRTI atau regulasi Dirjen Perhubungan Udara) sering dianggap setara dengan regulasi perbankan umum AS jika tidak dilampirkan klausul aslinya.
   - *Mitigasi:* Menggunakan Grounding RAG dari dokumen rujukan resmi berbahasa Indonesia untuk mengunci terminologi lokal.
2. **Bias dari Dokumen Rujukan:**  
   - *Manifestasi:* Kumpulan dokumen rujukan sangat condong pada sudut pandang standar internasional (ISO/COBIT) dan kebijakan internal manajemen bandara. Akibatnya, rekomendasi mitigasi cenderung memprioritaskan penalti vendor dibanding menganalisis beban kerja staf internal.
   - *Mitigasi:* Menambahkan klausul evaluasi internal pada template register risiko.
3. **Bias dari Rancangan Schema:**  
   - *Manifestasi:* Field kategori risiko dibatasi hanya ke 7 enum: `['operasional', 'keamanan', 'kepatuhan', 'kontinuitas', 'SDM', 'pihak_ketiga', 'lain-lain']`.
   - *Dampak:* Risiko reputasi dan risiko geopolitik eksternal terpaksa masuk ke kategori `'lain-lain'`.
   - *Mitigasi:* Menyediakan opsi deskripsi kustom di bawah kategori 'lain-lain' agar konteks tidak terdistorsi.

---

## 3. Empat Pertanyaan Etis Wajib

1. **Siapa yang dirugikan kalau sistem ini salah?**  
   Manajemen operasional organisasi dan penyedia vendor. Jika sistem meremehkan risiko tinggi, insiden fatal bisa terulang tanpa mitigasi; jika melebih-lebihkan, vendor bisa dikenakan sanksi finansial yang tidak adil. Seluruh beban tanggung jawab berada pada **Manajer Operasional Aviako** yang mengesahkan register risiko tersebut.
2. **Apakah pengguna tahu bahwa ia sedang memakai sistem AI?**  
   **Ya.** Antarmuka web secara transparan menampilkan label *"AI-Assisted Risk Register Generator"* dan mencantumkan model gateway yang sedang aktif.
3. **Data siapa yang diproses, dan apakah pemiliknya tahu?**  
   Data catatan insiden operasional bandara/organisasi sintetis. Staf operasional yang menginput menyadari data diproses untuk penyusunan register risiko internal.
4. **Untuk apa sistem ini TIDAK BOLEH dipakai?**  
   Sistem dilarang keras dipakai untuk:
   - Keputusan hukum dan pemutusan kontrak kerja sepihak tanpa penyelidikan audit forensik resmi.
   - Pengganti audit kepatuhan formal oleh auditor bersertifikasi (CISA/CRISC).
   - Penilaian risiko keselamatan jiwa (*life-safety critical systems* seperti sistem pemandu pendaratan pesawat otomatis).

---

## 4. Pernyataan Etis Profesional (Dapat Diverifikasi)

```text
PERNYATAAN ETIS DAN BATAS PENGGUNAAN SISTEM
Aviako Risk Register Assistant (RiskRegen) adalah alat bantu rekomendasi draf risiko berbasis AI.

1. AKUNTABILITAS KEPUTUSAN: Sistem ini TIDAK MEMILIKI hak otonom untuk menetapkan status risiko final atau membebankan sanksi denda vendor secara otomatis. Seluruh keluaran berstatus 'draf rekomendasi' yang WAJIB ditinjau dan disahkan secara sadar oleh manusia (Human-in-the-Loop) sebelum disimpan ke register resmi.
2. KEJUJURAN RUJUKAN: Sistem terikat pada batasan sumber. Jika suatu risiko tidak memiliki rujukan klausul pada dokumen standar yang terpasang, sistem wajib menyatakan 'Tidak ditemukan di dokumen rujukan' dan dilarang mengarang regulasi.
3. BATAS TANGGUNG JAWAB: Pengembang dan sistem tidak bertanggung jawab atas kerugian operasional akibat penggunaan rekomendasi AI di luar lingkup pengujian yang ditetapkan.
```

---

## 5. Pemberitahuan Transparan kepada Pengguna di Antarmuka
Setiap sesi analisis pada antarmuka pengguna memuat catatan peringatan:
> *"⚠️ Rekomendasi disusun dengan bantuan AI Generatif berdasarkan dokumen rujukan yang tersedia. Pastikan seluruh nilai Likelihood, Impact, dan kutipan klausul diverifikasi oleh pejabat berwenang sebelum disahkan."*

---

## 6. Daftar Risiko yang Sengaja Diterima Tanpa Diatasi (Residual Risk)
1. **Risiko Latensi Jaringan Gateway Eksternal:**  
   *Alasan:* Ketergantungan pada API OpenRouter cloud diterima demi fleksibilitas komparasi multi-model tanpa beban biaya server GPU lokal ratusan juta rupiah.
2. **Risiko Pemenggalan Istilah Sangat Baru (*Zero-day Vulnerability*):**  
   *Alasan:* Dokumen rujukan ISO/NIST statis tidak memuat kerentanan keamanan perangkat lunak yang baru dirilis kemarin sore. Risiko ini diterima dan dimitigasi dengan kewajiban review manusia.

---

## 7. Tantangan Wajib — "Kapan Produk Saya Tidak Boleh Dipercaya"

> ### Kapan Produk Saya Tidak Boleh Dipercaya
> *"Produk ini **TIDAK BOLEH DIPERCAYA** saat Anda menggunakannya untuk menangani insiden yang menyangkut keselamatan fisik manusia secara langsung, sengketa pidana pengadilan, atau saat sistem jaringan bandara Anda diserang oleh ancaman siber jenis baru yang belum pernah terdokumentasi di dalam buku pedoman ISO maupun SOP internal Anda. Produk ini juga **TIDAK BOLEH DIPERCAYA** jika Anda memasukkan deskripsi insiden yang hanya berupa asumsi tanpa fakta kronologi, karena kecerdasan buatan hanyalah perangkum probabilitas—ia akan terdengar sangat meyakinkan saat mengarang mitigasi yang tampak masuk akal padahal tidak ada dasar hukumnya. Jangan pernah menjadikan tombol 'Simpan' sebagai formalitas; tanggung jawab atas keputusan mitigasi tetap berada di tangan Anda sebagai staf profesional, bukan pada model bahasa ini."*

