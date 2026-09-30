import { calculateBestPacking, convertUnit, convertVolume } from './packing.js';
import { CargoVisualizer3D } from './visualizer.js';
import { Icons } from './icons.js';

export function initCargoView(containerEl) {
  containerEl.innerHTML = `
    <div class="view-content">
      <!-- 3D Canvas Viewport Card -->
      <div class="canvas-card">
        <div id="canvas-3d" class="canvas-3d"></div>
        
        <div class="floating-controls">
          <button class="pill-btn" id="btn-cam-iso" title="Iso">${Icons.camera}</button>
          <button class="pill-btn" id="btn-cam-top" title="Top">T</button>
          <button class="pill-btn" id="btn-cam-front" title="Front">F</button>
          <button class="pill-btn" id="btn-toggle-wire" title="Wire">${Icons.wireframe}</button>
          <button class="pill-btn" id="btn-reset-cam" title="Reset">${Icons.reset}</button>
        </div>

        <div class="canvas-badge" id="canvas-badge">0 / 0%</div>
      </div>

      <!-- Live Metrics Strip -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Unidades</span>
          <span class="metric-value text-sky" id="metric-units">0</span>
          <span class="metric-sub" id="metric-layout">0×0×0</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Eficiencia</span>
          <span class="metric-value text-emerald" id="metric-efficiency">0.0%</span>
          <div class="progress-track mt-1"><div class="progress-fill bg-emerald" id="bar-efficiency" style="width: 0%"></div></div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Ocupado</span>
          <span class="metric-value" id="metric-used">0 ft³</span>
          <span class="metric-sub text-rose" id="metric-waste">0 vacio</span>
        </div>
      </div>

      <!-- Presets & Quick Actions -->
      <div class="section-card">
        <div class="presets-row">
          <button class="preset-chip" data-preset="20ft">Contenedor 20'</button>
          <button class="preset-chip" data-preset="40ft">Contenedor 40'</button>
          <button class="preset-chip" data-preset="us-pallet">Pallet US</button>
          <button class="preset-chip" data-preset="eu-pallet">Pallet Euro</button>
        </div>
      </div>

      <!-- Form Inputs: Container -->
      <div class="section-card">
        <div class="card-header">
          <span class="card-title">Contenedor</span>
          <div class="unit-group" id="container-unit-group">
            <button class="unit-btn active" data-unit="in">in</button>
            <button class="unit-btn" data-unit="cm">cm</button>
            <button class="unit-btn" data-unit="ft">ft</button>
          </div>
        </div>
        <div class="inputs-3col">
          <div class="input-field"><label>Largo</label><input type="number" id="c-length" value="20" step="any"></div>
          <div class="input-field"><label>Ancho</label><input type="number" id="c-width" value="20" step="any"></div>
          <div class="input-field"><label>Alto</label><input type="number" id="c-height" value="20" step="any"></div>
        </div>
      </div>

      <!-- Form Inputs: Item 1 -->
      <div class="section-card">
        <div class="card-header">
          <span class="card-title">Caja / Bulto 1</span>
          <div class="unit-group" id="item-unit-group">
            <button class="unit-btn active" data-unit="in">in</button>
            <button class="unit-btn" data-unit="cm">cm</button>
            <button class="unit-btn" data-unit="ft">ft</button>
          </div>
        </div>
        <div class="inputs-3col">
          <div class="input-field"><label>Largo</label><input type="number" id="i1-length" value="10" step="any"></div>
          <div class="input-field"><label>Ancho</label><input type="number" id="i1-width" value="6" step="any"></div>
          <div class="input-field"><label>Alto</label><input type="number" id="i1-height" value="4" step="any"></div>
        </div>
      </div>

      <!-- Multi-Item Toggle & Item 2 -->
      <div class="section-card">
        <div class="card-header">
          <label class="toggle-row">
            <input type="checkbox" id="toggle-item2">
            <span class="toggle-slider"></span>
            <span class="card-title">Segundo Bulto</span>
          </label>
        </div>
        <div id="item2-fields" class="inputs-3col hidden">
          <div class="input-field"><label>Largo</label><input type="number" id="i2-length" value="8" step="any"></div>
          <div class="input-field"><label>Ancho</label><input type="number" id="i2-width" value="5" step="any"></div>
          <div class="input-field"><label>Alto</label><input type="number" id="i2-height" value="3" step="any"></div>
        </div>
      </div>

      <!-- Options: Pallet & Error Margin -->
      <div class="section-card">
        <div class="checkboxes-grid">
          <label class="toggle-row">
            <input type="checkbox" id="toggle-pallet">
            <span class="toggle-slider"></span>
            <span class="toggle-label">Base Pallet</span>
          </label>
          <label class="toggle-row">
            <input type="checkbox" id="toggle-margin">
            <span class="toggle-slider"></span>
            <span class="toggle-label">+0.5 Margen</span>
          </label>
        </div>
      </div>

      <!-- Optimization Tip Card -->
      <div id="tip-card" class="tip-banner hidden">
        ${Icons.spark}
        <span id="tip-text" class="tip-text"></span>
      </div>
    </div>
  `;

  const canvasEl = containerEl.querySelector('#canvas-3d');
  const visualizer = new CargoVisualizer3D(canvasEl);

  let containerUnit = 'in';
  let itemUnit = 'in';
  let palletMode = false;
  let errorMargin = false;
  let multiItem = false;

  const cL = containerEl.querySelector('#c-length');
  const cW = containerEl.querySelector('#c-width');
  const cH = containerEl.querySelector('#c-height');
  const i1L = containerEl.querySelector('#i1-length');
  const i1W = containerEl.querySelector('#i1-width');
  const i1H = containerEl.querySelector('#i1-height');
  const i2L = containerEl.querySelector('#i2-length');
  const i2W = containerEl.querySelector('#i2-width');
  const i2H = containerEl.querySelector('#i2-height');
  const item2Toggle = containerEl.querySelector('#toggle-item2');
  const item2Fields = containerEl.querySelector('#item2-fields');
  const palletToggle = containerEl.querySelector('#toggle-pallet');
  const marginToggle = containerEl.querySelector('#toggle-margin');

  const metricUnits = containerEl.querySelector('#metric-units');
  const metricLayout = containerEl.querySelector('#metric-layout');
  const metricEff = containerEl.querySelector('#metric-efficiency');
  const barEff = containerEl.querySelector('#bar-efficiency');
  const metricUsed = containerEl.querySelector('#metric-used');
  const metricWaste = containerEl.querySelector('#metric-waste');
  const canvasBadge = containerEl.querySelector('#canvas-badge');
  const tipCard = containerEl.querySelector('#tip-card');
  const tipText = containerEl.querySelector('#tip-text');

  const runCalculation = () => {
    const cont = { length: cL.value, width: cW.value, height: cH.value };
    const it1 = { length: i1L.value, width: i1W.value, height: i1H.value };
    const it2 = multiItem ? { length: i2L.value, width: i2W.value, height: i2H.value } : null;

    const res = calculateBestPacking({
      container: cont,
      item: it1,
      secondaryItem: it2,
      palletMode,
      errorMargin,
      containerUnit,
      itemUnit
    });

    metricUnits.textContent = res.count;
    metricLayout.textContent = multiItem ? `i1:${res.count1} · i2:${res.count2}` : `${res.layout[0]}×${res.layout[1]}×${res.layout[2]}`;
    metricEff.textContent = `${res.efficiency.toFixed(1)}%`;
    barEff.style.width = `${Math.min(res.efficiency, 100)}%`;
    barEff.className = `progress-fill ${res.efficiency > 80 ? 'bg-emerald' : res.efficiency > 50 ? 'bg-amber' : 'bg-rose'}`;

    const usedFt = convertVolume(res.usedVol, containerUnit, 'ft3');
    const wasteFt = convertVolume(res.waste, containerUnit, 'ft3');
    metricUsed.textContent = `${usedFt.toFixed(1)} ft³`;
    metricWaste.textContent = `${wasteFt.toFixed(1)} ft³`;
    canvasBadge.textContent = `${res.count} U · ${res.efficiency.toFixed(1)}%`;

    if (res.count > 0 && parseFloat(cont.length) % res.orientation.length > 0) {
      const diff = (parseFloat(cont.length) % res.orientation.length).toFixed(1);
      tipText.textContent = `Ajustar longitud en -${diff}${containerUnit} optimizará espacio muerto.`;
      tipCard.classList.remove('hidden');
    } else {
      tipCard.classList.add('hidden');
    }

    visualizer.updateScene(cont, res, palletMode);
  };

  [cL, cW, cH, i1L, i1W, i1H, i2L, i2W, i2H].forEach(inp => inp.addEventListener('input', runCalculation));

  item2Toggle.addEventListener('change', () => {
    multiItem = item2Toggle.checked;
    item2Fields.classList.toggle('hidden', !multiItem);
    runCalculation();
  });

  palletToggle.addEventListener('change', () => {
    palletMode = palletToggle.checked;
    runCalculation();
  });

  marginToggle.addEventListener('change', () => {
    errorMargin = marginToggle.checked;
    runCalculation();
  });

  // Unit switchers
  const bindUnitSwitch = (groupId, setter) => {
    const btns = containerEl.querySelectorAll(`#${groupId} .unit-btn`);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      setter(b.dataset.unit);
      runCalculation();
    }));
  };
  bindUnitSwitch('container-unit-group', u => containerUnit = u);
  bindUnitSwitch('item-unit-group', u => itemUnit = u);

  // Preset chips
  const presets = {
    '20ft': { l: 232, w: 92, h: 94, u: 'in' },
    '40ft': { l: 474, w: 92, h: 94, u: 'in' },
    'us-pallet': { l: 48, w: 40, h: 48, u: 'in' },
    'eu-pallet': { l: 120, w: 80, h: 144, u: 'cm' }
  };
  containerEl.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const p = presets[chip.dataset.preset];
      if (p) {
        cL.value = p.l; cW.value = p.w; cH.value = p.h;
        containerUnit = p.u;
        containerEl.querySelectorAll('#container-unit-group .unit-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.unit === p.u);
        });
        runCalculation();
      }
    });
  });

  // Camera buttons
  containerEl.querySelector('#btn-cam-iso').addEventListener('click', () => visualizer.setCameraView('iso'));
  containerEl.querySelector('#btn-cam-top').addEventListener('click', () => visualizer.setCameraView('top'));
  containerEl.querySelector('#btn-cam-front').addEventListener('click', () => visualizer.setCameraView('front'));
  containerEl.querySelector('#btn-toggle-wire').addEventListener('click', () => visualizer.toggleWireframe());
  containerEl.querySelector('#btn-reset-cam').addEventListener('click', () => visualizer.focusCamera(parseFloat(cL.value)||20, parseFloat(cH.value)||20, parseFloat(cW.value)||20));

  runCalculation();
}
