export default class AttemptCounter {
  constructor() {
    this.reset(true);
  }

  // eslint-disable-next-line class-methods-use-this
  getName() {
    return "attempt";
  }

  reset(doReset = false) {
    if (doReset) {
      this.attempt = 0;
    } else {
      this.attempt += 1;
    }
  }

  onStep() {
    return this.attempt;
  }

  onEnd() {
    return this.attempt;
  }

  deserialize(d) {
    this.attempt = d.attempt;
    return this;
  }
}
