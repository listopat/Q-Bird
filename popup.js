var isStarted = 0

document.addEventListener('DOMContentLoaded', function() {
    isStarted = getIsStarted()
    document.getElementById('startButton').addEventListener('click', onStartButtonClicked);
})

function getIsStarted() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "isStarted"}, function(response) {
            if (response.result == "Success") {
                isStarted = response.isStarted
                if (isStarted == 1) {
                    document.getElementById('startButton').innerHTML = "Stop"
                } else {
                    document.getElementById('startButton').innerHTML = "Start"
                }
            }
        });
    });
}

function sendStart() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "Start"}, function(response) {
            if (response.result == "Success") {
                isStarted = 1
                document.getElementById('startButton').innerHTML = "Stop"
            }
        });
    });
}

function sendStop() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "Stop"}, function(response) {
            if (response.result == "Success") {
                isStarted = 0
                document.getElementById('startButton').innerHTML = "Start"
            }
        });
    });
}

function onStartButtonClicked(){
    if (isStarted == 0) {
        sendStart()
    } else {
        sendStop()
    }
}