const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'proje_takip.db'));

// Yeni departmanlar ve birimler ekle
const departmanlar = [
  { ad: 'Kalite', aciklama: 'Kalite kontrol ve güvence süreçleri' },
  { ad: 'Bilgi İşlem', aciklama: 'IT altyapı ve yazılım geliştirme' },
  { ad: 'Satış', aciklama: 'Satış ve müşteri ilişkileri' },
  { ad: 'Pazarlama', aciklama: 'Pazarlama ve marka yönetimi' },
  { ad: 'Muhasebe', aciklama: 'Mali işler ve finansal raporlama' }
];

departmanlar.forEach(dept => {
  // Departman var mı kontrol et
  const existing = db.prepare('SELECT id FROM departmanlar WHERE ad = ?').get(dept.ad);
  if (!existing) {
    const result = db.prepare('INSERT INTO departmanlar (ad, aciklama) VALUES (?, ?)').run(dept.ad, dept.aciklama);
    const deptId = result.lastInsertRowid;

    // Her departman için bir birim oluştur
    db.prepare('INSERT INTO birimler (ad, departman_id, aciklama) VALUES (?, ?, ?)').run(
      `${dept.ad} Birimi`,
      deptId,
      `${dept.ad} departmanı ana birimi`
    );

    console.log(`${dept.ad} departmanı ve birimi eklendi.`);
  } else {
    console.log(`${dept.ad} departmanı zaten mevcut.`);
  }
});

console.log('\nTüm birimler başarıyla eklendi!');
console.log('Tarayıcıda http://localhost:3000 adresinden görüntüleyebilirsiniz.');

db.close();
