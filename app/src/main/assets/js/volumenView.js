import { Icons } from './icons.js';

export function initVolumenView(containerEl) {
  containerEl.innerHTML = `
    <div class="view-content">
      <div class="view-header">
        <h2 class="view-title">Calculadora Volumétrica</h2>
        <button class="pill-btn" id="btn-toggle-compare" title="Comparar">${Icons.compare}</button>
      </div>

      <!-- Main Box Card -->
      <div class="section-card" id="card-box-a">
        <div class="card-header">
          <span class="card-title">Configuración Principal</span>
          <div class="unit-group" id="vol-mode-a">
            <button class="unit-btn active" data-mode="3d">3D</button>
            <button class="unit-btn" data-mode="vol">CuFt</button>
          </div>
        </div>

        <div class="input-field mb-3">
          <label>Precio por CuFt ($/ft³)</label>
          <input type="number" id="a-price" value="25" step="any">
        </div>

        <div id="a-dim-fields" class="inputs-3col mb-3">
          <div class="input-field"><label>Largo (in)</label><input type="number" id="a-l" value="18" step="any"></div>
          <div class="input-field"><label>Ancho (in)</label><input type="number" id="a-w" value="14" step="any"></div>
          <div class="input-field"><label>Alto (in)</label><input type="number" id="a-h" value="12" step="any"></div>
        </div>

        <div id="a-vol-field" class="input-field mb-3 hidden">
          <label>Volumen Directo (ft³)</label>
          <input type="number" id="a-direct-vol" value="1.75" step="any">
        </div>

        <!-- Calculated Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Total Flete</span>
            <span class="metric-value text-sky" id="a-res-total">$0.00</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Volumen</span>
            <span class="metric-value" id="a-res-cuft">0.00 ft³</span>
            <span class="metric-sub" id="a-res-liters">0.00 L</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Costo / Litro</span>
            <span class="metric-value text-emerald" id="a-res-cpl">$0.00</span>
          </div>
        </div>
      </div>

      <!-- Comparison Card (Optional) -->
      <div class="section-card hidden" id="card-box-b">
        <div class="card-header">
          <span class="card-title text-amber">Comparativa</span>
          <button class="icon-btn-sm" id="btn-close-compare">${Icons.trash}</button>
        </div>

        <div class="input-field mb-3">
          <label>Precio por CuFt ($/ft³)</label>
          <input type="number" id="b-price" value="22" step="any">
        </div>

        <div class="inputs-3col mb-3">
          <div class="input-field"><label>Largo (in)</label><input type="number" id="b-l" value="20" step="any"></div>
          <div class="input-field"><label>Ancho (in)</label><input type="number" id="b-w" value="16" step="any"></div>
          <div class="input-field"><label>Alto (in)</label><input type="number" id="b-h" value="14" step="any"></div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Total Flete</span>
            <span class="metric-value text-amber" id="b-res-total">$0.00</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Volumen</span>
            <span class="metric-value" id="b-res-cuft">0.00 ft³</span>
            <span class="metric-sub" id="b-res-liters">0.00 L</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Diferencia</span>
            <span class="metric-value" id="diff-res-val">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  `;

  let modeA = '3d';
  let comparing = false;

  const aPrice = containerEl.querySelector('#a-price');
  const aL = containerEl.querySelector('#a-l');
  const aW = containerEl.querySelector('#a-w');
  const aH = containerEl.querySelector('#a-h');
  const aDirect = containerEl.querySelector('#a-direct-vol');
  const aDimFields = containerEl.querySelector('#a-dim-fields');
  const aVolField = containerEl.querySelector('#a-vol-field');

  const aResTotal = containerEl.querySelector('#a-res-total');
  const aResCuft = containerEl.querySelector('#a-res-cuft');
  const aResLiters = containerEl.querySelector('#a-res-liters');
  const aResCpl = containerEl.querySelector('#a-res-cpl');

  const cardB = containerEl.querySelector('#card-box-b');
  const bPrice = containerEl.querySelector('#b-price');
  const bL = containerEl.querySelector('#b-l');
  const bW = containerEl.querySelector('#b-w');
  const bH = containerEl.querySelector('#b-h');
  const bResTotal = containerEl.querySelector('#b-res-total');
  const bResCuft = containerEl.querySelector('#b-res-cuft');
  const bResLiters = containerEl.querySelector('#b-res-liters');
  const diffResVal = containerEl.querySelector('#diff-res-val');

  const calcA = () => {
    const p = parseFloat(aPrice.value) || 0;
    let cuFt = 0;
    if (modeA === 'vol') {
      cuFt = parseFloat(aDirect.value) || 0;
    } else {
      const l = parseFloat(aL.value) || 0;
      const w = parseFloat(aW.value) || 0;
      const h = parseFloat(aH.value) || 0;
      cuFt = (l * w * h) / 1728;
    }

    const total = cuFt * p;
    const liters = cuFt * 28.3168;
    const cpl = liters > 0 ? total / liters : 0;

    aResTotal.textContent = `$${total.toFixed(2)}`;
    aResCuft.textContent = `${cuFt.toFixed(2)} ft³`;
    aResLiters.textContent = `${liters.toFixed(1)} L`;
    aResCpl.textContent = `$${cpl.toFixed(3)}/L`;

    if (comparing) calcB(total);
  };

  const calcB = (totalA) => {
    const p = parseFloat(bPrice.value) || 0;
    const l = parseFloat(bL.value) || 0;
    const w = parseFloat(bW.value) || 0;
    const h = parseFloat(bH.value) || 0;
    const cuFt = (l * w * h) / 1728;
    const total = cuFt * p;
    const liters = cuFt * 28.3168;

    bResTotal.textContent = `$${total.toFixed(2)}`;
    bResCuft.textContent = `${cuFt.toFixed(2)} ft³`;
    bResLiters.textContent = `${liters.toFixed(1)} L`;

    const diff = total - totalA;
    diffResVal.textContent = `${diff >= 0 ? '+' : ''}$${diff.toFixed(2)}`;
    diffResVal.className = `metric-value ${diff < 0 ? 'text-emerald' : 'text-rose'}`;
  };

  [aPrice, aL, aW, aH, aDirect].forEach(i => i.addEventListener('input', calcA));
  [bPrice, bL, bW, bH].forEach(i => i.addEventListener('input', () => calcA()));

  containerEl.querySelectorAll('#vol-mode-a .unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      containerEl.querySelectorAll('#vol-mode-a .unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      modeA = btn.dataset.mode;
      aDimFields.classList.toggle('hidden', modeA === 'vol');
      aVolField.classList.toggle('hidden', modeA !== 'vol');
      calcA();
    });
  });

  const toggleCompare = (show) => {
    comparing = show;
    cardB.classList.toggle('hidden', !comparing);
    if (comparing) calcA();
  };

  containerEl.querySelector('#btn-toggle-compare').addEventListener('click', () => toggleCompare(!comparing));
  containerEl.querySelector('#btn-close-compare').addEventListener('click', () => toggleCompare(false));

  calcA();
}
