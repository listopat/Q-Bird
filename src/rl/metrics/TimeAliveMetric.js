export default class TimeAliveMetric {
  constructor() {
    this.reset();
  }

  // eslint-disable-next-line class-methods-use-this
  getName() {
    return "time_alive";
  }

  reset() {
    this.timeAlive = 0;
  }

  onStep() {
    this.timeAlive += 1;
  }

  onEnd() {
    return this.timeAlive;
  }

  deserialize(d) {
    this.timeAlive = d.timeAlive;
    return this;
  }
}
