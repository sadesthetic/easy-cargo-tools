import { Icons } from './icons.js';
import { initCargoView } from './cargoView.js';
import { initVolumenView } from './volumenView.js';
import { initDivisasView } from './divisasView.js';
import { initAduanasView } from './aduanasView.js';
import { initFinanzasView } from './finanzasView.js';

const TABS = [
  { id: 'cargo', label: 'Carga 3D', icon: Icons.cube, init: initCargoView },
  { id: 'volumen', label: 'Volumen', icon: Icons.ruler, init: initVolumenView },
  { id: 'divisas', label: 'Divisas', icon: Icons.exchange, init: initDivisasView },
  { id: 'aduanas', label: 'Aduana', icon: Icons.customs, init: initAduanasView },
  { id: 'finanzas', label: 'Finanzas', icon: Icons.finance, init: initFinanzasView }
];

class App {
  constructor() {
    this.currentTab = localStorage.getItem('active_tab') || 'cargo';
    this.mainScroll = document.getElementById('main-scroll');
    this.navContainer = document.getElementById('bottom-nav');
    this.viewsCache = new Map();

    this.renderNav();
    this.switchTab(this.currentTab);
  }

  renderNav() {
    this.navContainer.innerHTML = TABS.map(tab => `
      <button class="nav-item ${tab.id === this.currentTab ? 'active' : ''}" data-tab="${tab.id}">
        ${tab.icon}
        <span class="nav-label">${tab.label}</span>
      </button>
    `).join('');

    this.navContainer.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        if (target !== this.currentTab) {
          if ('vibrate' in navigator) navigator.vibrate(10);
          this.switchTab(target);
        }
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    localStorage.setItem('active_tab', tabId);

    this.navContainer.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    this.mainScroll.innerHTML = '';
    const tabDef = TABS.find(t => t.id === tabId);
    if (tabDef) {
      const viewContainer = document.createElement('div');
      viewContainer.id = `view-${tabId}`;
      this.mainScroll.appendChild(viewContainer);
      tabDef.init(viewContainer);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
