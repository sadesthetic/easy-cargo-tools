import { Icons } from './icons.js';
import { checkUpdates } from './updateChecker.js';
import { getLang, setLang, t } from './i18n.js';

const PRIMARY_COLORS = ['#38bdf8', '#10b981', '#a855f7', '#f43f5e', '#f97316'];

export function applySavedTheme() {
  const p = localStorage.getItem('theme_primary') || '#38bdf8';
  setThemePrimary(p);
}

function setThemePrimary(primary) {
  document.documentElement.style.setProperty('--sky', primary);
  document.documentElement.style.setProperty('--sky-soft', primary + '20');
  localStorage.setItem('theme_primary', primary);
}

export function initSettingsModal() {
  applySavedTheme();

  const gearBtn = document.getElementById('btn-open-settings');
  if (!gearBtn) return;

  gearBtn.addEventListener('click', () => openModal());
}

function openModal() {
  let modal = document.getElementById('settings-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  let curP = localStorage.getItem('theme_primary') || '#38bdf8';
  let curLang = getLang();

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <span class="modal-title">${t('settings')}</span>
        <button class="icon-btn-sm" id="btn-close-settings">${Icons.close}</button>
      </div>

      <!-- Live Mini Preview -->
      <div class="theme-preview-box" id="theme-preview">
        <div class="preview-mini-header">
          <span class="preview-dot" style="background: ${curP};"></span>
          <span class="preview-title">EasyCargo</span>
        </div>
        <div class="preview-mini-body">
          <div class="preview-pill" style="border-color: ${curP}; color: ${curP};">${Icons.craneLogo}</div>
          <div class="preview-bar" style="background: ${curP};"></div>
        </div>
      </div>

      <!-- Language Selector -->
      <div class="segmented-control" id="lang-control">
        <button class="segment-btn ${curLang === 'es' ? 'active' : ''}" data-lang="es">Español</button>
        <button class="segment-btn ${curLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
      </div>

      <!-- Primary Color Pickers -->
      <div class="swatches-section">
        <div class="swatches-row" id="primary-swatches">
          ${PRIMARY_COLORS.map(c => `
            <button class="color-swatch ${c === curP ? 'active' : ''}" data-color="${c}" style="background: ${c};"></button>
          `).join('')}
        </div>
      </div>

      <!-- Action Items -->
      <div class="settings-actions-list">
        <button class="settings-item-btn" id="act-update">
          ${Icons.refresh}
          <span>${t('updateBtn')}</span>
        </button>
        <button class="settings-item-btn" id="act-donate">
          ${Icons.heart}
          <span>${t('donateBtn')}</span>
        </button>
        <button class="settings-item-btn" id="act-review">
          ${Icons.star}
          <span>${t('reviewBtn')}</span>
        </button>
        <button class="settings-item-btn" id="act-report">
          ${Icons.alert}
          <span>${t('reportBtn')}</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');

  const updatePreview = (p) => {
    const prevDot = modal.querySelector('.preview-dot');
    const prevPill = modal.querySelector('.preview-pill');
    const prevBar = modal.querySelector('.preview-bar');

    prevDot.style.background = p;
    prevPill.style.borderColor = p;
    prevPill.style.color = p;
    prevBar.style.background = p;
  };

  // Language selector
  modal.querySelectorAll('#lang-control .segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('#lang-control .segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      curLang = btn.dataset.lang;
      setLang(curLang);
      window.dispatchEvent(new Event('app_language_changed'));
      modal.classList.add('hidden');
    });
  });

  // Primary swatches
  modal.querySelectorAll('#primary-swatches .color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('#primary-swatches .color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      curP = btn.dataset.color;
      setThemePrimary(curP);
      updatePreview(curP);
    });
  });

  // Action events
  modal.querySelector('#btn-close-settings').addEventListener('click', () => modal.classList.add('hidden'));

  modal.querySelector('#act-update').addEventListener('click', () => {
    modal.classList.add('hidden');
    checkUpdates();
  });

  modal.querySelector('#act-donate').addEventListener('click', () => {
    window.open('https://github.com/sponsors/sadesthetic', '_blank');
  });

  modal.querySelector('#act-review').addEventListener('click', () => {
    window.open('https://github.com/sadesthetic/easy-cargo-tools', '_blank');
  });

  modal.querySelector('#act-report').addEventListener('click', () => {
    window.open('https://github.com/sadesthetic/easy-cargo-tools/issues/new', '_blank');
  });
}
