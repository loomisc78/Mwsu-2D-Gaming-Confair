var mainState = {
	
    preload: function() {
        game.load.spritesheet('player', 'assets/monkey.png', 49, 42);
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        game.load.image('token', 'assets/banana-small.png');
        game.load.spritesheet('barrell', 'assets/barrells.png', 36, 35);
		game.load.image('sky', 'assets/sky.png');
    },
	


    create: function() { 
		this.gameOn = true;
		//game.stage.backgroundColor = '#3498db';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.renderer.renderSession.roundPixels = true;
		game.add.sprite(0, 0, 'sky');
		

        //set keys for game play
		this.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		this.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		this.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
		this.player.body.setSize(24, 42, 0, 0);
		
		//  Our animations, walk and barrell roll
		this.player.animations.add('walk', [1, 2, 3, 4, 5, 6], 12, true);
		this.player.animations.add('dead', [13, 14, 15, 16, 17], 12, false);

        this.createWorld();

        this.token = game.add.sprite(60, 180, 'token');
        game.physics.arcade.enable(this.token); 
        this.token.anchor.setTo(0.5, 0.5);

        this.scoreLabel = game.add.text(30, 30, 'Score: 0', { font: '18px Arial', fill: '#ffffff'});
        this.score = 0;
		
		this.deathLabel = game.add.text(360, 360, 'Deaths: 0', { font: '18px Arial', fill: '#ffffff'});
        this.death = 0;
		
		this.timeLabel = game.add.text(360, 30, 'Time: 120', { font: '18px Arial', fill: '#ffffff'});
        this.elaspsedTime;
		this.lastTime = 0;
		this.startTime = game.time.now;

        this.barrells = game.add.group();
        this.barrells.enableBody = true;
        this.barrells.createMultiple(10, 'barrell');
		

        this.makeBarrells = game.time.events.loop(3000, this.addbarrell, this);
		
    },

    update: function() {
		if (this.gameOn){
			game.physics.arcade.collide(this.player, this.walls);
			game.physics.arcade.collide(this.barrells, this.walls);
			game.physics.arcade.collide(this.barrells, this.barrells);
			game.physics.arcade.overlap(this.player, this.token, this.taketoken, null, this);
			game.physics.arcade.overlap(this.player, this.barrells, this.playerDie, null, this);

			this.movePlayer(); 
			this.updateTimer();


			if (!this.player.inWorld) {
				this.playerDie();
			}
		}
		
    },

    movePlayer: function() {
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
		
		if (this.space.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -320;
        } 

     
    },

    taketoken: function(player, token) {
        this.score += 5;
        this.scoreLabel.text = 'score: ' + this.score;

        this.updatetokenPosition();
    },

    updatetokenPosition: function() {
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

        var newTokenPosition = game.rnd.pick(tokenPosition);
        this.token.reset(newTokenPosition.x, newTokenPosition.y);
    },
	
	updatePlayerPosition: function() {
        var playerPosition = [
            {x: 140, y: 90}, {x: 250, y: 90}, {x: 360, y: 90}, 
            {x: 60, y: 180}, {x: 440, y: 180}, 
			{x: 140, y: 270}, {x: 250, y: 270}, {x: 360, y: 270},
            {x: 40, y: 360}, {x: 320, y: 360}, {x: 180, y: 360}, {x: 450, y: 360} 
        ];

        for (var i = 0; i < playerPosition.length; i++) {
            if (playerPosition[i].x == this.player.x) {
                playerPosition.splice(i, 1);
            }
        }

        var newPlayerPosition = game.rnd.pick(playerPosition);
        this.player.reset(newPlayerPosition.x, newPlayerPosition.y);
    },

    addbarrell: function() {
        var barrell = this.barrells.getFirstDead();

        if (!barrell) {
            return;
        }

        barrell.anchor.setTo(0.5, 1);
        barrell.reset(game.width/2, 0);
        barrell.body.gravity.y = 500;
        barrell.body.velocity.x = 100 * game.rnd.pick([-1.5, -1, -0.5, 0.5, 1, 1.5]);
		barrell.animations.add('roll', [0, 1, 2, 3, 4, 5, 6, 7, 8], 12, true);
		barrell.animations.play('roll');
		if (barrell.body.velocity.x > 0){
			barrell.scale.x = -1;			
		}
		else if (barrell.body.velocity.x < 0){
			barrell.scale.x = 1;
		}
        barrell.body.bounce.x = 1;
        barrell.checkWorldBounds = true;
        barrell.outOfBoundsKill = true;
    },

    createWorld: function() {
		this.walls = game.add.group();
		this.walls.enableBody = true;
		
		game.add.sprite(0, 0, 'wallV', 0, this.walls); 
        game.add.sprite(480, 0, 'wallV', 0, this.walls); 
		game.add.sprite(0, 300, 'wallV', 0, this.walls); 
        game.add.sprite(480, 300, 'wallV', 0, this.walls); 
		
        game.add.sprite(0, 0, 'wallH', 0, this.walls); 
        game.add.sprite(300, 0, 'wallH', 0, this.walls);
		
        game.add.sprite(0, 385, 'wallH', 0, this.walls); 
        game.add.sprite(300, 385, 'wallH', 0, this.walls);
		
        game.add.sprite(-100, 200, 'wallH', 0, this.walls); 
        game.add.sprite(400, 200, 'wallH', 0, this.walls); 
		
        var middleTop = game.add.sprite(100, 110, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 290, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);

        this.walls.setAll('body.immovable', true);
    },

    playerDie: function() {	
		this.player.animations.stop();
		this.player.animations.play('dead');
		this.updatePlayerPosition();
		this.death ++;
		this.deathLabel.text = 'Deaths: ' + this.death;
    },
	
	updateTimer: function() {
		var newTime = game.time.now;
		this.runTime = (Math.floor((newTime - this.startTime) / 1000) % 120) + 1;
		this.elaspsedTime = 120 - this.runTime;
		this.timeLabel.text = 'Time: ' + this.elaspsedTime;
		console.log(this.elaspsedTime);
		if (this.elaspsedTime < 1){
			this.timeLabel.text = 'Time: 0';
			game.time.events.remove(this.makeBarrells);
			var gameOver = game.add.text(game.width/2 - 60, game.height/2,  
										'GAME OVER', { font: '18px Arial', fill: '#ffffff', align: 'center'});
			console.log('GAME OVER');
			this.gameOn = false;
		}
	},
	
};

var game = new Phaser.Game(500, 405, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');