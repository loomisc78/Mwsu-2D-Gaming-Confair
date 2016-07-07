BasicGame.Preloader = function (game) {

  this.preloadBar = null;

  this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		// Add a 'loading...' label on the screen
		this.loadingLabel = this.game.add.text(this.game.width/2, 
											150, 
											'loading...', 
											{ font: '30px Arial', fill: '#ffffff' });
		this.loadingLabel.anchor.setTo(0.5, 0.5);

		// Display the progress bar
		this.progressBar = this.game.add.sprite(this.game.width/2, 200, 'progressBar');
		this.progressBar.anchor.setTo(0.5, 0.5);
		this.game.load.setPreloadSprite(this.progressBar);

		// Load all our assets
		this.game.load.spritesheet('player', 'assets/monkey.png', 49, 42);
		this.game.load.image('token', 'assets/banana-small.png');
		this.game.load.spritesheet('barrel', 'assets/barrels.png', 36, 35);
		this.game.load.image('pixel', 'assets/pixel.png');
		this.game.load.spritesheet('mute', 'assets/muteButton.png', 28, 22);	

		// Load the tileset information
		this.game.load.image('tileset', 'assets/jungle_set.png');
		this.game.load.tilemap('level1', 'assets/jungle_lv1.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.tilemap('level2', 'assets/jungle_lv2.json', null, Phaser.Tilemap.TILED_JSON);

		// Sound when the player jumps
		this.game.load.audio('jump', ['assets/jump.ogg', 'assets/jump.mp3']);
		// Sound when the player takes a coin
		this.game.load.audio('banana', ['assets/banana.ogg', 'assets/banana.mp3']);
		// Sound when the player dies
		this.game.load.audio('dead', ['assets/dead.ogg', 'assets/dead.mp3']);

		// Load the music in 2 different formats in the load.js file
		this.game.load.audio('music', ['assets/Monkey_Drama.ogg', 'assets/Monkey-Drama.mp3']);		

		// Load a new asset that we will use in the menu state
		this.game.load.image('sky', 'assets/sky.png');
	},//end preload******************************************************
  
	create: function() {
        // Go to the menu state
        this.game.state.start('MainMenu');
    },	
	
  };












