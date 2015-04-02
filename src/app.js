// setup our blueprint input
VIZI.BlueprintInputGeoTweets = require('./BlueprintInputGeoTweets');


var world = new VIZI.World({
  viewport: document.querySelector("#map-viewport"),
  center: new VIZI.LatLon(51.50358, -0.01924)
});

var controls = new VIZI.ControlsMap(world.camera, {
  viewport: world.options.viewport
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