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
      grids: [
      {
        zoom: 19,
        tilesPerDirection: 3,
        cullZoom: 17
      },
      {
        zoom: 18,
        tilesPerDirection: 3,
        cullZoom: 16
      },
      {
        zoom: 17,
        tilesPerDirection: 3,
        cullZoom: 15
      },
      {
        zoom: 16,
        tilesPerDirection: 3,
        cullZoom: 14
      },
      {
        zoom: 15,
        tilesPerDirection: 3,
        cullZoom: 13
      },
      {
        zoom: 14,
        tilesPerDirection: 3,
        cullZoom: 12
      },
      {
        zoom: 13,
        tilesPerDirection: 5,
        cullZoom: 11
      },
      {
        zoom: 12,
        tilesPerDirection: 6,
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