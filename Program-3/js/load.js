var loadState = {
    preload: function () {
        // Add a 'loading...' label on the screen
        var loadingLabel = game.add.text(game.width/2, 150, 'loading...', { font: '30px Arial', fill: '#ffffff' });
        loadingLabel.anchor.setTo(0.5, 0.5);
        // Display the progress bar
        var progressBar = game.add.sprite(game.width/2, 200, 'progressBar');
        progressBar.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progressBar);
        
		// Load all our assets
        game.load.spritesheet('player', 'assets/monkey.png', 49, 42);
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        game.load.image('token', 'assets/banana-small.png');
        game.load.spritesheet('barrel', 'assets/barrels.png', 36, 35);
		game.load.image('pixel', 'assets/pixel.png');
		game.load.spritesheet('mute', 'assets/muteButton.png', 28, 22);
		
		// Sound when the player jumps
		game.load.audio('jump', ['assets/jump.ogg', 'assets/jump.mp3']);
		// Sound when the player takes a coin
		game.load.audio('banana', ['assets/banana.ogg', 'assets/banana.mp3']);
		// Sound when the player dies
		game.load.audio('dead', ['assets/dead.ogg', 'assets/dead.mp3']);
		
		// Load the music in 2 different formats in the load.js file
		game.load.audio('music', ['assets/Monkey_Drama.ogg', 'assets/Monkey-Drama.mp3']);
		
		
	
        // Load a new asset that we will use in the menu state
		game.load.image('sky', 'assets/sky.png');
    },//end preload******************************************************
    create: function() {
        // Go to the menu state
        game.state.start('menu');
    }
};