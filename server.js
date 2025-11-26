const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DEPARTMANLAR ====================
app.get('/api/departmanlar', (req, res) => {
  try {
    const departmanlar = db.prepare(`
      SELECT d.*,
        (SELECT COUNT(*) FROM birimler WHERE departman_id = d.id) as birim_sayisi
      FROM departmanlar d ORDER BY d.ad
    `).all();
    res.json(departmanlar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/departmanlar/:id', (req, res) => {
  try {
    const departman = db.prepare('SELECT * FROM departmanlar WHERE id = ?').get(req.params.id);
    if (!departman) return res.status(404).json({ error: 'Departman bulunamadı' });
    res.json(departman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/departmanlar', (req, res) => {
  try {
    const { ad, aciklama } = req.body;
    const result = db.prepare('INSERT INTO departmanlar (ad, aciklama) VALUES (?, ?)').run(ad, aciklama);
    res.json({ id: result.lastInsertRowid, ad, aciklama });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/departmanlar/:id', (req, res) => {
  try {
    const { ad, aciklama } = req.body;
    db.prepare('UPDATE departmanlar SET ad = ?, aciklama = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ad, aciklama, req.params.id);
    res.json({ id: req.params.id, ad, aciklama });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/departmanlar/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM departmanlar WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BİRİMLER ====================
app.get('/api/birimler', (req, res) => {
  try {
    const birimler = db.prepare(`
      SELECT b.*, d.ad as departman_adi,
        (SELECT COUNT(*) FROM kisiler WHERE birim_id = b.id) as kisi_sayisi
      FROM birimler b
      LEFT JOIN departmanlar d ON b.departman_id = d.id
      ORDER BY b.ad
    `).all();
    res.json(birimler);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/birimler/:id', (req, res) => {
  try {
    const birim = db.prepare(`
      SELECT b.*, d.ad as departman_adi
      FROM birimler b
      LEFT JOIN departmanlar d ON b.departman_id = d.id
      WHERE b.id = ?
    `).get(req.params.id);
    if (!birim) return res.status(404).json({ error: 'Birim bulunamadı' });
    res.json(birim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/birimler', (req, res) => {
  try {
    const { ad, departman_id, aciklama } = req.body;
    const result = db.prepare('INSERT INTO birimler (ad, departman_id, aciklama) VALUES (?, ?, ?)').run(ad, departman_id, aciklama);
    res.json({ id: result.lastInsertRowid, ad, departman_id, aciklama });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/birimler/:id', (req, res) => {
  try {
    const { ad, departman_id, aciklama } = req.body;
    db.prepare('UPDATE birimler SET ad = ?, departman_id = ?, aciklama = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ad, departman_id, aciklama, req.params.id);
    res.json({ id: req.params.id, ad, departman_id, aciklama });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/birimler/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM birimler WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== KİŞİLER ====================
app.get('/api/kisiler', (req, res) => {
  try {
    const kisiler = db.prepare(`
      SELECT k.*, b.ad as birim_adi, d.ad as departman_adi
      FROM kisiler k
      LEFT JOIN birimler b ON k.birim_id = b.id
      LEFT JOIN departmanlar d ON b.departman_id = d.id
      ORDER BY k.ad, k.soyad
    `).all();
    res.json(kisiler);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/kisiler/:id', (req, res) => {
  try {
    const kisi = db.prepare(`
      SELECT k.*, b.ad as birim_adi, d.ad as departman_adi
      FROM kisiler k
      LEFT JOIN birimler b ON k.birim_id = b.id
      LEFT JOIN departmanlar d ON b.departman_id = d.id
      WHERE k.id = ?
    `).get(req.params.id);
    if (!kisi) return res.status(404).json({ error: 'Kişi bulunamadı' });
    res.json(kisi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/kisiler', (req, res) => {
  try {
    const { ad, soyad, email, telefon, birim_id, pozisyon } = req.body;
    const result = db.prepare('INSERT INTO kisiler (ad, soyad, email, telefon, birim_id, pozisyon) VALUES (?, ?, ?, ?, ?, ?)').run(ad, soyad, email, telefon, birim_id, pozisyon);
    res.json({ id: result.lastInsertRowid, ad, soyad, email, telefon, birim_id, pozisyon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/kisiler/:id', (req, res) => {
  try {
    const { ad, soyad, email, telefon, birim_id, pozisyon } = req.body;
    db.prepare('UPDATE kisiler SET ad = ?, soyad = ?, email = ?, telefon = ?, birim_id = ?, pozisyon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ad, soyad, email, telefon, birim_id, pozisyon, req.params.id);
    res.json({ id: req.params.id, ad, soyad, email, telefon, birim_id, pozisyon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/kisiler/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM kisiler WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJELER ====================
app.get('/api/projeler', (req, res) => {
  try {
    const projeler = db.prepare(`
      SELECT p.*,
        k.ad || ' ' || k.soyad as sorumlu_kisi_adi,
        b.ad as sorumlu_birim_adi,
        d.ad as sorumlu_departman_adi,
        (SELECT COUNT(*) FROM proje_adimlari WHERE proje_id = p.id) as toplam_adim,
        (SELECT COUNT(*) FROM proje_adimlari WHERE proje_id = p.id AND durum = 'tamamlandi') as tamamlanan_adim
      FROM projeler p
      LEFT JOIN kisiler k ON p.sorumlu_kisi_id = k.id
      LEFT JOIN birimler b ON p.sorumlu_birim_id = b.id
      LEFT JOIN departmanlar d ON p.sorumlu_departman_id = d.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(projeler);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projeler/:id', (req, res) => {
  try {
    const proje = db.prepare(`
      SELECT p.*,
        k.ad || ' ' || k.soyad as sorumlu_kisi_adi,
        b.ad as sorumlu_birim_adi,
        d.ad as sorumlu_departman_adi
      FROM projeler p
      LEFT JOIN kisiler k ON p.sorumlu_kisi_id = k.id
      LEFT JOIN birimler b ON p.sorumlu_birim_id = b.id
      LEFT JOIN departmanlar d ON p.sorumlu_departman_id = d.id
      WHERE p.id = ?
    `).get(req.params.id);
    if (!proje) return res.status(404).json({ error: 'Proje bulunamadı' });
    res.json(proje);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projeler', (req, res) => {
  try {
    const { ad, aciklama, durum, oncelik, baslangic_tarihi, bitis_tarihi, sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id } = req.body;
    const result = db.prepare(`
      INSERT INTO projeler (ad, aciklama, durum, oncelik, baslangic_tarihi, bitis_tarihi, sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ad, aciklama, durum || 'beklemede', oncelik || 'normal', baslangic_tarihi, bitis_tarihi, sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id);

    // Log kaydı
    db.prepare('INSERT INTO proje_guncellemeleri (proje_id, guncelleme_tipi, aciklama) VALUES (?, ?, ?)').run(result.lastInsertRowid, 'olusturma', 'Proje oluşturuldu');

    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projeler/:id', (req, res) => {
  try {
    const { ad, aciklama, durum, oncelik, baslangic_tarihi, bitis_tarihi, sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id, ilerleme } = req.body;

    // Eski değeri al
    const eskiProje = db.prepare('SELECT * FROM projeler WHERE id = ?').get(req.params.id);

    db.prepare(`
      UPDATE projeler SET
        ad = ?, aciklama = ?, durum = ?, oncelik = ?,
        baslangic_tarihi = ?, bitis_tarihi = ?,
        sorumlu_kisi_id = ?, sorumlu_birim_id = ?, sorumlu_departman_id = ?,
        ilerleme = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(ad, aciklama, durum, oncelik, baslangic_tarihi, bitis_tarihi, sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id, ilerleme || 0, req.params.id);

    // Durum değişikliği log
    if (eskiProje && eskiProje.durum !== durum) {
      db.prepare('INSERT INTO proje_guncellemeleri (proje_id, guncelleme_tipi, eski_deger, yeni_deger, aciklama) VALUES (?, ?, ?, ?, ?)').run(req.params.id, 'durum_degisikligi', eskiProje.durum, durum, 'Proje durumu güncellendi');
    }

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projeler/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM projeler WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJE ADIMLARI ====================
app.get('/api/projeler/:projeId/adimlar', (req, res) => {
  try {
    const adimlar = db.prepare(`
      SELECT pa.*,
        k.ad || ' ' || k.soyad as atanan_kisi_adi,
        b.ad as atanan_birim_adi
      FROM proje_adimlari pa
      LEFT JOIN kisiler k ON pa.atanan_kisi_id = k.id
      LEFT JOIN birimler b ON pa.atanan_birim_id = b.id
      WHERE pa.proje_id = ?
      ORDER BY pa.sira, pa.id
    `).all(req.params.projeId);

    // Her adım için çoklu atanmış kişi ve birimleri getir
    adimlar.forEach(adim => {
      // Atanmış kişiler
      adim.atanan_kisiler = db.prepare(`
        SELECT ak.*, k.ad, k.soyad, k.ad || ' ' || k.soyad as tam_ad
        FROM adim_kisiler ak
        JOIN kisiler k ON ak.kisi_id = k.id
        WHERE ak.adim_id = ?
      `).all(adim.id);

      // Atanmış birimler
      adim.atanan_birimler = db.prepare(`
        SELECT ab.*, b.ad
        FROM adim_birimler ab
        JOIN birimler b ON ab.birim_id = b.id
        WHERE ab.adim_id = ?
      `).all(adim.id);
    });

    res.json(adimlar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projeler/:projeId/adimlar', (req, res) => {
  try {
    const { baslik, aciklama, sira, durum, atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, notlar, atanan_kisi_ids, atanan_birim_ids } = req.body;
    const projeId = req.params.projeId;

    // Sıra numarası belirtilmemişse en son sıraya ekle
    let yeniSira = sira;
    if (yeniSira === undefined) {
      const maxSira = db.prepare('SELECT MAX(sira) as max FROM proje_adimlari WHERE proje_id = ?').get(projeId);
      yeniSira = (maxSira.max || 0) + 1;
    }

    const result = db.prepare(`
      INSERT INTO proje_adimlari (proje_id, baslik, aciklama, sira, durum, atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, notlar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(projeId, baslik, aciklama, yeniSira, durum || 'beklemede', atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, notlar);

    const adimId = result.lastInsertRowid;

    // Çoklu kişi ataması
    if (atanan_kisi_ids && atanan_kisi_ids.length > 0) {
      const insertKisi = db.prepare('INSERT OR IGNORE INTO adim_kisiler (adim_id, kisi_id) VALUES (?, ?)');
      atanan_kisi_ids.forEach(kisiId => {
        if (kisiId) insertKisi.run(adimId, kisiId);
      });
    }

    // Çoklu birim ataması
    if (atanan_birim_ids && atanan_birim_ids.length > 0) {
      const insertBirim = db.prepare('INSERT OR IGNORE INTO adim_birimler (adim_id, birim_id) VALUES (?, ?)');
      atanan_birim_ids.forEach(birimId => {
        if (birimId) insertBirim.run(adimId, birimId);
      });
    }

    // Proje ilerleme güncelle
    updateProjeIlerleme(projeId);

    // Log kaydı
    db.prepare('INSERT INTO proje_guncellemeleri (proje_id, adim_id, guncelleme_tipi, aciklama) VALUES (?, ?, ?, ?)').run(projeId, adimId, 'adim_ekleme', `"${baslik}" adımı eklendi`);

    res.json({ id: adimId, proje_id: projeId, baslik, aciklama, sira: yeniSira, durum: durum || 'beklemede', atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, notlar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/adimlar/:id', (req, res) => {
  try {
    const { baslik, aciklama, sira, durum, atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, notlar, atanan_kisi_ids, atanan_birim_ids } = req.body;
    const adimId = req.params.id;

    // Eski değeri al
    const eskiAdim = db.prepare('SELECT * FROM proje_adimlari WHERE id = ?').get(adimId);

    let tamamlanmaTarihi = eskiAdim.tamamlanma_tarihi;
    if (durum === 'tamamlandi' && eskiAdim.durum !== 'tamamlandi') {
      tamamlanmaTarihi = new Date().toISOString().split('T')[0];
    } else if (durum !== 'tamamlandi') {
      tamamlanmaTarihi = null;
    }

    db.prepare(`
      UPDATE proje_adimlari SET
        baslik = ?, aciklama = ?, sira = ?, durum = ?,
        atanan_kisi_id = ?, atanan_birim_id = ?,
        baslangic_tarihi = ?, bitis_tarihi = ?,
        tamamlanma_tarihi = ?, notlar = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(baslik, aciklama, sira, durum, atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, tamamlanmaTarihi, notlar, adimId);

    // Çoklu kişi ataması güncelle
    if (atanan_kisi_ids !== undefined) {
      // Önce mevcut atamaları sil
      db.prepare('DELETE FROM adim_kisiler WHERE adim_id = ?').run(adimId);
      // Yeni atamaları ekle
      if (atanan_kisi_ids && atanan_kisi_ids.length > 0) {
        const insertKisi = db.prepare('INSERT OR IGNORE INTO adim_kisiler (adim_id, kisi_id) VALUES (?, ?)');
        atanan_kisi_ids.forEach(kisiId => {
          if (kisiId) insertKisi.run(adimId, kisiId);
        });
      }
    }

    // Çoklu birim ataması güncelle
    if (atanan_birim_ids !== undefined) {
      // Önce mevcut atamaları sil
      db.prepare('DELETE FROM adim_birimler WHERE adim_id = ?').run(adimId);
      // Yeni atamaları ekle
      if (atanan_birim_ids && atanan_birim_ids.length > 0) {
        const insertBirim = db.prepare('INSERT OR IGNORE INTO adim_birimler (adim_id, birim_id) VALUES (?, ?)');
        atanan_birim_ids.forEach(birimId => {
          if (birimId) insertBirim.run(adimId, birimId);
        });
      }
    }

    // Proje ilerleme güncelle
    updateProjeIlerleme(eskiAdim.proje_id);

    // Durum değişikliği log
    if (eskiAdim && eskiAdim.durum !== durum) {
      db.prepare('INSERT INTO proje_guncellemeleri (proje_id, adim_id, guncelleme_tipi, eski_deger, yeni_deger, aciklama) VALUES (?, ?, ?, ?, ?, ?)').run(eskiAdim.proje_id, adimId, 'adim_durum_degisikligi', eskiAdim.durum, durum, `"${baslik}" adımının durumu güncellendi`);
    }

    res.json({ id: adimId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/adimlar/:id', (req, res) => {
  try {
    const adim = db.prepare('SELECT * FROM proje_adimlari WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM proje_adimlari WHERE id = ?').run(req.params.id);

    if (adim) {
      updateProjeIlerleme(adim.proje_id);
      db.prepare('INSERT INTO proje_guncellemeleri (proje_id, guncelleme_tipi, aciklama) VALUES (?, ?, ?)').run(adim.proje_id, 'adim_silme', `"${adim.baslik}" adımı silindi`);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJE GÜNCELLEMELERİ ====================
app.get('/api/projeler/:projeId/guncellemeler', (req, res) => {
  try {
    const guncellemeler = db.prepare(`
      SELECT pg.*, pa.baslik as adim_baslik
      FROM proje_guncellemeleri pg
      LEFT JOIN proje_adimlari pa ON pg.adim_id = pa.id
      WHERE pg.proje_id = ?
      ORDER BY pg.created_at DESC
      LIMIT 50
    `).all(req.params.projeId);
    res.json(guncellemeler);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proje ilerleme hesaplama fonksiyonu (optimize edilmiş)
function updateProjeIlerleme(projeId) {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as toplam,
      SUM(CASE WHEN durum = 'tamamlandi' THEN 1 ELSE 0 END) as tamamlanan,
      SUM(CASE WHEN durum = 'devam_ediyor' THEN 1 ELSE 0 END) as devam_eden,
      SUM(CASE WHEN durum = 'beklemede' THEN 1 ELSE 0 END) as bekleyen
    FROM proje_adimlari WHERE proje_id = ?
  `).get(projeId);

  // İlerleme hesaplama: Tamamlanan = 100%, Devam Eden = 50%, Beklemede = 0%
  let ilerleme = 0;
  if (stats.toplam > 0) {
    const tamamlananPuan = stats.tamamlanan * 100;
    const devamEdenPuan = stats.devam_eden * 50;
    ilerleme = Math.round((tamamlananPuan + devamEdenPuan) / stats.toplam);
  }

  // Proje durumunu otomatik güncelle
  let yeniDurum = null;
  const mevcutProje = db.prepare('SELECT durum FROM projeler WHERE id = ?').get(projeId);

  if (mevcutProje && mevcutProje.durum !== 'iptal') {
    if (stats.toplam > 0 && stats.tamamlanan === stats.toplam) {
      // Tüm adımlar tamamlandıysa proje de tamamlandı
      yeniDurum = 'tamamlandi';
    } else if (stats.devam_eden > 0 || stats.tamamlanan > 0) {
      // En az bir adım devam ediyorsa veya tamamlandıysa proje devam ediyor
      yeniDurum = 'devam_ediyor';
    } else if (stats.toplam > 0 && stats.bekleyen === stats.toplam) {
      // Tüm adımlar beklemedeyse proje de beklemede
      yeniDurum = 'beklemede';
    }

    if (yeniDurum && yeniDurum !== mevcutProje.durum) {
      db.prepare('UPDATE projeler SET ilerleme = ?, durum = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ilerleme, yeniDurum, projeId);

      // Durum değişikliği log
      db.prepare('INSERT INTO proje_guncellemeleri (proje_id, guncelleme_tipi, eski_deger, yeni_deger, aciklama) VALUES (?, ?, ?, ?, ?)')
        .run(projeId, 'durum_degisikligi', mevcutProje.durum, yeniDurum, 'Proje durumu otomatik güncellendi');
    } else {
      db.prepare('UPDATE projeler SET ilerleme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ilerleme, projeId);
    }
  } else {
    db.prepare('UPDATE projeler SET ilerleme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ilerleme, projeId);
  }

  return ilerleme;
}

// ==================== DASHBOARD İSTATİSTİKLERİ ====================
app.get('/api/dashboard', (req, res) => {
  try {
    const stats = {
      toplam_proje: db.prepare('SELECT COUNT(*) as count FROM projeler').get().count,
      aktif_proje: db.prepare("SELECT COUNT(*) as count FROM projeler WHERE durum = 'devam_ediyor'").get().count,
      tamamlanan_proje: db.prepare("SELECT COUNT(*) as count FROM projeler WHERE durum = 'tamamlandi'").get().count,
      bekleyen_proje: db.prepare("SELECT COUNT(*) as count FROM projeler WHERE durum = 'beklemede'").get().count,
      toplam_kisi: db.prepare('SELECT COUNT(*) as count FROM kisiler').get().count,
      toplam_birim: db.prepare('SELECT COUNT(*) as count FROM birimler').get().count,
      toplam_departman: db.prepare('SELECT COUNT(*) as count FROM departmanlar').get().count,
      son_projeler: db.prepare('SELECT id, ad, durum, ilerleme FROM projeler ORDER BY updated_at DESC LIMIT 5').all(),
      son_guncellemeler: db.prepare(`
        SELECT pg.*, p.ad as proje_adi
        FROM proje_guncellemeleri pg
        JOIN projeler p ON pg.proje_id = p.id
        ORDER BY pg.created_at DESC LIMIT 10
      `).all()
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proje Takip Uygulaması http://localhost:${PORT} adresinde çalışıyor`);
});
