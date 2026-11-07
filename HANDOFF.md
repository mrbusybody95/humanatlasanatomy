# Human Atlas — dokumen serah-terima lengkap

> Diringkas dari artefak nyata di disk dan hasil pemeriksaan langsung, 7 Nov 2026.
> Semua angka di bawah diukur, bukan perkiraan.

## 1. Identitas proyek

| Item | Nilai |
|---|---|
| Nama produk | **Human Atlas** (di header aplikasi) |
| Nama paket | `anatomy-studio` v0.1.0 (private) |
| Lokasi | `C:/Agentic/02-apps/human-atlas` |
| Ukuran total | **183 MB** (dist 91 MB, public 90 MB) |
| Situs live | https://human-atlas-seven.vercel.app — **status saat dicek: HTTP 503 (mati)** |
| Lisensi kode | MIT (`LICENSE`) |
| Lisensi data | **CC BY 4.0** — wajib atribusi (`public/ATTRIBUTION.md`) |

## 2. Apa yang bisa dilakukan pengguna

- Memutar, zoom, dan memilih struktur langsung pada tubuh
- Menyalakan/mematikan **15 sistem anatomi**, plus preset skeleton dan organ
- Berpindah dari tubuh utuh ke **inventaris terpisah** setiap bagian yang terlihat
- Mencari **3.432 nama konsep** dan ID sumber
- Mengisolasi satu struktur lalu membaca detailnya
- Kontrol ringkas + panel detail untuk ponsel
- Riwayat dan mode gelap (commit `04d7607`)
- WebMCP opsional: pencarian & inspeksi anatomi untuk browser yang mendukung; UI tetap jalan tanpanya

## 3. Data anatomi

| Item | Nilai |
|---|---|
| Sumber | **BodyParts3D 4.0**, referensi pria dewasa |
| Lisensi | CC Attribution 4.0 International (DBCLS) |
| Mesh sumber | **2.234** OBJ individual (semua tetap terwakili) |
| Konsep bernama | **3.432** konsep FMA (satu konsep bisa merujuk beberapa mesh) |
| Segitiga terpaket | **2.288.268** |
| Unduhan geometri | ± **33 MB** terkompresi |
| Berkas sumber | `isa_BP3D_4.0_obj_99.zip` + tabel IS-A / PART-OF |

Adaptasi yang dilakukan: sumbu & satuan mm/Z-up → meter/Y-up; diterjemahkan agar diam di panggung; geometri disederhanakan dengan meshoptimizer (**batas galat relatif 0,2% per struktur**); normal dikuantisasi ke signed 16-bit; dipaket ke chunk biner; pengelompokan sistem & warna dikurasi manual. Identitas sumber asli dipertahankan di manifest.

Publikasi acuan: Mitsuhashi et al. (2009), *BodyParts3D: 3D structure database for anatomical concepts*, https://doi.org/10.1093/nar/gkn613

## 4. Tumpukan teknologi

- **React 19.2.6** + **TypeScript**
- **three 0.159** untuk 3D
- **shadcn / @base-ui / Tailwind 4.2.1 / lucide-react** untuk UI
- **Vite** (dev & build), `vinext` beta, plugin Cloudflare & OpenAI Sites
- Node **≥ 22.13**
- Geometri digabung jadi batch; tekstur GPU per-struktur mengatur translasi, visibilitas, dan seleksi; picking tetap akurat per komponen; layout "exploded" hanya mengemas bagian yang terlihat → orbit tetap mulus tanpa ribuan draw call

## 5. Cara menjalankan

```sh
cd C:/Agentic/02-apps/human-atlas
npm ci
npm run dev        # http://localhost:3016
```

Build statis: `npm run build` → hasil di `dist/`. Catatan: server dev **3016 sedang tidak berjalan** saat diperiksa.

## 6. Cara memverifikasi

```sh
npm run check                          # tsc --noEmit
node scripts/validate-atlas.mjs
node scripts/validate-interactions.mjs
npm run build
```

Cakupan validasi menurut README: buffer mesh, nama & keanggotaan konsep, layout exploded tidak tumpang tindih pada rasio desktop & mobile, kontrak pencarian dan inspeksi, serta pembedaan tap vs drag. Uji interaksi browser sudah mencakup seleksi, kontrol sistem, pencarian, isolasi, rotasi, dan layout 390×844 / 320×568 / 844×390.

## 7. Serah-terima deployment

- `vercel.json` sudah mengatur `npm ci`, `npm run build`, output `dist`
- Bisa juga disajikan host statis apa pun
- **Perlu dicek sebelum diserahkan:** situs live mengembalikan **503**. Kemungkinan penyebab yang perlu diperiksa berurutan: kuota/limit akun Vercel, deployment terakhir gagal, atau proyek di-suspend. Ini bukan masalah kode — build lokal menghasilkan `dist/` 91 MB.

## 8. Status git (perlu tindakan)

- HEAD: `b3ea765` — *Merge GitHub auto-generated initial commit (README, LICENSE)*
- Riwayat lain: `04d7607` preset wilayah + sembunyikan/pulihkan struktur + mode gelap · `7cf9ce5` initial · `1c38bf3` judul · `a972456` rename header · `7a383d3` layout ponsel & inspeksi
- **Working tree kotor:** `app/page.tsx` (modified), `package-lock.json` (modified), `app/history.ts` (untracked), `.gitattributes` (untracked)

Artinya ada pekerjaan yang belum masuk commit. Sebelum menyerahkan ke pihak lain, putuskan: commit, atau buang.

## 9. Batasan yang sudah dinyatakan sendiri oleh proyek

- Ini **alat edukasi**, bukan alat diagnosis atau bedah
- Tidak mewakili seluruh variasi anatomi manusia
- Performa di perangkat fisik dan multitouch sungguhan **belum diuji**
- Deskripsi membedakan konteks sistem dari penjelasan organ individual

## 10. Hal yang perlu disampaikan ke penerima

1. Data CC BY 4.0 — **atribusi wajib ikut** kalau didistribusikan ulang. Jangan hapus `ATTRIBUTION.md`.
2. Ukuran aset besar: 33 MB geometri terkompresi untuk pengguna pertama kali. Perlu strategi loading (sudah dipaket chunk biner).
3. Situs live sedang 503 → jangan kirim tautan itu sebagai "demo hidup" sampai diperbaiki.
4. Ada perubahan belum ter-commit di `app/page.tsx` dan berkas baru `app/history.ts` — bisa jadi fitur riwayat yang belum selesai.
5. Tidak ada kunci API atau akun yang dibutuhkan untuk menjalankan secara lokal.

---

### Versi ringkas untuk dikirim lewat pesan

> **Human Atlas** — penjelajah anatomi 3D interaktif. React 19 + three.js + shadcn, build Vite, tanpa backend dan tanpa kunci API.
> Isi: 2.234 mesh dari BodyParts3D 4.0 (CC BY 4.0, atribusi wajib), 3.432 konsep FMA, 15 sistem, 2,29 juta segitiga, ±33 MB geometri terkompresi.
> Jalankan: `npm ci && npm run dev` → localhost:3016. Build: `npm run build` → `dist/`.
> Verifikasi: `npm run check`, `scripts/validate-atlas.mjs`, `scripts/validate-interactions.mjs`.
> Repo: `C:/Agentic/02-apps/human-atlas`. Situs Vercel saat ini **503**, jangan dipakai sebagai demo sampai diperbaiki. Working tree masih kotor (`app/page.tsx`, `app/history.ts` belum di-commit).
> Batasan: alat edukasi, bukan diagnostik; variasi anatomi tidak lengkap; performa perangkat fisik belum diuji.
