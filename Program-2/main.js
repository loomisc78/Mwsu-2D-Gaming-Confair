var mainState = {
	//preload game assets
    preload: function() {
        game.load.spritesheet('player', 'assets/monkey.png', 49, 42);
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        game.load.image('token', 'assets/banana-small.png');
        game.load.spritesheet('barrel', 'assets/barrels.png', 36, 35);
		game.load.image('sky', 'assets/sky.png');
    },//end preload******************************************************
	
    create: function() { 
		//variable to control end game. set to false when time runs out
		this.gameOn = true;
		
		//set game physics and add background
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.renderer.renderSession.roundPixels = true;
		game.add.sprite(0, 0, 'sky');
		
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
		//this.player.animations.add('dead', [13, 14, 15, 16, 17], 12, false);

        this.createWorld();
		
		//create banana token
        this.token = game.add.sprite(60, 180, 'token');
        game.physics.arcade.enable(this.token); 
        this.token.anchor.setTo(0.5, 0.5);

		//set create score, death, and timer labels and add to surface
        this.score = 0;
		this.scoreLabel = game.add.text(30, 30,'Score: 0', 
										{ font: '18px Arial', fill: '#ffffff'});
        
		this.death = 0;
		this.deathLabel = game.add.text(360, 360, 'Deaths: 0', 
										{ font: '18px Arial', fill: '#ffffff'});
        
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
            this.player.body.velocity.y = -320;
        }      
    },//end movePlayer***************************************************

    takeToken: function(player, token) {
        //update score and move token to new location
		this.score += 5;
        this.scoreLabel.text = 'score: ' + this.score;
        this.updateTokenPosition();
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
		barrel.animations.add('roll', [0, 1, 2, 3, 4, 5, 6, 7, 8], 12, true);
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
		//stop player animation then update position
		this.player.animations.stop();
				
		//have death animation for player but unable to figure out how to
		//pause animation and velocity of other spites to play
		//this.player.animations.play('dead');
		this.updatePlayerPosition();
		
		//increment and display new death total
		this.death ++;
		this.deathLabel.text = 'Deaths: ' + this.death;
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
		}
	},
	
};

var game = new Phaser.Game(500, 405, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');