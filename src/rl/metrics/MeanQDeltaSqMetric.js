export default class MeanQDeltaSqMetric {
  constructor() {
    this.reset();
  }

  // eslint-disable-next-line class-methods-use-this
  getName() {
    return "mean_Q_delta_sq";
  }

  reset() {
    this.QDeltaSqSum = 0;
    this.steps = 0;
  }

  onStep(withParams = { discountFactor: 0, reward: 0, Q: 0, newStateMaxQ: 0 }) {
    const delta =
      withParams.reward +
      withParams.discountFactor * withParams.newStateMaxQ -
      withParams.Q;
    this.QDeltaSqSum += delta ** 2;
    this.steps += 1;
  }

  onEnd() {
    return this.QDeltaSqSum / this.steps;
  }

  deserialize(d) {
    this.QDeltaSqSum = d.QDeltaSum;
    this.steps = d.steps;
    return this;
  }
}
