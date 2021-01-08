import { mean } from "../../utils";

export default class RollingMeanMetric {
  constructor(metric, windowLen = 20) {
    this.metric = metric;
    this.windowLen = windowLen;
    this.reset(true);
  }

  getName() {
    return `rolling_${this.metric.getName()}`;
  }

  reset(doReset = false) {
    this.metric.reset(doReset);
    if (doReset) {
      this.window = [];
    }
  }

  onStep(withParams) {
    this.metric.onStep(withParams);
  }

  onEnd() {
    if (this.window.length === this.windowLen) {
      this.window.shift();
    }
    this.window.push(this.metric.onEnd());
    return mean(this.window);
  }

  deserialize(d) {
    this.metric = this.metric.deserialize(d.metric);
    this.windowLen = d.windowLen;
    this.window = d.window;
    return this;
  }
}
