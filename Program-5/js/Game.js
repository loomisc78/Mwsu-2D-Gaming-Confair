
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    create: function () {
		console.log(this.state.current); 
		var mapData = '';
		
		for (var row = 0; row < BasicGame.mapSizeRows; row ++){
			
			for (var col = 0; col < BasicGame.mapSizeCols; col ++){
				
				mapData += BasicGame.map[row][col].toString();
				
				if (col < BasicGame.mapSizeCols - 1){
					mapData += ',';
				}
			}
			
			if (row < BasicGame.mapSizeRows - 1){
				mapData += "\n";
			}
		}
		
		//  Add data to the cache
		this.game.cache.addTilemap('dynamicMap', null, mapData, Phaser.Tilemap.CSV);

		//  Create our map (the 12x12 is the tile size)
		floor = this.game.add.tilemap('dynamicMap', 12, 12);

		//  'tileset' = cache image key, 12x12 = tile size
		floor.addTilesetImage('tileset', 'tileset', 12, 12);

		//  0 is important
		layer = floor.createLayer(0);

		//  Scroll it
		layer.resizeWorld();

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		floor.setCollision([0,2]);
			
    },

    update: function () {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};
