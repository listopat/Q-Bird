export default class AttemptCounter {
  constructor() {
    this.reset(true);
  }

  static getKey() {
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
}
