# UangKita - Financial Management App

A modern financial management application built with React, TypeScript, and Supabase.

## Features

- Wallet Management
- Transaction Tracking
- Financial Tools
  - Investment Calculator
  - Currency Converter
  - Gold Calculator
- Market Prices
  - USD/IDR Exchange Rate
  - Gold Price
  - Silver Price

## Tech Stack

- React
- TypeScript
- Vite
- Supabase
- Tailwind CSS
- Shadcn UI

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Development with Cursor

This project is developed using Cursor IDE, which provides an enhanced development experience with AI-powered assistance.

### How to edit this code?

**Using Cursor IDE**

1. Open the project in Cursor IDE
2. Make your changes
3. Commit and push your changes

**Using your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

Requirements:
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository
git clone https://github.com/kalabercerita/uangkita-cursor.git

# Step 2: Navigate to the project directory
cd uangkita-cursor

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

**Edit directly in GitHub**

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon)
- Make your changes and commit

## Auto-Push Configuration

This repository is configured with GitHub Actions to automatically push changes to the main branch.

## License

MIT

## Project info

**URL**: https://lovable.dev/projects/5d5a8379-ca04-4660-9d22-cb66c11f72cf

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5d5a8379-ca04-4660-9d22-cb66c11f72cf) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5d5a8379-ca04-4660-9d22-cb66c11f72cf) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Fitur Analisis Struk dengan AI

Aplikasi ini memiliki fitur untuk menganalisis struk belanja menggunakan AI. Untuk menggunakan fitur ini, Anda perlu melakukan beberapa setup:

### Setup di Supabase Dashboard

1. Buka [Supabase Dashboard](https://supabase.com/dashboard/project/jvdmtxoumqfpsejbdorr)
2. Pergi ke bagian "Edge Functions"
3. Klik "New Function"
4. Masukkan informasi berikut:
   - Name: `analyze-receipt`
   - Verify JWT: `false` (karena menggunakan API key)
5. Copy-paste kode dari file `supabase/functions/analyze-receipt/index.ts`
6. Tambahkan environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: [Your OpenAI API Key]

### Cara Menggunakan

1. Pada halaman transaksi, klik tab "Dari Foto"
2. Anda bisa mengambil foto struk langsung dari kamera atau memilih dari galeri
3. Klik "Analisis Foto dengan AI"
4. Sistem akan menganalisis struk dan mengisi form transaksi secara otomatis dengan:
   - Deskripsi merchant/transaksi
   - Total nominal
   - Tanggal transaksi
   - Daftar item (jika tersedia dalam struk)
5. Periksa hasil analisis dan sesuaikan jika diperlukan
6. Klik "Tambah Transaksi" untuk menyimpan

### Catatan

- Fitur ini menggunakan OpenAI Vision API untuk menganalisis struk
- Hasil analisis mungkin tidak selalu 100% akurat
- Pastikan foto struk jelas dan terbaca
- Untuk hasil terbaik, pastikan struk menampilkan:
  - Nama merchant
  - Total pembayaran
  - Tanggal transaksi
  - Daftar item (opsional)

### Troubleshooting

Jika mengalami masalah:
1. Pastikan foto struk jelas dan tidak blur
2. Cek koneksi internet
3. Pastikan environment variable `OPENAI_API_KEY` sudah diset dengan benar
4. Jika hasil analisis tidak akurat, gunakan input manual

### Pengembangan

Untuk mengembangkan fitur ini:
1. Edit file `supabase/functions/analyze-receipt/index.ts` untuk logika analisis
2. Edit file `src/components/ReceiptAnalyzer.tsx` untuk UI komponen
3. Deploy ulang fungsi ke Supabase setelah melakukan perubahan

## Lisensi

MIT License
