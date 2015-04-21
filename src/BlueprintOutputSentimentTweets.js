var _ = require('underscore');
var d3 = require('d3');
var InfoUI = require('./TweetUI');

var BlueprintOutputSentimentTweets = function(options) {
  var self = this;

  VIZI.BlueprintOutput.call(self, options);

  _.defaults(self.options, {
    name: "Sentiment Tweets"
  });

  self.triggers = [
    {name: "initialised", arguments: []}
  ];

  self.actions = [
    {name: "outputTweet", arguments: ["tweet"]}
  ];

  self.name = self.options.name;

  self.world;
  self.pickedMesh;
  self.lastPickedIdClick;
  self.tweets = [];

}

BlueprintOutputSentimentTweets.prototype = Object.create(VIZI.BlueprintOutput.prototype);

BlueprintOutputSentimentTweets.prototype.init = function() {

  var self = this;

  self.color = d3.scale.linear()
   .domain([-11,11])  // min/max of data
   .range(["rgb(253,88,6)", "rgb(44,163,219)"])
   .interpolate(d3.interpolateHcl);

  // Set up info UI
  if (self.options.infoUI) {
    self.infoUI = new InfoUI(self.world);
  }


  var loader = new THREE.JSONLoader();
  loader.load('data/tweet.json', function(geometry, materials) {
    self.geometry = geometry;
    self.emit("initialised");
  });

};


BlueprintOutputSentimentTweets.prototype.outputTweet = function(tweet) {
  var self = this;

  tweet.color = self.color(tweet.sentiment.score);

  var col = parseInt(tweet.color.replace('#', '0x'), 16);



  var material = new THREE.MeshBasicMaterial({
    color: col,
    // color: 0xff0000,
    // vertexColors: THREE.VertexColors,
    // ambient: 0xffffff,
    // emissive: 0xcccccc,
    transparent: true,
    opoacity: 0.8,
    shading: THREE.FlatShading
  });

  var circleMaterial = new THREE.MeshBasicMaterial({
    color: col,
    opacity: 0,
    transparent: true,
    side: THREE.BackSide,
    // // color: 0xff0000,
    // wireframe: true,
    // wireframeLinewidth: 0.1,
    // vertexColors: THREE.VertexColors,
    // ambient: 0xffffff,
    // emissive: 0xffffff,
    shading: THREE.FlatShading
  });

  var pickedMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff22,
    shading: THREE.FlatShading,
  //   // wireframe: true,
  //   // wireframeLinewidth: 3,
    transparent: true,
    opacity: 0.5
  });


  var circleGeom = new THREE.CircleGeometry( 5, 10 );

  var coords = tweet.coordinates.coordinates;

  var offset = new VIZI.Point();

  var geoCoord = self.world.project(new VIZI.LatLon(coords[1], coords[0]));

  var height = 2;

  var circleMesh = new THREE.Mesh(circleGeom, circleMaterial);
  circleMesh.scale.x = height;
  circleMesh.scale.y = height;
  circleMesh.scale.z = height;

  circleMesh.rotation.x = -Math.PI / 2;
  circleMesh.position.y = 1;
  circleMesh.position.x = geoCoord.x;
  circleMesh.position.z = geoCoord.y;

  var circleEdge = new THREE.EdgesHelper(circleMesh, col);
  circleEdge.material.linewidth = 3;

  var mesh = new THREE.Mesh(self.geometry, material);
  mesh.scale.x = height;
  mesh.scale.y = height;
  mesh.scale.z = height;
  mesh.position.y = 10;


  // offset
  mesh.position.x = geoCoord.x;
  mesh.position.z = geoCoord.y;

  mesh.matrixAutoUpdate && mesh.updateMatrix();
  circleMesh.matrixAutoUpdate && circleMesh.updateMatrix();

  self.world.addPickable(circleMesh, tweet.id_str);

  tweet.circle = mesh;
  tweet.mesh = mesh;
  tweet.spawnedAt = new Date().getTime();
  // add a times bounced counter
  tweet.bounced = 0;

  self.tweets.push(tweet);

  VIZI.Messenger.on("pick-hover:" + tweet.id_str, function() {
    if (self.hidden) {
      return;
    }

    self.world.scene.options.viewport.classList.add('hand');


    mesh.material = pickedMaterial;
    circleMesh.material = pickedMaterial;
  });

  VIZI.Messenger.on("pick-off:" + tweet.id_str, function() {
    if (self.pickedMesh) {
      self.remove(self.pickedMesh);
    }
    if (!tweet.picked) {
      mesh.material = material;
      circleMesh.material = circleMaterial;
    }
    self.world.scene.options.viewport.classList.remove('hand');
  });


  VIZI.Messenger.on("pick-click:" + tweet.id_str, function() {
    console.log("clicked: " + tweet.id_str);

    var pickedId;
    var lastPickedTweet;
    // Create info panel
    if (self.infoUI) {

      if (self.lastPickedIdClick) {
        lastPickedTweet = self.infoUI.panels[self.lastPickedIdClick].tweet;
        lastPickedTweet.picked = false;
        lastPickedTweet.mesh.material = material;

        self.infoUI.removePanel(self.lastPickedIdClick);
        pickedId = undefined;

      }

      // we have to use the mesh.id here rather than the tweet id
      // because addPanel uses the meshId by default which kinda sucks.
      if (!self.lastPickedIdClick || self.lastPickedIdClick !== mesh.id) {
        self.infoUI.addPanel(mesh, tweet);
        pickedId = mesh.id;
        tweet.picked = true;
        tweet.mesh.material = pickedMaterial;
      }
    }

    self.lastPickedIdClick = pickedId;
  });

  self.add(circleMesh);
  self.add(circleEdge);
  self.add(mesh);

}

BlueprintOutputSentimentTweets.prototype.onTick = function() {
  var self = this;
  var i, l, tw, elapsed, angle;

  var t = new Date().getTime();

  if (self.infoUI) {
    self.infoUI.onChange();
  }

  if (self.tweets.length > 0) {
    // iterate backwards forever (because particle system)
    for (var l = self.tweets.length, i = l - 1; i > 0; i--) {
      tw = self.tweets[i];

      elapsed = t - tw.spawnedAt;

      // remove the ones aged more than 5 minutes;
      // XXX Make this a constant / configurable;
      if (elapsed > (1000 * 60 * 60 * 5)) {
        self.remove(tw.mesh);
        self.world.removePickable(tw.mesh, tw.id_str);
        self.tweets.splice(i, 1);
        continue;
      }



      // KNOW YOU NOT DESIGN PATTERNS?
      // TURN THIS INTO A FSM YOU TWEEB ;_;

      angle = elapsed*0.001;
      if (!tw.stop) {
        tw.mesh.position.y = Math.abs(Math.sin(angle)*20);

        // only bounce 3 times
        if (Math.floor(angle / Math.PI) > 2) {
          tw.stop = true;
        }
      }
      // if the tweet has been picked, rotate it really quickly
      // to indicate picked
      if (tw.picked) {
        tw.mesh.rotation.x = 0;
        tw.mesh.rotation.z = 0;
        tw.mesh.rotation.y = Math.abs((elapsed * 0.01) % Math.PI);
      } else {
        tw.mesh.lookAt(self.world.camera.camera.position);
      }




      // remove them by age
    }
  }
}


BlueprintOutputSentimentTweets.prototype.onAdd = function(world) {
  var self = this;
  self.world = world;
  self.init();
};

module.exports = BlueprintOutputSentimentTweets;