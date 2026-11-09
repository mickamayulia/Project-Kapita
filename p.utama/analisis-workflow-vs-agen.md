# ANALISIS PERBANDINGAN: WORKFLOW vs AGENT
## Produk: Aviako Risk Register Assistant (RiskRegen)
**Penyusun / NIM / K:** Micka Mayulia Utama / 10231053 / 17  
**Modul Acuan:** Minggu 10 (Blok D — Agentic)

---

## 1. Tugas Multi-Langkah di Bidang Risiko TI
Tugas yang dipilih:  
**"Audit Kepatuhan Risiko Vendor Eksternal dan Rekomendasi Sanksi SLA Terintegrasi"**  
Skenario: Staf operasional menginput insiden downtime sistem ticketing selama 3 jam akibat kelalaian vendor. Sistem harus:
1. Mengekstrak risiko dan detail insiden teknis.
2. Mencari klausul SLA dan sanksi pinalti pada Dokumen Kebijakan Internal Aviako.
3. Mencari kontrol kepatuhan kontinuitas pihak ketiga pada ISO 27005 / ISO 31000.
4. Menghitung deterministik matriks risiko dan penalti denda SLA vendor.
5. Menghasilkan draf register risiko dan surat rekomendasi eskalasi formal.

---

## 2. Diagram Dua Bentuk Perancangan

### A. Bentuk Workflow (Pipeline Deterministik Tetap)
```text
[Input Teks Insiden]
       │
       ▼
[Langkah 1: Ekstraksi Risiko via LLM Prompts]
       │
       ▼
[Langkah 2: Retrieval Paralel (SLA Internal + Standar ISO)]
       │
       ▼
[Langkah 3: Kalkulasi Deterministik (hitung_skor_risiko & denda_sla)]
       │
       ▼
[Langkah 4: Penyusunan Draf Register Risiko JSON]
       │
       ▼
[Output Terstruktur & Review Pengguna]
```

### B. Bentuk Agent (Siklus Otonom ReAct: Reason-Act-Observe)
```text
[Tujuan Pengguna: "Audit insiden vendor dan tentukan sanksi SLA"]
       │
       ▼
┌──► [1. REASON: LLM menentukan tool apa yang dibutuhkan]
│      │
│      ▼
│    [2. ACT: Panggil Tool (cari_dokumen / hitung_skor / cek_sla)]
│      │
│      ▼
│    [3. OBSERVE: Baca output eksekusi tool]
│      │
│      ▼
└─── [4. EVALUATE: Apakah data mitigasi sudah lengkap? Jika belum, ulangi]
       │ (Bila lengkap atau batas langkah tercapai)
       ▼
[Output Akhir Register Risiko]
```

---

## 3. Matriks Perbandingan 5 Sisi

| Sisi Penilaian | Rancangan Workflow (Tetap) | Rancangan Agent (ReAct) |
|---|---|---|
| **1. Ketertebakan Alur (*Predictability*)** | **Sangat Tinggi:** Urutan pemanggilan fungsi selalu sama persis pada setiap eksekusi. | **Rendah:** Urutan pemanggilan tool dan kedalaman pencarian diputuskan model secara dinamis tiap waktu. |
| **2. Biaya Token & Latensi** | **Rendah & Pasti:** Hanya butuh 2 panggilan LLM (ekstraksi & format akhir). Biaya flat $\approx$ Rp 8 per permintaan. | **Tinggi & Variatif:** Siklus ReAct berulang menghabiskan 4–8 panggilan LLM per permintaan ($\approx$ Rp 25–50 per permintaan). |
| **3. Kemudahan Pengujian** | **Mudah:** Setiap fungsi dapat diuji unit test terisolasi secara deterministik. | **Sulit:** Kombinasi lintasan eksekusi sangat banyak; rentan gagal acak antar iterasi. |
| **4. Penanganan Kegagalan** | **Jelas & Terisolir:** Jika retrieval gagal, sistem langsung memberikan fallback transparan. | **Rentan Loop:** Jika tool mengembalikan hasil kosong, agent rentan berputar mencoba lagi (*infinite loop*). |
| **5. Kualitas & Fleksibilitas** | **Kaku:** Tidak dapat mengeksplorasi dokumen tambahan di luar pipeline yang didefinisikan. | **Sangat Fleksibel:** Mampu melakukan penelusuran bertahap jika insiden melibatkan banyak vendor sekaligus. |

---

## 4. Bentuk yang Dipilih & Kekurangan yang Diterima
**Bentuk Terpilih: Arsitektur Hibrida (Workflow-First dengan Bounded Agent).**  
Sistem inti berjalan di atas **Workflow** tetap untuk ekstraksi dan perhitungan deterministik, namun menyediakan **Bounded Agent** (maksimal 4 langkah) hanya pada modul investigasi insiden multi-dokumen yang ambigu.

**Kekurangan yang Saya Terima:**  
Sistem tidak dapat secara otomatis mengeksplorasi puluhan dokumen tanpa batas seperti agent penuh, namun saya menerima keterbatasan ini demi menjamin **kepastian format, auditabilitas kepatuhan, kehandalan evaluasi, dan pengendalian biaya.**

---

## 5. Bagian Produk yang SENGAJA TETAP Berupa Workflow
1. **Perhitungan Skor Risiko (`hitung_skor_risiko`):**  
   *Alasan:* Matriks risiko $L \times I$ adalah formula matematika deterministik pasti. Menyerahkan urutan perhitungan ke agent hanya menambah biaya dan risiko halusinasi.
2. **Penyimpanan ke Register Database (`simpan_register_risiko`):**  
   *Alasan:* Tindakan penulisan data wajib membutuhkan persetujuan manusia (*human-in-the-loop*); tidak boleh diputuskan sepihak oleh loop agent.
3. **Validasi Schema JSON:**  
   *Alasan:* Skema JSON diperiksa oleh aturan kode terstruktur, bukan oleh agent.

---

## 6. Tantangan Wajib (Perhitungan Biaya Nyata 100 Permintaan)
Berdasarkan data nyata dari [catatan-pemakaian.md](file:///d:/Kuliah/Semester%207/KAPITA/Project/Project-Kapita/catatan-pemakaian.md):
- Rata-rata token per pemanggilan model: ~800 token input, ~400 token output.
- Biaya acuan model berbayar komparatif (misal GPT-4o-mini: $\$0.15$/1M In, $\$0.60$/1M Out $\approx$ Rp 5,5 per panggilan tunggal).

| Metrik | Rancangan Workflow | Rancangan Full Agent (Maks 5 Langkah) |
|---|---|---|
| Panggilan LLM per permintaan | 2 kali pemanggilan | Rata-rata 5 kali pemanggilan |
| Token per permintaan | ~1.500 token | ~6.500 token (karena akumulasi konteks ReAct) |
| Biaya 1 Permintaan (IDR) | Rp 11,- | Rp 47,- |
| **Biaya 100 Permintaan (IDR)** | **Rp 1.100,-** | **Rp 4.700,-** |

**Rasio Perbedaan:**  
Rancangan Agent **4,27 kali lipat lebih mahal** daripada Workflow.

**Apa yang Didapatkan dari Selisih Biaya Tersebut?**  
Dengan membayar 4,2x lebih mahal pada mode agent, sistem memperoleh fleksibilitas untuk menangani insiden kompleks yang tidak terduga (misal insiden vendor yang melibatkan 3 sistem berbeda secara simultan di mana agent mampu menelusuri ketiga dokumen rujukan satu per satu secara otonom). Namun untuk 80% kasus operasional rutin harian, Workflow jauh lebih efisien dan terpercaya.

