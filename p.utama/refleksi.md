# REFLEKSI AKHIR SEMESTER
## Kapita Selekta: AI Engineering (Ganjil 2026/2027)
**Nama / NIM / K :** Micka Mayulia Utama / 10231053 / 17  
**Produk           :** Aviako Risk Register Assistant (RiskRegen)  

---

### 1. Keputusan rancangan apa yang paling Anda sesali, dan apa yang akan Anda lakukan berbeda?
Keputusan yang paling saya sesali di awal perkuliahan adalah **menganggap enteng pemotongan konteks (chunking) dan validasi skema format output**. Di Minggu 4–5, saya sempat berpikir bahwa cukup dengan meminta model *"Jawab dengan format JSON yang rapi"*, model akan selalu patuh. Kenyataannya, tanpa validasi skema ketat di kode backend, *auto-retry loop*, dan *guardrail* ambiguitas, model berkali-kali menambahkan teks pembuka basa-basi atau menebak-nebak angka risiko secara liar. Jika saya mengulang dari awal, saya akan langsung memasang fungsi validasi schema biner di kode JavaScript dan membatasi *whitelist enum* sejak hari pertama sebelum menyentuh prompt.

---

### 2. Kesalahan apa yang Anda buat sepanjang semester yang tidak tertangkap oleh siapa pun kecuali Anda sendiri?
Pada pengujian awal Minggu 7 (Retrieval RAG), saya sempat menyadari terjadinya masalah **chunk starvation** pada dokumen referensi sintetis saya. Karena dokumen kebijakan internal memiliki frekuensi pengulangan kata "vendor" yang sangat tinggi, sistem pencarian awal selalu memborong 3 cuplikan teratas murni dari dokumen kebijakan tersebut, sehingga dokumen standar internasional (ISO 27005 dan COBIT) sama sekali tidak pernah terambil oleh LLM. Kesalahan ini tidak disadari oleh teman reviewer saat presentasi karena output terlihat "tetap memiliki kutipan". Saya memperbaikinya sendiri dengan merancang mekanisme **Diversity-Aware Multi-Document Retrieval**, yang membatasi kuota cuplikan maksimal 2 paragraf per dokumen agar seluruh referensi yang saya unggah benar-benar terwakili dalam rekomendasi mitigasi.

---

### 3. Bagaimana AI membantu Anda, dan di titik mana ia menyesatkan Anda?
- **Bagaimana AI Membantu:** AI sangat mempercepat proses *prototyping*, mulai dari merancang kerangka awal endpoint Express, menyusun ide pengujian kasus batas (*edge cases*), hingga menerjemahkan teks klausul standar keamanan siber internasional berbahasa Inggris ke Bahasa Indonesia yang mengalir untuk staf operasional.
- **Di Titik Mana AI Menyesatkan:** AI paling sering menyesatkan ketika diminta merancang batasan kontrol. Model berkali-kali menyarankan untuk membuat seluruh alur berjalan secara otomatis penuh (*fully autonomous multi-agent without human review*), seolah-olah semakin sedikit campur tangan manusia maka sistem semakin canggih. Saran tersebut sangat berbahaya dalam tata kelola risiko TI, karena tindakan yang membawa dampak hukum dan finansial organisasi (seperti menerbitkan denda vendor) mutlak membutuhkan persetujuan manusia (*human-in-the-loop*).

---

### 4. Kalau produk Anda dipakai orang sungguhan mulai besok, apa yang paling membuat Anda khawatir?
Hal yang paling membuat saya khawatir adalah jika pengguna **memperlakukan sistem ini seperti oracle yang maha-tahu dan menekan tombol 'Simpan Register' tanpa membaca ulang buktinya**. Meskipun sistem sudah dilengkapi *guardrail* ambiguitas (mengembalikan `null` jika data tidak lengkap) dan menautkan kutipan dokumen rujukan, kecenderungan manusia untuk malas memverifikasi (*automation bias*) dapat membuat staf non-IT meloloskan penilaian risiko yang tidak akurat hanya karena bahasanya terdengar sangat meyakinkan dan formal. Oleh karena itu, edukasi bahwa sistem ini hanyalah *asisten penyusun draf*—bukan pengambil keputusan—adalah benteng pertahanan yang paling krusial.

