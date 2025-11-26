const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'proje_takip.db'));

// Tabloları oluştur
db.exec(`
  -- Departmanlar tablosu
  CREATE TABLE IF NOT EXISTS departmanlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad TEXT NOT NULL,
    aciklama TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Birimler tablosu
  CREATE TABLE IF NOT EXISTS birimler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad TEXT NOT NULL,
    departman_id INTEGER,
    aciklama TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departman_id) REFERENCES departmanlar(id) ON DELETE SET NULL
  );

  -- Kişiler tablosu
  CREATE TABLE IF NOT EXISTS kisiler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad TEXT NOT NULL,
    soyad TEXT NOT NULL,
    email TEXT,
    telefon TEXT,
    birim_id INTEGER,
    pozisyon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (birim_id) REFERENCES birimler(id) ON DELETE SET NULL
  );

  -- Projeler tablosu
  CREATE TABLE IF NOT EXISTS projeler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad TEXT NOT NULL,
    aciklama TEXT,
    durum TEXT DEFAULT 'beklemede',
    oncelik TEXT DEFAULT 'normal',
    baslangic_tarihi DATE,
    bitis_tarihi DATE,
    sorumlu_kisi_id INTEGER,
    sorumlu_birim_id INTEGER,
    sorumlu_departman_id INTEGER,
    ilerleme INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sorumlu_kisi_id) REFERENCES kisiler(id) ON DELETE SET NULL,
    FOREIGN KEY (sorumlu_birim_id) REFERENCES birimler(id) ON DELETE SET NULL,
    FOREIGN KEY (sorumlu_departman_id) REFERENCES departmanlar(id) ON DELETE SET NULL
  );

  -- Proje adımları tablosu
  CREATE TABLE IF NOT EXISTS proje_adimlari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proje_id INTEGER NOT NULL,
    baslik TEXT NOT NULL,
    aciklama TEXT,
    sira INTEGER DEFAULT 0,
    durum TEXT DEFAULT 'beklemede',
    atanan_kisi_id INTEGER,
    atanan_birim_id INTEGER,
    baslangic_tarihi DATE,
    bitis_tarihi DATE,
    tamamlanma_tarihi DATE,
    notlar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proje_id) REFERENCES projeler(id) ON DELETE CASCADE,
    FOREIGN KEY (atanan_kisi_id) REFERENCES kisiler(id) ON DELETE SET NULL,
    FOREIGN KEY (atanan_birim_id) REFERENCES birimler(id) ON DELETE SET NULL
  );

  -- Proje güncellemeleri/logları tablosu
  CREATE TABLE IF NOT EXISTS proje_guncellemeleri (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proje_id INTEGER NOT NULL,
    adim_id INTEGER,
    guncelleme_tipi TEXT NOT NULL,
    eski_deger TEXT,
    yeni_deger TEXT,
    aciklama TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proje_id) REFERENCES projeler(id) ON DELETE CASCADE,
    FOREIGN KEY (adim_id) REFERENCES proje_adimlari(id) ON DELETE SET NULL
  );

  -- Adım-Kişi ilişki tablosu (çoklu atama için)
  CREATE TABLE IF NOT EXISTS adim_kisiler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adim_id INTEGER NOT NULL,
    kisi_id INTEGER NOT NULL,
    rol TEXT DEFAULT 'sorumlu',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adim_id) REFERENCES proje_adimlari(id) ON DELETE CASCADE,
    FOREIGN KEY (kisi_id) REFERENCES kisiler(id) ON DELETE CASCADE,
    UNIQUE(adim_id, kisi_id)
  );

  -- Adım-Birim ilişki tablosu (çoklu atama için)
  CREATE TABLE IF NOT EXISTS adim_birimler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adim_id INTEGER NOT NULL,
    birim_id INTEGER NOT NULL,
    rol TEXT DEFAULT 'sorumlu',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adim_id) REFERENCES proje_adimlari(id) ON DELETE CASCADE,
    FOREIGN KEY (birim_id) REFERENCES birimler(id) ON DELETE CASCADE,
    UNIQUE(adim_id, birim_id)
  );
`);

// Örnek veriler ekle (ilk çalıştırmada)
const departmanCount = db.prepare('SELECT COUNT(*) as count FROM departmanlar').get();
if (departmanCount.count === 0) {
  // Örnek departmanlar
  db.prepare('INSERT INTO departmanlar (ad, aciklama) VALUES (?, ?)').run('Bilgi Teknolojileri', 'IT ve yazılım geliştirme');
  db.prepare('INSERT INTO departmanlar (ad, aciklama) VALUES (?, ?)').run('İnsan Kaynakları', 'İK süreçleri');
  db.prepare('INSERT INTO departmanlar (ad, aciklama) VALUES (?, ?)').run('Finans', 'Mali işler');

  // Örnek birimler
  db.prepare('INSERT INTO birimler (ad, departman_id, aciklama) VALUES (?, ?, ?)').run('Yazılım Geliştirme', 1, 'Yazılım projeleri');
  db.prepare('INSERT INTO birimler (ad, departman_id, aciklama) VALUES (?, ?, ?)').run('Sistem Yönetimi', 1, 'Altyapı ve sistemler');
  db.prepare('INSERT INTO birimler (ad, departman_id, aciklama) VALUES (?, ?, ?)').run('İşe Alım', 2, 'Personel temini');

  // Örnek kişiler
  db.prepare('INSERT INTO kisiler (ad, soyad, email, birim_id, pozisyon) VALUES (?, ?, ?, ?, ?)').run('Ahmet', 'Yılmaz', 'ahmet@sirket.com', 1, 'Yazılım Geliştirici');
  db.prepare('INSERT INTO kisiler (ad, soyad, email, birim_id, pozisyon) VALUES (?, ?, ?, ?, ?)').run('Ayşe', 'Demir', 'ayse@sirket.com', 1, 'Proje Yöneticisi');
  db.prepare('INSERT INTO kisiler (ad, soyad, email, birim_id, pozisyon) VALUES (?, ?, ?, ?, ?)').run('Mehmet', 'Kaya', 'mehmet@sirket.com', 2, 'Sistem Uzmanı');
}

module.exports = db;
