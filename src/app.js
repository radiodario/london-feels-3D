// setup our blueprint input
VIZI.BlueprintInputGeoTweets = require('./BlueprintInputGeoTweets');
VIZI.BlueprintOutputSentimentTweets = require('./BlueprintOutputSentimentTweets');


var worldOptions = {
  viewport: document.querySelector("#map-viewport"),
  center: new VIZI.LatLon(51.502, -0.08),
  zoom: 14,
  picking: true,
  antialias: false
};

var world = new VIZI.World(worldOptions);

var controls = new VIZI.ControlsMap(world.camera, {
  viewport: world.options.viewport
});

var pickControls = new VIZI.ControlsMousePick(world.camera, {
  scene: world.scene
});

var mapConfig = require('./mapConfig');

var tweetConfig = require('./tweetsConfig');


var switchboardMap = new VIZI.BlueprintSwitchboard(mapConfig);
switchboardMap.addToWorld(world);


var switchboardTweets = new VIZI.BlueprintSwitchboard(tweetConfig);
switchboardTweets.addToWorld(world);

// Update and render loop

var clock = new VIZI.Clock();

var update = function() {
  var delta = clock.getDelta();

  world.onTick(delta);
  world.render();

  window.requestAnimationFrame(update);
};

update();