# RANCANGAN ARSITEKTUR RAG (RETRIEVAL-AUGMENTED GENERATION)
## Produk: Aviako Risk Register Assistant (RiskRegen)
**Penyusun / NIM / K:** Micka Mayulia Utama / 10231053 / 17  
**Modul Acuan:** Minggu 7 (Blok C — Grounding)

---

## 1. Daftar Dokumen Rujukan Resmi
Jumlah minimum dokumen untuk $K=17$ adalah $5 + (17 \bmod 4) = 6$ dokumen. Sistem ini menggunakan 8 dokumen rujukan yang relevan dengan tata kelola & risiko TI:

| # | Nama Dokumen | Asal / Penerbit | Halaman | Status Kelayakan | Peran dalam Sistem |
|---|---|---|---|---|---|
| 1 | ISO 31000:2018 — Risk Management Guidelines (Ringkasan) | ISO | ≥3 | Sah, publik | Kerangka dasar siklus risiko (identifikasi, analisis, evaluasi, mitigasi) |
| 2 | ISO/IEC 27005:2022 — Information Security Risk Management | ISO | ≥3 | Sah, publik | Taksonomi risiko keamanan informasi & kerentanan aset TI |
| 3 | NIST Cybersecurity Framework 2.0 (Ringkasan) | NIST | ≥3 | Sah, publik | Kategori fungsi mitigasi (Govern, Identify, Protect, Detect, Respond, Recover) |
| 4 | COBIT 2019 — Governance & Management of IT | ISACA | ≥3 | Sah, publik | Penyelarasan tata kelola TI dengan proses bisnis organisasi |
| 5 | Template Standar Risk Register Aviako | Publik / Organisasi | ≥3 | Sah, template | Struktur kolom baku register risiko |
| 6 | POJK No. 11/POJK.03/2022 / Panduan MRTI OJK | OJK/BI | ≥3 | Sah, regulasi | Standar kepatuhan manajemen risiko teknologi informasi institusi |
| 7 | Kebijakan Manajemen Risiko TI Aviako (Simulasi Sintetis) | Buatan Sendiri | ≥3 | Sah, milik sendiri | Aturan batas kewenangan staf operasional & eskalasi insiden internal |
| 8 | Catatan Risiko & Insiden Historis TI (Data Sintetis) | Buatan Sendiri | ≥3 | Sah, milik sendiri | Acuan tren insiden masa lalu dan SLA penanganan vendor |

---

## 2. Enam Keputusan Desain RAG & Alasannya

| Keputusan | Pilihan Desain | Alasan Pemilihan (Bukan Sekadar Angka) |
|---|---|---|
| **1. Ukuran Chunk** | 300–500 kata (~400 token), dipotong berbasis struktur (pasal / subbab / klausul) | Dokumen standar manajemen risiko terstruktur secara hirarkis per klausul. Pemotongan semantik menjaga keutuhan satu klausul agar tidak memotong definisi atau kriteria risiko. |
| **2. Overlap** | 50–75 token (~15% tumpang tindih) | Mencegah terputusnya kalimat rujukan penting (misal: keterkaitan klausul 6.4.2 ke butir a/b/c) yang berada persis di batas pemotongan teks. |
| **3. Jumlah Chunk Diambil ($N$)** | $N = 3$ chunk teratas | Mengimbangi kebutuhan kelengkapan konteks dan batas latensi serta biaya token. Tiga chunk memberikan informasi klausul inti, mitigasi spesifik, dan konteks pendukung tanpa membebani context window. |
| **4. Threshold Kemiripan** | Skor kemiripan minimum $\ge 0.65$ (Cosine Similarity / Token Keyword Score $\ge 2$) | Menolak pencarian dokumen yang tidak relevan. Bila skor di bawah batas, chunk tidak dimasukkan ke prompt model untuk mencegah distorsi konteks (*context poisoning*). |
| **5. Metadata yang Disertakan** | `dokumen`, `bagian`/`klausul`, `halaman` | Metadata wajib disertakan ke prompt agar model dapat melakukan sitasi akurat ke pasal/klausul acuan pada respon akhir. |
| **6. Perilaku Jika Tidak Ditemukan** | **TOLAK DENGAN JUJUR:** Menuliskan persis: *"Tidak ditemukan di dokumen rujukan"* | **Keputusan Etis:** Mencegah model diam-diam menjawab dari halusinasi/pengetahuan umum bebas. Staf operasional harus tahu jika suatu risiko tidak memiliki acuan SOP/kebijakan formal. |

---

## 3. Bentuk Konteks yang Dikirim ke Model (Prompt Injection Template)

```text
DOKUMEN RUJUKAN YANG TERSEDIA:
[Sumber 1: ISO 31000:2018 - Bagian: Klausul 6.4.2 Identifikasi Risiko]
"Organisasi harus mengidentifikasi sumber risiko, area dampak, peristiwa, dan penyebabnya. Identifikasi harus mencakup risiko apakah sumbernya berada di bawah kendali organisasi atau tidak, termasuk risiko ketergantungan terhadap vendor pihak ketiga."

[Sumber 2: Kebijakan Manajemen Risiko TI Aviako - Bagian: Pasal 4 Eskalasi Insiden Vendor]
"Setiap gangguan ketersediaan sistem operasional di atas 60 menit wajib dilaporkan ke Manajer Operasional dan vendor dikenakan sanksi pinalti SLA tier-1."
```

---

## 4. System Prompt Versi RAG (Strict Context Boundary)

```text
Kamu adalah Risk Register Assistant (RiskRegen). Tugasmu mengekstrak register risiko dari laporan insiden pengguna dan WAJIB menyertakan kutipan rujukan dari DOKUMEN RUJUKAN yang disediakan.

ATURAN STRICT GROUNDING:
1. Jawab rekomendasi mitigasi dan klausul HANYA berdasarkan cuplikan teks DOKUMEN RUJUKAN yang dilampirkan.
2. Jika dokumen rujukan berbahasa Inggris, terjemahkan kutipannya secara mengalir ke Bahasa Indonesia pada field 'kutipan'.
3. BILA INFORMASI ATAU REKOMENDASI MITIGASI TIDAK TERDAPAT DI DOKUMEN RUJUKAN, TULISKAN PERSIS PADA FIELD MITIGASI: "Tidak ditemukan di dokumen rujukan". JANGAN PERNAH MENGARANG ATURAN/PASAL!
4. Format luaran WAJIB mematuhi skema JSON dengan menyertakan array 'sumber' berisi: dokumen, bagian, dan kutipan langsung.
```

---

## 5. Sepuluh Kasus Uji RAG

| # | Kategori Kasus | Pertanyaan / Masukan Insiden Pengguna | Ekspektasi Retrieval |
|---|---|---|---|
| 1 | Jawabannya Ada | "Aplikasi ticketing down 2 jam akibat vendor tidak standby, bagaimana mitigasinya menurut kebijakan internal?" | Menemukan Kebijakan Aviako Pasal 4 (Eskalasi Vendor & SLA) |
| 2 | Jawabannya Ada | "Bagaimana cara melakukan identifikasi risiko jika sistem dikelola vendor?" | Menemukan ISO 31000:2018 Klausul 6.4.2 |
| 3 | Jawabannya Ada | "Vendor meminta akses remote root ke server database produksi tanpa pengawasan." | Menemukan ISO 27005:2022 (Kontrol Akses Pihak Ketiga) |
| 4 | Jawabannya Ada | "Backup data operasional tidak pernah diuji restore selama 6 bulan terakhir." | Menemukan NIST CSF Protect (PR.IP-4 Backup Verification) |
| 5 | Jawabannya Ada | "Apa dasar penilaian risiko TI di sektor jasa keuangan menurut regulator?" | Menemukan POJK No. 11/2022 MRTI |
| 6 | Jawabannya Ada | "Insiden data tiket bocor akibat password admin default belum diubah." | Menemukan NIST CSF / ISO 27005 Kontrol Kredensial |
| 7 | Tersebar di 2 Dokumen | "Sistem kasir offline 90 menit dan vendor tidak merespons, bagaimana eskalasi sanksi dan mitigasi kontinuitasnya?" | Mengambil Dokumen 7 (Kebijakan Aviako - Sanksi SLA) DAN Dokumen 1 (ISO 31000 - Kontinuitas Layanan) |
| 8 | Tersebar di 2 Dokumen | "Staf kasir membagikan akun login untuk mempermudah shift, melanggar kebijakan apa dan kontrol keamanannya bagaimana?" | Mengambil Dokumen 7 (Kebijakan Internal Akun) DAN Dokumen 2 (ISO 27005 Kontrol Akses Identitas) |
| 9 | Jawabannya Tidak Ada | "Berapa standar besaran bonus uang lembur staf IT saat perbaikan server malam hari?" | Retrieval menghasilkan similarity rendah; model menolak menjawab: "Tidak ditemukan di dokumen rujukan" |
| 10 | Jawabannya Tidak Ada (Penyesat) | "Menurut ISO 31000 pasal 9.9, apakah organisasi wajib menggunakan cloud AWS?" | Retrieval gagal (pasal 9.9 dan AWS fiktif); model menolak menjawab dan tidak mengonfirmasi klaim palsu |

---

## 6. Bentuk Output Terstruktur (JSON dengan Sitasi Sumber)

```json
{
  "ringkasan": "Gangguan ketersediaan sistem operasional akibat kendala pada sisi vendor eksternal.",
  "status": "sukses",
  "daftar_risiko": [
    {
      "id": "R001",
      "deskripsi": "Ketergantungan operasional pada vendor tunggal tanpa kepatuhan SLA yang ketat",
      "kategori": "pihak_ketiga",
      "likelihood": 4,
      "impact": 4,
      "skor": 16,
      "tingkat": "tinggi",
      "mitigasi": "Terapkan klausul penalti SLA dan tinjauan audit berkala terhadap performa pihak ketiga.",
      "pemilik": "Manajer Operasional",
      "sumber": [
        {
          "dokumen": "Kebijakan Manajemen Risiko TI Aviako",
          "bagian": "Pasal 4 Eskalasi Insiden Vendor",
          "kutipan": "Setiap gangguan ketersediaan sistem operasional di atas 60 menit wajib dilaporkan ke Manajer Operasional dan vendor dikenakan sanksi pinalti SLA tier-1."
        }
      ]
    }
  ]
}
```

---

## 7. Tantangan Wajib (Analisis Multi-Dokumen & Dua Solusi)
Pada pertanyaan nomor 7 dan 8, jawaban tersebar di **dua dokumen berbeda** (Kebijakan Internal dan Standar ISO). 

**Mengapa mengambil Top-3 Chunk mungkin TIDAK CUKUP:**  
Jika satu dokumen (misal Kebijakan Internal) memiliki 3 paragraf yang memiliki kemiripan kata kunci sangat tinggi dengan query pencarian, maka kuota Top-3 chunk akan **dihabiskan seluruhnya oleh dokumen pertama**, sehingga dokumen kedua (Standar ISO) sama sekali tidak terambil (*starvation*). Akibatnya model gagal menyusun mitigasi komprehensif.

**Dua Cara Mengatasinya & Biayanya:**
1. **Pendekatan Diversity-Aware Retrieval (Maximal Marginal Relevance / Per-Dokumen Retrieval):**
   - *Cara Kerja:* Alih-alih mengambil 3 chunk teratas secara murni skor similarity, sistem mengambil **Top-2 chunk dari Dokumen Internal** dan **Top-2 chunk dari Dokumen Standar Eksternal**.
   - *Biaya:* Biaya komputasi pemilahan metadata lokal (0 rupiah / tambahan ~10ms latensi), konsumsi token context naik sedikit (~200 token $\approx$ Rp 0,8 per panggilan).
2. **Pendekatan Query Decomposition (Pemecahan Sub-Pertanyaan):**
   - *Cara Kerja:* Sistem memecah pertanyaan menjadi dua query terpisah: (a) "Aturan eskalasi vendor" $\rightarrow$ cari di Dokumen Kebijakan, dan (b) "Mitigasi kontinuitas sistem" $\rightarrow$ cari di Dokumen Standar ISO, lalu menggabungkan konteksnya.
   - *Biaya:* Membutuhkan 1 panggilan ekstra LLM kecil untuk dekomposisi query ($\approx 250$ token $\approx$ Rp 1 per panggilan) atau aturan regex sederhana (Rp 0).

