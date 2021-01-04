import Action from "./Action";
import { digitize, randomChoice, range, DefaultMap } from "../utils";

export default class QLearningDriver {
  constructor(
    learningRate = 0.1,
    discountFactor = 0.9,
    eps = 0.05,
    Q = new DefaultMap(0),
    bins = {
      playerPosition: range(0, 400, 50),
      playerAngle: range(-90, 90, 180),
      pipeDistance: range(0, 200, 25),
      pipeHeight: range(0, 400, 50),
    }
  ) {
    this.learningRate = learningRate;
    this.discountFactor = discountFactor;
    this.eps = eps;
    this.Q = Q;
    this.bins = bins;
    this.reset();
  }

  static calculateReward(newState) {
    let reward = 0;
    if (newState === "dead") {
      reward -= 100;
    }
    return reward;
  }

  reset() {
    this.prevState = "start";
    this.prevAction = Action.JUMP;
  }

  binState(s) {
    if (s === "dead") {
      return "dead";
    }
    return [
      digitize(this.bins.playerPosition, s.player.position),
      digitize(this.bins.playerAngle, s.player.angle),
      digitize(this.bins.pipeDistance, s.pipe.distance),
      digitize(this.bins.pipeHeight, s.pipe.height),
    ];
  }

  maxQAction(state) {
    const actions = Object.values(Action);
    const qs = actions.map((action) => this.Q.get([state, action]));
    const maxQ = Math.max(...qs);
    const maxActions = actions.filter((_, i) => qs[i] === maxQ);
    return { Q: maxQ, action: randomChoice(maxActions) };
  }

  updateQ(state) {
    const k = [this.prevState, this.prevAction];
    const maxFutureReward = state === "dead" ? 0 : this.maxQAction(state).Q;
    const reward = QLearningDriver.calculateReward(state);
    this.Q.set(
      k,
      this.Q.get([this.prevState, this.prevAction]) +
        this.learningRate *
          (reward + this.discountFactor * maxFutureReward - this.Q.get(k))
    );
  }

  updateState(newState, isUpdateQ = true) {
    const discreteState = this.binState(newState);
    if (isUpdateQ) {
      this.updateQ(discreteState);
    }
    this.prevState = discreteState;
    this.prevAction =
      Math.random() < this.eps
        ? randomChoice(Action)
        : this.maxQAction(discreteState).action;
    return this.prevAction;
  }

  die(isUpdateQ = true) {
    if (isUpdateQ) {
      this.updateQ("dead");
    }
    this.reset();
  }
}
