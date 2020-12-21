var SpacebarEvent = new KeyboardEvent('keydown', {'keyCode':32, 'which':32});
function sendSpacebar() {
    document.dispatchEvent(SpacebarEvent); 
}

function main() {
    
    if (currentstate == 0)
    {
        console.log("Splash Screen")
        sendSpacebar()
    }
    else if (currentstate == 1)
    {
        console.log("Game Screen")
        console.log("Position: ".concat(position))
        console.log("Rotation: ".concat(rotation))
        console.log("Velocity: ".concat(velocity))

        var nextpipe = pipes[0];
        if (nextpipe) {
            var nextpipeupper = nextpipe.children(".pipe_upper");
            var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
        }
      
        console.log("Next pipe top: ".concat(pipetop))
        sendSpacebar()
    }

    else 
    {
        console.log("Score Screen")
        sendSpacebar() 
    }
}

//execute clearInterval(t) in console to stop execution
var t=setInterval(main,500);