export default class MeanStepQMetric {
  constructor() {
    this.reset();
  }

  static getKey() {
    return "mean_Q";
  }

  reset() {
    this.QSum = 0;
    this.steps = 0;
  }

  onStep(withQ = { Q: 0 }) {
    this.QSum += withQ.Q;
    this.steps += 1;
  }

  onEnd() {
    return this.QSum / this.steps;
  }

  deserialize(d) {
    this.QSum = d.QSum;
    this.steps = d.steps;
    return this;
  }
}
