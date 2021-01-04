import Action from "./rl/Action";

const ACTIONS_PER_SECOND = 20;

let isRunning = 0;
let mainLoop;
let backend;
let seq;
let prevGameState;
let currentGameState;

function getGameState() {
  const splashScreen = document.getElementById("splash");
  const splashScreenStyle = window.getComputedStyle(splashScreen);
  const splashScreenOpacity = splashScreenStyle.getPropertyValue("opacity");

  const player = document.getElementById("player");
  const playerStyle = window.getComputedStyle(player);
  const playerState = playerStyle.getPropertyValue("animation-play-state");

  if (splashScreenOpacity > 0) {
    return 0;
  }
  if (playerState === "running") {
    return 1;
  }
  if (playerState === "paused") {
    return 2;
  }
  return -1;
}

function getPlayerPosition() {
  const player = document.getElementById("player");
  const style = window.getComputedStyle(player);
  const position = style.getPropertyValue("top");
  return parseFloat(position);
}

function getPlayerRotation() {
  const player = document.getElementById("player");
  const style = window.getComputedStyle(player);
  const rotation = style.getPropertyValue("transform");

  const values = rotation.split("(")[1].split(")")[0].split(",");
  const a = values[0];
  const b = values[1];
  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

  return angle;
}

function getNextPipe() {
  const pipes = document.getElementsByClassName("pipe_upper");
  if (pipes.length === 0) {
    return { distance: Number.MAX_VALUE, height: 0 };
  }
  const player = document.getElementById("player");
  const playerPosition = player.getBoundingClientRect().right;

  let closestPipe = pipes[0];
  let distanceToClosestPipe = Number.MAX_VALUE;

  Array.from(pipes).forEach((p) => {
    const rect = p.getBoundingClientRect();

    if (rect.right >= playerPosition) {
      const distance = rect.right - playerPosition;
      if (distance < distanceToClosestPipe) {
        closestPipe = p;
        distanceToClosestPipe = distance;
      }
    }
  });

  const closestPipeHeight = parseFloat(
    window.getComputedStyle(closestPipe).getPropertyValue("height")
  );

  return {
    distance: distanceToClosestPipe,
    height: closestPipeHeight,
  };
}

// function getScore() {
//   const digits = document.getElementById("currentscore").children;
//   return Array.from(digits).reduce(
//     (sum, digit) => 10 * sum + parseInt(digit.alt, 10),
//     0
//   );
// }

function sendSpacebar() {
  const SpacebarEvent = new KeyboardEvent("keydown", {
    keyCode: 32,
    which: 32,
  });
  document.dispatchEvent(SpacebarEvent);
}

function performAction(action) {
  switch (action) {
    case Action.JUMP:
      sendSpacebar();
      break;
    case Action.IDLE:
    default:
  }
}

function sendBackend(msg) {
  backend.postMessage({ seq, ...msg });
  seq += 1;
}

function handleBackend(msg) {
  const expectedSeq = seq - 1;
  if (msg.seq !== expectedSeq) {
    console.error(`Invalid message seq: ${msg.seq}, expected: ${expectedSeq}`);
    return;
  }
  switch (msg.type) {
    case "action":
      performAction(msg.action);
      break;
    default:
      console.error(`Unknown message: ${msg}`);
  }
}

function main() {
  prevGameState = currentGameState;
  currentGameState = getGameState();

  if (currentGameState === 0) {
    sendSpacebar();
  } else if (currentGameState === 1) {
    const position = getPlayerPosition();
    const angle = getPlayerRotation();
    const pipe = getNextPipe();

    sendBackend({
      type: "state",
      state: {
        player: { position, angle },
        pipe,
      },
    });
  } else if (currentGameState === 2) {
    if (prevGameState === 1) {
      sendBackend({ type: "death" });
    }
    sendSpacebar();
  }
}

function onStart() {
  if (isRunning === 0) {
    seq = 0;
    backend = chrome.runtime.connect();
    backend.onMessage.addListener(handleBackend);
    mainLoop = setInterval(main, 1000 / ACTIONS_PER_SECOND);
    isRunning = 1;
  }
}

function onStop() {
  if (isRunning === 1) {
    clearInterval(mainLoop);
    backend.disconnect();
    isRunning = 0;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "Start":
      onStart();
      sendResponse({ result: "Success" });
      break;
    case "Stop":
      onStop();
      sendResponse({ result: "Success" });
      break;
    case "isStarted":
      sendResponse({ result: "Success", isStarted: isRunning });
      break;
    default:
      sendResponse("Unknown request");
  }
});
