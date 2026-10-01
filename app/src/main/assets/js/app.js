import { Icons } from './icons.js';
import { initCargoView } from './cargoView.js';
import { initVolumenView } from './volumenView.js';
import { initCalculadorasView } from './calculadorasView.js';
import { initAduanasView } from './aduanasView.js';
import { initSettingsModal, applySavedTheme } from './settingsModal.js';
import { t } from './i18n.js';

const TABS = [
  { id: 'cargo', labelKey: 'tabCargo', icon: Icons.cube, init: initCargoView },
  { id: 'volumen', labelKey: 'tabVolumen', icon: Icons.ruler, init: initVolumenView },
  { id: 'calculadoras', labelKey: 'tabCalculadoras', icon: Icons.calculator, init: initCalculadorasView },
  { id: 'aduanas', labelKey: 'tabAduanas', icon: Icons.customs, init: initAduanasView }
];

class App {
  constructor() {
    applySavedTheme();
    let savedTab = localStorage.getItem('active_tab') || 'cargo';
    if (savedTab === 'divisas' || savedTab === 'finanzas') savedTab = 'calculadoras';
    this.currentTab = savedTab;
    this.mainScroll = document.getElementById('main-scroll');
    this.navContainer = document.getElementById('bottom-nav');

    this.renderNav();
    this.switchTab(this.currentTab);
    initSettingsModal();

    window.addEventListener('app_language_changed', () => {
      this.renderNav();
      this.switchTab(this.currentTab);
    });
  }

  renderNav() {
    this.navContainer.innerHTML = TABS.map(tab => `
      <button class="nav-item ${tab.id === this.currentTab ? 'active' : ''}" data-tab="${tab.id}">
        ${tab.icon}
        <span class="nav-label">${t(tab.labelKey)}</span>
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
