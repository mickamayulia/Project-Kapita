# DOKUMENTASI LENGKAP TOOLS & 5 LAPIS GUARDRAILS (Minggu 11–13)
## Produk: Aviako Risk Register Assistant (RiskRegen)
**Target CPMK:** Sub-CPMK-4 & Sub-CPMK-6 (Blok D — Agentic)

---

## 1. Daftar Tool Resmi (Syarat $K=17 \rightarrow 2 + (17 \bmod 2) = 3$ Tool)

| # | Nama Tool | Kegunaan | Parameter Input | Output | Batas Akses & Tempat Pemasangan |
|---|---|---|---|---|---|
| 1 | `hitung_skor_risiko` | Menghitung matriks deterministik $L \times I$ (1–25) dan level risiko (`rendah`, `sedang`, `tinggi`). | `likelihood` (int 1–5), `impact` (int 1–5) | `{ skor, tingkat }` | **Otomatis (Read-Only)** di kode JavaScript backend. Dilarang jika salah satu input bernilai `null`. |
| 2 | `cari_dokumen_rujukan` | Menemukan cuplikan pasal/klausul kepatuhan standar (ISO 31000/27005/NIST/Kebijakan internal). | `query` (string pencarian kata kunci) | Array objek `{ dokumen, score, text }` | **Otomatis (Read-Only)** di kode backend. Terbatas hanya pada folder dokumen resmi. |
| 3 | `hitung_denda_sla_vendor` | Menghitung denda finansial dan sanksi keterlambatan vendor berdasarkan durasi downtime. | `downtimeMenit` (int), `tierVendor` (int 1–2) | `{ kenaPinalti, jamTerlambat, dendaRp, kategoriSanksi }` | **Otomatis (Read-Only)** di kode backend kalkulator matematis. |
| 4 | `simpan_register_risiko` | Menyimpan draf register risiko dan sanksi ke database permanen `registers.json`. | `sessionId`, `title`, `daftar_risiko` | `{ success: true, register }` | **WAJIB PERSETUJUAN MANUSIA (Human-in-the-Loop)** via endpoint `POST /api/registers/save`. |

---

## 2. Implementasi Lima Lapis Guardrails (Modul 13.1)

```text
[Permintaan Masuk]
       │
       ▼
[Lapis 1: Input Sanitization] ──► Tolak jika memuat regex prompt injection ("abaikan instruksi", dll.)
       │
       ▼
[Lapis 2: System Prompt] ───────► Strict Context Boundary: tolak instruksi non-IT & larangan menebak
       │
       ▼
[Lapis 3: Akses Tool Kaku] ─────► Tool hanya membaca file resmi; batas langkah maksimum 4–6 langkah
       │
       ▼
[Lapis 4: Validasi Output] ─────► Cek JSON Schema; otomatis retry 1x jika format cacat sebelum diteruskan
       │
       ▼
[Lapis 5: Human-in-the-Loop] ───► Tindakan penulisan data/sanksi finansial menunggu verifikasi staf manusia
```

### Rincian Pemasangan Tiap Lapis:
1. **Lapis 1 (Input Guardrail):** Dipasang di fungsi `sanitizeInputGuardrails()` pada `server.js`. Memeriksa masukan terhadap pola *jailbreak* / *prompt injection*. Jika terdeteksi, langsung ditolak dengan kode HTTP 403.
2. **Lapis 2 (Prompt Guardrail):** Dipasang di `v2.md` dan `SYSTEM_PROMPT`. Menegakkan aturan strict context boundary dan larangan halusinasi skor jika data ambigu (`null`).
3. **Lapis 3 (Tool Access Guardrail):** Dipasang langsung di arsitektur fungsi kode (bukan diserahkan ke LLM). Tool hanya memiliki hak baca (*read-only*), direktori akses dibatasi kaku ke `uploads/` dan `data/`. Siklus eksekusi agen dibatasi maksimum **4 langkah kaku** (`maxSteps`).
4. **Lapis 4 (Output Guardrail):** Dipasang di `validateRiskSchema()`. Memeriksa struktur JSON (field status, daftar_risiko, dan sumber kutipan). Jika rusak, memicu mekanisme retry otomatis 1x dengan umpan balik pesan kesalahan.
5. **Lapis 5 (Human-in-the-Loop Guardrail):** Dipasang pada endpoint `POST /api/registers/save`. Setiap agen menyelesaikan sintesis investigasi, status akhir diset ke `awaiting_human_approval`. Data tidak akan pernah disimpan ke database register resmi sebelum tombol simpan ditekan secara sadar oleh staf pengguna.

