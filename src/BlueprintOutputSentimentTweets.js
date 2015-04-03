var _ = require('underscore');
var d3 = require('d3');


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

  self.emit("initialised");

};


BlueprintOutputSentimentTweets.prototype.outputTweet = function(tweet) {
  var self = this;


  var col = parseInt(self.color(tweet.sentiment.score).replace('#', '0x'), 16);



  var material = new THREE.MeshBasicMaterial({
    color: col,
    // color: 0xff0000,
    // vertexColors: THREE.VertexColors,
    // ambient: 0xffffff,
    // emissive: 0xcccccc,
    shading: THREE.FlatShading
  });

  var barGeom = new THREE.BoxGeometry( 5, 1, 5 );

  // Shift each vertex by half the bar height
  // This means it will scale from the bottom rather than the centre
  var vertices = barGeom.vertices;
  for (var v = 0; v < vertices.length; v++) {
    vertices[v].y += 0.5;
  }

  var coords = tweet.coordinates.coordinates;

  var offset = new VIZI.Point();

  var geoCoord = self.world.project(new VIZI.LatLon(coords[1], coords[0]));

  var height = 100;

  var mesh = new THREE.Mesh(barGeom, material);
  mesh.scale.y = height;

  // offset
  mesh.position.x = geoCoord.x;
  mesh.position.z = geoCoord.y;

  mesh.matrixAutoUpdate && mesh.updateMatrix();



  // debugger;
  self.world.addPickable(mesh, tweet.id_str);

  tweet.mesh = mesh;
  // remove the object in 5 seconds
  self.tweets.push(tweet);

  VIZI.Messenger.on("pick-hover:" + tweet.id_str, function() {
    if (self.hidden) {
      return;
    }

    console.log("pick-hover:" + tweet.id_str)

    if (self.pickedMesh) {
      self.remove(self.pickedMesh);
    }

    var geomCopy = barGeom.clone();

    self.pickedMesh = new THREE.Mesh(geomCopy, new THREE.MeshBasicMaterial({
      color: 0xffff22,
      shading: THREE.FlatShading,
      wireframe: true,
      wireframeLinewidth: 3
    }));

    self.pickedMesh.position.copy(mesh.position)
    self.pickedMesh.rotation.copy(mesh.rotation);
    self.pickedMesh.scale.copy(mesh.scale);
    self.pickedMesh.scale.x *= 1.01;
    self.pickedMesh.scale.y *= 1.01;
    self.pickedMesh.scale.z *= 1.01;
    self.pickedMesh.renderDepth = -1.1 * self.options.layer;

    self.pickedMesh.matrixAutoUpdate && self.pickedMesh.updateMatrix();

    self.add(self.pickedMesh);
  });

  VIZI.Messenger.on("pick-off:" + tweet.id_str, function() {
    if (self.pickedMesh) {
      self.remove(self.pickedMesh);
    }
  });


  VIZI.Messenger.on("pick-click:" + tweet.id_str, function() {
    console.log("clicked: " + tweet.id_str)
  });


  self.add(mesh);

}

BlueprintOutputSentimentTweets.prototype.onTick = function() {
  var self = this;
  var i, l, tw;
  if (self.tweets.length > 0) {
    for (var l = self.tweets.length, i = l - 1; i > 0; i--) {
      tw = self.tweets[i];
      tw.mesh.scale.y *= 0.9998;
      // tw.mesh.scale.z *= 0.9998;
      // tw.mesh.scale.x *= 0.9998;
      if (tw.mesh.scale.y < 1) {
        self.remove(tw.mesh);
        self.world.removePickable(tw.mesh, tw.id_str);
        self.tweets.splice(i, 1);
      }
    }
  }
}


BlueprintOutputSentimentTweets.prototype.onAdd = function(world) {
  var self = this;
  self.world = world;
  self.init();
};

module.exports = BlueprintOutputSentimentTweets;