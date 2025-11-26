// API Base URL
const API = '';

// Global Data
let departmanlar = [];
let birimler = [];
let kisiler = [];
let projeler = [];
let currentProjeId = null;

// Page Loader Elements
const pageLoader = document.getElementById('pageLoader');
const toastContainer = document.getElementById('toastContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadPage('dashboard');
  setupNavigation();
});

// ==================== LOADER & TOAST ====================
function showLoader(text = 'Yukleniyor...') {
  const loaderText = pageLoader.querySelector('.loader-text');
  if (loaderText) loaderText.textContent = text;
  pageLoader.classList.add('active');
}

function hideLoader() {
  pageLoader.classList.remove('active');
}

function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;

  const icon = type === 'success' ? 'bi-check-circle-fill' :
               type === 'error' ? 'bi-x-circle-fill' : 'bi-info-circle-fill';

  toast.innerHTML = `
    <i class="bi ${icon}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Navigation Setup
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      loadPage(link.dataset.page);
    });
  });
}

// Page Loader with Animation
async function loadPage(page) {
  const content = document.getElementById('page-content');

  // Page exit animation
  content.classList.add('page-exit');
  showLoader(getPageLoadText(page));

  // Wait for exit animation
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    switch(page) {
      case 'dashboard':
        content.innerHTML = await renderDashboard();
        break;
      case 'projeler':
        content.innerHTML = await renderProjeler();
        break;
      case 'kisiler':
        content.innerHTML = await renderKisiler();
        break;
      case 'birimler':
        content.innerHTML = await renderBirimler();
        break;
      case 'departmanlar':
        content.innerHTML = await renderDepartmanlar();
        break;
    }
  } catch (error) {
    showToast('Sayfa yuklenirken hata olustu', 'error');
    console.error(error);
  }

  // Remove exit class and trigger enter animation
  content.classList.remove('page-exit');
  content.style.animation = 'none';
  content.offsetHeight; // Trigger reflow
  content.style.animation = 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

  hideLoader();
}

function getPageLoadText(page) {
  const texts = {
    'dashboard': 'Dashboard yukleniyor...',
    'projeler': 'Projeler yukleniyor...',
    'kisiler': 'Kisiler yukleniyor...',
    'birimler': 'Birimler yukleniyor...',
    'departmanlar': 'Departmanlar yukleniyor...'
  };
  return texts[page] || 'Yukleniyor...';
}

// Skeleton Loading HTML
function getSkeletonCards(count = 4) {
  return Array(count).fill(`
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card">
        <div class="card-body">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 80%"></div>
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== DASHBOARD ====================
async function renderDashboard() {
  const stats = await fetch(`${API}/api/dashboard`).then(r => r.json());

  return `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-grid-1x2 me-2"></i>Dashboard</h2>
      <span class="text-muted">${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>

    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-primary bg-opacity-10 text-primary me-3">
              <i class="bi bi-folder"></i>
            </div>
            <div>
              <div class="stat-number">${stats.toplam_proje}</div>
              <div class="stat-label">Toplam Proje</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-info bg-opacity-10 text-info me-3">
              <i class="bi bi-play-circle"></i>
            </div>
            <div>
              <div class="stat-number">${stats.aktif_proje}</div>
              <div class="stat-label">Devam Eden</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-success bg-opacity-10 text-success me-3">
              <i class="bi bi-check-circle"></i>
            </div>
            <div>
              <div class="stat-number">${stats.tamamlanan_proje}</div>
              <div class="stat-label">Tamamlanan</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-warning bg-opacity-10 text-warning me-3">
              <i class="bi bi-clock"></i>
            </div>
            <div>
              <div class="stat-number">${stats.bekleyen_proje}</div>
              <div class="stat-label">Bekleyen</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-secondary bg-opacity-10 text-secondary me-3">
              <i class="bi bi-people"></i>
            </div>
            <div>
              <div class="stat-number">${stats.toplam_kisi}</div>
              <div class="stat-label">Toplam Kisi</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-secondary bg-opacity-10 text-secondary me-3">
              <i class="bi bi-building"></i>
            </div>
            <div>
              <div class="stat-number">${stats.toplam_birim}</div>
              <div class="stat-label">Toplam Birim</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-secondary bg-opacity-10 text-secondary me-3">
              <i class="bi bi-diagram-3"></i>
            </div>
            <div>
              <div class="stat-number">${stats.toplam_departman}</div>
              <div class="stat-label">Toplam Departman</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="mb-0"><i class="bi bi-folder me-2"></i>Son Projeler</h5>
          </div>
          <div class="card-body">
            ${stats.son_projeler.length === 0 ? `
              <div class="empty-state py-4">
                <i class="bi bi-folder"></i>
                <p>Henuz proje yok</p>
              </div>
            ` : stats.son_projeler.map(p => `
              <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom project-item" style="cursor: pointer;" onclick="navigateToProject(${p.id})">
                <div>
                  <strong>${p.ad}</strong>
                  <div class="progress mt-2" style="width: 150px;">
                    <div class="progress-bar" style="width: ${p.ilerleme}%"></div>
                  </div>
                </div>
                <span class="badge badge-status badge-${p.durum}">${formatDurum(p.durum)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-white">
            <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Son Guncellemeler</h5>
          </div>
          <div class="card-body">
            ${stats.son_guncellemeler.length === 0 ? `
              <div class="empty-state py-4">
                <i class="bi bi-clock-history"></i>
                <p>Henuz guncelleme yok</p>
              </div>
            ` : `
              <div class="timeline">
                ${stats.son_guncellemeler.map(g => `
                  <div class="timeline-item">
                    <div class="small text-muted">${formatDate(g.created_at)}</div>
                    <div><strong>${g.proje_adi}</strong></div>
                    <div class="text-muted small">${g.aciklama || formatGuncellemeTipi(g.guncelleme_tipi)}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Navigate to project from dashboard
async function navigateToProject(id) {
  // Update navigation
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector('[data-page="projeler"]').classList.add('active');

  // Show loader and navigate
  showLoader('Proje detayi yukleniyor...');
  await new Promise(resolve => setTimeout(resolve, 300));
  await openProjeDetay(id);
  hideLoader();
}

// ==================== PROJELER ====================
async function renderProjeler() {
  projeler = await fetch(`${API}/api/projeler`).then(r => r.json());

  return `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-folder me-2"></i>Projeler</h2>
      <button class="btn btn-primary" onclick="openProjeModal()">
        <i class="bi bi-plus-lg"></i> Yeni Proje
      </button>
    </div>

    ${projeler.length === 0 ? `
      <div class="card">
        <div class="card-body empty-state">
          <i class="bi bi-folder"></i>
          <h5>Henuz proje yok</h5>
          <p class="text-muted">Yeni bir proje olusturarak baslayabilirsiniz</p>
          <button class="btn btn-primary" onclick="openProjeModal()">
            <i class="bi bi-plus-lg"></i> Ilk Projeyi Olustur
          </button>
        </div>
      </div>
    ` : `
      <div class="row">
        ${projeler.map((p, index) => `
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="card priority-${p.oncelik}" style="cursor: pointer; animation-delay: ${index * 0.1}s" onclick="openProjeDetay(${p.id})">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="card-title mb-0">${p.ad}</h5>
                  <span class="badge badge-status badge-${p.durum}">${formatDurum(p.durum)}</span>
                </div>
                <p class="card-text text-muted small">${p.aciklama || 'Aciklama yok'}</p>
                <div class="progress-container mb-2">
                  <div class="progress">
                    <div class="progress-bar ${getProgressBarClass(p.ilerleme)}" style="width: ${p.ilerleme}%"></div>
                  </div>
                  <div class="progress-label">
                    <span class="progress-percent">${p.ilerleme}%</span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted">
                    <i class="bi bi-check-circle text-success"></i> ${p.tamamlanan_adim}
                    <span class="mx-1">|</span>
                    <i class="bi bi-list-task"></i> ${p.toplam_adim} adim
                  </span>
                  ${p.bitis_tarihi ? `
                    <span class="text-muted ${isOverdue(p.bitis_tarihi, p.durum) ? 'text-danger' : ''}">
                      <i class="bi bi-calendar"></i> ${formatShortDate(p.bitis_tarihi)}
                    </span>
                  ` : ''}
                </div>
                ${p.sorumlu_kisi_adi || p.sorumlu_birim_adi ? `
                  <div class="mt-2 small">
                    <i class="bi bi-person text-muted"></i>
                    ${p.sorumlu_kisi_adi || p.sorumlu_birim_adi || ''}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

async function openProjeDetay(id) {
  currentProjeId = id;
  showLoader('Proje detayi yukleniyor...');

  try {
    const [proje, adimlar, guncellemeler] = await Promise.all([
      fetch(`${API}/api/projeler/${id}`).then(r => r.json()),
      fetch(`${API}/api/projeler/${id}/adimlar`).then(r => r.json()),
      fetch(`${API}/api/projeler/${id}/guncellemeler`).then(r => r.json())
    ]);

    const content = document.getElementById('page-content');
    content.style.animation = 'none';
    content.offsetHeight;
    content.style.animation = 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    // Liste gorunumu icerigi
    const listViewContent = adimlar.length === 0 ? `
      <div class="empty-state py-4">
        <i class="bi bi-list-check"></i>
        <p>Henuz adim yok</p>
        <button class="btn btn-primary btn-sm" onclick="openAdimModal()">
          <i class="bi bi-plus-lg"></i> Ilk Adimi Ekle
        </button>
      </div>
    ` : adimlar.map((a, index) => `
      <div class="step-item ${a.durum === 'tamamlandi' ? 'completed' : a.durum === 'devam_ediyor' ? 'in-progress' : ''}" style="animation-delay: ${index * 0.1}s">
        <div class="d-flex justify-content-between align-items-start">
          <div class="d-flex align-items-start">
            <div class="me-3">
              ${a.durum === 'tamamlandi' ?
                '<i class="bi bi-check-circle-fill text-success fs-5"></i>' :
                a.durum === 'devam_ediyor' ?
                '<i class="bi bi-play-circle-fill text-primary fs-5"></i>' :
                '<i class="bi bi-circle text-muted fs-5"></i>'
              }
            </div>
            <div>
              <strong>${index + 1}. ${a.baslik}</strong>
              ${a.aciklama ? `<p class="text-muted small mb-1">${a.aciklama}</p>` : ''}
              <div class="small mt-1">
                ${a.atanan_kisiler && a.atanan_kisiler.length > 0 ? `
                  <div class="assigned-badges mb-1">
                    ${a.atanan_kisiler.map(k => `
                      <span class="assigned-badge kisi">
                        <i class="bi bi-person"></i> ${k.tam_ad || k.ad}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
                ${a.atanan_birimler && a.atanan_birimler.length > 0 ? `
                  <div class="assigned-badges mb-1">
                    ${a.atanan_birimler.map(b => `
                      <span class="assigned-badge birim">
                        <i class="bi bi-building"></i> ${b.ad}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
                ${a.bitis_tarihi ? `<span class="text-muted"><i class="bi bi-calendar"></i> ${a.bitis_tarihi}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary" onclick="openAdimModal(${a.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteAdim(${a.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Gantt gorunumu icerigi
    const ganttViewContent = renderGanttChart(proje, adimlar);

    // Adım istatistiklerini hesapla
    const adimStats = calculateAdimStats(adimlar);

    content.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button class="btn btn-outline-secondary me-2" onclick="loadPage('projeler')">
            <i class="bi bi-arrow-left"></i> Geri
          </button>
          <span class="badge badge-status badge-${proje.durum} ms-2">${formatDurum(proje.durum)}</span>
        </div>
        <div>
          <button class="btn btn-outline-primary me-2" onclick="openProjeModal(${id})">
            <i class="bi bi-pencil"></i> Duzenle
          </button>
          <button class="btn btn-outline-danger" onclick="deleteProje(${id})">
            <i class="bi bi-trash"></i> Sil
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="mb-1">${proje.ad}</h3>
              <p class="text-muted mb-0">${proje.aciklama || 'Aciklama yok'}</p>
            </div>
            <div class="text-end">
              <div class="progress-circle" style="--progress: ${proje.ilerleme}" data-progress="${proje.ilerleme}">
                <span class="progress-circle-value">${proje.ilerleme}%</span>
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-3">
              <div class="info-box">
                <span class="info-label">Oncelik</span>
                <span class="badge bg-${getPriorityColor(proje.oncelik)}">${formatOncelik(proje.oncelik)}</span>
              </div>
            </div>
            <div class="col-md-3">
              <div class="info-box">
                <span class="info-label">Baslangic</span>
                <span class="info-value">${proje.baslangic_tarihi || '-'}</span>
              </div>
            </div>
            <div class="col-md-3">
              <div class="info-box">
                <span class="info-label">Bitis</span>
                <span class="info-value ${isOverdue(proje.bitis_tarihi, proje.durum) ? 'text-danger fw-bold' : ''}">${proje.bitis_tarihi || '-'}</span>
              </div>
            </div>
            <div class="col-md-3">
              <div class="info-box">
                <span class="info-label">Sorumlu</span>
                <span class="info-value">${proje.sorumlu_kisi_adi || proje.sorumlu_birim_adi || proje.sorumlu_departman_adi || '-'}</span>
              </div>
            </div>
          </div>

          <div class="progress-stats mb-2">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-medium">Ilerleme Durumu</span>
              <span class="text-muted small">
                <span class="badge bg-success me-1">${adimStats.tamamlanan}</span> Tamamlanan
                <span class="badge bg-primary mx-1">${adimStats.devamEden}</span> Devam Eden
                <span class="badge bg-warning mx-1">${adimStats.bekleyen}</span> Bekleyen
              </span>
            </div>
            <div class="progress" style="height: 12px;">
              <div class="progress-bar bg-success" style="width: ${adimStats.toplam > 0 ? (adimStats.tamamlanan / adimStats.toplam * 100) : 0}%" title="Tamamlanan: ${adimStats.tamamlanan}"></div>
              <div class="progress-bar bg-primary" style="width: ${adimStats.toplam > 0 ? (adimStats.devamEden / adimStats.toplam * 100) : 0}%" title="Devam Eden: ${adimStats.devamEden}"></div>
              <div class="progress-bar bg-warning" style="width: ${adimStats.toplam > 0 ? (adimStats.bekleyen / adimStats.toplam * 100) : 0}%" title="Bekleyen: ${adimStats.bekleyen}"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="${currentGanttView === 'gantt' ? 'col-12' : 'col-md-8'}">
          <div class="card">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <h5 class="mb-0 me-3">
                  <i class="bi ${currentGanttView === 'gantt' ? 'bi-bar-chart-steps' : 'bi-list-check'} me-2"></i>
                  Proje Adimlari
                </h5>
                <div class="btn-group btn-group-sm view-toggle" role="group">
                  <button type="button" class="btn ${currentGanttView === 'list' ? 'btn-primary' : 'btn-outline-primary'}" onclick="switchProjeView('list')">
                    <i class="bi bi-list-ul"></i> Liste
                  </button>
                  <button type="button" class="btn ${currentGanttView === 'gantt' ? 'btn-primary' : 'btn-outline-primary'}" onclick="switchProjeView('gantt')">
                    <i class="bi bi-bar-chart-steps"></i> Gantt
                  </button>
                </div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="openAdimModal()">
                <i class="bi bi-plus-lg"></i> Adim Ekle
              </button>
            </div>
            <div class="card-body ${currentGanttView === 'gantt' ? 'p-0' : ''}">
              ${currentGanttView === 'gantt' ? ganttViewContent : listViewContent}
            </div>
          </div>
        </div>

        ${currentGanttView === 'list' ? `
        <div class="col-md-4">
          <div class="card">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Gecmis</h5>
            </div>
            <div class="card-body">
              ${guncellemeler.length === 0 ? `
                <div class="text-muted text-center py-3">
                  Henuz guncelleme yok
                </div>
              ` : `
                <div class="timeline">
                  ${guncellemeler.map(g => `
                    <div class="timeline-item">
                      <div class="small text-muted">${formatDate(g.created_at)}</div>
                      <div class="small">${g.aciklama || formatGuncellemeTipi(g.guncelleme_tipi)}</div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    showToast('Proje yuklenirken hata olustu', 'error');
    console.error(error);
  }

  hideLoader();
}

async function openProjeModal(id = null) {
  showLoader('Form hazirlaniyor...');
  await loadSelectData();

  // Populate select boxes
  document.getElementById('proje_departman').innerHTML = '<option value="">Secin...</option>' +
    departmanlar.map(d => `<option value="${d.id}">${d.ad}</option>`).join('');
  document.getElementById('proje_birim').innerHTML = '<option value="">Secin...</option>' +
    birimler.map(b => `<option value="${b.id}">${b.ad}</option>`).join('');
  document.getElementById('proje_kisi').innerHTML = '<option value="">Secin...</option>' +
    kisiler.map(k => `<option value="${k.id}">${k.ad} ${k.soyad}</option>`).join('');

  if (id) {
    const proje = await fetch(`${API}/api/projeler/${id}`).then(r => r.json());
    document.getElementById('projeModalTitle').textContent = 'Proje Duzenle';
    document.getElementById('proje_id').value = proje.id;
    document.getElementById('proje_ad').value = proje.ad;
    document.getElementById('proje_aciklama').value = proje.aciklama || '';
    document.getElementById('proje_oncelik').value = proje.oncelik;
    document.getElementById('proje_durum').value = proje.durum;
    document.getElementById('proje_baslangic').value = proje.baslangic_tarihi || '';
    document.getElementById('proje_bitis').value = proje.bitis_tarihi || '';
    document.getElementById('proje_departman').value = proje.sorumlu_departman_id || '';
    document.getElementById('proje_birim').value = proje.sorumlu_birim_id || '';
    document.getElementById('proje_kisi').value = proje.sorumlu_kisi_id || '';
  } else {
    document.getElementById('projeModalTitle').textContent = 'Yeni Proje';
    document.getElementById('projeForm').reset();
    document.getElementById('proje_id').value = '';
  }

  hideLoader();
  new bootstrap.Modal(document.getElementById('projeModal')).show();
}

async function saveProje() {
  const id = document.getElementById('proje_id').value;
  const data = {
    ad: document.getElementById('proje_ad').value,
    aciklama: document.getElementById('proje_aciklama').value,
    oncelik: document.getElementById('proje_oncelik').value,
    durum: document.getElementById('proje_durum').value,
    baslangic_tarihi: document.getElementById('proje_baslangic').value || null,
    bitis_tarihi: document.getElementById('proje_bitis').value || null,
    sorumlu_departman_id: document.getElementById('proje_departman').value || null,
    sorumlu_birim_id: document.getElementById('proje_birim').value || null,
    sorumlu_kisi_id: document.getElementById('proje_kisi').value || null
  };

  showLoader('Kaydediliyor...');

  const url = id ? `${API}/api/projeler/${id}` : `${API}/api/projeler`;
  const method = id ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    bootstrap.Modal.getInstance(document.getElementById('projeModal')).hide();
    showToast(id ? 'Proje guncellendi' : 'Proje olusturuldu', 'success');
    await loadPage('projeler');
  } catch (error) {
    showToast('Kaydetme hatasi', 'error');
    hideLoader();
  }
}

async function deleteProje(id) {
  if (!confirm('Bu projeyi silmek istediginizden emin misiniz?')) return;

  showLoader('Siliniyor...');

  try {
    await fetch(`${API}/api/projeler/${id}`, { method: 'DELETE' });
    showToast('Proje silindi', 'success');
    await loadPage('projeler');
  } catch (error) {
    showToast('Silme hatasi', 'error');
    hideLoader();
  }
}

// ==================== ADIMLAR ====================
// Coklu secim icin secili degerler
let selectedBirimler = [];
let selectedKisiler = [];

async function openAdimModal(id = null) {
  showLoader('Form hazirlaniyor...');
  await loadSelectData();

  // Secili degerleri sifirla
  selectedBirimler = [];
  selectedKisiler = [];

  document.getElementById('adim_proje_id').value = currentProjeId;

  if (id) {
    const adimlar = await fetch(`${API}/api/projeler/${currentProjeId}/adimlar`).then(r => r.json());
    const adim = adimlar.find(a => a.id === id);
    document.getElementById('adimModalTitle').textContent = 'Adim Duzenle';
    document.getElementById('adim_id').value = adim.id;
    document.getElementById('adim_baslik').value = adim.baslik;
    document.getElementById('adim_aciklama').value = adim.aciklama || '';
    document.getElementById('adim_durum').value = adim.durum;
    document.getElementById('adim_baslangic').value = adim.baslangic_tarihi || '';
    document.getElementById('adim_bitis').value = adim.bitis_tarihi || '';
    document.getElementById('adim_notlar').value = adim.notlar || '';

    // Coklu atamalari yukle
    if (adim.atanan_birimler && adim.atanan_birimler.length > 0) {
      selectedBirimler = adim.atanan_birimler.map(b => ({ id: b.birim_id, ad: b.ad }));
    }
    if (adim.atanan_kisiler && adim.atanan_kisiler.length > 0) {
      selectedKisiler = adim.atanan_kisiler.map(k => ({ id: k.kisi_id, ad: k.tam_ad || `${k.ad} ${k.soyad}` }));
    }
  } else {
    document.getElementById('adimModalTitle').textContent = 'Yeni Adim';
    document.getElementById('adimForm').reset();
    document.getElementById('adim_id').value = '';
    document.getElementById('adim_proje_id').value = currentProjeId;
  }

  // Multi-select alanlari baslat
  initMultiSelect('birim', birimler.map(b => ({ id: b.id, ad: b.ad })), selectedBirimler);
  initMultiSelect('kisi', kisiler.map(k => ({ id: k.id, ad: `${k.ad} ${k.soyad}` })), selectedKisiler);

  hideLoader();
  new bootstrap.Modal(document.getElementById('adimModal')).show();
}

// Multi-select baslatma
function initMultiSelect(type, options, selected) {
  const container = document.getElementById(type === 'birim' ? 'birimlerContainer' : 'kisilerContainer');
  const selectedContainer = document.getElementById(type === 'birim' ? 'selectedBirimler' : 'selectedKisiler');
  const searchInput = document.getElementById(type === 'birim' ? 'birimSearch' : 'kisiSearch');
  const optionsContainer = document.getElementById(type === 'birim' ? 'birimOptions' : 'kisiOptions');

  // Secili elemanlari goster
  renderSelectedItems(type, selectedContainer);

  // Secenekleri doldur
  renderOptions(type, options, optionsContainer, '');

  // Arama input event
  searchInput.value = '';
  searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    renderOptions(type, options, optionsContainer, query);
  };

  // Dropdown acilip kapanmasi icin focus/blur
  searchInput.onfocus = () => {
    optionsContainer.style.display = 'block';
  };

  // Tiklama ile dropdown kapanmasini engelle
  container.onclick = (e) => {
    e.stopPropagation();
  };
}

// Secili elemanlari render et
function renderSelectedItems(type, container) {
  const selected = type === 'birim' ? selectedBirimler : selectedKisiler;
  container.innerHTML = selected.map(item => `
    <span class="selected-item" data-id="${item.id}">
      <i class="bi ${type === 'birim' ? 'bi-building' : 'bi-person'}"></i>
      ${item.ad}
      <button type="button" class="remove-btn" onclick="removeSelected('${type}', ${item.id})">
        <i class="bi bi-x"></i>
      </button>
    </span>
  `).join('');
}

// Secenekleri render et
function renderOptions(type, options, container, query) {
  const selected = type === 'birim' ? selectedBirimler : selectedKisiler;
  const selectedIds = selected.map(s => s.id);

  const filtered = options.filter(opt =>
    opt.ad.toLowerCase().includes(query) && !selectedIds.includes(opt.id)
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="dropdown-option disabled">Sonuc bulunamadi</div>`;
  } else {
    container.innerHTML = filtered.map(opt => `
      <div class="dropdown-option" onclick="selectOption('${type}', ${opt.id}, '${opt.ad.replace(/'/g, "\\'")}')">
        <i class="bi ${type === 'birim' ? 'bi-building' : 'bi-person'}"></i>
        ${opt.ad}
      </div>
    `).join('');
  }
}

// Secim yapildiginda
function selectOption(type, id, ad) {
  if (type === 'birim') {
    selectedBirimler.push({ id, ad });
    initMultiSelect('birim', birimler.map(b => ({ id: b.id, ad: b.ad })), selectedBirimler);
  } else {
    selectedKisiler.push({ id, ad });
    initMultiSelect('kisi', kisiler.map(k => ({ id: k.id, ad: `${k.ad} ${k.soyad}` })), selectedKisiler);
  }
}

// Secim kaldirildiginda
function removeSelected(type, id) {
  if (type === 'birim') {
    selectedBirimler = selectedBirimler.filter(b => b.id !== id);
    initMultiSelect('birim', birimler.map(b => ({ id: b.id, ad: b.ad })), selectedBirimler);
  } else {
    selectedKisiler = selectedKisiler.filter(k => k.id !== id);
    initMultiSelect('kisi', kisiler.map(k => ({ id: k.id, ad: `${k.ad} ${k.soyad}` })), selectedKisiler);
  }
}

// Dropdown disina tiklandiginda kapat
document.addEventListener('click', function(e) {
  const birimOptions = document.getElementById('birimOptions');
  const kisiOptions = document.getElementById('kisiOptions');
  const birimContainer = document.getElementById('birimlerContainer');
  const kisiContainer = document.getElementById('kisilerContainer');

  if (birimOptions && birimContainer && !birimContainer.contains(e.target)) {
    birimOptions.style.display = 'none';
  }
  if (kisiOptions && kisiContainer && !kisiContainer.contains(e.target)) {
    kisiOptions.style.display = 'none';
  }
});

async function saveAdim() {
  const id = document.getElementById('adim_id').value;
  const projeId = document.getElementById('adim_proje_id').value;
  const data = {
    baslik: document.getElementById('adim_baslik').value,
    aciklama: document.getElementById('adim_aciklama').value,
    durum: document.getElementById('adim_durum').value,
    baslangic_tarihi: document.getElementById('adim_baslangic').value || null,
    bitis_tarihi: document.getElementById('adim_bitis').value || null,
    notlar: document.getElementById('adim_notlar').value,
    // Coklu atamalar
    atanan_birim_ids: selectedBirimler.map(b => b.id),
    atanan_kisi_ids: selectedKisiler.map(k => k.id)
  };

  showLoader('Kaydediliyor...');

  const url = id ? `${API}/api/adimlar/${id}` : `${API}/api/projeler/${projeId}/adimlar`;
  const method = id ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    bootstrap.Modal.getInstance(document.getElementById('adimModal')).hide();
    showToast(id ? 'Adim guncellendi' : 'Adim eklendi', 'success');
    await openProjeDetay(currentProjeId);
  } catch (error) {
    showToast('Kaydetme hatasi', 'error');
    hideLoader();
  }
}

async function deleteAdim(id) {
  if (!confirm('Bu adimi silmek istediginizden emin misiniz?')) return;

  showLoader('Siliniyor...');

  try {
    await fetch(`${API}/api/adimlar/${id}`, { method: 'DELETE' });
    showToast('Adim silindi', 'success');
    await openProjeDetay(currentProjeId);
  } catch (error) {
    showToast('Silme hatasi', 'error');
    hideLoader();
  }
}

// ==================== KISILER ====================
async function renderKisiler() {
  kisiler = await fetch(`${API}/api/kisiler`).then(r => r.json());

  return `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-people me-2"></i>Kisiler</h2>
      <button class="btn btn-primary" onclick="openKisiModal()">
        <i class="bi bi-plus-lg"></i> Yeni Kisi
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        ${kisiler.length === 0 ? `
          <div class="empty-state">
            <i class="bi bi-people"></i>
            <h5>Henuz kisi yok</h5>
            <button class="btn btn-primary" onclick="openKisiModal()">
              <i class="bi bi-plus-lg"></i> Ilk Kisiyi Ekle
            </button>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Telefon</th>
                  <th>Birim</th>
                  <th>Pozisyon</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${kisiler.map(k => `
                  <tr>
                    <td><strong>${k.ad} ${k.soyad}</strong></td>
                    <td>${k.email || '-'}</td>
                    <td>${k.telefon || '-'}</td>
                    <td>${k.birim_adi || '-'}</td>
                    <td>${k.pozisyon || '-'}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-primary me-1" onclick="openKisiModal(${k.id})">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteKisi(${k.id})">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function openKisiModal(id = null) {
  showLoader('Form hazirlaniyor...');
  await loadSelectData();

  document.getElementById('kisi_birim').innerHTML = '<option value="">Secin...</option>' +
    birimler.map(b => `<option value="${b.id}">${b.ad}</option>`).join('');

  if (id) {
    const kisi = await fetch(`${API}/api/kisiler/${id}`).then(r => r.json());
    document.getElementById('kisiModalTitle').textContent = 'Kisi Duzenle';
    document.getElementById('kisi_id').value = kisi.id;
    document.getElementById('kisi_ad').value = kisi.ad;
    document.getElementById('kisi_soyad').value = kisi.soyad;
    document.getElementById('kisi_email').value = kisi.email || '';
    document.getElementById('kisi_telefon').value = kisi.telefon || '';
    document.getElementById('kisi_birim').value = kisi.birim_id || '';
    document.getElementById('kisi_pozisyon').value = kisi.pozisyon || '';
  } else {
    document.getElementById('kisiModalTitle').textContent = 'Yeni Kisi';
    document.getElementById('kisiForm').reset();
    document.getElementById('kisi_id').value = '';
  }

  hideLoader();
  new bootstrap.Modal(document.getElementById('kisiModal')).show();
}

async function saveKisi() {
  const id = document.getElementById('kisi_id').value;
  const data = {
    ad: document.getElementById('kisi_ad').value,
    soyad: document.getElementById('kisi_soyad').value,
    email: document.getElementById('kisi_email').value,
    telefon: document.getElementById('kisi_telefon').value,
    birim_id: document.getElementById('kisi_birim').value || null,
    pozisyon: document.getElementById('kisi_pozisyon').value
  };

  showLoader('Kaydediliyor...');

  const url = id ? `${API}/api/kisiler/${id}` : `${API}/api/kisiler`;
  const method = id ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    bootstrap.Modal.getInstance(document.getElementById('kisiModal')).hide();
    showToast(id ? 'Kisi guncellendi' : 'Kisi eklendi', 'success');
    await loadPage('kisiler');
  } catch (error) {
    showToast('Kaydetme hatasi', 'error');
    hideLoader();
  }
}

async function deleteKisi(id) {
  if (!confirm('Bu kisiyi silmek istediginizden emin misiniz?')) return;

  showLoader('Siliniyor...');

  try {
    await fetch(`${API}/api/kisiler/${id}`, { method: 'DELETE' });
    showToast('Kisi silindi', 'success');
    await loadPage('kisiler');
  } catch (error) {
    showToast('Silme hatasi', 'error');
    hideLoader();
  }
}

// ==================== BIRIMLER ====================
async function renderBirimler() {
  birimler = await fetch(`${API}/api/birimler`).then(r => r.json());

  return `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-building me-2"></i>Birimler</h2>
      <button class="btn btn-primary" onclick="openBirimModal()">
        <i class="bi bi-plus-lg"></i> Yeni Birim
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        ${birimler.length === 0 ? `
          <div class="empty-state">
            <i class="bi bi-building"></i>
            <h5>Henuz birim yok</h5>
            <button class="btn btn-primary" onclick="openBirimModal()">
              <i class="bi bi-plus-lg"></i> Ilk Birimi Ekle
            </button>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Birim Adi</th>
                  <th>Departman</th>
                  <th>Kisi Sayisi</th>
                  <th>Aciklama</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${birimler.map(b => `
                  <tr>
                    <td><strong>${b.ad}</strong></td>
                    <td>${b.departman_adi || '-'}</td>
                    <td><span class="badge bg-secondary">${b.kisi_sayisi}</span></td>
                    <td>${b.aciklama || '-'}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-primary me-1" onclick="openBirimModal(${b.id})">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteBirim(${b.id})">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function openBirimModal(id = null) {
  showLoader('Form hazirlaniyor...');
  await loadSelectData();

  document.getElementById('birim_departman').innerHTML = '<option value="">Secin...</option>' +
    departmanlar.map(d => `<option value="${d.id}">${d.ad}</option>`).join('');

  if (id) {
    const birim = await fetch(`${API}/api/birimler/${id}`).then(r => r.json());
    document.getElementById('birimModalTitle').textContent = 'Birim Duzenle';
    document.getElementById('birim_id').value = birim.id;
    document.getElementById('birim_ad').value = birim.ad;
    document.getElementById('birim_departman').value = birim.departman_id || '';
    document.getElementById('birim_aciklama').value = birim.aciklama || '';
  } else {
    document.getElementById('birimModalTitle').textContent = 'Yeni Birim';
    document.getElementById('birimForm').reset();
    document.getElementById('birim_id').value = '';
  }

  hideLoader();
  new bootstrap.Modal(document.getElementById('birimModal')).show();
}

async function saveBirim() {
  const id = document.getElementById('birim_id').value;
  const data = {
    ad: document.getElementById('birim_ad').value,
    departman_id: document.getElementById('birim_departman').value || null,
    aciklama: document.getElementById('birim_aciklama').value
  };

  showLoader('Kaydediliyor...');

  const url = id ? `${API}/api/birimler/${id}` : `${API}/api/birimler`;
  const method = id ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    bootstrap.Modal.getInstance(document.getElementById('birimModal')).hide();
    showToast(id ? 'Birim guncellendi' : 'Birim eklendi', 'success');
    await loadPage('birimler');
  } catch (error) {
    showToast('Kaydetme hatasi', 'error');
    hideLoader();
  }
}

async function deleteBirim(id) {
  if (!confirm('Bu birimi silmek istediginizden emin misiniz?')) return;

  showLoader('Siliniyor...');

  try {
    await fetch(`${API}/api/birimler/${id}`, { method: 'DELETE' });
    showToast('Birim silindi', 'success');
    await loadPage('birimler');
  } catch (error) {
    showToast('Silme hatasi', 'error');
    hideLoader();
  }
}

// ==================== DEPARTMANLAR ====================
async function renderDepartmanlar() {
  departmanlar = await fetch(`${API}/api/departmanlar`).then(r => r.json());

  return `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-diagram-3 me-2"></i>Departmanlar</h2>
      <button class="btn btn-primary" onclick="openDepartmanModal()">
        <i class="bi bi-plus-lg"></i> Yeni Departman
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        ${departmanlar.length === 0 ? `
          <div class="empty-state">
            <i class="bi bi-diagram-3"></i>
            <h5>Henuz departman yok</h5>
            <button class="btn btn-primary" onclick="openDepartmanModal()">
              <i class="bi bi-plus-lg"></i> Ilk Departmani Ekle
            </button>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Departman Adi</th>
                  <th>Birim Sayisi</th>
                  <th>Aciklama</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${departmanlar.map(d => `
                  <tr>
                    <td><strong>${d.ad}</strong></td>
                    <td><span class="badge bg-secondary">${d.birim_sayisi}</span></td>
                    <td>${d.aciklama || '-'}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-primary me-1" onclick="openDepartmanModal(${d.id})">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteDepartman(${d.id})">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function openDepartmanModal(id = null) {
  showLoader('Form hazirlaniyor...');

  if (id) {
    const departman = await fetch(`${API}/api/departmanlar/${id}`).then(r => r.json());
    document.getElementById('departmanModalTitle').textContent = 'Departman Duzenle';
    document.getElementById('departman_id').value = departman.id;
    document.getElementById('departman_ad').value = departman.ad;
    document.getElementById('departman_aciklama').value = departman.aciklama || '';
  } else {
    document.getElementById('departmanModalTitle').textContent = 'Yeni Departman';
    document.getElementById('departmanForm').reset();
    document.getElementById('departman_id').value = '';
  }

  hideLoader();
  new bootstrap.Modal(document.getElementById('departmanModal')).show();
}

async function saveDepartman() {
  const id = document.getElementById('departman_id').value;
  const data = {
    ad: document.getElementById('departman_ad').value,
    aciklama: document.getElementById('departman_aciklama').value
  };

  showLoader('Kaydediliyor...');

  const url = id ? `${API}/api/departmanlar/${id}` : `${API}/api/departmanlar`;
  const method = id ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    bootstrap.Modal.getInstance(document.getElementById('departmanModal')).hide();
    showToast(id ? 'Departman guncellendi' : 'Departman eklendi', 'success');
    await loadPage('departmanlar');
  } catch (error) {
    showToast('Kaydetme hatasi', 'error');
    hideLoader();
  }
}

async function deleteDepartman(id) {
  if (!confirm('Bu departmani silmek istediginizden emin misiniz?')) return;

  showLoader('Siliniyor...');

  try {
    await fetch(`${API}/api/departmanlar/${id}`, { method: 'DELETE' });
    showToast('Departman silindi', 'success');
    await loadPage('departmanlar');
  } catch (error) {
    showToast('Silme hatasi', 'error');
    hideLoader();
  }
}

// ==================== HELPERS ====================
async function loadSelectData() {
  [departmanlar, birimler, kisiler] = await Promise.all([
    fetch(`${API}/api/departmanlar`).then(r => r.json()),
    fetch(`${API}/api/birimler`).then(r => r.json()),
    fetch(`${API}/api/kisiler`).then(r => r.json())
  ]);
}

function formatDurum(durum) {
  const durumlar = {
    'beklemede': 'Beklemede',
    'devam_ediyor': 'Devam Ediyor',
    'tamamlandi': 'Tamamlandi',
    'iptal': 'Iptal'
  };
  return durumlar[durum] || durum;
}

function formatOncelik(oncelik) {
  const oncelikler = {
    'dusuk': 'Dusuk',
    'normal': 'Normal',
    'yuksek': 'Yuksek',
    'kritik': 'Kritik'
  };
  return oncelikler[oncelik] || oncelik;
}

function getPriorityColor(oncelik) {
  const colors = {
    'dusuk': 'success',
    'normal': 'primary',
    'yuksek': 'warning',
    'kritik': 'danger'
  };
  return colors[oncelik] || 'secondary';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatGuncellemeTipi(tip) {
  const tipler = {
    'olusturma': 'Proje olusturuldu',
    'durum_degisikligi': 'Durum degistirildi',
    'adim_ekleme': 'Adim eklendi',
    'adim_silme': 'Adim silindi',
    'adim_durum_degisikligi': 'Adim durumu degistirildi'
  };
  return tipler[tip] || tip;
}

function getProgressBarClass(ilerleme) {
  if (ilerleme >= 100) return 'bg-success';
  if (ilerleme >= 75) return 'bg-info';
  if (ilerleme >= 50) return 'bg-primary';
  if (ilerleme >= 25) return 'bg-warning';
  return '';
}

function isOverdue(bitisTarihi, durum) {
  if (!bitisTarihi || durum === 'tamamlandi') return false;
  const bitis = new Date(bitisTarihi);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  return bitis < bugun;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit'
  });
}

function calculateAdimStats(adimlar) {
  const stats = {
    toplam: adimlar.length,
    tamamlanan: 0,
    devamEden: 0,
    bekleyen: 0
  };

  adimlar.forEach(a => {
    if (a.durum === 'tamamlandi') stats.tamamlanan++;
    else if (a.durum === 'devam_ediyor') stats.devamEden++;
    else stats.bekleyen++;
  });

  return stats;
}

// ==================== GANTT CHART ====================
let currentGanttView = 'list'; // 'list' veya 'gantt'

function renderGanttChart(proje, adimlar) {
  if (adimlar.length === 0) {
    return `
      <div class="empty-state py-4">
        <i class="bi bi-bar-chart-steps"></i>
        <p>Gantt semasini goruntulemek icin adim ekleyin</p>
      </div>
    `;
  }

  // Tarih araligini hesapla
  const dates = [];
  adimlar.forEach(a => {
    if (a.baslangic_tarihi) dates.push(new Date(a.baslangic_tarihi));
    if (a.bitis_tarihi) dates.push(new Date(a.bitis_tarihi));
  });

  // Proje tarihlerini de ekle
  if (proje.baslangic_tarihi) dates.push(new Date(proje.baslangic_tarihi));
  if (proje.bitis_tarihi) dates.push(new Date(proje.bitis_tarihi));

  // Eger tarih yoksa bugunun tarihini kullan
  if (dates.length === 0) {
    const today = new Date();
    dates.push(today);
    dates.push(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)); // 30 gun sonra
  }

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // 2 gun oncesi ve 2 gun sonrasini ekle
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 2);

  // Gun sayisini hesapla
  const dayCount = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

  // Gun basliklarini olustur
  const dayHeaders = [];
  const currentDate = new Date(minDate);
  for (let i = 0; i < dayCount; i++) {
    dayHeaders.push({
      date: new Date(currentDate),
      day: currentDate.getDate(),
      month: currentDate.toLocaleDateString('tr-TR', { month: 'short' }),
      isToday: isSameDay(currentDate, new Date()),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Her adim icin bar pozisyonunu hesapla
  const ganttRows = adimlar.map((adim, index) => {
    const startDate = adim.baslangic_tarihi ? new Date(adim.baslangic_tarihi) : (adim.bitis_tarihi ? new Date(adim.bitis_tarihi) : new Date());
    const endDate = adim.bitis_tarihi ? new Date(adim.bitis_tarihi) : startDate;

    const startOffset = Math.max(0, Math.floor((startDate - minDate) / (1000 * 60 * 60 * 24)));
    const duration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);

    const leftPercent = (startOffset / dayCount) * 100;
    const widthPercent = (duration / dayCount) * 100;

    return {
      ...adim,
      index: index + 1,
      leftPercent,
      widthPercent,
      startOffset,
      duration
    };
  });

  // Bugunun cizgisi icin pozisyon
  const today = new Date();
  const todayOffset = Math.floor((today - minDate) / (1000 * 60 * 60 * 24));
  const todayPercent = (todayOffset / dayCount) * 100;
  const showTodayLine = todayPercent >= 0 && todayPercent <= 100;

  return `
    <div class="gantt-container">
      <div class="gantt-chart">
        <!-- Header -->
        <div class="gantt-header">
          <div class="gantt-task-header">Adim</div>
          <div class="gantt-timeline-header">
            ${dayHeaders.map(d => `
              <div class="gantt-day ${d.isToday ? 'today' : ''} ${d.isWeekend ? 'weekend' : ''}">
                <div class="gantt-day-number">${d.day}</div>
                <div class="gantt-day-month">${d.month}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Rows -->
        ${ganttRows.map(row => `
          <div class="gantt-row" onclick="openAdimModal(${row.id})">
            <div class="gantt-task-name" title="${row.baslik}">
              <span class="gantt-task-number">${row.index}.</span>
              ${row.baslik.length > 25 ? row.baslik.substring(0, 25) + '...' : row.baslik}
            </div>
            <div class="gantt-timeline">
              <div class="gantt-bar-container">
                ${dayHeaders.map((d, i) => `
                  <div class="gantt-grid-cell ${d.isWeekend ? 'weekend' : ''} ${d.isToday ? 'today' : ''}"></div>
                `).join('')}
                <div class="gantt-bar ${row.durum}"
                     style="left: ${row.leftPercent}%; width: ${row.widthPercent}%;"
                     data-tooltip="${row.baslik}&#10;${row.baslangic_tarihi || '-'} - ${row.bitis_tarihi || '-'}&#10;Durum: ${formatDurum(row.durum)}">
                  <span class="gantt-bar-label">${row.baslik.substring(0, 15)}${row.baslik.length > 15 ? '...' : ''}</span>
                </div>
              </div>
              ${showTodayLine ? `<div class="gantt-today-line" style="left: ${todayPercent}%;"></div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Legend -->
      <div class="gantt-legend">
        <div class="gantt-legend-item">
          <div class="gantt-legend-color beklemede"></div>
          <span>Beklemede</span>
        </div>
        <div class="gantt-legend-item">
          <div class="gantt-legend-color devam_ediyor"></div>
          <span>Devam Ediyor</span>
        </div>
        <div class="gantt-legend-item">
          <div class="gantt-legend-color tamamlandi"></div>
          <span>Tamamlandi</span>
        </div>
        <div class="gantt-legend-item">
          <div class="gantt-today-marker"></div>
          <span>Bugun</span>
        </div>
      </div>
    </div>
  `;
}

function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

function switchProjeView(view) {
  currentGanttView = view;
  openProjeDetay(currentProjeId);
}
