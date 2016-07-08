BasicGame.Level2 = function(game) {

};

BasicGame.Level2.prototype = {
	create: function() { 

        //create player
        this.player = this.game.add.sprite(this.game.width/2, 
										this.game.height/2, 
										'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
		this.player.body.setSize(24, 42, 0, 0);
		
		//set animations. walk is player walk, dead is death throws that 
		//aim am still working on implementing
		this.player.animations.add('walk', [1, 2, 3, 4, 5, 6], 12, true);
		this.player.animations.add('dead', [13, 14, 15, 16, 17], 8, false);
		

        this.createWorld();
		
		//create banana token
        this.token = this.game.add.sprite(45, 85, 'token');
        this.game.physics.arcade.enable(this.token); 
        this.token.anchor.setTo(0.5, 0.5);

		//set create score, death, and timer labels and add to surface
        this.scoreLabel = this.game.add.text(30, 
											30,
											'Score: 0', 
											{ font: '18px Orbitron', fill: '#ffffff'});
        
		this.timeLabel = this.game.add.text(360, 
											30, 
											'Time: 120', 
											{ font: '18px Orbitron', fill: '#ffffff'});        
		
		//create barrels group for enemy barrels
        this.barrels = this.game.add.group();
        this.barrels.enableBody = true;
        this.barrels.createMultiple(15, 'barrel');
		
		//create event to spawn barrels every 3 seconds until stopped
        this.makeBarrels = this.game.time.events.loop(2200, this.addBarrel, this);	

		// Create the emitter with 15 particles. We don't need to set the x y
		// Since we don't know where to do the explosion yet
		this.emitter = this.game.add.emitter(0, 0, 15);

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
		
		this.game.physics.arcade.collide(this.player, this.layer);
		this.game.physics.arcade.collide(this.barrels, this.layer);
		this.game.physics.arcade.collide(this.barrels, this.barrels);
		this.game.physics.arcade.overlap(this.player, 
										this.token, 
										this.takeToken, 
										null, 
										this);
		this.game.physics.arcade.overlap(this.player, 
										this.barrels, 
										this.playerDie, 
										null, 
										this);
		this.movePlayer(); 
		this.updateTimer();

		if (!this.player.inWorld) {
			this.nextLevel();
		}		
    },//end update*******************************************************

    movePlayer: function() {
                
		//if key is pressed adjust velocity and animation accordingly 
		//player.scale.x flips the animation towards direction of travel
        if (BasicGame.wasd.left.isDown || BasicGame.leftArrow.isDown) {
            this.player.body.velocity.x = -200;
			this.player.animations.play('walk');
			this.player.scale.x = -1;
        }
        else if (BasicGame.wasd.right.isDown || BasicGame.rightArrow.isDown) {
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
		if ((BasicGame.wasd.up.isDown || BasicGame.upArrow.isDown) && this.player.body.onFloor) {
			this.jumpPlayer();
        }      
    },//end movePlayer***************************************************

    takeToken: function(player, token) {
        //update score and move token to new location
		BasicGame.score += 10;
		BasicGame.gameTime += 5;
        this.scoreLabel.text = 'score: ' + BasicGame.score;
		BasicGame.bananaSound.play();
		
		// Scale the coin to 0 to make it invisible
		this.token.scale.setTo(0, 0);
        this.updateTokenPosition();
		
		// Grow the coin back to its original scale in 300ms
		this.game.add.tween(this.token.scale).to({x: 1, y: 1}, 300).start();
		
		this.game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
    },//end takeToken****************************************************

    updateTokenPosition: function() {
        //set array for random token spawn
		var tokenPosition = [
            {x: 45, y: 85}, {x: 745, y: 85}, 
            {x: 85, y: 365}, {x: 705, y: 365}, 
			{x: 225, y: 585}, {x: 565, y: 585},
            {x: 400, y: 320} 
        ];
		
        for (var i = 0; i < tokenPosition.length; i++) {
            if (tokenPosition[i].x == this.token.x) {
                tokenPosition.splice(i, 1);
            }
        }
		
		//pick random tokenPosition from array
        var newTokenPosition = this.game.rnd.pick(tokenPosition);
        this.token.reset(newTokenPosition.x, newTokenPosition.y);
    },//end updateTokenPosition******************************************

    addBarrel: function() {
        var barrel = this.barrels.getFirstDead();

        if (!barrel) {
            return;
        }
		
		//create barrel and add to the world
        barrel.anchor.setTo(0.5, 1);
        barrel.reset(this.game.width/2, 0);
        barrel.body.gravity.y = 500;
        barrel.body.velocity.x = 100 * this.game.rnd.pick(
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
		// Create the tilemap
		this.map = this.game.add.tilemap('level2');

		// Add the tileset to the map
		this.map.addTilesetImage('jungle_set');

		// Create the layer by specifying the name of the Tiled layer
		this.layer = this.map.createLayer('Tile Layer 1');

		// Set the world size to match the size of the layer
		this.layer.resizeWorld();

		// Enable collisions for the tilset elements
		this.map.setCollision([1, 2, 12, 25, 26, 31, 32, 33, 34, 35, 36, 37, 38, 39]);
    },//end createWorld**************************************************
	
    playerDie: function() {	
		
		this.player.kill();	
		BasicGame.deadSound.play();
		// Set the position of the emitter on top of the player
		this.emitter.x = this.player.x;
		this.emitter.y = this.player.y;
		// Start the emitter by exploding 15 particles that will live 800ms
		this.emitter.start(true, 800, null, 15);
				
		BasicGame.gameTime = 0;
		BasicGame.music.stop();
				
		// Call the 'startMenu' function in 1000ms
		this.game.time.events.add(1000, this.startMenu, this);
    },//end playerDie*****************************************************
	
	startMenu: function() {
		this.game.state.start('MainMenu');
	},//end startMenu*****************************************************
	
	nextLevel: function() {
		this.game.state.start('Level2');
	},//end nextLevel*****************************************************
	
	updateTimer: function() {
		//timer to count down from 120 seconds to 0
		var newTime = this.game.time.now;
		BasicGame.runTime = (Math.floor((newTime - BasicGame.startTime) / 1000) % 121) + 1;
		this.elaspsedTime = 121 - BasicGame.runTime + BasicGame.gameTime;
		this.timeLabel.text = 'Time: ' + this.elaspsedTime;		
		
		//when time runs out handle stop the barrells spawning and 
		//change to MainMenu
		if (this.elaspsedTime < 1){
			this.timeLabel.text = 'Time: 0';
			this.game.time.events.remove(this.makeBarrels);
			BasicGame.gameTime = 0;
			this.game.add.text(this.game.width/2 - 60, 
						this.game.height/2, 
						'GAME OVER', 
						{ font: '18px Orbitron', fill: '#ffffff', align: 'center'});
			console.log('GAME OVER');
			
			this.game.state.start('MainMenu');
		}
	},//end updateTimer*****************************************************
           
    jumpPlayer: function() {
        // If the player is touching the ground
        if (this.player.body.onFloor()) {
            // Jump with sound
            this.player.body.velocity.y = -430;
            BasicGame.jumpSound.play();
        }
    },//end jumpPlayer*****************************************************
};