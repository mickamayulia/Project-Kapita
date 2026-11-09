# CATATAN PROSES — MINGGU 3

Nama / NIM / K : Micka Mayulia Utama / 10231053 / 17 <br>
Tanggal        : 18 September 2026 <br>
Waktu yang saya habiskan minggu ini : 5 jam

---

## 1. Yang saya kerjakan minggu ini
Saya menyiapkan lingkungan kerja lokal backend (Node.js/Express) yang terhubung ke model gateway OpenRouter. Saya mengonfigurasi kredensial API key di dalam file `.env` (terlindungi oleh `.gitignore`). Pada tahap READ dan BREAK, saya membedah komponen payload API dan menjalankan 5 percobaan pengujian model (termasuk efek pemotongan token). Pada tahap BUILD, saya membandingkan 3 model berbeda dan membuat file buku kas `catatan-pemakaian.md`.

## 2. Tahap READ
Yang saya amati :
Satu pemanggilan API ke OpenRouter terdiri dari payload JSON standar: model ID, array `messages` (berisi pesan peran `system` dan `user`), parameter `temperature`, dan batas token. Kredensial diletakkan di header HTTP Authorization `Bearer <API_KEY>`.

Yang mengejutkan saya :
Ketika peran `system` dihilangkan, model tetap merespons namun gayanya berubah menjadi asisten percakapan umum yang santai dan berbasa-basi, alih-alih bertindak spesifik sebagai asisten manajemen risiko.

| Bagian pemanggilan | Isinya pada percobaan saya | Fungsinya |
|---|---|---|
| Model yang dipilih | `dots-studio/dots-3-note-preview:free` | Menentukan model AI pemroses di gateway |
| Peran "system" | Instruksi analis register risiko TI & batasan ISO 31000 | Menetapkan persona, aturan, dan batasan perilaku |
| Peran "user" | Teks laporan insiden operasional pengguna | Input spesifik/pertanyaan yang harus diolah |
| Temperature | 0.1 | Mengontrol determinisme (rendah untuk stabilitas output) |
| Batas token output | 1000 token | Menjaga respons tidak bertele-tele & membatasi biaya |
| Token input terpakai | 420 token | Jumlah token input (prompt + context) |
| Token output terpakai | 280 token | Jumlah token hasil generasi model |
| Waktu respons (latency) | ~1.4 detik | Kecepatan respons dari gateway |

## 3. Tahap BREAK
Model & gateway: OpenRouter, 18 September 2026

| # | Percobaan | Prediksi saya | Hasil sebenarnya | Prediksi tepat? |
|---|---|---|---|---|
| 1 | Hapus seluruh isi peran "system" | Model menjawab dengan gaya bebas/umum | Model menjawab panjang lebar dengan kalimat pembuka ramah tamah, melupakan format terstruktur | ya |
| 2 | Turunkan batas token output menjadi 20 | Model merangkum sangat singkat | Jawaban terpotong di tengah kalimat ("Berikut register risiko berdasarkan...") tanpa penutup | tidak |
| 3 | Ganti nama model menjadi yang tidak ada | Gateway mengembalikan error HTTP | Error HTTP 404/400: "Model not found / invalid model slug" | ya |
| 4 | Kirim input user kosong | Error atau model minta input | Model merespons: "Halo! Ada yang bisa saya bantu terkait risiko TI hari ini?" | ya |
| 5 | Jalankan prompt sama pada model murah vs mahal | Model mahal lebih akurat, model murah meleset | Model murah (free tier) mampu mengekstrak risiko dasar persis seperti GPT-4o-mini | tidak |

Prediksi saya yang paling MELESET : nomor 2
Apa yang salah dari cara saya berpikir sebelumnya : Saya mengira batas token output membuat model berusaha "meringkas" agar muat. Nyatanya, pemotongan token adalah pemutusan mekanis (*hard stop*) seketika saat kuota token tercapai, sehingga kalimat terputus secara tidak valid.

## 4. Tahap FIX
Dimulai di Minggu 4

## 5. Tahap BUILD
1. **Lingkungan Kerja & Kredensial:**
   - Gateway yang dipilih: OpenRouter (satu API key untuk berbagai model open-source dan komersial).
   - Pengamanan Kunci: Disimpan di file `.env` (`OPENROUTER_API_KEY=...`) dan dipastikan terdaftar di `.gitignore`.
2. **File `catatan-pemakaian.md`:**
   - Dibuat di root proyek untuk memantau akumulasi token dan biaya tiap minggu.
3. **Tabel Perbandingan 3 Model pada Tugas Ekstraksi Register Risiko:**

| Model | Biaya / 1M Token (In/Out) | Latency | Kualitas (1–5) | Catatan Kualitas |
|---|---|---|---|---|
| `dots-studio/dots-3-note-preview:free` | $0.00 / $0.00 (Free) | ~1.3 s | 4.5 | Ekstraksi risiko rapi, pemahaman Bahasa Indonesia sangat baik |
| `openai/gpt-4o-mini` | $0.15 / $0.60 | ~1.1 s | 4.8 | Struktur JSON sangat konsisten, penalaran mitigasi matang |
| `google/gemini-2.0-flash-exp:free` | $0.00 / $0.00 (Free) | ~0.9 s | 4.3 | Cepat, namun kadang menyisipkan penjelasan naratif pembuka |

## 6. Tantangan wajib
**Hasil:** Tercapai.  
**Tugas Pengujian:** Ekstraksi kategori risiko dan penentuan nilai *Likelihood* & *Impact* dari kasus: *"Server aplikasi pemesanan tiket mati selama 3 jam di jam sibuk akibat database overload."*  
- **Model Murah/Free (`dots-studio/dots-3-note-preview:free`):** Menghasilkan Kategori: Operasional, Likelihood: 3, Impact: 4, Mitigasi: Penambahan load balancer dan optimasi query database.
- **Model Berbayar (`openai/gpt-4o-mini`):** Menghasilkan Kategori: Operasional, Likelihood: 3, Impact: 4, Mitigasi: Konfigurasi connection pooling dan monitoring kapasitas server.
- **Kesimpulan:** Output keduanya secara substantif tidak dapat dibedakan dan sama-sama akurat untuk level staf operasional.
- **Perhitungan Penghematan (1.000 pemanggilan):**
  - Rata-rata token per panggilan: 500 token input + 300 token output.
  - GPT-4o-mini: $(0.0005 \times 0.15) + (0.0003 \times 0.60) = \$0.000255$ per panggilan $\times 1.000 = \$0.255 \approx \text{Rp3.952}$.
  - Model Free: Rp 0.
  - Penghematan: 100% biaya (Rp3.952 per 1.000 pemanggilan) dapat dihemat tanpa penurunan akurasi kategori risiko.

## 7. Penggunaan AI minggu ini
| # | Untuk apa | Prompt (ringkas / pola Lampiran A) | Yang saya UBAH dari hasilnya | Bagaimana saya verifikasi |
|---|---|---|---|---|
| 1 | Menyusun template panggilan OpenRouter | "Contoh fetch node.js ke OpenRouter chat completion" | Menyesuaikan parsing body dan error handling | Dites via endpoint Express |
| 2 | Uji pembanding model | Ekstraksi risiko dari insiden downtime server | Tidak ada | Dicocokkan dengan kriteria ISO 31000 |

Satu hal yang AI berikan dan ternyata KELIRU minggu ini :
Model sempat menyarankan menaruh header `HTTP-Referer` dan `X-Title` sebagai kewajiban absolut di OpenRouter, padahal bersifat opsional.

Bagian karya minggu ini yang paling sulit saya jelaskan bila ditanya :
Bagaimana mekanisme OpenRouter meneruskan prompt ke model upstream tanpa memengaruhi format parsing JSON di sisi backend kami.

## 8. Pemakaian dan biaya
| Kegiatan | Model | Perkiraan token | Perkiraan biaya |
|---|---|---|---|
| Setup & Uji Pemanggilan Model Gateway | dots-studio, gpt-4o-mini, gemini | ~6.000 token | Rp 42 |

Total minggu ini : Rp 42  
Total kumulatif  : Rp 42  

## 9. Daftar periksa mandiri
- [x] Pemanggilan model pertama berhasil dan buktinya tersimpan
- [x] API key berada di luar file kode dan di luar repositori (.gitignore)
- [x] Tabel uraian pemanggilan terisi lengkap
- [x] Lima percobaan BREAK dijalankan dengan prediksi lebih dulu
- [x] Perbandingan tiga model terisi biaya, latency, dan kualitas
- [x] `catatan-pemakaian.md` dibuat dan sudah berisi baris pertama
- [x] Tantangan wajib disertai bukti berdampingan

## 10. Yang macet dan rencana minggu depan
Yang masih macet : Penanganan saat response model terpotong akibat limit token.  
Apa yang sudah saya coba untuk mengatasinya : Menaikkan max_tokens ke 1500.  
Rencana konkret minggu depan : Mulai menyusun system prompt terstruktur v1 dan skema JSON tetap untuk Minggu 4.
