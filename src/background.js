import QLearningDriver from "./rl/QLearningDriver";

const tabToPort = new Map();
const portToSeq = new Map();
const drivers = {};
let stateDirty = true;

function saveState(manual = false) {
  if (!manual && !stateDirty) {
    console.log("State up to date, skipping save");
    return;
  }
  const state = {};
  Object.entries(drivers).forEach(([tabId, driver]) => {
    const o = driver.serialize();
    o.originTab = tabId;
    state[driver.hash()] = o;
  });
  chrome.storage.local.set(state, () => {
    if (chrome.runtime.lastError != null) {
      console.error(`Error saving state: ${chrome.runtime.lastError}`);
      return;
    }
    console.log("State saved");
    chrome.storage.local.get(null, console.log);
    chrome.storage.local.getBytesInUse(null, (inUse) => {
      const quota = chrome.storage.local.QUOTA_BYTES;
      const quotaPercentage = ((inUse / quota) * 100).toFixed(0);
      console.log(`Storage used: (${quotaPercentage}%) ${inUse} / ${quota} B`);
    });
  });
  stateDirty = false;
}

function loadDriver(tabId, callback) {
  if (tabId in drivers) {
    console.log(`Cached driver for tab: ${tabId}`);
    callback(drivers[tabId]);
  } else {
    const driver = new QLearningDriver();
    const hash = driver.hash();
    chrome.storage.local.get(hash, (d) => {
      if (hash in d) {
        console.log(`Stored driver for tab ${tabId}`);
        driver.deserialize(d[hash]);
      } else {
        console.log(`New driver for tab: ${tabId}`);
      }
      drivers[tabId] = driver;
      callback(driver);
    });
  }
}

chrome.commands.onCommand.addListener((command, tab) => {
  switch (command) {
    case "toggle_agent":
      chrome.tabs.sendMessage(tab.id, {
        type: tabToPort.has(tab.id) ? "Stop" : "Start",
      });
      break;
    case "save_state":
      console.log("Command: save_state");
      saveState(true);
      break;
    default:
  }
});

chrome.alarms.create("save_drivers", {
  when: Date.now(),
  periodInMinutes: 1,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "save_drivers") {
    console.log(`Alarm: ${JSON.stringify(alarm)}`);
    saveState();
  }
});

chrome.runtime.onConnect.addListener((port) => {
  const tabId = port.sender.tab.id;
  tabToPort.set(tabId, port);
  portToSeq.set(port, -1);

  console.log(`Connect: tab = ${tabId}`);

  port.onDisconnect.addListener(() => {
    console.log(`Disconnect: tab = ${tabId}`);
    saveState();
    portToSeq.delete(port);
    tabToPort.delete(tabId);
  });

  loadDriver(tabId, (driver) => {
    port.onMessage.addListener((msg) => {
      const expectedSeq = portToSeq.get(port) + 1;
      const isUpdateQ = msg.seq === expectedSeq && msg.inconsistent === false;
      if (isUpdateQ) {
        stateDirty = true;
      } else {
        console.error(
          `Invalid message: seq = ${msg.seq}, expectedSeq = ${expectedSeq}, inconsistent: ${msg.inconsistent}`
        );
      }
      portToSeq.set(port, msg.seq);
      switch (msg.type) {
        case "state": {
          const action = driver.onStep(msg.state, isUpdateQ);
          port.postMessage({ seq: msg.seq, type: "action", action });
          break;
        }
        case "death": {
          const metrics = driver.onEnd(isUpdateQ);
          port.postMessage({ seq: msg.seq, type: "metrics", metrics });
          break;
        }
        default:
          console.error(`Unknown message ${msg}`);
      }
    });
  });
});
