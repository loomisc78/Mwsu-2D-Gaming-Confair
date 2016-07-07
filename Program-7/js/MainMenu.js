BasicGame.MainMenu = function(game) {

};

BasicGame.MainMenu.prototype = {
	create: function() {
        // Add a background image
        this.sky = this.game.add.image(0, 0, 'sky');
		this.sky.width = this.game.width;
		this.sky.height = this.game.height;
        // Display the name of the game
        this.nameLabel = this.game.add.text(this.game.width/2, 
										-50, 
										'Monkey Dash', 
										{ font: '50px Orbitron', fill: '#ffffff' });
		this.game.add.tween(this.nameLabel).
							to({y: 120}, 1000).
							easing(Phaser.Easing.Bounce.Out).
							start();
		this.nameLabel.anchor.setTo(0.5, 0.5);
		
		// If 'bestScore' is not defined
		// It means that this is the first time the game is played
		if (!localStorage.getItem('bestScore')) {
			// Then set the best score to 0
			localStorage.setItem('bestScore', 0);
		}
		// If the score is higher than the best score
		if (BasicGame.score > localStorage.getItem('bestScore')) {
			// Then update the best score
			localStorage.setItem('bestScore', BasicGame.score);
		}
			
		// Add the button that calls the 'toggleSound' function when pressed
		this.muteButton = this.game.add.button(20, 20, 'mute', this.toggleSound, this);
		
		// If the game is already muted, display the speaker with no sound
		this.muteButton.frame = this.game.sound.mute ? 1 : 0;		

        // Show the score at the center of the screen
        var text = 'score: ' + BasicGame.score + '\nbest score: ' + localStorage.getItem('bestScore');
		this.scoreLabel = this.game.add.text(this.game.width/2, 
											this.game.height/2, 
											text, 
											{ font: '25px Orbitron', fill: '#ffffff', align: 'center' });
        this.scoreLabel.anchor.setTo(0.5, 0.5);
        
        // Explain how to start the game
        // Store the relevant text based on the device used
        var text;
        if (this.game.device.desktop) {
            text = 'press the up arrow key to start';
        }
        else {
            text = 'touch the screen to start';
        }
        // Display the text variable
        this.startLabel = this.game.add.text(this.game.width/2, 
											this.game.height-80, 
											text, 
											{ font: '25px Orbitron', fill: '#ffffff' }); 
        this.startLabel.anchor.setTo(0.5, 0.5);
        
        // Create a new Phaser keyboard variable: the up arrow key
        // When pressed, call the 'start' function once
        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.upKey.onDown.add(this.start, this);
        
        if (!this.game.device.desktop) {
            this.game.input.onDown.add(this.start, this);
        }
    },
	
    start: function() {
		BasicGame.score = 0;
        
        // If we tap in the top left corner of the game on mobile
        if (!this.game.device.desktop && this.game.input.y < 50 && this.game.input.x < 60) {
            // It means we want to mute the game, so we don't start the game
            return;
        }
		// Start the actual game
        this.game.state.start('play');
    },
	
	// Function called when the 'muteButton' is pressed
	toggleSound: function() {
		// Switch the variable from true to false, or false to true
		// When 'game.sound.mute = true', Phaser will mute the game
		this.game.sound.mute = !this.game.sound.mute;
		// Change the frame of the button
		this.muteButton.frame = this.game.sound.mute ? 1 : 0;
	},
};