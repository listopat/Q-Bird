import Action from "./Action";
import { digitize, randomChoice, range, DefaultMap } from "../utils";
import MetricComposite from "./metrics/MetricComposite";
import AttemptCounter from "./metrics/AttemptCounter";
import MeanStepQMetric from "./metrics/MeanStepQMetric";
import TimeAliveMetric from "./metrics/TimeAliveMetric";

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
    },
    metrics = new MetricComposite(
      new AttemptCounter(),
      new MeanStepQMetric(),
      new TimeAliveMetric()
    )
  ) {
    this.learningRate = learningRate;
    this.discountFactor = discountFactor;
    this.eps = eps;
    this.Q = Q;
    this.bins = bins;
    this.metrics = metrics;
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
    this.metrics.reset();
    this.prevState = "start";
    this.prevAction = Action.JUMP;
    this.prevQ = 0;
  }

  binState(s) {
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

  updateQ(newState) {
    const k = [this.prevState, this.prevAction];
    const maxFutureReward =
      newState === "dead" ? 0 : this.maxQAction(newState).Q;
    this.Q.set(
      k,
      this.Q.get([this.prevState, this.prevAction]) +
        this.learningRate *
          (this.prevReward +
            this.discountFactor * maxFutureReward -
            this.Q.get(k))
    );
  }

  onStep(newState, isUpdateQ = true) {
    const discreteState = this.binState(newState);

    this.prevReward = QLearningDriver.calculateReward(discreteState);
    if (isUpdateQ) {
      this.updateQ(discreteState);
    }

    this.metrics.onStep({ reward: this.prevReward, Q: this.prevQ });

    this.prevState = discreteState;

    if (Math.random() < this.eps) {
      this.prevAction = randomChoice(Action);
      this.prevQ = this.Q.get([this.prevState, this.prevAction]);
    } else {
      const maxQAction = this.maxQAction(discreteState);
      this.prevAction = maxQAction.action;
      this.prevQ = maxQAction.Q;
    }

    return this.prevAction;
  }

  onEnd(isUpdateQ = true) {
    this.prevReward = QLearningDriver.calculateReward("dead");
    if (isUpdateQ) {
      this.updateQ("dead");
    }

    this.metrics.onStep({ reward: this.prevReward, Q: this.prevQ });
    const metrics = this.metrics.onEnd();

    this.reset();

    return metrics;
  }
}
