export const UNIT_META = {
  'шт.': { kind: 'count', factor: 1 },
  'уп.': { kind: 'pack', factor: 1 },
  г: { kind: 'weight', factor: 1 },
  кг: { kind: 'weight', factor: 1000 },
  мл: { kind: 'volume', factor: 1 },
  л: { kind: 'volume', factor: 1000 },
};

export function compatibleUnits(unit) {
  const meta = UNIT_META[unit];
  return Object.keys(UNIT_META).filter(
    (item) => UNIT_META[item].kind === meta?.kind,
  );
}

export function offerDetails(product, value) {
  if (typeof value === 'number')
    value = { price: value, size: 1, unit: product.unit };
  if (!value || typeof value !== 'object') return null;
  const price = value.price === '' ? '' : Number(value.price);
  const size = Number(value.size);
  const unit = value.unit;
  if (
    (price !== '' && (!Number.isFinite(price) || price < 0)) ||
    !Number.isFinite(size) ||
    size <= 0 ||
    !UNIT_META[unit] ||
    UNIT_META[unit].kind !== UNIT_META[product.unit]?.kind
  )
    return null;
  return { price, size, unit };
}

export function normalizedPrice(product, value) {
  const offer = offerDetails(product, value);
  if (!offer || offer.price === '') return null;
  const packageBase = offer.size * UNIT_META[offer.unit].factor;
  const perBase = offer.price / packageBase;
  return {
    offer,
    perBase,
    packageBase,
    unitPrice: perBase * UNIT_META[product.unit].factor,
  };
}

export function offerPlan(product, value) {
  const normalized = normalizedPrice(product, value);
  if (!normalized) return null;
  const neededBase = product.qty * UNIT_META[product.unit].factor;
  const packages = Math.max(
    1,
    Math.ceil((neededBase - 1e-9) / normalized.packageBase),
  );
  return {
    ...normalized,
    packages,
    total: Math.round(normalized.offer.price * packages * 100) / 100,
    purchased:
      (normalized.packageBase * packages) / UNIT_META[product.unit].factor,
  };
}

export function calculatePricePlan(data) {
  const groups = data.stores.map((store) => ({
    store,
    items: [],
    totalCents: 0,
  }));
  const missing = [];
  let totalCents = 0;
  for (const product of data.products) {
    let best = null;
    for (const group of groups) {
      const planned = offerPlan(product, product.prices[group.store.id]);
      if (!planned) continue;
      const candidate = { group, ...planned };
      if (
        !best ||
        candidate.total < best.total ||
        (candidate.total === best.total && candidate.perBase < best.perBase)
      )
        best = candidate;
    }
    if (!best) {
      missing.push(product);
      continue;
    }
    const totalLineCents = Math.round(best.total * 100);
    best.group.items.push({
      product,
      storeId: best.group.store.id,
      ...best,
      total: best.total,
      packages: best.packages,
      purchased: best.purchased,
    });
    best.group.totalCents += totalLineCents;
    totalCents += totalLineCents;
  }
  return {
    groups: groups
      .filter((group) => group.items.length)
      .map((group) => ({ ...group, total: group.totalCents / 100 })),
    missing,
    total: totalCents / 100,
  };
}
