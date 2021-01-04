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
 * Map with a default value. A plain map compares by reference, so using arrays
 * as keys is impossible. This map converts keys to strings internally to force
 * comparison by value :(
 */
export class DefaultMap {
  constructor(defaultValue = 0) {
    this.defaultValue = defaultValue;
    this.map = new Map();
  }

  static k(o) {
    return JSON.stringify(o);
  }

  get(key) {
    return this.map.get(DefaultMap.k(key)) || this.defaultValue;
  }

  set(key, value) {
    this.map.set(DefaultMap.k(key), value);
    return this;
  }
}
