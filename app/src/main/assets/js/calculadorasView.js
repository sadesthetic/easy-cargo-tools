import { Icons } from './icons.js';
import { t } from './i18n.js';
import { initDivisasView } from './divisasView.js';
import { initFinanzasView } from './finanzasView.js';

export function initCalculadorasView(containerEl) {
  let activeTool = null;

  const renderSelector = () => {
    activeTool = null;
    containerEl.innerHTML = `
      <div class="view-content">
        <div class="view-header">
          <h2 class="view-title">${t('tabCalculadoras')}</h2>
        </div>

        <div class="calc-selector-grid">
          <div class="calc-selector-card" id="btn-select-divisas">
            <div class="calc-card-icon text-sky">
              ${Icons.exchange}
            </div>
            <div class="calc-card-body">
              <span class="calc-card-title">${t('exchangeArbitrage')}</span>
              <span class="calc-card-sub">${t('calcForexDesc')}</span>
            </div>
            <div class="calc-card-arrow">
              ${Icons.chevronRight}
            </div>
          </div>

          <div class="calc-selector-card" id="btn-select-finanzas">
            <div class="calc-card-icon text-emerald">
              ${Icons.finance}
            </div>
            <div class="calc-card-body">
              <span class="calc-card-title">${t('finTitle')}</span>
              <span class="calc-card-sub">${t('calcFinanceDesc')}</span>
            </div>
            <div class="calc-card-arrow">
              ${Icons.chevronRight}
            </div>
          </div>
        </div>
      </div>
    `;

    containerEl.querySelector('#btn-select-divisas').addEventListener('click', () => {
      if ('vibrate' in navigator) navigator.vibrate(10);
      loadTool('divisas');
    });

    containerEl.querySelector('#btn-select-finanzas').addEventListener('click', () => {
      if ('vibrate' in navigator) navigator.vibrate(10);
      loadTool('finanzas');
    });
  };

  const loadTool = (toolId) => {
    activeTool = toolId;
    containerEl.innerHTML = '';
    const wrapper = document.createElement('div');
    containerEl.appendChild(wrapper);

    const onBack = () => renderSelector();

    if (toolId === 'divisas') {
      initDivisasView(wrapper, onBack);
    } else if (toolId === 'finanzas') {
      initFinanzasView(wrapper, onBack);
    }
  };

  renderSelector();
}
