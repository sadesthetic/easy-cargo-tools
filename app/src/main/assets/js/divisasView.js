import { Icons } from './icons.js';
import { t } from './i18n.js';

export function initDivisasView(containerEl, onBack) {
  const backBtn = onBack ? `<button class="icon-btn-sm" id="btn-back-calc" style="margin-right: 8px;">${Icons.chevronLeft}</button>` : '';

  containerEl.innerHTML = `
    <div class="view-content">
      <div class="view-header">
        <div class="header-inline">
          ${backBtn}
          <h2 class="view-title">${t('exchangeArbitrage')}</h2>
        </div>
        <span class="badge-pill bg-sky-soft text-sky" id="badge-saving-pct">0.00%</span>
      </div>

      <!-- Main Result Card -->
      <div class="hero-card">
        <span class="hero-label">Ahorro Estimado</span>
        <div class="hero-value text-emerald" id="res-saving-usd">$0.00</div>
        <div class="hero-sub" id="res-saving-ves">0,00 Bs.</div>

        <div class="progress-bar-dual mt-3">
          <div class="progress-segment bg-sky" id="bar-spent" style="width: 70%"></div>
          <div class="progress-segment bg-emerald" id="bar-saved" style="width: 30%"></div>
        </div>
        <div class="bar-labels">
          <span id="label-bar-spent">$0.00 desembolso</span>
          <span id="label-bar-saved">$0.00 ahorro</span>
        </div>
      </div>

      <!-- Inputs Card -->
      <div class="section-card">
        <div class="input-field mb-3">
          <label>Monto a Liquidar ($ USD)</label>
          <input type="number" id="in-tax-usd" value="100" step="any">
        </div>

        <div class="inputs-2col mb-3">
          <div class="input-field">
            <label>Tasa Oficial (BCV)</label>
            <input type="number" id="in-rate-bank" value="39.60" step="any">
          </div>
          <div class="input-field">
            <label>Tasa Paralelo</label>
            <input type="number" id="in-rate-street" value="45.50" step="any">
          </div>
        </div>
      </div>

      <!-- Detailed Breakdown Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Deuda Oficial</span>
          <span class="metric-value text-sky" id="res-ves-pay">0,00 Bs.</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">USD Real Necesario</span>
          <span class="metric-value text-emerald" id="res-usd-needed">$0.00</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Factor Brecha</span>
          <span class="metric-value" id="res-factor">1.0000</span>
        </div>
      </div>
    </div>
  `;

  const inTax = containerEl.querySelector('#in-tax-usd');
  const inBank = containerEl.querySelector('#in-rate-bank');
  const inStreet = containerEl.querySelector('#in-rate-street');

  const badgeSavingPct = containerEl.querySelector('#badge-saving-pct');
  const resSavingUsd = containerEl.querySelector('#res-saving-usd');
  const resSavingVes = containerEl.querySelector('#res-saving-ves');
  const barSpent = containerEl.querySelector('#bar-spent');
  const barSaved = containerEl.querySelector('#bar-saved');
  const labelSpent = containerEl.querySelector('#label-bar-spent');
  const labelSaved = containerEl.querySelector('#label-bar-saved');
  const resVesPay = containerEl.querySelector('#res-ves-pay');
  const resUsdNeeded = containerEl.querySelector('#res-usd-needed');
  const resFactor = containerEl.querySelector('#res-factor');

  const formatBs = (v) => v.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculate = () => {
    const taxUsd = parseFloat(inTax.value) || 0;
    const rateBank = parseFloat(inBank.value) || 0;
    const rateStreet = parseFloat(inStreet.value) || 0;

    if (taxUsd <= 0 || rateBank <= 0 || rateStreet <= 0) {
      badgeSavingPct.textContent = '0.00%';
      resSavingUsd.textContent = '$0.00';
      resSavingVes.textContent = '0,00 Bs.';
      resVesPay.textContent = '0,00 Bs.';
      resUsdNeeded.textContent = '$0.00';
      resFactor.textContent = '1.0000';
      barSpent.style.width = '100%';
      barSaved.style.width = '0%';
      return;
    }

    const vesToPay = taxUsd * rateBank;
    const usdNeeded = vesToPay / rateStreet;
    const savingUsd = taxUsd - usdNeeded;
    const savingVes = savingUsd * rateStreet;
    const savingPct = rateStreet > 0 ? (1 - (rateBank / rateStreet)) * 100 : 0;
    const factor = rateBank / rateStreet;

    badgeSavingPct.textContent = `${savingPct.toFixed(2)}%`;
    resSavingUsd.textContent = `$${savingUsd.toFixed(2)}`;
    resSavingVes.textContent = `${formatBs(savingVes)} Bs.`;
    resVesPay.textContent = `${formatBs(vesToPay)} Bs.`;
    resUsdNeeded.textContent = `$${usdNeeded.toFixed(2)}`;
    resFactor.textContent = factor.toFixed(4);

    const spentPct = (usdNeeded / taxUsd) * 100;
    const savedPct = (savingUsd / taxUsd) * 100;
    barSpent.style.width = `${spentPct}%`;
    barSaved.style.width = `${savedPct}%`;
    labelSpent.textContent = `$${usdNeeded.toFixed(2)} desembolso`;
    labelSaved.textContent = `$${savingUsd.toFixed(2)} ahorro`;
  };

  if (onBack) {
    containerEl.querySelector('#btn-back-calc')?.addEventListener('click', onBack);
  }

  [inTax, inBank, inStreet].forEach(inp => inp.addEventListener('input', calculate));
  calculate();
}
