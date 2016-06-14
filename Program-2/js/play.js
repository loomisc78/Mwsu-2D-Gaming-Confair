var playState = {
	
    create: function() { 
		//variable to control end game. set to false when time runs out
		this.gameOn = true;
		
		//add sounds into the game
		this.jumpSound = game.add.audio('jump');
		this.bananaSound = game.add.audio('banana');
		this.deadSound = game.add.audio('dead');
		
		// Add and start the music in the 'create' function of the play.js file
		// Because we want to play the music when the play state starts
		this.music = game.add.audio('music'); // Add the music
		this.music.loop = true; // Make it loop
		this.music.play(); // Start the music

        //set keys for game play
		this.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		this.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		this.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
        //create player
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
		this.player.body.setSize(24, 42, 0, 0);
		
		//set animations. walk is player walk, dead is death throws that 
		//aim am still working on implementing
		this.player.animations.add('walk', [1, 2, 3, 4, 5, 6], 12, true);
		this.player.animations.add('dead', [13, 14, 15, 16, 17], 8, false);

        this.createWorld();
		
		//create banana token
        this.token = game.add.sprite(60, 180, 'token');
        game.physics.arcade.enable(this.token); 
        this.token.anchor.setTo(0.5, 0.5);

		//set create score, death, and timer labels and add to surface
        this.scoreLabel = game.add.text(30, 30,'Score: 0', 
										{ font: '18px Arial', fill: '#ffffff'});
        
		// this.death = 0;
		// this.deathLabel = game.add.text(360, 360, 'Deaths: 0', 
										// { font: '18px Arial', fill: '#ffffff'});
        
		this.elaspsedTime;
		this.timeLabel = game.add.text(360, 30, 'Time: 120', 
										{ font: '18px Arial', fill: '#ffffff'});        
		this.lastTime = 0;
		this.startTime = game.time.now;
		
		//create barrels group for enemy barrels
        this.barrels = game.add.group();
        this.barrels.enableBody = true;
        this.barrels.createMultiple(10, 'barrel');
		
		//create event to spawn barrels every 3 seconds until stopped
        this.makeBarrels = game.time.events.loop(3000, this.addBarrel, this);	

		// Create the emitter with 15 particles. We don't need to set the x y
		// Since we don't know where to do the explosion yet
		this.emitter = game.add.emitter(0, 0, 15);

		// Set the 'pixel' image for the particles
		this.emitter.makeParticles('pixel');

		// Set the x and y speed of the particles between -150 and 150
		// Speed will be randomly picked between -150 and 150 for each particle
		this.emitter.setYSpeed(-150, 150);
		this.emitter.setXSpeed(-150, 150);

		// Scale the particles from 2 time their size to 0 in 800ms
		// Parameters are: startX, endX, startY, endY, duration
		this.emitter.setScale(2, 0, 2, 0, 800);

		// Use no gravity
		this.emitter.gravity = 0;
    },//end create*******************************************************

    update: function() {
		//if time remaining manage collisions, move player, and update the timer
		if (this.gameOn){
			game.physics.arcade.collide(this.player, this.walls);
			game.physics.arcade.collide(this.barrels, this.walls);
			game.physics.arcade.collide(this.barrels, this.barrels);
			game.physics.arcade.overlap(this.player, this.token, 
										this.takeToken, null, this);
			game.physics.arcade.overlap(this.player, this.barrels, 
										this.playerDie, null, this);

			this.movePlayer(); 
			this.updateTimer();

			if (!this.player.inWorld) {
				this.playerDie();
			}
		}
		
    },//end update*******************************************************

    movePlayer: function() {
		//if key is pressed adjust velocity and animation accordingly 
		//player.scale.x flips the animation towards direction of travel
        if (this.left.isDown) {
            this.player.body.velocity.x = -200;
			this.player.animations.play('walk');
			this.player.scale.x = -1;
        }
        else if (this.right.isDown) {
            this.player.body.velocity.x = 200;			
			this.player.animations.play('walk');
			this.player.scale.x = 1;
		}
        else {
            this.player.body.velocity.x = 0;
			this.player.animations.stop();
			this.player.frame = 0;
        }
		//if spacebar is pressed make sprite jump
		if (this.space.isDown && this.player.body.touching.down) {
			this.jumpSound.play();
            this.player.body.velocity.y = -320;
        }      
    },//end movePlayer***************************************************

    takeToken: function(player, token) {
        //update score and move token to new location
		game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;
		this.bananaSound.play();
		
		// Scale the coin to 0 to make it invisible
		this.token.scale.setTo(0, 0);
        this.updateTokenPosition();
		
		// Grow the coin back to its original scale in 300ms
		game.add.tween(this.token.scale).to({x: 1, y: 1}, 300).start();
		
		game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
    },//end takeToken****************************************************

    updateTokenPosition: function() {
        //set array for random token spawn
		var tokenPosition = [
            {x: 140, y: 90}, {x: 360, y: 90}, 
            {x: 60, y: 180}, {x: 440, y: 180}, 
            {x: 130, y: 360}, {x: 370, y: 360} 
        ];
		
        for (var i = 0; i < tokenPosition.length; i++) {
            if (tokenPosition[i].x == this.token.x) {
                tokenPosition.splice(i, 1);
            }
        }
		
		//pick random tokenPosition from array
        var newTokenPosition = game.rnd.pick(tokenPosition);
        this.token.reset(newTokenPosition.x, newTokenPosition.y);
    },//end updateTokenPosition******************************************
	
	updatePlayerPosition: function() {
		//array to hold spawn locations for player
        var playerPosition = [
            {x: 140, y: 90}, {x: 250, y: 90}, {x: 360, y: 90}, 
            {x: 60, y: 180}, {x: 440, y: 180}, 
			{x: 140, y: 270}, {x: 250, y: 270}, {x: 360, y: 270},
            {x: 40, y: 360}, {x: 320, y: 360}, 
			{x: 180, y: 360}, {x: 450, y: 360} 
        ];

        for (var i = 0; i < playerPosition.length; i++) {
            if (playerPosition[i].x == this.player.x) {
                playerPosition.splice(i, 1);
            }
        }
		
		//get random spawn location
        var newPlayerPosition = game.rnd.pick(playerPosition);
        this.player.reset(newPlayerPosition.x, newPlayerPosition.y);
    },//end updatePlayerPosition*****************************************

    addBarrel: function() {
        var barrel = this.barrels.getFirstDead();

        if (!barrel) {
            return;
        }
		
		//create barrel and add to the world
        barrel.anchor.setTo(0.5, 1);
        barrel.reset(game.width/2, 0);
        barrel.body.gravity.y = 500;
        barrel.body.velocity.x = 100 * game.rnd.pick(
										[-1.5, -1, -0.5, 0.5, 1, 1.5]);
		
		//set barrel 
		barrel.animations.add('roll', [0, 1, 2, 3, 4, 5, 6, 7], 12, true);
		barrel.animations.play('roll');
		if (barrel.body.velocity.x > 0){
			barrel.scale.x = -1;			
		}
		else if (barrel.body.velocity.x < 0){
			barrel.scale.x = 1;
		}
        barrel.body.bounce.x = 1;
        barrel.checkWorldBounds = true;
        barrel.outOfBoundsKill = true;
    },//end addBarrel****************************************************

    createWorld: function() {
		//create wall group and enable body
		this.walls = game.add.group();
		this.walls.enableBody = true;
		
		//add verticle walls
		game.add.sprite(0, 0, 'wallV', 0, this.walls); 
        game.add.sprite(480, 0, 'wallV', 0, this.walls); 
		game.add.sprite(0, 300, 'wallV', 0, this.walls); 
        game.add.sprite(480, 300, 'wallV', 0, this.walls); 
		
		//add ceiling
        game.add.sprite(0, 0, 'wallH', 0, this.walls); 
        game.add.sprite(300, 0, 'wallH', 0, this.walls);
		
		//add floor
        game.add.sprite(0, 385, 'wallH', 0, this.walls); 
        game.add.sprite(300, 385, 'wallH', 0, this.walls);
		
		//add wall ledges
        game.add.sprite(-100, 210, 'wallH', 0, this.walls); 
        game.add.sprite(400, 210, 'wallH', 0, this.walls); 
		
		//add middle platforms
        var middleTop = game.add.sprite(100, 110, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 290, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);
		
		//set walls as immovable
        this.walls.setAll('body.immovable', true);
    },//end createWorld**************************************************

    playerDie: function() {
		//this.player.animations.play('dead', 8, true);
		
		
		if (!this.player.inWorld){
			this.player.kill();
			var killTime = 90;
			// Flash the color white for 300ms
			game.camera.flash(0xffffff, killTime);
			
			// Shake for 300ms with an intensity of 0.02
			game.camera.shake(0.02, killTime);
			
		}
		else {
			this.player.kill();
			// Set the position of the emitter on top of the player
			this.emitter.x = this.player.x;
			this.emitter.y = this.player.y;
			// Start the emitter by exploding 15 particles that will live 800ms
			this.emitter.start(true, 800, null, 15);
		}
		
		// Play the sound and go to the menu state
		this.deadSound.play();
		this.music.stop();
		
		
		// Call the 'startMenu' function in 1000ms
		game.time.events.add(1000, this.startMenu, this);
		
		//increment and display new death total
		// this.death ++;
		// this.deathLabel.text = 'Deaths: ' + this.death;
    },
	
	startMenu: function() {
		
		game.state.start('menu');
	},
	
	updateTimer: function() {
		//timer to count down from 120 seconds to 0
		var newTime = game.time.now;
		this.runTime = (Math.floor((newTime - this.startTime) / 1000) % 121) + 1;
		this.elaspsedTime = 121 - this.runTime;
		this.timeLabel.text = 'Time: ' + this.elaspsedTime;
		
		//when time runs out handle end of game buy setting gameOn to false and 
		//stopping the event that spawns the barrels
		if (this.elaspsedTime < 1){
			this.timeLabel.text = 'Time: 0';
			game.time.events.remove(this.makeBarrels);
			game.add.text(game.width/2 - 60, game.height/2, 'GAME OVER', 
						{ font: '18px Arial', fill: '#ffffff', align: 'center'});
			console.log('GAME OVER');
			this.gameOn = false;
			game.state.start('menu');
		}
	},
	
};
