/** @jsx React.DOM */

/**
 * 2D info UI class
 * @author Robin Hawkes - vizicities.com
 */




// TODO: Sort out scoping issues
// TODO: Work out a neater structure for defining the render method
var React = require("react");
var moment = require("moment");

var feels = {
  '-11': 'like suicide is the only option',
  '-10': 'the end coming',
  '-9' : 'Terrible',
  '-8' : 'OH GOD WHY',
  '-7' : 'Snow day',
  '-6' : 'Very, very bad',
  '-5' : 'Very Bad',
  '-4' : 'Bad',
  '-3' : 'Not Good',
  '-2' : 'Not Great',
  '-1' : 'Meh',
  '0'  : 'Average',
  '1'  : 'Alright',
  '2'  : 'Not Bad',
  '3'  : 'Sweet',
  '4'  : 'Good',
  '5'  : 'Great',
  '6'  : 'Awesome',
  '7'  : 'Incredible',
  '8'  : 'Ecstatic',
  '9'  : 'Like a boss',
  '10' : 'Nirvana',
  '11' : 'something no words can describe',
};


var TweetUI2D = function(world) {
  var self = this;
  var scope = self;

  self.world = world;

  // Check that 2D info UI container exists
  if (!document.querySelector(".vizicities-ui .vizicities-info-ui-2d")) {
    var infoUIContainer = document.createElement("section");
    infoUIContainer.classList.add("vizicities-info-ui-2d");

    document.querySelector(".vizicities-ui").appendChild(infoUIContainer);
  }

  self.panels = {};
  self.hidden = false;

  self.infoUI = React.createClass({
    render: function() {
      var self = this;

      var panels = _.map(self.props.panels, function(panel) {
        var bounds = new THREE.Box3().setFromObject(panel.object);

        var offsetPos = panel.object.position.clone();
        offsetPos.y = bounds.max.y;

        var screenPos = scope.world.worldPositionTo2D(offsetPos);

        // TODO: Scale margin-top offset based on camera zoom so panel stays above the object
        // TODO: Or, base the screen position on the top of the object bounding box
        // TODO: Set z-index based on object distance from camera

        var style = {
          transform: "translateX(calc(" + screenPos.x + "px - 50%)) translateY(calc(" + screenPos.y + "px - 100%))",
          display: (scope.hidden) ? "none" : "block"
        }

        var tweet = panel.tweet;
        tweet.created_human = moment(tweet.created_at).format("HH:mm:ss - D MMM YYYY");
        var user = tweet.user;
        tweet.feelsText = feels[Math.floor(tweet.sentiment.score)] || "average";

        return (
          <div key={panel.id} style={style} className="vizicities-info-ui-2d-layer-item">
            <div className="tweet-container">
              <div className="tweet" key={tweet.id_str}>
                <div className="tweet-header">
                  <a href={"http://twitter.com/" + user.screen_name} target="_blank">
                    <img className="user-pic" src={user.profile_image_url_https}/>
                    <span className="username">{ user.name }</span>
                    <span> feels </span>
                    <span className="feels" style={{color: tweet.color}}>{ tweet.feelsText }</span>
                  </a>
                </div>
                <div className="tweet-body">
                  <a className="tweet-link" href={"http://twitter.com/" + user.screen_name + "/status/" + tweet.id_str} target="_blank">
                    {tweet.text}
                  </a>
                </div>
                <div className="tweet-footer">
                  {tweet.place.name + " - " + tweet.created_human}
                </div>
              </div>
            </div>
            <div className="tweet-tip-container">
              <div className="tweet-tip"/>
            </div>
          </div>
        );
      });

      return (
        <section className="vizicities-info-ui-2d-layer">
          {panels}
        </section>
      );
    }
  });

  self.onChange();
};

TweetUI2D.prototype.addPanel = function(object, tweet) {
  var self = this;

  var panel = {
    id: object.id,
    object: object,
    tweet: tweet
  };

  self.panels[object.id] = panel;

  self.onChange();

  return panel;
};

TweetUI2D.prototype.removePanel = function(id) {
  var self = this;

  if (!self.panels[id]) {
    return;
  }

  delete self.panels[id];

  self.onChange();
};

TweetUI2D.prototype.onHide = function() {
  var self = this;
  self.hidden = true;
  self.onChange();
};

TweetUI2D.prototype.onShow = function() {
  var self = this;
  self.hidden = false;
  self.onChange();
};

TweetUI2D.prototype.onChange = function() {
  var self = this;

  var InfoUI = self.infoUI;

  React.render(<InfoUI panels={self.panels} />, document.querySelector(".vizicities-info-ui-2d"));
};


module.exports = TweetUI2D;