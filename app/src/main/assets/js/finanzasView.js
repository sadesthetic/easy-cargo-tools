export function initFinanzasView(containerEl) {
  containerEl.innerHTML = `
    <div class="view-content">
      <div class="view-header">
        <h2 class="view-title">Financiamiento & Intereses</h2>
        <span class="badge-pill bg-sky-soft text-sky" id="badge-apy">0.00% APY</span>
      </div>

      <!-- Hero Total Card -->
      <div class="hero-card">
        <span class="hero-label">Total a Reembolsar</span>
        <div class="hero-value text-sky" id="res-fin-total">$0.00</div>
        <div class="hero-sub text-emerald" id="res-fin-interest">Interés: $0.00</div>

        <div class="progress-bar-dual mt-3">
          <div class="progress-segment bg-sky" id="bar-principal" style="width: 80%"></div>
          <div class="progress-segment bg-rose" id="bar-interest" style="width: 20%"></div>
        </div>
        <div class="bar-labels">
          <span id="lbl-principal">$0 Principal</span>
          <span id="lbl-interest">$0 Intereses</span>
        </div>
      </div>

      <!-- Inputs Card -->
      <div class="section-card">
        <div class="input-field mb-3">
          <label>Capital / Principal ($ USD)</label>
          <input type="number" id="in-principal" value="1000" step="any">
        </div>

        <div class="inputs-2col mb-3">
          <div class="input-field">
            <label>Tasa Anual APR (%)</label>
            <input type="number" id="in-apr" value="12" step="any">
          </div>
          <div class="input-field">
            <label>Plazo (Meses)</label>
            <input type="number" id="in-term" value="12" step="1">
          </div>
        </div>

        <div class="mb-2">
          <label class="input-label-sm">Modalidad de Pago</label>
          <div class="segmented-control" id="amort-control">
            <button class="segment-btn active" data-type="amortized">Cuota Mensual</button>
            <button class="segment-btn" data-type="bullet">Pago Único (Bullet)</button>
          </div>
        </div>
      </div>

      <!-- Breakdown Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Cuota Periódica</span>
          <span class="metric-value text-emerald" id="res-monthly-pay">$0.00</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Costo Financiero</span>
          <span class="metric-value text-rose" id="res-cost-pct">0.0%</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Plazo Final</span>
          <span class="metric-value" id="res-term-display">12 meses</span>
        </div>
      </div>
    </div>
  `;

  let mode = 'amortized';

  const inPrincipal = containerEl.querySelector('#in-principal');
  const inApr = containerEl.querySelector('#in-apr');
  const inTerm = containerEl.querySelector('#in-term');

  const badgeApy = containerEl.querySelector('#badge-apy');
  const resTotal = containerEl.querySelector('#res-fin-total');
  const resInterest = containerEl.querySelector('#res-fin-interest');
  const barPrincipal = containerEl.querySelector('#bar-principal');
  const barInterest = containerEl.querySelector('#bar-interest');
  const lblPrincipal = containerEl.querySelector('#lbl-principal');
  const lblInterest = containerEl.querySelector('#lbl-interest');

  const resMonthlyPay = containerEl.querySelector('#res-monthly-pay');
  const resCostPct = containerEl.querySelector('#res-cost-pct');
  const resTermDisplay = containerEl.querySelector('#res-term-display');

  const calculate = () => {
    const p = parseFloat(inPrincipal.value) || 0;
    const rate = parseFloat(inApr.value) || 0;
    const months = parseFloat(inTerm.value) || 0;

    if (p <= 0 || rate < 0 || months <= 0) {
      resTotal.textContent = '$0.00';
      resInterest.textContent = 'Interés: $0.00';
      resMonthlyPay.textContent = '$0.00';
      resCostPct.textContent = '0.0%';
      badgeApy.textContent = '0.00% APY';
      return;
    }

    let finalTotal = 0;
    let interestEarned = 0;
    let monthlyPay = 0;
    let apy = rate;

    if (mode === 'amortized') {
      const r = (rate / 100) / 12;
      if (r > 0 && months > 0) {
        monthlyPay = p * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      } else {
        monthlyPay = p / months;
      }
      finalTotal = monthlyPay * months;
      interestEarned = finalTotal - p;
      apy = (Math.pow(1 + (rate / 1200), 12) - 1) * 100;
    } else {
      const years = months / 12;
      interestEarned = p * (rate / 100) * years;
      finalTotal = p + interestEarned;
      monthlyPay = finalTotal;
      apy = rate;
    }

    badgeApy.textContent = `${apy.toFixed(2)}% APY`;
    resTotal.textContent = `$${finalTotal.toFixed(2)}`;
    resInterest.textContent = `Interés: $${interestEarned.toFixed(2)}`;
    resMonthlyPay.textContent = `$${monthlyPay.toFixed(2)}`;
    resCostPct.textContent = `${((interestEarned / p) * 100).toFixed(1)}%`;
    resTermDisplay.textContent = `${months} meses`;

    const pctP = (p / finalTotal) * 100;
    const pctI = (interestEarned / finalTotal) * 100;
    barPrincipal.style.width = `${pctP}%`;
    barInterest.style.width = `${pctI}%`;
    lblPrincipal.textContent = `$${p.toFixed(0)} Capital`;
    lblInterest.textContent = `$${interestEarned.toFixed(0)} Interés`;
  };

  [inPrincipal, inApr, inTerm].forEach(i => i.addEventListener('input', calculate));

  containerEl.querySelectorAll('#amort-control .segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      containerEl.querySelectorAll('#amort-control .segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.type;
      calculate();
    });
  });

  calculate();
}
