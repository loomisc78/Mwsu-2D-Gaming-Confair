var SpaceHipster = SpaceHipster || {};

//title screen
SpaceHipster.MainMenu = function(){};

SpaceHipster.MainMenu.prototype = {
  init: function(score) {
    var score = score || 0;
    this.highestScore = this.highestScore || 0;

    this.highestScore = Math.max(score, this.highestScore);
   },
  create: function() {
	this.game.global = {
		skillLevel: 1	
	};
  	//show the space tile, repeated
    this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'space');
    
    //give it speed in x
    this.background.autoScroll(-20, 0);

    //start game text
    var text = "Choose a skill level to start game";
    var style = { font: "30px Arial", fill: "#fff", align: "center" };
    var t = this.game.add.text(this.game.width/2, this.game.height/2, text, style);
    t.anchor.set(0.5);

	//disply buttons to select level and start game
	var bOne = this.game.add.button(this.game.width/2 - 310, 
						this.game.height/2 + 50, 'button1', 
						this.setLevel, this);	
	var bTwo = this.game.add.button(this.game.width/2 -50, 
						this.game.height/2 + 50, 'button2', 
						this.setLevel, this);
	var bThree = this.game.add.button(this.game.width/2 + 210, 
						this.game.height/2 + 50, 'button3', 
						this.setLevel, this);			

    //highest score
    text = "Highest score: "+this.highestScore;
    style = { font: "15px Arial", fill: "#fff", align: "center" };
  
    var h = this.game.add.text(this.game.width/2, this.game.height/2 + 200, text, style);
    h.anchor.set(0.5);
  },//end create**********************************************************************
  
  update: function() {
  },//end update**********************************************************************
  
  setLevel: function(level){
	  if(level.key == "button1"){
		this.game.global.skillLevel = 1;
		this.game.state.start('Game')		 
	  }
	  if(level.key == "button2"){
		this.game.global.skillLevel = 2;
		this.game.state.start('Game')
	  }
	  if(level.key == "button3"){
		this.game.global.skillLevel = 3;
		this.game.state.start('Game')		 
	  }
  }//end setLevel************************************************************************
};