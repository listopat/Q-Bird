export default class MetricComposite {
  constructor(...metrics) {
    this.metrics = metrics;
  }

  static getKey() {
    return "composite";
  }

  reset() {
    this.metrics.forEach((m) => m.reset());
  }

  onStep(withParams) {
    this.metrics.forEach((m) => m.onStep(withParams));
  }

  onEnd() {
    const metricValues = {};
    this.metrics.forEach((m) => {
      metricValues[m.constructor.getKey()] = m.onEnd();
    });
    return metricValues;
  }
}
