export function initAduanasView(containerEl) {
  containerEl.innerHTML = `
    <div class="view-content">
      <div class="view-header">
        <h2 class="view-title">Impuestos Aduana (CIF)</h2>
        <span class="badge-pill bg-sky-soft text-sky" id="badge-rate">37%</span>
      </div>

      <!-- Hero Total Card -->
      <div class="hero-card">
        <span class="hero-label">Costo Total de Nacionalización</span>
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
          <label>Valor FOB Mercancía ($ USD)</label>
          <input type="number" id="in-fob" value="15000" step="any">
        </div>

        <!-- Tariff Selector Chips -->
        <div class="mb-3">
          <label class="input-label-sm">Tasa Arancelaria</label>
          <div class="segmented-control" id="tariff-control">
            <button class="segment-btn active" data-rate="37">37%</button>
            <button class="segment-btn" data-rate="52">52%</button>
            <button class="segment-btn" data-rate="72">72%</button>
          </div>
        </div>

        <!-- Freight & Insurance Toggles -->
        <div class="subcard mb-2">
          <div class="subcard-header">
            <label class="toggle-row">
              <input type="checkbox" id="chk-flete" checked>
              <span class="toggle-slider"></span>
              <span class="subcard-title">Flete Internacional</span>
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
              <span class="subcard-title">Seguro de Carga (%)</span>
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
        <span class="card-title mb-2 block">Comparativa Arancelaria</span>
        <div class="table-compact">
          <div class="table-row table-head">
            <span>Tasa</span>
            <span>Arancel</span>
            <span>Total CIF+Tax</span>
          </div>
          <div class="table-row" id="row-r-37">
            <span class="font-bold">37%</span>
            <span class="tax-cell">$0.00</span>
            <span class="total-cell text-sky">$0.00</span>
          </div>
          <div class="table-row" id="row-r-52">
            <span class="font-bold">52%</span>
            <span class="tax-cell">$0.00</span>
            <span class="total-cell text-sky">$0.00</span>
          </div>
          <div class="table-row" id="row-r-72">
            <span class="font-bold">72%</span>
            <span class="tax-cell">$0.00</span>
            <span class="total-cell text-sky">$0.00</span>
          </div>
        </div>
      </div>

      <!-- Alternate Cost Real Mode -->
      <div class="section-card">
        <label class="toggle-row">
          <input type="checkbox" id="chk-alt-calc">
          <span class="toggle-slider"></span>
          <span class="card-title">Costo Real de Compra</span>
        </label>
        <div id="alt-box" class="mt-3 hidden">
          <div class="input-field mb-2">
            <label>FOB Real Desembolsado ($)</label>
            <input type="number" id="in-alt-fob" value="11000" step="any">
          </div>
          <div class="metric-card bg-slate-900 border-slate-800">
            <span class="metric-label">Costo Real Integrado</span>
            <span class="metric-value text-emerald" id="res-alt-total">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentRate = 37;

  const inFob = containerEl.querySelector('#in-fob');
  const chkFlete = containerEl.querySelector('#chk-flete');
  const inFlete = containerEl.querySelector('#in-flete');
  const boxFlete = containerEl.querySelector('#box-flete');
  const chkSeguro = containerEl.querySelector('#chk-seguro');
  const inPctSeguro = containerEl.querySelector('#in-pct-seguro');
  const boxSeguro = containerEl.querySelector('#box-seguro');
  const resSeguroCalc = containerEl.querySelector('#res-seguro-calc');

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

    [37, 52, 72].forEach(r => {
      const row = containerEl.querySelector(`#row-r-${r}`);
      if (row) {
        const rowTax = cif * (r / 100);
        row.querySelector('.tax-cell').textContent = `$${rowTax.toFixed(2)}`;
        row.querySelector('.total-cell').textContent = `$${(cif + rowTax).toFixed(2)}`;
      }
    });

    if (chkAlt.checked) {
      const altFobVal = parseFloat(inAltFob.value) || 0;
      const altSeg = chkSeguro.checked ? (altFobVal * (pctSeg / 100)) : 0;
      const altTotal = altFobVal + flete + altSeg + tax;
      resAltTotal.textContent = `$${altTotal.toFixed(2)}`;
    }
  };

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

  containerEl.querySelectorAll('#tariff-control .segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      containerEl.querySelectorAll('#tariff-control .segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRate = parseFloat(btn.dataset.rate) || 37;
      calculate();
    });
  });

  calculate();
}
