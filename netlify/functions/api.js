const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jfoiewcdgjgpmxhemgrd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmb2lld2NkZ2pncG14aGVtZ3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTY4OTEsImV4cCI6MjA3OTczMjg5MX0.NLhfU29yh4aHsWqlupkDHzxVfP4GXYf8nSMcTv7O7Zs';
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // ==================== DEPARTMANLAR ====================
    if (path === '/departmanlar' && method === 'GET') {
      const { data, error } = await supabase
        .from('departmanlar')
        .select('*, birimler(count)')
        .order('ad');

      if (error) throw error;

      const result = data.map(d => ({
        ...d,
        birim_sayisi: d.birimler?.[0]?.count || 0
      }));

      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (path.match(/^\/departmanlar\/\d+$/) && method === 'GET') {
      const id = path.split('/')[2];
      const { data, error } = await supabase
        .from('departmanlar')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path === '/departmanlar' && method === 'POST') {
      const { ad, aciklama } = body;
      const { data, error } = await supabase
        .from('departmanlar')
        .insert({ ad, aciklama })
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/departmanlar\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const { ad, aciklama } = body;
      const { data, error } = await supabase
        .from('departmanlar')
        .update({ ad, aciklama, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/departmanlar\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2];
      const { error } = await supabase
        .from('departmanlar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ==================== BİRİMLER ====================
    if (path === '/birimler' && method === 'GET') {
      const { data, error } = await supabase
        .from('birimler')
        .select('*, departmanlar(ad), kisiler(count)')
        .order('ad');

      if (error) throw error;

      const result = data.map(b => ({
        ...b,
        departman_adi: b.departmanlar?.ad,
        kisi_sayisi: b.kisiler?.[0]?.count || 0
      }));

      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (path.match(/^\/birimler\/\d+$/) && method === 'GET') {
      const id = path.split('/')[2];
      const { data, error } = await supabase
        .from('birimler')
        .select('*, departmanlar(ad)')
        .eq('id', id)
        .single();

      if (error) throw error;
      data.departman_adi = data.departmanlar?.ad;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path === '/birimler' && method === 'POST') {
      const { ad, departman_id, aciklama } = body;
      const { data, error } = await supabase
        .from('birimler')
        .insert({ ad, departman_id, aciklama })
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/birimler\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const { ad, departman_id, aciklama } = body;
      const { data, error } = await supabase
        .from('birimler')
        .update({ ad, departman_id, aciklama, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/birimler\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2];
      const { error } = await supabase
        .from('birimler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ==================== KİŞİLER ====================
    if (path === '/kisiler' && method === 'GET') {
      const { data, error } = await supabase
        .from('kisiler')
        .select('*, birimler(ad, departmanlar(ad))')
        .order('ad');

      if (error) throw error;

      const result = data.map(k => ({
        ...k,
        birim_adi: k.birimler?.ad,
        departman_adi: k.birimler?.departmanlar?.ad
      }));

      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (path.match(/^\/kisiler\/\d+$/) && method === 'GET') {
      const id = path.split('/')[2];
      const { data, error } = await supabase
        .from('kisiler')
        .select('*, birimler(ad, departmanlar(ad))')
        .eq('id', id)
        .single();

      if (error) throw error;
      data.birim_adi = data.birimler?.ad;
      data.departman_adi = data.birimler?.departmanlar?.ad;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path === '/kisiler' && method === 'POST') {
      const { ad, soyad, email, telefon, birim_id, pozisyon } = body;
      const { data, error } = await supabase
        .from('kisiler')
        .insert({ ad, soyad, email, telefon, birim_id, pozisyon })
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/kisiler\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const { ad, soyad, email, telefon, birim_id, pozisyon } = body;
      const { data, error } = await supabase
        .from('kisiler')
        .update({ ad, soyad, email, telefon, birim_id, pozisyon, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/kisiler\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2];
      const { error } = await supabase
        .from('kisiler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ==================== PROJELER ====================
    if (path === '/projeler' && method === 'GET') {
      const { data, error } = await supabase
        .from('projeler')
        .select(`
          *,
          kisiler(ad, soyad),
          birimler(ad),
          departmanlar(ad),
          proje_adimlari(id, durum)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result = data.map(p => {
        const adimlar = p.proje_adimlari || [];
        return {
          ...p,
          sorumlu_kisi_adi: p.kisiler ? `${p.kisiler.ad} ${p.kisiler.soyad}` : null,
          sorumlu_birim_adi: p.birimler?.ad,
          sorumlu_departman_adi: p.departmanlar?.ad,
          toplam_adim: adimlar.length,
          tamamlanan_adim: adimlar.filter(a => a.durum === 'tamamlandi').length
        };
      });

      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (path.match(/^\/projeler\/\d+$/) && method === 'GET') {
      const id = path.split('/')[2];
      const { data, error } = await supabase
        .from('projeler')
        .select(`
          *,
          kisiler(ad, soyad),
          birimler(ad),
          departmanlar(ad)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      data.sorumlu_kisi_adi = data.kisiler ? `${data.kisiler.ad} ${data.kisiler.soyad}` : null;
      data.sorumlu_birim_adi = data.birimler?.ad;
      data.sorumlu_departman_adi = data.departmanlar?.ad;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path === '/projeler' && method === 'POST') {
      const { ad, aciklama, durum, oncelik, baslangic_tarihi, bitis_tarihi, sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id } = body;
      const { data, error } = await supabase
        .from('projeler')
        .insert({
          ad, aciklama,
          durum: durum || 'beklemede',
          oncelik: oncelik || 'normal',
          baslangic_tarihi, bitis_tarihi,
          sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id
        })
        .select()
        .single();

      if (error) throw error;

      // Log kaydı
      await supabase.from('proje_guncellemeleri').insert({
        proje_id: data.id,
        guncelleme_tipi: 'olusturma',
        aciklama: 'Proje oluşturuldu'
      });

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/projeler\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const { ad, aciklama, durum, oncelik, baslangic_tarihi, bitis_tarihi, sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id, ilerleme } = body;

      // Eski değeri al
      const { data: eskiProje } = await supabase
        .from('projeler')
        .select('durum')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('projeler')
        .update({
          ad, aciklama, durum, oncelik,
          baslangic_tarihi, bitis_tarihi,
          sorumlu_kisi_id, sorumlu_birim_id, sorumlu_departman_id,
          ilerleme: ilerleme || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Durum değişikliği log
      if (eskiProje && eskiProje.durum !== durum) {
        await supabase.from('proje_guncellemeleri').insert({
          proje_id: id,
          guncelleme_tipi: 'durum_degisikligi',
          eski_deger: eskiProje.durum,
          yeni_deger: durum,
          aciklama: 'Proje durumu güncellendi'
        });
      }

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/projeler\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2];
      const { error } = await supabase
        .from('projeler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ==================== PROJE ADIMLARI ====================
    if (path.match(/^\/projeler\/\d+\/adimlar$/) && method === 'GET') {
      const projeId = path.split('/')[2];
      const { data, error } = await supabase
        .from('proje_adimlari')
        .select(`
          *,
          kisiler(ad, soyad),
          birimler(ad)
        `)
        .eq('proje_id', projeId)
        .order('sira')
        .order('id');

      if (error) throw error;

      // Her adım için çoklu atanmış kişi ve birimleri getir
      for (let adim of data) {
        adim.atanan_kisi_adi = adim.kisiler ? `${adim.kisiler.ad} ${adim.kisiler.soyad}` : null;
        adim.atanan_birim_adi = adim.birimler?.ad;

        const { data: atananKisiler } = await supabase
          .from('adim_kisiler')
          .select('*, kisiler(ad, soyad)')
          .eq('adim_id', adim.id);

        adim.atanan_kisiler = (atananKisiler || []).map(ak => ({
          ...ak,
          ad: ak.kisiler?.ad,
          soyad: ak.kisiler?.soyad,
          tam_ad: ak.kisiler ? `${ak.kisiler.ad} ${ak.kisiler.soyad}` : null
        }));

        const { data: atananBirimler } = await supabase
          .from('adim_birimler')
          .select('*, birimler(ad)')
          .eq('adim_id', adim.id);

        adim.atanan_birimler = (atananBirimler || []).map(ab => ({
          ...ab,
          ad: ab.birimler?.ad
        }));
      }

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/projeler\/\d+\/adimlar$/) && method === 'POST') {
      const projeId = path.split('/')[2];
      const { baslik, aciklama, sira, durum, atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, notlar, atanan_kisi_ids, atanan_birim_ids } = body;

      // Sıra numarası
      let yeniSira = sira;
      if (yeniSira === undefined) {
        const { data: maxSiraData } = await supabase
          .from('proje_adimlari')
          .select('sira')
          .eq('proje_id', projeId)
          .order('sira', { ascending: false })
          .limit(1);
        yeniSira = (maxSiraData?.[0]?.sira || 0) + 1;
      }

      const { data, error } = await supabase
        .from('proje_adimlari')
        .insert({
          proje_id: projeId,
          baslik, aciklama,
          sira: yeniSira,
          durum: durum || 'beklemede',
          atanan_kisi_id, atanan_birim_id,
          baslangic_tarihi, bitis_tarihi, notlar
        })
        .select()
        .single();

      if (error) throw error;

      // Çoklu kişi ataması
      if (atanan_kisi_ids?.length > 0) {
        await supabase.from('adim_kisiler').insert(
          atanan_kisi_ids.filter(k => k).map(kisiId => ({ adim_id: data.id, kisi_id: kisiId }))
        );
      }

      // Çoklu birim ataması
      if (atanan_birim_ids?.length > 0) {
        await supabase.from('adim_birimler').insert(
          atanan_birim_ids.filter(b => b).map(birimId => ({ adim_id: data.id, birim_id: birimId }))
        );
      }

      // Proje ilerleme güncelle
      await updateProjeIlerleme(projeId);

      // Log
      await supabase.from('proje_guncellemeleri').insert({
        proje_id: projeId,
        adim_id: data.id,
        guncelleme_tipi: 'adim_ekleme',
        aciklama: `"${baslik}" adımı eklendi`
      });

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/adimlar\/\d+$/) && method === 'PUT') {
      const adimId = path.split('/')[2];
      const { baslik, aciklama, sira, durum, atanan_kisi_id, atanan_birim_id, baslangic_tarihi, bitis_tarihi, notlar, atanan_kisi_ids, atanan_birim_ids } = body;

      // Eski değeri al
      const { data: eskiAdim } = await supabase
        .from('proje_adimlari')
        .select('*')
        .eq('id', adimId)
        .single();

      let tamamlanmaTarihi = eskiAdim?.tamamlanma_tarihi;
      if (durum === 'tamamlandi' && eskiAdim?.durum !== 'tamamlandi') {
        tamamlanmaTarihi = new Date().toISOString().split('T')[0];
      } else if (durum !== 'tamamlandi') {
        tamamlanmaTarihi = null;
      }

      const { data, error } = await supabase
        .from('proje_adimlari')
        .update({
          baslik, aciklama, sira, durum,
          atanan_kisi_id, atanan_birim_id,
          baslangic_tarihi, bitis_tarihi,
          tamamlanma_tarihi: tamamlanmaTarihi,
          notlar,
          updated_at: new Date().toISOString()
        })
        .eq('id', adimId)
        .select()
        .single();

      if (error) throw error;

      // Çoklu kişi ataması güncelle
      if (atanan_kisi_ids !== undefined) {
        await supabase.from('adim_kisiler').delete().eq('adim_id', adimId);
        if (atanan_kisi_ids?.length > 0) {
          await supabase.from('adim_kisiler').insert(
            atanan_kisi_ids.filter(k => k).map(kisiId => ({ adim_id: adimId, kisi_id: kisiId }))
          );
        }
      }

      // Çoklu birim ataması güncelle
      if (atanan_birim_ids !== undefined) {
        await supabase.from('adim_birimler').delete().eq('adim_id', adimId);
        if (atanan_birim_ids?.length > 0) {
          await supabase.from('adim_birimler').insert(
            atanan_birim_ids.filter(b => b).map(birimId => ({ adim_id: adimId, birim_id: birimId }))
          );
        }
      }

      // Proje ilerleme güncelle
      if (eskiAdim) {
        await updateProjeIlerleme(eskiAdim.proje_id);

        // Durum değişikliği log
        if (eskiAdim.durum !== durum) {
          await supabase.from('proje_guncellemeleri').insert({
            proje_id: eskiAdim.proje_id,
            adim_id: adimId,
            guncelleme_tipi: 'adim_durum_degisikligi',
            eski_deger: eskiAdim.durum,
            yeni_deger: durum,
            aciklama: `"${baslik}" adımının durumu güncellendi`
          });
        }
      }

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/adimlar\/\d+$/) && method === 'DELETE') {
      const adimId = path.split('/')[2];

      const { data: adim } = await supabase
        .from('proje_adimlari')
        .select('*')
        .eq('id', adimId)
        .single();

      const { error } = await supabase
        .from('proje_adimlari')
        .delete()
        .eq('id', adimId);

      if (error) throw error;

      if (adim) {
        await updateProjeIlerleme(adim.proje_id);
        await supabase.from('proje_guncellemeleri').insert({
          proje_id: adim.proje_id,
          guncelleme_tipi: 'adim_silme',
          aciklama: `"${adim.baslik}" adımı silindi`
        });
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ==================== PROJE GÜNCELLEMELERİ ====================
    if (path.match(/^\/projeler\/\d+\/guncellemeler$/) && method === 'GET') {
      const projeId = path.split('/')[2];
      const { data, error } = await supabase
        .from('proje_guncellemeleri')
        .select('*, proje_adimlari(baslik)')
        .eq('proje_id', projeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const result = data.map(g => ({
        ...g,
        adim_baslik: g.proje_adimlari?.baslik
      }));

      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // ==================== DASHBOARD ====================
    if (path === '/dashboard' && method === 'GET') {
      const [
        { count: toplam_proje },
        { count: aktif_proje },
        { count: tamamlanan_proje },
        { count: bekleyen_proje },
        { count: toplam_kisi },
        { count: toplam_birim },
        { count: toplam_departman },
        { data: son_projeler },
        { data: son_guncellemeler }
      ] = await Promise.all([
        supabase.from('projeler').select('*', { count: 'exact', head: true }),
        supabase.from('projeler').select('*', { count: 'exact', head: true }).eq('durum', 'devam_ediyor'),
        supabase.from('projeler').select('*', { count: 'exact', head: true }).eq('durum', 'tamamlandi'),
        supabase.from('projeler').select('*', { count: 'exact', head: true }).eq('durum', 'beklemede'),
        supabase.from('kisiler').select('*', { count: 'exact', head: true }),
        supabase.from('birimler').select('*', { count: 'exact', head: true }),
        supabase.from('departmanlar').select('*', { count: 'exact', head: true }),
        supabase.from('projeler').select('id, ad, durum, ilerleme').order('updated_at', { ascending: false }).limit(5),
        supabase.from('proje_guncellemeleri').select('*, projeler(ad)').order('created_at', { ascending: false }).limit(10)
      ]);

      const stats = {
        toplam_proje,
        aktif_proje,
        tamamlanan_proje,
        bekleyen_proje,
        toplam_kisi,
        toplam_birim,
        toplam_departman,
        son_projeler: son_projeler || [],
        son_guncellemeler: (son_guncellemeler || []).map(g => ({
          ...g,
          proje_adi: g.projeler?.ad
        }))
      };

      return { statusCode: 200, headers, body: JSON.stringify(stats) };
    }

    // ==================== AUTHENTICATION ====================
    if (path === '/auth/login' && method === 'POST') {
      const { kullanici_adi, sifre } = body;

      const { data: user, error } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('kullanici_adi', kullanici_adi)
        .eq('sifre_hash', sifre)
        .eq('aktif', true)
        .single();

      if (error || !user) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Gecersiz kullanici adi veya sifre' }) };
      }

      // Son giriş tarihini güncelle
      await supabase
        .from('kullanicilar')
        .update({ son_giris: new Date().toISOString() })
        .eq('id', user.id);

      // Şifreyi döndürme
      delete user.sifre_hash;

      return { statusCode: 200, headers, body: JSON.stringify(user) };
    }

    // ==================== KULLANICI YÖNETİMİ (Admin Panel) ====================
    if (path === '/kullanicilar' && method === 'GET') {
      const { data, error } = await supabase
        .from('kullanicilar')
        .select('id, kullanici_adi, ad, soyad, email, rol, aktif, son_giris, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/kullanicilar\/\d+$/) && method === 'GET') {
      const id = path.split('/')[2];
      const { data, error } = await supabase
        .from('kullanicilar')
        .select('id, kullanici_adi, ad, soyad, email, rol, aktif, son_giris, created_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path === '/kullanicilar' && method === 'POST') {
      const { kullanici_adi, sifre, ad, soyad, email, rol } = body;

      // Kullanıcı adı kontrolü
      const { data: existing } = await supabase
        .from('kullanicilar')
        .select('id')
        .eq('kullanici_adi', kullanici_adi)
        .single();

      if (existing) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bu kullanici adi zaten kullaniliyor' }) };
      }

      const { data, error } = await supabase
        .from('kullanicilar')
        .insert({
          kullanici_adi,
          sifre_hash: sifre,
          ad,
          soyad,
          email,
          rol: rol || 'user'
        })
        .select('id, kullanici_adi, ad, soyad, email, rol, aktif, created_at')
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/kullanicilar\/\d+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const { kullanici_adi, sifre, ad, soyad, email, rol, aktif } = body;

      // Kullanıcı adı değişiyorsa kontrol et
      if (kullanici_adi) {
        const { data: existing } = await supabase
          .from('kullanicilar')
          .select('id')
          .eq('kullanici_adi', kullanici_adi)
          .neq('id', id)
          .single();

        if (existing) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bu kullanici adi zaten kullaniliyor' }) };
        }
      }

      const updateData = {
        ad,
        soyad,
        email,
        rol,
        aktif,
        updated_at: new Date().toISOString()
      };

      if (kullanici_adi) updateData.kullanici_adi = kullanici_adi;
      if (sifre) updateData.sifre_hash = sifre;

      const { data, error } = await supabase
        .from('kullanicilar')
        .update(updateData)
        .eq('id', id)
        .select('id, kullanici_adi, ad, soyad, email, rol, aktif, created_at')
        .single();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path.match(/^\/kullanicilar\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2];

      // Admin kullanıcısını silmeyi engelle
      const { data: user } = await supabase
        .from('kullanicilar')
        .select('rol')
        .eq('id', id)
        .single();

      if (user && user.rol === 'admin') {
        // Admin sayısını kontrol et
        const { count } = await supabase
          .from('kullanicilar')
          .select('*', { count: 'exact', head: true })
          .eq('rol', 'admin');

        if (count <= 1) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Son admin kullanici silinemez' }) };
        }
      }

      const { error } = await supabase
        .from('kullanicilar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // 404
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint bulunamadı' }) };

  } catch (error) {
    console.error('API Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};

// Proje ilerleme hesaplama
async function updateProjeIlerleme(projeId) {
  const { data: adimlar } = await supabase
    .from('proje_adimlari')
    .select('durum')
    .eq('proje_id', projeId);

  if (!adimlar) return 0;

  const toplam = adimlar.length;
  const tamamlanan = adimlar.filter(a => a.durum === 'tamamlandi').length;
  const devam_eden = adimlar.filter(a => a.durum === 'devam_ediyor').length;

  let ilerleme = 0;
  if (toplam > 0) {
    ilerleme = Math.round((tamamlanan * 100 + devam_eden * 50) / toplam);
  }

  // Proje durumunu güncelle
  const { data: mevcutProje } = await supabase
    .from('projeler')
    .select('durum')
    .eq('id', projeId)
    .single();

  if (mevcutProje && mevcutProje.durum !== 'iptal') {
    let yeniDurum = mevcutProje.durum;

    if (toplam > 0 && tamamlanan === toplam) {
      yeniDurum = 'tamamlandi';
    } else if (devam_eden > 0 || tamamlanan > 0) {
      yeniDurum = 'devam_ediyor';
    } else if (toplam > 0) {
      yeniDurum = 'beklemede';
    }

    if (yeniDurum !== mevcutProje.durum) {
      await supabase
        .from('projeler')
        .update({ ilerleme, durum: yeniDurum, updated_at: new Date().toISOString() })
        .eq('id', projeId);

      await supabase.from('proje_guncellemeleri').insert({
        proje_id: projeId,
        guncelleme_tipi: 'durum_degisikligi',
        eski_deger: mevcutProje.durum,
        yeni_deger: yeniDurum,
        aciklama: 'Proje durumu otomatik güncellendi'
      });
    } else {
      await supabase
        .from('projeler')
        .update({ ilerleme, updated_at: new Date().toISOString() })
        .eq('id', projeId);
    }
  }

  return ilerleme;
}
