import Action from "./Action";
import {
  digitize,
  randomChoice,
  range,
  stringHash,
  DefaultMap,
} from "../utils";
import MetricComposite from "./metrics/MetricComposite";
import RollingMeanMetric from "./metrics/RollingMeanMetric";
import AttemptCounter from "./metrics/AttemptCounter";
import TimeAliveMetric from "./metrics/TimeAliveMetric";
import MeanQDeltaSqMetric from "./metrics/MeanQDeltaSqMetric";

export default class QLearningDriver {
  constructor(
    learningRate = 0.1,
    discountFactor = 0.9,
    eps = 0.05,
    Q = new DefaultMap(0),
    bins = {
      playerPosition: range(0, 400, 50),
      playerAngle: range(-90, 90, 180),
      pipeDistance: range(0, 200, 200),
      pipeHeight: range(0, 400, 50),
    },
    metrics = new MetricComposite(
      new AttemptCounter(),
      new TimeAliveMetric(),
      new RollingMeanMetric(new MeanQDeltaSqMetric(), 20)
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
    this.state = "start";
    this.action = Action.JUMP;
    this.actionQ = this.Q.get([...this.state, this.action]);
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
    const qs = actions.map((action) => this.Q.get([...state, action]));
    const maxQ = Math.max(...qs);
    const maxActions = actions.filter((_, i) => qs[i] === maxQ);
    return { Q: maxQ, action: randomChoice(maxActions) };
  }

  updateQ(newState) {
    const maxFutureRewards =
      newState === "dead" ? 0 : this.maxQAction(newState).Q;
    const k = [...this.state, this.action];
    this.Q.set(
      k,
      this.Q.get(k) +
        this.learningRate *
          (this.reward + this.discountFactor * maxFutureRewards - this.Q.get(k))
    );
  }

  onStep(newState, isUpdateQ = true) {
    const binNewState = this.binState(newState);

    this.reward = QLearningDriver.calculateReward(binNewState);
    if (isUpdateQ) {
      this.updateQ(binNewState);
    }

    this.state = binNewState;
    const newStateMaxQAction = this.maxQAction(binNewState);

    this.metrics.onStep({
      discountFactor: this.discountFactor,
      reward: this.reward,
      Q: this.actionQ,
      newStateMaxQ: newStateMaxQAction.Q,
    });

    if (Math.random() < this.eps) {
      this.action = randomChoice(Action);
      this.actionQ = this.Q.get([...this.state, this.action]);
    } else {
      this.action = newStateMaxQAction.action;
      this.actionQ = newStateMaxQAction.Q;
    }

    return this.action;
  }

  onEnd(isUpdateQ = true) {
    this.reward = QLearningDriver.calculateReward("dead");
    if (isUpdateQ) {
      this.updateQ("dead");
    }

    this.metrics.onStep({
      discountFactor: this.discountFactor,
      reward: this.reward,
      Q: this.actionQ,
      newStateMaxQ: 0,
    });
    const metrics = this.metrics.onEnd();

    this.reset();

    return metrics;
  }

  hash() {
    const str = JSON.stringify([
      this.learningRate,
      this.discountFactor,
      this.eps,
      [
        // turning bins into array to preserve order of keys
        this.bins.playerPosition,
        this.bins.playerAngle,
        this.bins.pipeDistance,
        this.bins.pipeHeight,
      ],
    ]);
    return stringHash(str);
  }

  serialize() {
    return {
      learningRate: this.learningRate,
      discountFactor: this.discountFactor,
      eps: this.eps,
      bins: this.bins,
      metrics: this.metrics,
      Q: this.Q,
    };
  }

  deserialize(d) {
    this.learningRate = d.learningRate;
    this.discountFactor = d.discountFactor;
    this.eps = d.eps;
    this.bins = d.bins;
    this.metrics = this.metrics.deserialize(d.metrics);
    this.Q = this.Q.deserialize(d.Q);
  }
}
