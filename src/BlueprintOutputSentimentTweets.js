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

  var col = self.color(tweet.sentiment.score);

  var colHex = parseInt(col, 16);

  var material = new THREE.MeshBasicMaterial({
    color: col,
    // vertexColors: THREE.VertexColors,
    // ambient: 0xffffff,
    // emissive: 0xcccccc,
    shading: THREE.FlatShading
  });

  var barGeom = new THREE.BoxGeometry( 10, 1, 10 );

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

  var mesh = new THREE.Mesh(barGeom);
  mesh.scale.y = height;

  // offset
  mesh.position.x = geoCoord.x;
  mesh.position.z = geoCoord.y;

  mesh.matrixAutoUpdate && mesh.updateMatrix();


  self.add(mesh);

}


BlueprintOutputSentimentTweets.prototype.onAdd = function(world) {
  var self = this;
  self.world = world;
  self.init();
};

module.exports = BlueprintOutputSentimentTweets;