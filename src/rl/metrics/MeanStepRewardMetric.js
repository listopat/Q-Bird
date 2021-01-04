export default class MeanStepRewardMetric {
  constructor() {
    this.reset();
  }

  static getKey() {
    return "mean_reward";
  }

  reset() {
    this.rewardSum = 0;
    this.steps = 0;
  }

  onStep(withReward = { reward: 0 }) {
    this.rewardSum += withReward.reward;
    this.steps += 1;
  }

  onEnd() {
    return this.rewardSum / this.steps;
  }
}
