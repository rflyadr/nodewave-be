# NodeWave Backend

---

## Fitur Utama

- Autentikasi JWT (Register, Login, Proteksi route)
- Upload file (penyimpanan lokal pada folder `/uploads`)
- Manajemen user, produk, file, dan lainnya
- Integrasi Prisma ORM (database)
- Struktur modular dan mudah dikembangkan

---

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/rflyadr/nodewave-be.git
cd nodewave-be
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Environment Variable

Gunakan `.env` lalu sesuaikan (database, JWT, dsb):

**.env:**
```
DATABASE_URL="mysql://root:12345678@localhost:3306/nw_be"
SHADOW_DATABASE_URL="mysql://root:12345678@localhost:3306/nw_be_shadow"
NODE_LOCAL_PORT=3150
JWT_SECRET="AVERYSECRETjWTcoDE"
ENVIRONMENT=dev
ALLOWED_ORIGINS="*"

```

### 4. Migrasi Database (Prisma)

```bash
npx prisma migrate
npx prisma generate
npm run seed
```

**Atau untuk dev:**
```bash
npx prisma migrate dev --name init
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Akses API di: [http://localhost:3150](http://localhost:3150)

---

## API Documentation

- Endpoint utama ada di `/src/app/routes/`

---

## Folder storage

- **/uploads** — untuk file upload (auto dibuat)

---

## ⚠️ Troubleshooting

- **Database tidak connect:**  
  Cek `DATABASE_URL` di `.env`, pastikan DB jalan & user/password benar

- **Port bentrok:**  
  Ubah `PORT` di `.env`

- **File upload error:**  
  Pastikan folder `/uploads` bisa diakses/tulis, dan path di `.env` benar

- **Prisma error:**  
  Pastikan sudah `npx prisma generate` setelah update schema

---

## 🙋‍♂️ Kontribusi

Pull request & issue dipersilakan!  
Laporkan bug/ide melalui [issues](https://github.com/rflyadr/nodewave-be/issues)

---

## 👨‍💻 Author

- Nama: Rafly Adriansyah
- Email: raflyadriansyah79@gmail.com
- GitHub: [https://github.com/rflyadr](https://github.com/rflyadr)
