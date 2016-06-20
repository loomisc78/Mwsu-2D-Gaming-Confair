var SpaceHipster = SpaceHipster || {};

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
	create: function() {
		//set world dimensions
		this.game.world.setBounds(0, 0, 1920, 1920);

		//background
		this.background = this.game.add.tileSprite(0, 
												0, 
												this.game.world.width, 
												this.game.world.height, 
												'space');

		//create player
		this.player = this.game.add.sprite(this.game.world.centerX, 
										this.game.world.centerY, 
										'playership');
		this.player.scale.setTo(0.5);
		this.player.anchor.setTo(0.5, 0.5);

		//player initial score of zero
		this.playerScore = 0;

		//enable player physics
		this.game.physics.arcade.enable(this.player);
		this.playerSpeed = 120;
		this.player.body.collideWorldBounds = true;

		//the camera will follow the player in the world
		this.game.camera.follow(this.player);

		//generate game elements
		this.generateCollectables();
		this.generateAsteriods();

		//show score
		this.showLabels();

		//sounds
		this.explosionSound = this.game.add.audio('explosion');
		this.collectSound = this.game.add.audio('collect');
		this.cannonSound = this.game.add.audio('cannon');
		this.asteroidExplosionSound = this.game.add.audio('rockX');

		//create bullets
		this.bullets = this.game.add.group();
		this.bullets.enableBody = true;
		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(30, 'bullet');
		this.bullets.setAll('anchor.x', 0.5);
		this.bullets.setAll('anchor.y', 1);
		this.bullets.setAll('outOfBoundsKill', true);
		this.bullets.setAll('checkWorldBounds', true);
		this.bulletTime = 0;
		
		//add controls and add fire button and have it call fireBullet()
		this.cursors = this.game.input.keyboard.createCursorKeys(); 
		this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.fireButton.onDown.add(this.fireBullet, this);
		this.wasd = {
			up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
		};

	},//end create**********************************************************************

	update: function() {
		//control for player movement
		if (this.cursors.up.isDown || this.wasd.up.isDown)
		{
			this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 
															200, 
															this.player.body.acceleration);
		}
		else
		{
			this.player.body.acceleration.set(0);
		}

		if (this.cursors.left.isDown || this.wasd.left.isDown)
		{
			this.player.body.angularVelocity = -300;
		}
		else if (this.cursors.right.isDown || this.wasd.right.isDown)
		{
			this.player.body.angularVelocity = 300;
		}
		else
		{
			this.player.body.angularVelocity = 0;
		}

		// if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
		// {
			// fireBullet();
		// }

		//collision between player and asteroids or asteroids and other asteroids
		this.game.physics.arcade.overlap(this.player, this.asteroids, this.hitAsteroid, null, this);
		this.game.physics.arcade.collide(this.asteroids, this.asteroids);	

		//overlapping between player and collectables
		this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
		
		//overlapping bewteen bullets and asteroids
		this.game.physics.arcade.overlap(this.bullets, this.asteroids, 
										this.explodeAsteroid, null, this);

	},//end update**************************************************************************

	generateCollectables: function() {
		
		//add a group of collectables
		this.collectables = this.game.add.group();

		//enable physics in them
		this.collectables.enableBody = true;
		this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

		//generate a random number of collectables
		var numCollectables = this.game.rnd.integerInRange(100, 150)
		var collectable;
		
		//add the collectables
		for (var i = 0; i < numCollectables; i++) {
			//add sprite
			collectable = this.collectables.create(this.game.world.randomX, 
												this.game.world.randomY, 
												'power');
			collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
			collectable.animations.play('fly');
		}
	},//end generateCollectables**************************************************************

	generateAsteroid: function(rockArray){
			//use a weighted pick to generate a number from the array. The modifier will
			//help determine how large the rock is and how fast it moves
			var modifier = this.game.rnd.weightedPick(rockArray);
			
			//variable to help prevent rocks spawning on the player at start. It is larger at 
			//higher levels due to the number of asteroids
			var rockGap = this.game.global.skillLevel * 75;
			
			//generate a random spawn point for this asteroid
			var spawn = {
				x: this.game.world.randomX,
				y: this.game.world.randomY
			};

			//if the random spawn point is inside the area set by the center +- the rockGap
			//a new random spawn point will be created and checked
			while ((spawn.x >= (this.game.world.centerX - rockGap) && 
				spawn.x <= (this.game.world.centerX + rockGap)) &&
				(spawn.y >= (this.game.world.centerY - rockGap) && 
				spawn.y <= (this.game.world.centerY + rockGap))){
					spawn.x = this.game.world.randomX;
					spawn.y = this.game.world.randomY;
				}
				
			//once the spawn has been checked for being in the rock gap, create it
			var asteriod = this.asteroids.create(spawn.x, spawn.y, 'rock');
			
			//scale the asteroid with respect to the weighted modifier 
			asteriod.scale.setTo(modifier / 7);
			
			//set the velocity using the modifier so larger asteroids move slower
			asteriod.body.velocity.x = (100 / modifier) * this.game.rnd.integerInRange(-2, 2);
			asteriod.body.velocity.y = (100 / modifier) * this.game.rnd.integerInRange(-2, 2);
			
			//set world collision and bounce of the asteroid
			asteriod.enableBody = true;			
			asteriod.body.collideWorldBounds = true;
			asteriod.body.bounce.x = 1;
			asteriod.body.bounce.y = 1;			
		
	},//end generateAsteroid****************************************************************
	
	generateAsteriods: function() {
		this.asteroids = this.game.add.physicsGroup(Phaser.Physics.ARCADE);

		//minmum and maximum asteroids
		var astMin;
		var astMax;
		
		//array to be used in the weighted random
		var rockArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		//set the minimum and maximum asteroids based on game level
		if (this.game.global.skillLevel == 1){
			astMin = 25;
			astMax = 50;
		}
		else if (this.game.global.skillLevel == 2){
			astMin = 50;
			astMax = 150;
		}
		else{
			astMin = 150;
			astMax = 250;		
		}
		
		//generate the number of asteroids
		var numAsteroids = this.game.rnd.integerInRange(astMin, astMax);
		
		//create the asteroids
		for (var i = 0; i < numAsteroids; i++){
			this.generateAsteroid(rockArray);
		}

	},//end generateAsteriods*****************************************************************
	
	hitAsteroid: function(player, asteroid) {
		//play explosion sound
		this.asteroidExplosionSound.play();

		//make the player explode
		var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
		emitter.makeParticles('rockParticle');
		emitter.minParticleSpeed.setTo(-200, -200);
		emitter.maxParticleSpeed.setTo(200, 200);
		emitter.gravity = 0;
		emitter.start(true, 1000, null, 100);
		
		//kill the player
		this.player.kill();
		
		//end the game, back to the menu
		this.game.time.events.add(800, this.gameOver, this);
	},//end hitAsteroid***********************************************************************
	
	gameOver: function() {    
	//pass it the score as a parameter 
	this.game.state.start('MainMenu', true, false, this.playerScore);
	},//end gameOver******************************************************************
	
	collect: function(player, collectable) {
	//play collect sound
	this.collectSound.play();

	//update score
	this.playerScore++;
	this.scoreLabel.text = this.playerScore;

	//remove sprite
	collectable.destroy();
	},//end collect*****************************************************************************
	
	showLabels: function() {
	//score text
	var text = "0";
	var style = { font: "20px Arial", fill: "#fff", align: "center" };
	this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
	this.scoreLabel.fixedToCamera = true;
	},//end showLabels************************************************************************

	fireBullet: function(){
		//  To avoid them being allowed to fire too fast we set a time limit	
		if (this.game.time.now > this.bulletTime)
		{
			//  Grab the first bullet we can from the pool
			bullet = this.bullets.getFirstExists(false);

			if (bullet)
			{
				//  spawn the bullet next to the player
				bullet.reset(this.player.x + 10, this.player.y + 4);
				
				//let the bullet live 2 seconds
				bullet.lifespan = 2000;

				//match the bullets trajectory to the ships
				bullet.rotation = this.player.rotation; 

				//set the velocity based on the players rotation
				this.game.physics.arcade.velocityFromRotation(this.player.rotation, 
															400, 
															bullet.body.velocity);

				//set the delay for the next shot
				this.bulletTime = this.game.time.now + 100;        
			}
			this.cannonSound.play();
		}
	},//end fireBullet********************************************************************
	
	explodeAsteroid: function (bullet, asteriod){
		bullet.kill();
		this.asteroidExplosionSound.play();
		
		//make the asteroid explode then kill it
		var emitter2 = this.game.add.emitter(asteriod.x, asteriod.y, 100);
		emitter2.makeParticles('rockParticle');
		emitter2.minParticleSpeed.setTo(-200, -200);
		emitter2.maxParticleSpeed.setTo(200, 200);
		emitter2.gravity = 0;
		emitter2.start(true, 1000, null, 100);
		asteriod.kill();
		console.log("boom!")
	},//end explodeAsteroid*******************************************************************
	
};

