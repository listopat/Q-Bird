var isRunning = 0
var mainLoop

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch (message.type){
            case "Start":
                onStart()
                sendResponse({result: "Success"});
                break
            case "Stop":
                onStop()
                sendResponse({result: "Success"});
                break
            case "isStarted":
                sendResponse({result: "Success", isStarted: isRunning})
                break
            default:
                sendResponse("Unknown request")
        }
    }
);

function onStart() {
    if (isRunning == 0) {
        mainLoop = setInterval(main,500);
        isRunning = 1
    }
}

function onStop() {
    if (isRunning == 1) {
        clearInterval(mainLoop)
        isRunning = 0
    }
}
  
function getGameState() {
    const splashScreen = document.getElementById('splash')
    const splashScreenStyle = window.getComputedStyle(splashScreen)
    const splashScreenOpacity = splashScreenStyle.getPropertyValue("opacity")

    const player = document.getElementById('player')
    const playerStyle = window.getComputedStyle(player)
    const playerState = playerStyle.getPropertyValue("animation-play-state")

    if (splashScreenOpacity > 0) {
        return 0
    } else if (playerState == "running") {
        return 1
    } else if (playerState == "paused") {
        return 2
    }
}

function getPlayerPosition() {
    const player = document.getElementById('player')
    const style = window.getComputedStyle(player)
    const position = style.getPropertyValue("top")
    
    return parseFloat(position)
}

function getPlayerRotation() {
    const player = document.getElementById('player')
    const style = window.getComputedStyle(player)
    const rotation = style.getPropertyValue("transform")

    var values = rotation.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));

    return angle
}

function getNextPipe() {
    const pipes = document.getElementsByClassName("pipe_upper")
    if (pipes.length == 0) {
        return -1
    }
    const player = document.getElementById('player')
    playerPosition = player.getBoundingClientRect().right 

    var closestPipe = 0
    var distanceToClosestPipe = Number.MAX_VALUE
    for (let id in Array.from(pipes)) {
        rect = pipes[id].getBoundingClientRect()
        
        if (rect.right >= playerPosition) {
            distance = rect.right - playerPosition
            if (distance < distanceToClosestPipe) {
                closestPipe = id
                distanceToClosestPipe = distance
            }
        }
    } 

    var closestPipeHeight = parseFloat(window.getComputedStyle(pipes[closestPipe]).getPropertyValue("height"))

    return {
        distance: distanceToClosestPipe,
        height: closestPipeHeight
    }
}

function sendSpacebar() {
    var SpacebarEvent = new KeyboardEvent('keydown', {'keyCode':32, 'which':32});
    document.dispatchEvent(SpacebarEvent); 
}

function main() {
    const currentGameState = getGameState()
    
    if (currentGameState == 0)
    {
        console.log("Splash Screen")
        sendSpacebar()
    }
    else if (currentGameState == 1)
    {
        console.log("Game Screen")
        const position = getPlayerPosition()
        console.log("Player position: " + position)
        const angle = getPlayerRotation()
        console.log("Player rotation: " + angle);
        const pipe = getNextPipe()
        console.log("Next pipe distance: " + pipe.distance)
        console.log("Next pipe upper height: " + pipe.height)

        sendSpacebar()
    }

    else if (currentGameState == 2)
    {
        console.log("Score Screen")
        sendSpacebar() 
    }   
}