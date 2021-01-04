import QLearningDriver from "./rl/QLearningDriver";

const tabToPort = new Map();
const portToSeq = new Map();
const drivers = {};

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "toggle_agent") {
    chrome.tabs.sendMessage(tab.id, {
      type: tabToPort.has(tab.id) ? "Stop" : "Start",
    });
  }
});

chrome.runtime.onConnect.addListener((port) => {
  const tabId = port.sender.tab.id;
  tabToPort.set(tabId, port);
  portToSeq.set(port, -1);

  drivers[tabId] = drivers[tabId] || new QLearningDriver();

  port.onDisconnect.addListener(() => {
    portToSeq.delete(port);
    tabToPort.delete(tabId);
  });

  port.onMessage.addListener((msg) => {
    const expectedSeq = portToSeq.get(port) + 1;
    const isUpdateQ = msg.seq === expectedSeq;
    if (!isUpdateQ) {
      console.error(
        `Invalid message seq: ${msg.seq}, expected: ${expectedSeq}`
      );
    }
    portToSeq.set(port, msg.seq);
    switch (msg.type) {
      case "state": {
        const action = drivers[tabId].onStep(msg.state, isUpdateQ);
        port.postMessage({ seq: msg.seq, type: "action", action });
        break;
      }
      case "death": {
        const metrics = drivers[tabId].onEnd(isUpdateQ);
        port.postMessage({ seq: msg.seq, type: "metrics", metrics });
        break;
      }
      default:
        console.error(`Unknown message ${msg}`);
    }
  });
});
