module.exports = {
  input: {
    type: "BlueprintInputGeoTweets",
    options: {
      path: 'http://london.feels.website/'
    }
  },
  output: {
    type: "BlueprintOutputSentimentTweets",
    options: {
      infoUI: true,
    }
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
      triggerArguments: ['tweet'],
      actionObject: "output",
      actionName: "outputTweet",
      actionArguments: ['tweet'],
      actionOutput: {
        tweet: "tweet"
      }
    }
  ]
}