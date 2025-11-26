const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'proje_takip.db'));

// Satın Alma Departmanını ekle
const satinAlmaDept = db.prepare('INSERT INTO departmanlar (ad, aciklama) VALUES (?, ?)').run(
  'Satın Alma',
  'Satın alma ve tedarik süreçleri yönetimi'
);
const deptId = satinAlmaDept.lastInsertRowid;

// Satın Alma Birimini ekle
const satinAlmaBirim = db.prepare('INSERT INTO birimler (ad, departman_id, aciklama) VALUES (?, ?, ?)').run(
  'Satın Alma Birimi',
  deptId,
  'Satın alma operasyonları'
);
const birimId = satinAlmaBirim.lastInsertRowid;

// Kişileri ekle
const ugur = db.prepare('INSERT INTO kisiler (ad, soyad, birim_id, pozisyon) VALUES (?, ?, ?, ?)').run(
  'Uğur', '', birimId, 'Departman Sahibi'
);
const erdem = db.prepare('INSERT INTO kisiler (ad, soyad, birim_id, pozisyon) VALUES (?, ?, ?, ?)').run(
  'Erdem', '', birimId, 'Uzman'
);
const irfan = db.prepare('INSERT INTO kisiler (ad, soyad, birim_id, pozisyon) VALUES (?, ?, ?, ?)').run(
  'İrfan', '', birimId, 'Uzman'
);
const erkan = db.prepare('INSERT INTO kisiler (ad, soyad, birim_id, pozisyon) VALUES (?, ?, ?, ?)').run(
  'Erkan', '', birimId, 'Uzman'
);
const ersin = db.prepare('INSERT INTO kisiler (ad, soyad, birim_id, pozisyon) VALUES (?, ?, ?, ?)').run(
  'Ersin', '', birimId, 'Uzman'
);

// Ana Projeyi oluştur
const proje = db.prepare(`
  INSERT INTO projeler (ad, aciklama, durum, oncelik, baslangic_tarihi, bitis_tarihi, sorumlu_departman_id, sorumlu_birim_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'Satın Alma Departmanı Süreç İyileştirme Projesi',
  'Satın Alma Departmanı iş akışları, prosedürler, görev tanımları, raporlama ve optimizasyon çalışmaları',
  'devam_ediyor',
  'yuksek',
  '2025-11-25',
  '2025-12-19',
  deptId,
  birimId
);
const projeId = proje.lastInsertRowid;

// Proje oluşturma logu
db.prepare('INSERT INTO proje_guncellemeleri (proje_id, guncelleme_tipi, aciklama) VALUES (?, ?, ?)').run(
  projeId, 'olusturma', 'Satın Alma Departmanı Süreç İyileştirme Projesi oluşturuldu'
);

// Adımları ekle
const adimlar = [
  {
    baslik: 'İş Akışlarının Eksiksiz Olarak Çıkartılması',
    aciklama: `• Makine ve ekipman akışları
• Diğer departmanlara temas eden alanların belirlenmesi ve akışa işlenmesi
• Sözleşme kapsamı ve kural seti, onay mekanizması
  - 150.000 TL altı birim yöneticisi onaylı
  - 150.000 TL üzeri GM onaylı`,
    sira: 1,
    durum: 'devam_ediyor',
    bitis_tarihi: '2025-11-27',
    notlar: 'Sorumlu: Uğur – Departman Sahibi'
  },
  {
    baslik: 'Prosedürlerin Güncellenmesi',
    aciklama: `Yeni akışa uygun şekilde prosedürlerin oluşturulması:
• Olması gereken prosedür sayısı belirlenmesi
• Mevcut prosedür sayısı tespiti
• Güncellenmesi gereken prosedür sayısı
• Mevcut form sayısı
• Olması gereken form sayısı
• Güncellenmesi gereken form sayısı
• Mevcut check list sayısı
• Olması gereken check list sayısı
• Güncellenmesi gereken check list sayısı`,
    sira: 2,
    durum: 'beklemede',
    bitis_tarihi: '2025-11-26',
    notlar: 'Sorumlu: Uğur – Erdem – Departman Sahibi'
  },
  {
    baslik: 'Sorumluluk, Yetki ve Görev Tanımlarının Belirlenmesi',
    aciklama: 'Tüm pozisyonlar için sorumluluk, yetki ve görev tanımlarının detaylı şekilde belirlenmesi',
    sira: 3,
    durum: 'beklemede',
    bitis_tarihi: '2025-12-05',
    notlar: 'Sorumlu: Uğur – İrfan – Erdem'
  },
  {
    baslik: 'Yönetim Raporları ve Görselleştirme',
    aciklama: `Veri yeterliliğinin sağlanması ve görselleştirme çalışmaları:
• Eksik parametrelerin belirlenmesi
• Parametrelerin kurgulanması
• Görsel raporların tasarlanması`,
    sira: 4,
    durum: 'beklemede',
    bitis_tarihi: '2025-11-28',
    notlar: 'Sorumlu: Uğur – Erkan – Ersin'
  },
  {
    baslik: 'Optimizasyon (Otomasyon ve İyileştirme)',
    aciklama: `Otomasyon ve iyileştirme süreçlerinin organize edilmesi:
• Üç teklif alınması, değerlendirilmesi, karar aşaması
• Bütçenin Satın Alma sistemine dahil edilmesi
• Belirlenmiş parametreler çerçevesinde ilgili sorumlu ve birim yöneticisinin bilgilendirilmesi için araçların geliştirilmesi
• Mevcut raporların kullanım sıklığının kontrol edilmesi
• Yeni oluşturulacak süreçlerin belirlenmesi
• Süreç iyileştirme çalışmaları
• Yazılım gerekliliğinin karar verilmesi`,
    sira: 5,
    durum: 'beklemede',
    bitis_tarihi: '2025-12-19',
    notlar: 'Sorumlu: Uğur – Erkan'
  },
  {
    baslik: 'Sonraki Oturum Tarihi Belirlenmesi',
    aciklama: 'Bir sonraki değerlendirme ve takip toplantısının planlanması',
    sira: 6,
    durum: 'beklemede',
    bitis_tarihi: '2025-12-02',
    notlar: 'Toplantı tarihi: 02.12.2025'
  }
];

adimlar.forEach(adim => {
  const result = db.prepare(`
    INSERT INTO proje_adimlari (proje_id, baslik, aciklama, sira, durum, bitis_tarihi, notlar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(projeId, adim.baslik, adim.aciklama, adim.sira, adim.durum, adim.bitis_tarihi, adim.notlar);

  // Adım ekleme logu
  db.prepare('INSERT INTO proje_guncellemeleri (proje_id, adim_id, guncelleme_tipi, aciklama) VALUES (?, ?, ?, ?)').run(
    projeId, result.lastInsertRowid, 'adim_ekleme', `"${adim.baslik}" adımı eklendi`
  );
});

// Proje ilerleme hesaplama
const stats = db.prepare(`
  SELECT
    COUNT(*) as toplam,
    SUM(CASE WHEN durum = 'tamamlandi' THEN 1 ELSE 0 END) as tamamlanan
  FROM proje_adimlari WHERE proje_id = ?
`).get(projeId);

const ilerleme = stats.toplam > 0 ? Math.round((stats.tamamlanan / stats.toplam) * 100) : 0;
db.prepare('UPDATE projeler SET ilerleme = ? WHERE id = ?').run(ilerleme, projeId);

console.log('Satın Alma Departmanı projesi başarıyla oluşturuldu!');
console.log(`Proje ID: ${projeId}`);
console.log(`Toplam Adım: ${adimlar.length}`);
console.log('Tarayıcıda http://localhost:3000 adresinden görüntüleyebilirsiniz.');

db.close();
