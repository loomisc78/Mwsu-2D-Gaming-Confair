var SpaceHipster = SpaceHipster || {};

//loading the game assets
SpaceHipster.Preload = function(){};

SpaceHipster.Preload.prototype = {
  preload: function() {
  	//show loading screen
  	this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.splash.anchor.setTo(0.5);

    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);

    this.load.setPreloadSprite(this.preloadBar);

  	//load image assets
  	this.load.image('space', 'assets/images/space.png');
  	this.load.image('rock', 'assets/images/rock2.png');
    this.load.image('playership', 'assets/images/spaceShip.png');
    this.load.spritesheet('power', 'assets/images/power.png', 12, 12);
	this.load.spritesheet('kaboom', 'assets/images/explosion.png', 64, 64);
  	this.load.image('playerParticle', 'assets/images/player-particle.png');
	this.load.image('rockParticle', 'assets/images/rock-particle.png');
	this.load.image('button1', 'assets/images/buttonOne.png');
	this.load.image('button2', 'assets/images/buttonTwo.png');
	this.load.image('button3', 'assets/images/buttonThree.png');
	this.load.image('bullet', 'assets/images/rocket.png');
	
	//load audio assets
	this.load.audio('cannon', ['assets/audio/Space-Cannon.ogg', 'assets/audio/Space-Cannon.mp3']);
    this.load.audio('collect', 'assets/audio/collect.ogg');
    this.load.audio('explosion', 'assets/audio/explosion.ogg');
	this.load.audio('rockX', ['assets/audio/asteroidExplosion.ogg', 'assets/audio/asteroidExplosion.mp3']);
	
  },
  create: function() {
  	this.state.start('MainMenu');
  }
};