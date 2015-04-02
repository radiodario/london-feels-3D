module.exports = {
  input: {
    type: "BlueprintInputMapTiles",
    options: {
      // tilePath: "https://a.tiles.mapbox.com/v3/examples.map-i86l3621/{z}/{x}/{y}@2x.png"
      tilePath: "//stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
    }
  },
  output: {
    type: "BlueprintOutputImageTiles",
    options: {
      grids: [{
        zoom: 14,
        tilesPerDirection: 10,
        cullZoom: 10
      }]
    }
  },
  triggers: [{
    triggerObject: "output",
    triggerName: "initialised",
    triggerArguments: ["tiles"],
    actionObject: "input",
    actionName: "requestTiles",
    actionArguments: ["tiles"],
    actionOutput: {
      tiles: "tiles" // actionArg: triggerArg
    }
  }, {
    triggerObject: "output",
    triggerName: "gridUpdated",
    triggerArguments: ["tiles"],
    actionObject: "input",
    actionName: "requestTiles",
    actionArguments: ["tiles"],
    actionOutput: {
      tiles: "tiles" // actionArg: triggerArg
    }
  }, {
    triggerObject: "input",
    triggerName: "tileReceived",
    triggerArguments: ["image", "tile"],
    actionObject: "output",
    actionName: "outputImageTile",
    actionArguments: ["image", "tile"],
    actionOutput: {
      image: "image", // actionArg: triggerArg
      tile: "tile"
    }
  }]
};