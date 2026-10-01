import { Icons } from './icons.js';
import { t } from './i18n.js';

export function initAduanasView(containerEl) {
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem('aduanas_custom_rates')) || [];
  } catch (e) {
    favorites = [];
  }

  let currentRate = 37;

  containerEl.innerHTML = `
    <div class="view-content">
      <div class="view-header">
        <h2 class="view-title">${t('customsTitle')}</h2>
        <span class="badge-pill bg-sky-soft text-sky" id="badge-rate">37%</span>
      </div>

      <!-- Hero Total Card -->
      <div class="hero-card">
        <span class="hero-label">${t('nationalizationCost')}</span>
        <div class="hero-value text-sky" id="res-adval-total">$0.00</div>
        <div class="hero-sub" id="res-adval-tax">Arancel: $0.00</div>

        <div class="progress-bar-dual mt-3">
          <div class="progress-segment bg-sky" id="bar-fob" style="width: 70%"></div>
          <div class="progress-segment bg-amber" id="bar-logistics" style="width: 15%"></div>
          <div class="progress-segment bg-rose" id="bar-tax" style="width: 15%"></div>
        </div>
        <div class="bar-labels">
          <span id="lbl-fob">$0 FOB</span>
          <span id="lbl-tax">$0 Arancel</span>
        </div>
      </div>

      <!-- Main Inputs -->
      <div class="section-card">
        <div class="input-field mb-3">
          <label>${t('fobValue')}</label>
          <input type="number" id="in-fob" value="15000" step="any">
        </div>

        <!-- Tariff Selector & Custom Favorites -->
        <div class="mb-3">
          <label class="input-label-sm">${t('tariffRate')}</label>
          <div class="tariff-chips-wrap mt-1" id="tariff-chips-wrap"></div>

          <div class="tariff-custom-row mt-2">
            <div class="input-field input-compact flex-1">
              <input type="number" id="in-custom-rate" placeholder="${t('customRate')}" step="any" min="0" max="100">
            </div>
            <button class="icon-btn-compact" id="btn-add-fav" title="${t('addFavorite')}">
              ${Icons.plus}
            </button>
          </div>
        </div>

        <!-- Freight & Insurance Toggles -->
        <div class="subcard mb-2">
          <div class="subcard-header">
            <label class="toggle-row">
              <input type="checkbox" id="chk-flete" checked>
              <span class="toggle-slider"></span>
              <span class="subcard-title">${t('intlFreight')}</span>
            </label>
          </div>
          <div class="input-field mt-2" id="box-flete">
            <input type="number" id="in-flete" value="3500" step="any">
          </div>
        </div>

        <div class="subcard">
          <div class="subcard-header">
            <label class="toggle-row">
              <input type="checkbox" id="chk-seguro" checked>
              <span class="toggle-slider"></span>
              <span class="subcard-title">${t('cargoInsurance')}</span>
            </label>
            <span class="metric-sub" id="res-seguro-calc">$0.00</span>
          </div>
          <div class="input-field mt-2" id="box-seguro">
            <input type="number" id="in-pct-seguro" value="2.5" step="any">
          </div>
        </div>
      </div>

      <!-- Rates Comparison Table -->
      <div class="section-card">
        <span class="card-title mb-2 block">${t('tariffComparison')}</span>
        <div class="table-compact" id="aduanas-comp-table"></div>
      </div>

      <!-- Alternate Cost Real Mode -->
      <div class="section-card">
        <label class="toggle-row">
          <input type="checkbox" id="chk-alt-calc">
          <span class="toggle-slider"></span>
          <span class="card-title">${t('realPurchaseCost')}</span>
        </label>
        <div id="alt-box" class="mt-3 hidden">
          <div class="input-field mb-2">
            <label>${t('realFobPaid')}</label>
            <input type="number" id="in-alt-fob" value="11000" step="any">
          </div>
          <div class="metric-card bg-slate-900 border-slate-800">
            <span class="metric-label">${t('realIntegratedCost')}</span>
            <span class="metric-value text-emerald" id="res-alt-total">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const inFob = containerEl.querySelector('#in-fob');
  const chkFlete = containerEl.querySelector('#chk-flete');
  const inFlete = containerEl.querySelector('#in-flete');
  const boxFlete = containerEl.querySelector('#box-flete');
  const chkSeguro = containerEl.querySelector('#chk-seguro');
  const inPctSeguro = containerEl.querySelector('#in-pct-seguro');
  const boxSeguro = containerEl.querySelector('#box-seguro');
  const resSeguroCalc = containerEl.querySelector('#res-seguro-calc');

  const chipsWrap = containerEl.querySelector('#tariff-chips-wrap');
  const inCustomRate = containerEl.querySelector('#in-custom-rate');
  const btnAddFav = containerEl.querySelector('#btn-add-fav');
  const compTable = containerEl.querySelector('#aduanas-comp-table');

  const badgeRate = containerEl.querySelector('#badge-rate');
  const resTotal = containerEl.querySelector('#res-adval-total');
  const resTax = containerEl.querySelector('#res-adval-tax');
  const barFob = containerEl.querySelector('#bar-fob');
  const barLogistics = containerEl.querySelector('#bar-logistics');
  const barTax = containerEl.querySelector('#bar-tax');
  const lblFob = containerEl.querySelector('#lbl-fob');
  const lblTax = containerEl.querySelector('#lbl-tax');

  const chkAlt = containerEl.querySelector('#chk-alt-calc');
  const altBox = containerEl.querySelector('#alt-box');
  const inAltFob = containerEl.querySelector('#in-alt-fob');
  const resAltTotal = containerEl.querySelector('#res-alt-total');

  const saveFavorites = () => {
    localStorage.setItem('aduanas_custom_rates', JSON.stringify(favorites));
  };

  const renderChips = () => {
    const defaults = [37, 52, 72];
    const uniqueRates = [...defaults];
    favorites.forEach(f => {
      if (!uniqueRates.includes(f)) uniqueRates.push(f);
    });

    chipsWrap.innerHTML = uniqueRates.map(r => {
      const isCustom = !defaults.includes(r);
      const isActive = currentRate === r;
      return `
        <div class="rate-chip ${isActive ? 'active' : ''}" data-rate="${r}">
          <span class="chip-rate-text">${r}%</span>
          ${isCustom ? `<span class="chip-rate-del" data-del-rate="${r}">${Icons.close}</span>` : ''}
        </div>
      `;
    }).join('');

    chipsWrap.querySelectorAll('.rate-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.chip-rate-del');
        if (delBtn) {
          e.stopPropagation();
          const toDel = parseFloat(delBtn.dataset.delRate);
          favorites = favorites.filter(f => f !== toDel);
          saveFavorites();
          if (currentRate === toDel) currentRate = 37;
          renderChips();
          calculate();
          return;
        }

        const r = parseFloat(chip.dataset.rate);
        currentRate = r;
        inCustomRate.value = '';
        renderChips();
        calculate();
      });
    });
  };

  const calculate = () => {
    const fob = parseFloat(inFob.value) || 0;
    const flete = chkFlete.checked ? (parseFloat(inFlete.value) || 0) : 0;
    const pctSeg = chkSeguro.checked ? (parseFloat(inPctSeguro.value) || 0) : 0;
    const seguro = fob * (pctSeg / 100);

    resSeguroCalc.textContent = `$${seguro.toFixed(2)}`;

    if (fob <= 0) {
      resTotal.textContent = '$0.00';
      resTax.textContent = 'Arancel: $0.00';
      return;
    }

    const cif = fob + flete + seguro;
    const tax = cif * (currentRate / 100);
    const total = cif + tax;

    badgeRate.textContent = `${currentRate}%`;
    resTotal.textContent = `$${total.toFixed(2)}`;
    resTax.textContent = `CIF: $${cif.toFixed(2)} | Arancel: $${tax.toFixed(2)}`;

    const pctF = (fob / total) * 100;
    const pctL = ((flete + seguro) / total) * 100;
    const pctT = (tax / total) * 100;
    barFob.style.width = `${pctF}%`;
    barLogistics.style.width = `${pctL}%`;
    barTax.style.width = `${pctT}%`;
    lblFob.textContent = `$${fob.toFixed(0)} FOB`;
    lblTax.textContent = `$${tax.toFixed(0)} Tax`;

    // Table rows
    const ratesForTable = [37, 52, 72];
    if (!ratesForTable.includes(currentRate) && currentRate > 0) {
      ratesForTable.push(currentRate);
      ratesForTable.sort((a, b) => a - b);
    }

    compTable.innerHTML = `
      <div class="table-row table-head">
        <span>Tasa</span>
        <span>Arancel</span>
        <span>Total CIF+Tax</span>
      </div>
      ${ratesForTable.map(r => {
        const rowTax = cif * (r / 100);
        const rowTotal = cif + rowTax;
        const isCurrent = r === currentRate;
        return `
          <div class="table-row ${isCurrent ? 'bg-row-active' : ''}">
            <span class="font-bold ${isCurrent ? 'text-sky' : ''}">${r}%</span>
            <span class="tax-cell">$${rowTax.toFixed(2)}</span>
            <span class="total-cell text-sky">$${rowTotal.toFixed(2)}</span>
          </div>
        `;
      }).join('')}
    `;

    if (chkAlt.checked) {
      const altFobVal = parseFloat(inAltFob.value) || 0;
      const altSeg = chkSeguro.checked ? (altFobVal * (pctSeg / 100)) : 0;
      const altTotal = altFobVal + flete + altSeg + tax;
      resAltTotal.textContent = `$${altTotal.toFixed(2)}`;
    }
  };

  inCustomRate.addEventListener('input', () => {
    const val = parseFloat(inCustomRate.value);
    if (!isNaN(val) && val >= 0) {
      currentRate = val;
      chipsWrap.querySelectorAll('.rate-chip').forEach(c => {
        c.classList.toggle('active', parseFloat(c.dataset.rate) === currentRate);
      });
      calculate();
    }
  });

  btnAddFav.addEventListener('click', () => {
    const val = parseFloat(inCustomRate.value) || currentRate;
    if (val > 0 && ![37, 52, 72].includes(val) && !favorites.includes(val)) {
      if ('vibrate' in navigator) navigator.vibrate(10);
      favorites.push(val);
      favorites.sort((a, b) => a - b);
      saveFavorites();
      currentRate = val;
      renderChips();
      calculate();
    }
  });

  [inFob, inFlete, inPctSeguro, inAltFob].forEach(inp => inp.addEventListener('input', calculate));

  chkFlete.addEventListener('change', () => {
    boxFlete.classList.toggle('hidden', !chkFlete.checked);
    calculate();
  });

  chkSeguro.addEventListener('change', () => {
    boxSeguro.classList.toggle('hidden', !chkSeguro.checked);
    calculate();
  });

  chkAlt.addEventListener('change', () => {
    altBox.classList.toggle('hidden', !chkAlt.checked);
    calculate();
  });

  renderChips();
  calculate();
}
