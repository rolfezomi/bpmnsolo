-- Departmanlar tablosu
CREATE TABLE IF NOT EXISTS departmanlar (
  id SERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birimler tablosu
CREATE TABLE IF NOT EXISTS birimler (
  id SERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  departman_id INTEGER REFERENCES departmanlar(id) ON DELETE SET NULL,
  aciklama TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kişiler tablosu
CREATE TABLE IF NOT EXISTS kisiler (
  id SERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  email TEXT,
  telefon TEXT,
  birim_id INTEGER REFERENCES birimler(id) ON DELETE SET NULL,
  pozisyon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projeler tablosu
CREATE TABLE IF NOT EXISTS projeler (
  id SERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  durum TEXT DEFAULT 'beklemede',
  oncelik TEXT DEFAULT 'normal',
  baslangic_tarihi DATE,
  bitis_tarihi DATE,
  sorumlu_kisi_id INTEGER REFERENCES kisiler(id) ON DELETE SET NULL,
  sorumlu_birim_id INTEGER REFERENCES birimler(id) ON DELETE SET NULL,
  sorumlu_departman_id INTEGER REFERENCES departmanlar(id) ON DELETE SET NULL,
  ilerleme INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proje adımları tablosu
CREATE TABLE IF NOT EXISTS proje_adimlari (
  id SERIAL PRIMARY KEY,
  proje_id INTEGER NOT NULL REFERENCES projeler(id) ON DELETE CASCADE,
  baslik TEXT NOT NULL,
  aciklama TEXT,
  sira INTEGER DEFAULT 0,
  durum TEXT DEFAULT 'beklemede',
  atanan_kisi_id INTEGER REFERENCES kisiler(id) ON DELETE SET NULL,
  atanan_birim_id INTEGER REFERENCES birimler(id) ON DELETE SET NULL,
  baslangic_tarihi DATE,
  bitis_tarihi DATE,
  tamamlanma_tarihi DATE,
  notlar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proje güncellemeleri tablosu
CREATE TABLE IF NOT EXISTS proje_guncellemeleri (
  id SERIAL PRIMARY KEY,
  proje_id INTEGER NOT NULL REFERENCES projeler(id) ON DELETE CASCADE,
  adim_id INTEGER REFERENCES proje_adimlari(id) ON DELETE SET NULL,
  guncelleme_tipi TEXT NOT NULL,
  eski_deger TEXT,
  yeni_deger TEXT,
  aciklama TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adım-Kişi ilişki tablosu
CREATE TABLE IF NOT EXISTS adim_kisiler (
  id SERIAL PRIMARY KEY,
  adim_id INTEGER NOT NULL REFERENCES proje_adimlari(id) ON DELETE CASCADE,
  kisi_id INTEGER NOT NULL REFERENCES kisiler(id) ON DELETE CASCADE,
  rol TEXT DEFAULT 'sorumlu',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(adim_id, kisi_id)
);

-- Adım-Birim ilişki tablosu
CREATE TABLE IF NOT EXISTS adim_birimler (
  id SERIAL PRIMARY KEY,
  adim_id INTEGER NOT NULL REFERENCES proje_adimlari(id) ON DELETE CASCADE,
  birim_id INTEGER NOT NULL REFERENCES birimler(id) ON DELETE CASCADE,
  rol TEXT DEFAULT 'sorumlu',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(adim_id, birim_id)
);

-- RLS (Row Level Security) - Public erişim için
ALTER TABLE departmanlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE birimler ENABLE ROW LEVEL SECURITY;
ALTER TABLE kisiler ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE proje_adimlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE proje_guncellemeleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE adim_kisiler ENABLE ROW LEVEL SECURITY;
ALTER TABLE adim_birimler ENABLE ROW LEVEL SECURITY;

-- Public read/write policy (demo için - production'da kısıtla)
CREATE POLICY "Public access" ON departmanlar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON birimler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON kisiler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON projeler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON proje_adimlari FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON proje_guncellemeleri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON adim_kisiler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON adim_birimler FOR ALL USING (true) WITH CHECK (true);

-- Örnek veriler
INSERT INTO departmanlar (ad, aciklama) VALUES
  ('Bilgi Teknolojileri', 'IT ve yazılım geliştirme'),
  ('İnsan Kaynakları', 'İK süreçleri'),
  ('Finans', 'Mali işler');

INSERT INTO birimler (ad, departman_id, aciklama) VALUES
  ('Yazılım Geliştirme', 1, 'Yazılım projeleri'),
  ('Sistem Yönetimi', 1, 'Altyapı ve sistemler'),
  ('İşe Alım', 2, 'Personel temini');

INSERT INTO kisiler (ad, soyad, email, birim_id, pozisyon) VALUES
  ('Ahmet', 'Yılmaz', 'ahmet@sirket.com', 1, 'Yazılım Geliştirici'),
  ('Ayşe', 'Demir', 'ayse@sirket.com', 1, 'Proje Yöneticisi'),
  ('Mehmet', 'Kaya', 'mehmet@sirket.com', 2, 'Sistem Uzmanı');
