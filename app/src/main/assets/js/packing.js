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
  tertiaryItem,
  errorMargin = false,
  containerUnit = 'in',
  itemUnit = 'in'
}) => {
  const cL = parseFloat(container.length) || 0;
  const cW = parseFloat(container.width) || 0;
  const cH = parseFloat(container.height) || 0;

  if (cL <= 0 || cW <= 0 || cH <= 0) {
    return { count: 0, count1: 0, count2: 0, count3: 0, items: [], efficiency: 0, waste: 0, layout: [0,0,0], isVolumeExceeded: false };
  }

  const iL1 = convertUnit(parseFloat(item.length) || 0, itemUnit, containerUnit);
  const iW1 = convertUnit(parseFloat(item.width) || 0, itemUnit, containerUnit);
  const iH1 = convertUnit(parseFloat(item.height) || 0, itemUnit, containerUnit);

  const hasSec = secondaryItem && parseFloat(secondaryItem.length) > 0;
  const iL2 = hasSec ? convertUnit(parseFloat(secondaryItem.length) || 0, itemUnit, containerUnit) : 0;
  const iW2 = hasSec ? convertUnit(parseFloat(secondaryItem.width) || 0, itemUnit, containerUnit) : 0;
  const iH2 = hasSec ? convertUnit(parseFloat(secondaryItem.height) || 0, itemUnit, containerUnit) : 0;

  const hasTer = tertiaryItem && parseFloat(tertiaryItem.length) > 0;
  const iL3 = hasTer ? convertUnit(parseFloat(tertiaryItem.length) || 0, itemUnit, containerUnit) : 0;
  const iW3 = hasTer ? convertUnit(parseFloat(tertiaryItem.width) || 0, itemUnit, containerUnit) : 0;
  const iH3 = hasTer ? convertUnit(parseFloat(tertiaryItem.height) || 0, itemUnit, containerUnit) : 0;

  if (iL1 <= 0 || iW1 <= 0 || iH1 <= 0) {
    return { count: 0, count1: 0, count2: 0, count3: 0, items: [], efficiency: 0, waste: 0, layout: [0,0,0], isVolumeExceeded: false };
  }

  const volCont = cL * cW * cH;
  const v1 = iL1 * iW1 * iH1;
  const v2 = hasSec ? iL2 * iW2 * iH2 : 0;
  const v3 = hasTer ? iL3 * iW3 * iH3 : 0;

  const margin = errorMargin ? 0.5 : 0;
  const ori1 = getOrientations(iL1, iW1, iH1);
  const ori2 = hasSec ? getOrientations(iL2, iW2, iH2) : [];
  const ori3 = hasTer ? getOrientations(iL3, iW3, iH3) : [];

  let bestItems = [];
  let bestLayout1 = [0,0,0];

  for (const priOri of ori1) {
    const spaces = [{ l: cL, w: cW, h: cH, x: 0, y: 0, z: 0 }];
    const curItems = [];
    let isFirst = true;

    while (spaces.length > 0) {
      spaces.sort((a,b) => (b.l * b.w * b.h) - (a.l * a.w * a.h));
      const sp = spaces.shift();

      let bestSpaceOri = null;
      let maxSpVol = 0;
      let spArr = [0,0,0];
      let selectedType = 1;

      // Test Item 1
      const pool1 = isFirst ? [priOri] : ori1;
      for (const o of pool1) {
        const pl = o[0] + margin, pw = o[1] + margin, ph = o[2] + margin;
        const nx = Math.floor(sp.l / pl), ny = Math.floor(sp.w / pw), nz = Math.floor(sp.h / ph);
        const total = nx * ny * nz;
        if (total > 0) {
          const v = total * (o[0] * o[1] * o[2]);
          if (v > maxSpVol) { maxSpVol = v; bestSpaceOri = o; spArr = [nx, ny, nz]; selectedType = 1; }
        }
      }

      // Test Item 2
      if (hasSec) {
        for (const o of ori2) {
          const pl = o[0] + margin, pw = o[1] + margin, ph = o[2] + margin;
          const nx = Math.floor(sp.l / pl), ny = Math.floor(sp.w / pw), nz = Math.floor(sp.h / ph);
          const total = nx * ny * nz;
          if (total > 0) {
            const v = total * (o[0] * o[1] * o[2]);
            if (v > maxSpVol) { maxSpVol = v; bestSpaceOri = o; spArr = [nx, ny, nz]; selectedType = 2; }
          }
        }
      }

      // Test Item 3
      if (hasTer) {
        for (const o of ori3) {
          const pl = o[0] + margin, pw = o[1] + margin, ph = o[2] + margin;
          const nx = Math.floor(sp.l / pl), ny = Math.floor(sp.w / pw), nz = Math.floor(sp.h / ph);
          const total = nx * ny * nz;
          if (total > 0) {
            const v = total * (o[0] * o[1] * o[2]);
            if (v > maxSpVol) { maxSpVol = v; bestSpaceOri = o; spArr = [nx, ny, nz]; selectedType = 3; }
          }
        }
      }

      if (maxSpVol > 0 && bestSpaceOri) {
        let [nx, ny, nz] = spArr;
        const [l, w, h] = bestSpaceOri;
        const pl = l + margin, pw = w + margin, ph = h + margin;

        if (isFirst) bestLayout1 = [nx, ny, nz];

        for (let ix = 0; ix < nx; ix++) {
          for (let iy = 0; iy < ny; iy++) {
            for (let iz = 0; iz < nz; iz++) {
              curItems.push({
                x: sp.x + ix * pl,
                y: sp.y + iy * pw,
                z: sp.z + iz * ph,
                origDx: l, origDy: w, origDz: h,
                type: selectedType
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
    }
  }

  const count1 = bestItems.filter(i => i.type === 1).length;
  const count2 = bestItems.filter(i => i.type === 2).length;
  const count3 = bestItems.filter(i => i.type === 3).length;
  const usedVol = count1 * v1 + count2 * v2 + count3 * v3;
  const efficiency = volCont > 0 ? (usedVol / volCont) * 100 : 0;
  const waste = Math.max(0, volCont - usedVol);

  // Volume excess detection
  const isVolumeExceeded = (iL1 > cL || iW1 > cW || iH1 > cH) ||
    (hasSec && (iL2 > cL || iW2 > cW || iH2 > cH)) ||
    (hasTer && (iL3 > cL || iW3 > cW || iH3 > cH)) ||
    (v1 > volCont);

  return {
    count: bestItems.length,
    count1,
    count2,
    count3,
    items: bestItems,
    efficiency,
    waste,
    usedVol,
    volCont,
    layout: bestLayout1,
    isVolumeExceeded
  };
};
