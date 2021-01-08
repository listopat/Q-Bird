export function range(startInclusive, stopInclusive, step) {
  return Array.from(
    new Array((stopInclusive - startInclusive) / step + 1),
    (_, i) => startInclusive + i * step
  );
}

export function digitize(bins, x) {
  if (bins.length < 1) {
    return 0;
  }
  if (bins.length === 1) {
    return bins[0] <= x ? 0 : -1;
  }
  let low = -1;
  let high = bins.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (bins[mid + 1] <= x) {
      low = mid + 1;
    } else if (x < bins[mid]) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return low;
}

export function randomChoice(obj) {
  const keys = Object.keys(obj);
  // eslint-disable-next-line no-bitwise
  return obj[keys[(keys.length * Math.random()) | 0]];
}

/**
 * Map with a default value. Converts keys to strings internally to enable
 * indexing by complex types and comparison by key value.
 */
export class DefaultMap {
  constructor(defaultValue = 0) {
    this.defaultValue = defaultValue;
    this.map = {};
  }

  static k(o) {
    return JSON.stringify(o);
  }

  get(key) {
    const k = DefaultMap.k(key);
    return k in this.map ? this.map[k] : this.defaultValue;
  }

  set(key, value) {
    this.map[DefaultMap.k(key)] = value;
    return this;
  }

  deserialize(d) {
    this.defaultValue = d.defaultValue;
    this.map = d.map;
    return this;
  }
}

export function stringHash(s) {
  let hash = 0;
  let i;
  let chr;
  for (i = 0; i < s.length; i += 1) {
    chr = s.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return JSON.stringify(hash);
}

export function sum(array) {
  return array.reduce(
    (acc, x) => (x == null || Number.isNaN(x) ? acc : acc + x),
    0
  );
}

export function mean(array) {
  return sum(array) / array.length;
}
