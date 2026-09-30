import { Icons } from './icons.js';
import { checkUpdates } from './updateChecker.js';

const PRIMARY_COLORS = ['#38bdf8', '#10b981', '#a855f7', '#f43f5e', '#f97316'];
const SECONDARY_COLORS = ['#10b981', '#070b12', '#f1f5f9', '#f59e0b', '#ef4444'];

export function applySavedTheme() {
  const p = localStorage.getItem('theme_primary') || '#38bdf8';
  const s = localStorage.getItem('theme_secondary') || '#10b981';
  setThemeColors(p, s);
}

function setThemeColors(primary, secondary) {
  document.documentElement.style.setProperty('--sky', primary);
  document.documentElement.style.setProperty('--sky-soft', primary + '20');
  document.documentElement.style.setProperty('--theme-secondary', secondary);
  localStorage.setItem('theme_primary', primary);
  localStorage.setItem('theme_secondary', secondary);
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
  let curS = localStorage.getItem('theme_secondary') || '#10b981';

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <span class="modal-title">Configuración</span>
        <button class="icon-btn-sm" id="btn-close-settings">${Icons.close}</button>
      </div>

      <!-- Live Mini Preview -->
      <div class="theme-preview-box" id="theme-preview">
        <div class="preview-mini-header" style="background: ${curS === '#070b12' ? '#0f172a' : curS}; color: ${curS === '#f1f5f9' ? '#070b12' : '#ffffff'};">
          <span class="preview-dot" style="background: ${curP};"></span>
          <span class="preview-title">EasyCargo</span>
        </div>
        <div class="preview-mini-body">
          <div class="preview-pill" style="border-color: ${curP}; color: ${curP};">${Icons.craneLogo}</div>
          <div class="preview-bar" style="background: ${curP};"></div>
        </div>
      </div>

      <!-- Color Pickers (Swatches without text) -->
      <div class="swatches-section">
        <div class="swatches-row" id="primary-swatches">
          ${PRIMARY_COLORS.map(c => `
            <button class="color-swatch ${c === curP ? 'active' : ''}" data-color="${c}" style="background: ${c};"></button>
          `).join('')}
        </div>
        <div class="swatches-row" id="secondary-swatches">
          ${SECONDARY_COLORS.map(c => `
            <button class="color-swatch ${c === curS ? 'active' : ''}" data-color="${c}" style="background: ${c}; ${c === '#070b12' ? 'border: 1px solid #334155;' : ''}"></button>
          `).join('')}
        </div>
      </div>

      <!-- Action Items -->
      <div class="settings-actions-list">
        <button class="settings-item-btn" id="act-update">
          ${Icons.refresh}
          <span>Actualizar</span>
        </button>
        <button class="settings-item-btn" id="act-donate">
          ${Icons.heart}
          <span>Donativo</span>
        </button>
        <button class="settings-item-btn" id="act-review">
          ${Icons.star}
          <span>Dejar reseña</span>
        </button>
        <button class="settings-item-btn" id="act-report">
          ${Icons.alert}
          <span>Reportar problema</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');

  const updatePreview = (p, s) => {
    const prevHeader = modal.querySelector('.preview-mini-header');
    const prevDot = modal.querySelector('.preview-dot');
    const prevPill = modal.querySelector('.preview-pill');
    const prevBar = modal.querySelector('.preview-bar');

    prevHeader.style.background = s === '#070b12' ? '#0f172a' : s;
    prevHeader.style.color = s === '#f1f5f9' ? '#070b12' : '#ffffff';
    prevDot.style.background = p;
    prevPill.style.borderColor = p;
    prevPill.style.color = p;
    prevBar.style.background = p;
  };

  // Primary swatches
  modal.querySelectorAll('#primary-swatches .color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('#primary-swatches .color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      curP = btn.dataset.color;
      setThemeColors(curP, curS);
      updatePreview(curP, curS);
    });
  });

  // Secondary swatches
  modal.querySelectorAll('#secondary-swatches .color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('#secondary-swatches .color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      curS = btn.dataset.color;
      setThemeColors(curP, curS);
      updatePreview(curP, curS);
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
