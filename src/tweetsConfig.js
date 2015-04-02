module.exports = {
  input: {
    type: "BlueprintInputGeoTweets",
    options: {
      path: 'http://london.feels.website/'
    }
  },
  output: {
    type: "BlueprintOutputDebugPoints",
    options: {}
  },
  triggers: [
    {
      triggerObject: "output",
      triggerName: "initialised",
      triggerArguments: [],
      actionObject: "input",
      actionName: "requestLatestTweets",
      actionArguments: [],
      actionOutput: {}
    },
    {
      triggerObject: "input",
      triggerName: "tweetReceived",
      triggerArguments: ['tweets'],
      actionObject: "output",
      actionName: "outputPoints",
      actionArguments: ['data'],
      actionOutput: {
        data: {
          process: "map",
          itemsObject: "tweets",
          itemsProperties: "tweets",
          transformation: {
            coordinates: "coordinates.coordinates"
          }
        }
      }
    }
  ]
}