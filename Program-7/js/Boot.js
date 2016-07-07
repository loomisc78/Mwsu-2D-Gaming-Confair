BasicGame = {

  score: 0,

  life: 200

};

BasicGame.Boot = function(game) {
};

BasicGame.Boot.prototype = {

	init: function() {

	},

	preload: function() {

		// Load the image
		this.game.load.image('progressBar', 'assets/progressBar.png');

	},

	create: function() {
		// Set some game settings
		this.game.stage.backgroundColor = '#3498db';
		//  We only want world bounds on the left and right
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.renderer.renderSession.roundPixels = true;

		// If the device is not a desktop (so it's a mobile device)
		if (!this.game.device.desktop) {
			// Set the type of scaling to 'show all'
			this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

			// Set the min and max width/height of the game
			this.game.scale.setMinMax(this.game.width/2, 
									this.game.height/2,
									this.game.width*2, 
									this.game.height*2);

			// Center the game on the screen
			this.game.scale.pageAlignHorizontally = true;
			this.game.scale.pageAlignVertically = true;

			// Add a blue color to the page to hide potential white borders
			this.document.body.style.backgroundColor = '#3498db';
		}

		// Start the load state
		this.game.state.start('Preloader');
	},
};






