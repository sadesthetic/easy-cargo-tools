export const convertUnit = (val, from, to) => {
  if (from === to) return val;
  let cm = val;
  if (from === 'in') cm = val * 2.54;
  else if (from === 'ft') cm = val * 30.48;

  if (to === 'cm') return cm;
  if (to === 'in') return cm / 2.54;
  if (to === 'ft') return cm / 30.48;
  return val;
};

export const convertVolume = (vol, fromUnit, toCubicUnit) => {
  let volInInches3 = vol;
  if (fromUnit === 'cm') volInInches3 = vol / 16.387064;
  else if (fromUnit === 'ft') volInInches3 = vol * 1728;

  if (toCubicUnit === 'in3') return volInInches3;
  if (toCubicUnit === 'ft3') return volInInches3 / 1728;
  if (toCubicUnit === 'm3') return volInInches3 * 0.000016387064;
  return vol;
};

const getOrientations = (l, w, h) => [
  [l, w, h], [l, h, w], [w, l, h],
  [w, h, l], [h, l, w], [h, w, l]
];

export const calculateBestPacking = ({
  container,
  item,
  secondaryItem,
  palletMode = false,
  limitMode = 'volume',
  maxCount1 = '',
  maxCount2 = '',
  maxVolume1 = '',
  maxVolume2 = '',
  distributionMode = 'optimal',
  errorMargin = false,
  containerUnit = 'in',
  itemUnit = 'in',
  volumeUnit = 'ft3'
}) => {
  const cL = parseFloat(container.length) || 0;
  const cW = parseFloat(container.width) || 0;
  let cH = parseFloat(container.height) || 0;

  if (cL <= 0 || cW <= 0 || cH <= 0) {
    return { count: 0, count1: 0, count2: 0, items: [], efficiency: 0, waste: 0, layout: [0,0,0], orientation: { length: 0, width: 0, height: 0 } };
  }

  const palletHeight = palletMode ? convertUnit(6, 'in', containerUnit) : 0;
  cH = Math.max(0, cH - palletHeight);

  const iL1 = convertUnit(parseFloat(item.length) || 0, itemUnit, containerUnit);
  const iW1 = convertUnit(parseFloat(item.width) || 0, itemUnit, containerUnit);
  const iH1 = convertUnit(parseFloat(item.height) || 0, itemUnit, containerUnit);

  const hasSecondary = secondaryItem && parseFloat(secondaryItem.length) > 0;
  const iL2 = hasSecondary ? convertUnit(parseFloat(secondaryItem.length) || 0, itemUnit, containerUnit) : 0;
  const iW2 = hasSecondary ? convertUnit(parseFloat(secondaryItem.width) || 0, itemUnit, containerUnit) : 0;
  const iH2 = hasSecondary ? convertUnit(parseFloat(secondaryItem.height) || 0, itemUnit, containerUnit) : 0;

  if (iL1 <= 0 || iW1 <= 0 || iH1 <= 0) {
    return { count: 0, count1: 0, count2: 0, items: [], efficiency: 0, waste: 0, layout: [0,0,0], orientation: { length: 0, width: 0, height: 0 } };
  }

  let limit1 = Infinity;
  let limit2 = Infinity;

  if (limitMode === 'quantity') {
    if (maxCount1) limit1 = parseInt(maxCount1, 10) || Infinity;
    if (hasSecondary && maxCount2) limit2 = parseInt(maxCount2, 10) || Infinity;
  } else {
    const vol1InCubic = convertVolume(iL1 * iW1 * iH1, containerUnit, volumeUnit);
    const maxV1 = parseFloat(maxVolume1) || 0;
    if (maxV1 > 0 && vol1InCubic > 0) limit1 = Math.floor(maxV1 / vol1InCubic);

    if (hasSecondary) {
      const vol2InCubic = convertVolume(iL2 * iW2 * iH2, containerUnit, volumeUnit);
      const maxV2 = parseFloat(maxVolume2) || 0;
      if (maxV2 > 0 && vol2InCubic > 0) limit2 = Math.floor(maxV2 / vol2InCubic);
    }
  }

  const margin = errorMargin ? 0.5 : 0;
  const orientations1 = getOrientations(iL1, iW1, iH1);
  const orientations2 = hasSecondary ? getOrientations(iL2, iW2, iH2) : [];

  let bestItems = [];
  let bestOri1 = orientations1[0];
  let bestOri2 = orientations2[0] || [0,0,0];
  let bestLayout1 = [0,0,0];
  let bestLayout2 = [0,0,0];

  for (const priOri of orientations1) {
    const spaces = [{ l: cL, w: cW, h: cH, x: 0, y: 0, z: 0 }];
    const curItems = [];
    let pCount1 = 0;
    let pCount2 = 0;
    let baseL1 = [0,0,0];
    let baseL2 = [0,0,0];
    let isFirst = true;

    while (spaces.length > 0) {
      if (distributionMode === 'x-first') spaces.sort((a,b) => (Math.abs(a.x - b.x) > 0.001 ? a.x - b.x : a.y - b.y));
      else if (distributionMode === 'y-first') spaces.sort((a,b) => (Math.abs(a.y - b.y) > 0.001 ? a.y - b.y : a.x - b.x));
      else if (distributionMode === 'z-first') spaces.sort((a,b) => (Math.abs(a.z - b.z) > 0.001 ? a.z - b.z : a.x - b.x));
      else spaces.sort((a,b) => (b.l * b.w * b.h) - (a.l * a.w * a.h));

      const sp = spaces.shift();
      let bestSpaceOri = null;
      let maxSpVol = 0;
      let spArr = [0,0,0];
      let itemType = 1;

      const test1 = distributionMode !== 'split' || pCount1 < limit1;
      const test2 = hasSecondary && (distributionMode !== 'split' || pCount1 >= limit1 || curItems.length === 0);

      if (test1 && pCount1 < limit1) {
        const pool = isFirst ? [priOri] : orientations1;
        for (const ori of pool) {
          const pl = ori[0] + margin, pw = ori[1] + margin, ph = ori[2] + margin;
          const nx = Math.floor(sp.l / pl), ny = Math.floor(sp.w / pw), nz = Math.floor(sp.h / ph);
          const allowed = Math.min(nx * ny * nz, limit1 - pCount1);
          if (allowed > 0) {
            const v = allowed * (ori[0] * ori[1] * ori[2]);
            if (v > maxSpVol) { maxSpVol = v; bestSpaceOri = ori; spArr = [nx, ny, nz]; itemType = 1; }
          }
        }
      }

      if (test2 && pCount2 < limit2) {
        for (const ori of orientations2) {
          const pl = ori[0] + margin, pw = ori[1] + margin, ph = ori[2] + margin;
          const nx = Math.floor(sp.l / pl), ny = Math.floor(sp.w / pw), nz = Math.floor(sp.h / ph);
          const allowed = Math.min(nx * ny * nz, limit2 - pCount2);
          if (allowed > 0) {
            const v = allowed * (ori[0] * ori[1] * ori[2]);
            if (v > maxSpVol) { maxSpVol = v; bestSpaceOri = ori; spArr = [nx, ny, nz]; itemType = 2; }
          }
        }
      }

      if (maxSpVol > 0 && bestSpaceOri) {
        let [nx, ny, nz] = spArr;
        const [l, w, h] = bestSpaceOri;
        const pl = l + margin, pw = w + margin, ph = h + margin;

        if (itemType === 1) {
          const rem = limit1 - pCount1;
          while (nx * ny * nz > rem && nz > 1) nz--;
          while (nx * ny * nz > rem && ny > 1) ny--;
          while (nx * ny * nz > rem && nx > 1) nx--;
          pCount1 += nx * ny * nz;
          if (isFirst) baseL1 = [nx, ny, nz];
        } else {
          const rem = limit2 - pCount2;
          while (nx * ny * nz > rem && nz > 1) nz--;
          while (nx * ny * nz > rem && ny > 1) ny--;
          while (nx * ny * nz > rem && nx > 1) nx--;
          pCount2 += nx * ny * nz;
          if (isFirst) baseL2 = [nx, ny, nz];
        }

        for (let ix = 0; ix < nx; ix++) {
          for (let iy = 0; iy < ny; iy++) {
            for (let iz = 0; iz < nz; iz++) {
              curItems.push({
                x: sp.x + ix * pl,
                y: sp.y + iy * pw,
                z: sp.z + iz * ph,
                dx: pl, dy: pw, dz: ph,
                origDx: l, origDy: w, origDz: h,
                type: itemType
              });
            }
          }
        }

        const uL = nx * pl, uW = ny * pw, uH = nz * ph;
        if (sp.l - uL > 0.001) spaces.push({ l: sp.l - uL, w: sp.w, h: sp.h, x: sp.x + uL, y: sp.y, z: sp.z });
        if (sp.w - uW > 0.001) spaces.push({ l: uL, w: sp.w - uW, h: sp.h, x: sp.x, y: sp.y + uW, z: sp.z });
        if (sp.h - uH > 0.001) spaces.push({ l: uL, w: uW, h: sp.h - uH, x: sp.x, y: sp.y, z: sp.z + uH });
      }
      isFirst = false;
    }

    if (curItems.length > bestItems.length) {
      bestItems = curItems;
      bestOri1 = priOri;
      bestLayout1 = baseL1;
      bestLayout2 = baseL2;
      const i2Best = curItems.find(i => i.type === 2);
      if (i2Best) bestOri2 = [i2Best.origDx, i2Best.origDy, i2Best.origDz];
    }
  }

  const volCont = cL * cW * cH;
  const count1 = bestItems.filter(i => i.type === 1).length;
  const count2 = bestItems.filter(i => i.type === 2).length;
  const usedVol = count1 * (iL1 * iW1 * iH1) + count2 * (iL2 * iW2 * iH2);
  const efficiency = volCont > 0 ? (usedVol / volCont) * 100 : 0;
  const waste = Math.max(0, volCont - usedVol);

  return {
    count: bestItems.length,
    count1,
    count2,
    items: bestItems,
    efficiency,
    waste,
    usedVol,
    volCont,
    orientation: { length: bestOri1[0], width: bestOri1[1], height: bestOri1[2] },
    orientation2: hasSecondary ? { length: bestOri2[0], width: bestOri2[1], height: bestOri2[2] } : undefined,
    layout: bestLayout1,
    layout2: hasSecondary ? bestLayout2 : undefined
  };
};
