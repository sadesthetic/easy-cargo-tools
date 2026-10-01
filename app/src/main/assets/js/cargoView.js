import { calculateBestPacking, convertVolume } from './packing.js';
import { CargoVisualizer3D, MAX_RENDER_BOXES } from './visualizer.js';
import { Icons } from './icons.js';
import { t } from './i18n.js';

export function initCargoView(containerEl) {
  containerEl.innerHTML = `
    <div class="view-content">
      <!-- 3D Canvas Viewport Card -->
      <div class="canvas-card" id="canvas-card">
        <div id="canvas-3d" class="canvas-3d"></div>
        
        <div class="floating-controls">
          <button class="pill-btn" id="btn-fullscreen" title="Pantalla completa">${Icons.maximize}</button>
          <button class="pill-btn" id="btn-reset-cam" title="Reset">${Icons.reset}</button>
        </div>

        <div class="canvas-badge" id="canvas-badge">0 / 0%</div>
      </div>

      <!-- Limiter Warning Notice (> 800 boxes) -->
      <div id="limit-banner" class="warning-banner hidden">
        <div class="warning-header">
          <span class="warning-icon">${Icons.warningSign}</span>
          <span class="warning-title">${t('limitNotice')}</span>
        </div>
        <button class="warning-btn" id="btn-toggle-limit">${t('btnRenderAll')}</button>
      </div>

      <!-- Capacity Overflow Notice -->
      <div id="overflow-banner" class="danger-banner hidden">
        <span class="danger-icon">${Icons.alert}</span>
        <span class="danger-title">${t('volExceeded')}</span>
      </div>

      <!-- Live Metrics Strip -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">${t('units')}</span>
          <span class="metric-value text-sky" id="metric-units">0</span>
          <span class="metric-sub" id="metric-layout">0×0×0</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">${t('efficiency')}</span>
          <span class="metric-value text-emerald" id="metric-efficiency">0.0%</span>
          <div class="progress-track mt-1"><div class="progress-fill bg-emerald" id="bar-efficiency" style="width: 0%"></div></div>
        </div>
        <div class="metric-card">
          <span class="metric-label">${t('occupied')}</span>
          <span class="metric-value" id="metric-used">0 ft³</span>
          <span class="metric-sub text-rose" id="metric-waste">0 ${t('empty')}</span>
        </div>
      </div>

      <!-- Presets: Container only -->
      <div class="section-card">
        <div class="presets-row">
          <button class="preset-chip" data-preset="20ft">${t('cont20')}</button>
          <button class="preset-chip" data-preset="40ft">${t('cont40')}</button>
        </div>
      </div>

      <!-- Form Inputs: Container -->
      <div class="section-card">
        <div class="card-header">
          <span class="card-title">${t('container')}</span>
          <div class="unit-group" id="container-unit-group">
            <button class="unit-btn active" data-unit="in">in</button>
            <button class="unit-btn" data-unit="cm">cm</button>
            <button class="unit-btn" data-unit="ft">ft</button>
          </div>
        </div>
        <div class="inputs-3col">
          <div class="input-field"><label>${t('length')}</label><input type="number" id="c-length" value="232" step="any"></div>
          <div class="input-field"><label>${t('width')}</label><input type="number" id="c-width" value="92" step="any"></div>
          <div class="input-field"><label>${t('height')}</label><input type="number" id="c-height" value="94" step="any"></div>
        </div>
      </div>

      <!-- Form Inputs: Item 1 (Azul) -->
      <div class="section-card">
        <div class="card-header">
          <span class="card-title text-sky">${t('box1')}</span>
          <div class="unit-group" id="item-unit-group">
            <button class="unit-btn active" data-unit="in">in</button>
            <button class="unit-btn" data-unit="cm">cm</button>
            <button class="unit-btn" data-unit="ft">ft</button>
          </div>
        </div>
        <div class="inputs-3col">
          <div class="input-field"><label>${t('length')}</label><input type="number" id="i1-length" value="20" step="any"></div>
          <div class="input-field"><label>${t('width')}</label><input type="number" id="i1-width" value="16" step="any"></div>
          <div class="input-field"><label>${t('height')}</label><input type="number" id="i1-height" value="14" step="any"></div>
        </div>
      </div>

      <!-- Item 2 (Verde) -->
      <div class="section-card">
        <div class="card-header">
          <label class="toggle-row">
            <input type="checkbox" id="toggle-item2">
            <span class="toggle-slider"></span>
            <span class="card-title text-emerald">${t('box2')}</span>
          </label>
        </div>
        <div id="item2-fields" class="inputs-3col hidden">
          <div class="input-field"><label>${t('length')}</label><input type="number" id="i2-length" value="18" step="any"></div>
          <div class="input-field"><label>${t('width')}</label><input type="number" id="i2-width" value="12" step="any"></div>
          <div class="input-field"><label>${t('height')}</label><input type="number" id="i2-height" value="10" step="any"></div>
        </div>
      </div>

      <!-- Item 3 (Naranja) -->
      <div class="section-card">
        <div class="card-header">
          <label class="toggle-row">
            <input type="checkbox" id="toggle-item3">
            <span class="toggle-slider"></span>
            <span class="card-title text-amber">${t('box3')}</span>
          </label>
        </div>
        <div id="item3-fields" class="inputs-3col hidden">
          <div class="input-field"><label>${t('length')}</label><input type="number" id="i3-length" value="14" step="any"></div>
          <div class="input-field"><label>${t('width')}</label><input type="number" id="i3-width" value="10" step="any"></div>
          <div class="input-field"><label>${t('height')}</label><input type="number" id="i3-height" value="8" step="any"></div>
        </div>
      </div>

      <!-- Option: Error Margin -->
      <div class="section-card">
        <label class="toggle-row">
          <input type="checkbox" id="toggle-margin">
          <span class="toggle-slider"></span>
          <span class="toggle-label">+0.5 Margen</span>
        </label>
      </div>
    </div>
  `;

  const canvasCard = containerEl.querySelector('#canvas-card');
  const canvasEl = containerEl.querySelector('#canvas-3d');
  const visualizer = new CargoVisualizer3D(canvasEl);

  let containerUnit = 'in';
  let itemUnit = 'in';
  let errorMargin = false;
  let multiItem2 = false;
  let multiItem3 = false;
  let isFullscreen = false;
  let lastPackingResult = null;
  let lastContainer = null;

  const cL = containerEl.querySelector('#c-length');
  const cW = containerEl.querySelector('#c-width');
  const cH = containerEl.querySelector('#c-height');
  const i1L = containerEl.querySelector('#i1-length');
  const i1W = containerEl.querySelector('#i1-width');
  const i1H = containerEl.querySelector('#i1-height');
  const i2L = containerEl.querySelector('#i2-length');
  const i2W = containerEl.querySelector('#i2-width');
  const i2H = containerEl.querySelector('#i2-height');
  const i3L = containerEl.querySelector('#i3-length');
  const i3W = containerEl.querySelector('#i3-width');
  const i3H = containerEl.querySelector('#i3-height');

  const item2Toggle = containerEl.querySelector('#toggle-item2');
  const item2Fields = containerEl.querySelector('#item2-fields');
  const item3Toggle = containerEl.querySelector('#toggle-item3');
  const item3Fields = containerEl.querySelector('#item3-fields');
  const marginToggle = containerEl.querySelector('#toggle-margin');

  const metricUnits = containerEl.querySelector('#metric-units');
  const metricLayout = containerEl.querySelector('#metric-layout');
  const metricEff = containerEl.querySelector('#metric-efficiency');
  const barEff = containerEl.querySelector('#bar-efficiency');
  const metricUsed = containerEl.querySelector('#metric-used');
  const metricWaste = containerEl.querySelector('#metric-waste');
  const canvasBadge = containerEl.querySelector('#canvas-badge');
  const limitBanner = containerEl.querySelector('#limit-banner');
  const btnToggleLimit = containerEl.querySelector('#btn-toggle-limit');
  const overflowBanner = containerEl.querySelector('#overflow-banner');

  const runCalculation = () => {
    const cont = { length: cL.value, width: cW.value, height: cH.value };
    const it1 = { length: i1L.value, width: i1W.value, height: i1H.value };
    const it2 = multiItem2 ? { length: i2L.value, width: i2W.value, height: i2H.value } : null;
    const it3 = multiItem3 ? { length: i3L.value, width: i3W.value, height: i3H.value } : null;

    const res = calculateBestPacking({
      container: cont,
      item: it1,
      secondaryItem: it2,
      tertiaryItem: it3,
      errorMargin,
      containerUnit,
      itemUnit
    });

    lastPackingResult = res;
    lastContainer = cont;

    metricUnits.textContent = res.count;

    const counts = [];
    if (res.count1 > 0) counts.push(`i1:${res.count1}`);
    if (res.count2 > 0) counts.push(`i2:${res.count2}`);
    if (res.count3 > 0) counts.push(`i3:${res.count3}`);
    metricLayout.textContent = counts.length > 1 ? counts.join(' · ') : `${res.layout[0]}×${res.layout[1]}×${res.layout[2]}`;

    metricEff.textContent = `${res.efficiency.toFixed(1)}%`;
    barEff.style.width = `${Math.min(res.efficiency, 100)}%`;
    barEff.className = `progress-fill ${res.efficiency > 80 ? 'bg-emerald' : res.efficiency > 50 ? 'bg-amber' : 'bg-rose'}`;

    const usedFt = convertVolume(res.usedVol, containerUnit, 'ft3');
    const wasteFt = convertVolume(res.waste, containerUnit, 'ft3');
    metricUsed.textContent = `${usedFt.toFixed(1)} ft³`;
    metricWaste.textContent = `${wasteFt.toFixed(1)} ft³`;
    canvasBadge.textContent = `${res.count} U · ${res.efficiency.toFixed(1)}%`;

    // 800-box Limiter notification
    if (res.count > MAX_RENDER_BOXES) {
      limitBanner.classList.remove('hidden');
      btnToggleLimit.textContent = visualizer.renderAll ? t('btnRenderSafe') : t('btnRenderAll');
    } else {
      limitBanner.classList.add('hidden');
    }

    // Capacity overflow notification
    overflowBanner.classList.toggle('hidden', !res.isVolumeExceeded);

    visualizer.updateScene(cont, res);
  };

  [cL, cW, cH, i1L, i1W, i1H, i2L, i2W, i2H, i3L, i3W, i3H].forEach(inp => inp.addEventListener('input', runCalculation));

  item2Toggle.addEventListener('change', () => {
    multiItem2 = item2Toggle.checked;
    item2Fields.classList.toggle('hidden', !multiItem2);
    runCalculation();
  });

  item3Toggle.addEventListener('change', () => {
    multiItem3 = item3Toggle.checked;
    item3Fields.classList.toggle('hidden', !multiItem3);
    runCalculation();
  });

  marginToggle.addEventListener('change', () => {
    errorMargin = marginToggle.checked;
    runCalculation();
  });

  btnToggleLimit.addEventListener('click', () => {
    visualizer.renderAll = !visualizer.renderAll;
    btnToggleLimit.textContent = visualizer.renderAll ? t('btnRenderSafe') : t('btnRenderAll');
    if (lastContainer && lastPackingResult) {
      visualizer.updateScene(lastContainer, lastPackingResult);
    }
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

  // Container presets only
  const presets = {
    '20ft': { l: 232, w: 92, h: 94, u: 'in' },
    '40ft': { l: 474, w: 92, h: 94, u: 'in' }
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

  // Reset button
  containerEl.querySelector('#btn-reset-cam').addEventListener('click', () => {
    visualizer.focusCamera(parseFloat(cL.value)||20, parseFloat(cH.value)||20, parseFloat(cW.value)||20);
  });

  // Fullscreen button
  const fsBtn = containerEl.querySelector('#btn-fullscreen');
  fsBtn.addEventListener('click', () => {
    isFullscreen = !isFullscreen;
    canvasCard.classList.toggle('canvas-fullscreen', isFullscreen);
    fsBtn.innerHTML = isFullscreen ? Icons.minimize : Icons.maximize;
    setTimeout(() => visualizer.handleResize(), 100);
  });

  runCalculation();
}
