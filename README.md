# Q-Bird

Q-learning agent for Flappy Bird-like game :bird:

## Building

```
npm install
npm run build
```

## Installing

1. Go to [chrome://extensions/](chrome://extensions/).
2. Enable developer mode.
3. Click the button for loading unpacked extensions.
4. Select the folder that contains the source files.

Once the extension is loaded, if you make any changes to the source files you can reload the extension by clicking the reload button. You can also view and debug the scripts attached to the virtual extension background page by clicking on a blue link.

## Running

1. Go to [https://nebezb.com/floppybird/](https://nebezb.com/floppybird/).
2. Ctrl+M to toggle learning.

## Saving state

All weights are automatically saved every 1 minute. This can be verified by background script logs. To manually save state, use `Ctrl+.`, relevant background log should appear. The saved state persists extension reload.

### Format

State is an object whose keys are hashes of algorithm parameters and values are the algorithm weights and metrics.
Drivers should be able to deserialize and continue learning from the get-go. Opening a few tabs with the same parameters
will probably cause a race condition, but after manual save, a consistent state from a single tab should be stored.

### Inspecting the state:

`chrome.storage.local.get(null, console.log)`

### Clearing the state:

`chrome.storage.local.clear()`
