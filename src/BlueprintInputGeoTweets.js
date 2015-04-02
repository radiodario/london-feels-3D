/* globals window, VIZI */
var _ = require('underscore');
var io = require('socket.io-client');
var d3 = require('d3');

var BlueprintInputGeoTweets = function(options) {
  var self = this;

  VIZI.BlueprintInput.call(self, options);

  _.defaults(self.options, {});

  self.triggers = [
    { name: "initialised", arguments: [] },
    { name: "tweetReceived", arguments: ["tweet"]}
  ];

  self.actions = [
    { name: "requestLatestTweets", arguments: []}
  ]

}

BlueprintInputGeoTweets.prototype = Object.create(VIZI.BlueprintInput.prototype);

// sets up the socket and emits a "tweetReceived" event every time a tweet is received
BlueprintInputGeoTweets.prototype.init = function() {
  var self = this;
  //setup the socket
  this.socket = io(self.options.path);
  this.socket.on('tweet', function(tweet) {
    if (VIZI.DEBUG) console.log("tweet received", tweets);
    self.emit("tweetReceived", {tweets: [tweet]});
  });

  self.emit("initialised");
};

// request a bunch of tweets initially to backfill the map
BlueprintInputGeoTweets.prototype.requestLatestTweets = function() {
  var self = this;
  d3.json(this.options.path + 'latest', function(error, tweets) {
    if (error) {
      if (VIZI.DEBUG) console.log("Failed to request latest tweets");
      console.warn(error);
      return;
    }

    self.emit("tweetReceived", {tweets:tweets});

    // if (VIZI.DEBUG) console.log("loaded", tweets.length, "tweets");

    // // stagger the tweets one every 50 ms
    // var i = 0;
    // d3.timer(function(d) {
    //   self.emit("tweetReceived", tweets[i]);

    //   return !(++i < tweets.length);

    // }, 50)

  })
};

module.exports = BlueprintInputGeoTweets;