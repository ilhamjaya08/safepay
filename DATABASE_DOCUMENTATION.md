# Safepay Digital Wallet - Database Documentation

## Overview

Database ini dirancang untuk aplikasi bank digital/e-wallet **Safepay** dengan 3 level akses:
- **User**: Melihat saldo, transfer antar user, bayar QR, transfer bank lain, memiliki kartu internasional
- **Operator**: Memonitor aktivitas user, suspend rekening, melihat laporan transaksi
- **Manager**: Semua akses operator + manipulasi transaksi + top up saldo user

## Database Tables

### 1. Users
**Primary table untuk semua pengguna sistem**
- `id`: Primary key
- `name`: Nama lengkap pengguna
- `email`: Email unik pengguna  
- `password`: Password ter-hash
- `role`: ENUM('user', 'operator', 'manager') - Role sistem
- `phone`: Nomor telepon unik
- `is_active`: Status aktif pengguna
- `last_login`: Waktu login terakhir

**Business Rules:**
- Setiap user otomatis dibuatkan wallet saat registrasi
- User dengan role 'user' bisa punya multiple cards & bank accounts
- Operator & Manager tidak memiliki wallet/cards

### 2. Wallets  
**Dompet digital utama user**
- `user_id`: FK ke users (one-to-one)
- `balance`: Saldo aktual 
- `locked_balance`: Saldo yang dikunci untuk transaksi pending
- `wallet_number`: Nomor dompet unik (SP + 8 digit)
- `pin_hash`: PIN transaksi ter-hash
- `is_active`: Status aktif wallet

**Business Rules:**
- Available balance = balance - locked_balance
- Setiap transaksi mengunci saldo dulu, baru deduct setelah sukses
- Wallet number auto-generated format: SP12345678

### 3. Cards
**Kartu internasional untuk user**
- `user_id`: FK ke users
- `card_number`: 16 digit nomor kartu
- `card_type`: ENUM('visa', 'mastercard')
- `status`: ENUM('active', 'blocked', 'expired', 'cancelled')
- `daily_limit` & `monthly_limit`: Limit transaksi
- `daily_used` & `monthly_used`: Usage counter
- `is_international`: Flag untuk transaksi international

**Business Rules:**
- Auto reset limit usage setiap hari/bulan
- Card number auto-generated (4xxx untuk Visa, 5xxx untuk Mastercard)
- Default limit: Daily 50M IDR, Monthly 500M IDR

### 4. Transactions
**Table utama untuk semua transaksi**
- `transaction_id`: ID unik transaksi (TXN + date + random)
- `sender_id` & `receiver_id`: FK ke users
- `type`: ENUM dengan 8 jenis transaksi:
  - `transfer_internal`: Transfer ke sesama user Safepay
  - `transfer_external`: Transfer ke bank lain
  - `receive_external`: Terima dari bank lain
  - `payment_qr`: Bayar invoice via QR
  - `topup`: Top up saldo (Manager only)
  - `withdrawal`: Tarik tunai
  - `card_transaction`: Transaksi menggunakan kartu
  - `refund`: Refund transaksi
- `amount`: Jumlah transaksi
- `fee`: Biaya admin
- `total_amount`: amount + fee
- `status`: ENUM('pending', 'processing', 'completed', 'failed', 'cancelled')
- `metadata`: JSON untuk data tambahan (bank details, QR info, etc)
- `external_reference`: Reference dari bank/payment external

**Business Rules:**
- Internal transfer: langsung completed
- External transfer: melalui API integration
- QR payment: terkait dengan invoices
- Semua status change dicatat di transaction_logs

### 5. Transaction Logs
**Audit trail untuk semua perubahan transaksi**
- `transaction_id`: FK ke transactions
- `user_id`: Siapa yang melakukan aksi (nullable untuk system)
- `action`: ENUM('created', 'updated', 'cancelled', 'completed', 'failed', 'refunded')
- `previous_status` & `new_status`: Status sebelum dan sesudah
- `notes`: Catatan tambahan
- `ip_address` & `user_agent`: Tracking info

### 6. Bank Accounts
**Rekening bank eksternal user**
- `user_id`: FK ke users
- `bank_code`: Kode bank (BCA, BNI, BRI, etc)
- `account_number`: Nomor rekening
- `account_holder_name`: Nama pemilik rekening
- `is_verified`: Status verifikasi rekening
- `is_primary`: Rekening utama user

**Business Rules:**
- User bisa punya multiple bank accounts
- Hanya bisa ada 1 primary account per user
- Verification required sebelum bisa digunakan

### 7. Invoices
**Invoice untuk pembayaran QR**
- `invoice_number`: Nomor invoice unik (INV + date + random)
- `merchant_id`: FK ke users (pembuat invoice)
- `customer_id`: FK ke users (pembayar, nullable)
- `amount`: Jumlah yang harus dibayar
- `qr_code`: Data QR code untuk pembayaran
- `expires_at`: Waktu kadaluwarsa
- `status`: ENUM('pending', 'paid', 'expired', 'cancelled')

**Business Rules:**
- Auto expire berdasarkan expires_at
- QR code berisi JSON dengan info pembayaran
- Setelah dibayar, status jadi 'paid' dan customer_id diisi

### 8. User Suspensions
**Sistem suspend user oleh Operator/Manager**
- `user_id`: FK ke users (yang disuspend)
- `suspended_by`: FK ke users (operator/manager)
- `lifted_by`: FK ke users (yang mencabut suspend)
- `type`: ENUM('temporary', 'permanent')
- `reason`: Alasan suspend
- `status`: ENUM('active', 'lifted', 'expired')
- `expires_at`: Waktu berakhir (untuk temporary)

**Business Rules:**
- Temporary suspension auto expire
- Permanent suspension butuh manual lift
- User yang disuspend tidak bisa melakukan transaksi

### 9. API Logs
**Log semua komunikasi API eksternal**
- `type`: webhook, external_api, internal_api
- `method`: HTTP method
- `endpoint`: URL endpoint
- `request_payload` & `response_payload`: JSON data
- `response_code`: HTTP status code
- `response_time`: Waktu response dalam ms
- `transaction_id`: FK ke transactions (jika terkait)

**Business Rules:**
- Digunakan untuk monitoring API performance
- Tracking webhook dari bank external
- Debug integration issues

## Indexes

Database menggunakan indexes untuk optimasi query:
- **Users**: `email`, `phone`, `role`
- **Transactions**: `(sender_id, created_at)`, `(receiver_id, created_at)`, `(type, status, created_at)`
- **Transaction_Logs**: `(transaction_id, created_at)`, `(user_id, action, created_at)`
- **Bank_Accounts**: `(user_id, is_primary)`
- **Invoices**: `(merchant_id, status, created_at)`, `(status, expires_at)`
- **User_Suspensions**: `(user_id, status)`, `(status, expires_at)`
- **API_Logs**: `(type, created_at)`, `(response_code, created_at)`

## Key Features

### 🔐 Security
- Role-based access control (user/operator/manager)
- Password hashing dengan Laravel
- Transaction PIN untuk wallet
- Audit trail untuk semua perubahan
- IP tracking dan user agent logging

### 💰 Balance Management
- Real-time balance tracking
- Locked balance untuk pending transactions
- Automatic balance adjustment
- Transaction fee calculation

### 📊 Reporting & Analytics
- Transaction history dengan filter
- User activity monitoring
- API performance tracking
- Comprehensive logging system

### 🌐 External Integration
- Bank transfer via API
- Webhook handling
- External reference tracking
- Error handling & retry mechanism

### ⚡ Performance
- Proper indexing for fast queries
- JSON columns for flexible metadata
- Optimized foreign key relationships
- Automatic cleanup jobs (expired invoices, suspensions)

## Usage Examples

### User Registration Flow
1. User registers → Record di `users` table
2. System auto-create → Record di `wallets` table dengan balance 0
3. User KYC → Update `is_active` ke true

### Transfer Internal Flow
1. Create transaction record dengan status 'pending'
2. Lock sender balance
3. Validate receiver exists
4. Update transaction status ke 'completed'
5. Deduct sender balance, add receiver balance
6. Unlock locked balance
7. Create transaction_log entries

### QR Payment Flow
1. Merchant create invoice
2. Generate QR code dengan invoice data
3. Customer scan QR → get invoice details
4. Customer bayar → create transaction dengan invoice_id
5. Invoice status jadi 'paid'
6. Create transaction_log entries

### Suspend User Flow (Operator/Manager)
1. Create user_suspension record
2. Set user.is_active = false (optional)
3. User tidak bisa login/transaksi
4. Auto expire untuk temporary suspension

## Installation

```bash
# Run migrations
php artisan migrate

# Rollback migrations (if needed)
php artisan migrate:rollback

# Fresh migration (reset all data)
php artisan migrate:fresh
```

## Data Seeding

Untuk testing, bisa buat seeder untuk:
- Demo users dengan different roles
- Sample wallets dengan balance
- Sample transactions
- Sample bank accounts
- Sample invoices

```bash
php artisan make:seeder DatabaseSeeder
php artisan db:seed
```

## Maintenance Jobs

Jadwalkan command ini untuk maintenance rutin:
```php
// Expire overdue invoices
Invoice::expireOverdueInvoices();

// Expire overdue suspensions  
UserSuspension::expireOverdueSuspensions();

// Reset card limits daily/monthly
Card::resetLimitsIfNeeded();
```

## Security Considerations

1. **Sensitive Data**: Card CVV, PIN hash, password tidak pernah di-log
2. **Rate Limiting**: Implement rate limiting untuk API endpoints
3. **Encryption**: Consider encrypt sensitive fields di database
4. **Backup**: Regular backup database dengan encryption
5. **Access Control**: Strict database user permissions
6. **Monitoring**: Monitor suspicious transaction patterns

## Compliance

Database structure mendukung compliance untuk:
- **PCI DSS**: Card data handling
- **PSD2**: Payment service directive
- **Anti Money Laundering**: Transaction monitoring
- **Data Protection**: User privacy & data retention
