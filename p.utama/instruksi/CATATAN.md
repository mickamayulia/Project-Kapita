# CATATAN PERUBAHAN VERSI SYSTEM PROMPT (CATATAN.md)
## Produk: Aviako Risk Register Assistant (RiskRegen)

| Versi | Tanggal | Yang diubah | Alasan | Efek yang terlihat |
|---|---|---|---|---|
| **v1.0** | 25/09/2026 | System prompt awal memuat Peran, Konteks, Tugas, Batasan umum, dan Format teks berpoin. Belum ada contoh few-shot kasus ambigu dan larangan menebak secara tegas. | Baseline awal untuk ekstraksi risiko dari catatan insiden operasional. | Model berhasil mengekstrak risiko, tetapi format jawaban tidak konsisten (kadang teks naratif, kadang list). Pada input ambigu, model mengarang nilai likelihood dan impact (misal memberi nilai 3 atau 4 secara acak). |
| **v2.0** | 02/10/2026 | Menambahkan: (1) Aturan guardrail ambiguitas tegas: jika tidak ada data frekuensi/dampak, wajib beri nilai `null` dan status `perlu_verifikasi`, (2) Contoh few-shot kasus ambigu, (3) Validasi skema JSON dengan field bukti/kutipan rujukan. | Mencegah halusinasi skor risiko pada input deskriptif yang minim angka kuantitatif dan memastikan output siap dikonsumsi sistem. | Pada input "Sistem kadang lemot sore hari", model tidak lagi menebak nilai likelihood=3 impact=4, melainkan konsisten mengisi `null` dan memberi status `perlu_verifikasi`. Output 100% konsisten berformat JSON. |

