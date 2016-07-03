
//====================================================================

var playState = {
    /** 
    * Establish eureca client and setup some globals
    */
    init: function(){
        //Add the server client for multiplayer
        this.client = new Eureca.Client();
        
        game.global.playerReady = false;

        game.global.dude = false;

    },
    /**
    * Calls the dude's update method
    */
    update: function() {
    	if (!game.global.dude) 
    	    return;  	    
        
        game.global.dude.update();


    },
    /**
    * Initialize the multiPlayer methods
    * and bind some keys to variables
    */
    create: function(){
        this.initMultiPlayer(game, game.global);
        
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    },
    
    /**
    * Handles communication with the server
    */
    initMultiPlayer: function(game, globals){
        
        // Reference to our eureca so we can call functions back on the server
        var eurecaProxy;
        
        /**
        * Fires on initial connection
        */
        this.client.onConnect(function (connection) {
            console.log('Incoming connection', connection);
            
        });
        /**
        * When the connection is established and ready
        * we will set a local variable to the "serverProxy" 
        * sent back by the server side.
        */
        this.client.ready(function (serverProxy) {
             // Local reference to the server proxy to be 
             // used in other methods within this module.
             eurecaProxy = serverProxy;

        });
        
        /**
        * This sets the players id that we get from the server
        * It creates the instance of the player, and communicates
        * it's state information to the server.
        */
        this.client.exports.setId = function(id){
            console.log("Setting Id:" + id);

            // Assign my new connection Id
            globals.myId = id;
            
            // Create new "dude"
            globals.dude = new Player(id, game, eurecaProxy);
            
            // Put instance of "dude" into list
            globals.playerList[id] = globals.dude;
            
            //Send state to server
            eurecaProxy.initPlayer(id, globals.dude.state);
            
            // debugging
            console.log(globals.playerList);

            // Were ready to go
            globals.playerReady = true;
            
            // Send a handshake to say hello to other players.
            eurecaProxy.handshake();
            

            
        }
        /**
        * Called from server when another player "disconnects"
        */
        this.client.exports.kill = function(id){	
            if (globals.playerList[id]) {
                //globals.playerList[id].kill();
                console.log('killing ', id, globals.playerList[id]);
            }
        }	
        /**
        * This is called from the server to spawn enemy's in the local game
        * instance.
        */
        this.client.exports.spawnEnemy = function(id, enemy_state, x, y){
            
            if (id == globals.myId){
                return; //this is me
            }
            
            //if the id doesn't exist in your local table
            // then spawn the enemy
			console.log('player list : ', globals.playerList);
			
			console.log('Spawning New Player');
			if(!globals.playerList[id]){
				var newDude = new Player(id, game);
				newDude.sprite.tint = enemy_state.tint;
				globals.playerList[id] = newDude;
			}
						
		
            console.log('enemy state: ', id, enemy_state);
			//console.log(newPlayer);
    
            //globals.playerList[id] = enemy_state;
            
            console.log(globals.playerList);

        }

        /**
        * This is called from the server to update a particular players
        * state. 
        */       
        this.client.exports.updateState = function(id, player_state){
            //console.log(id, player_state);
            
            // Don't do anything if its me
            if(globals.myId == id){
                return;
            }
            
            // If player exists, update that players state. 
            if (globals.playerList[id])  {
                globals.playerList[id].sprite.x = player_state.x;
				globals.playerList[id].sprite.y = player_state.y;
            }
            
            //now how do we update everyone??
			
		}        
    },
    /**
    * Not used
    */
    render: function(){
       
    },
    /**
    * Not used, but could be called to go back to the menu.
    */
    startMenu: function() {
        game.state.start('menu');
    },
};

function Player(index, game, proxyServer) {
    
    this.x = 0;
    this.y = 0;
    this.old_x = this.x;
    this.old_y = this.y;

    this.game = game;
    
    this.player_id = index;
    
    
    this.alive = true;                  // player alive or dead

    this.proxy = proxyServer;                  // reference to proxy server
    
    this.tint = Math.random() * 0xffffff;                   // player tint
	

    this.sprite = this.game.add.sprite(this.x, this.y, 'dude');
	this.sprite.tint = this.tint;

    this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    this.state = {alive : true, 
				tint: this.tint,
				x : this.x,
				y : this.y};             // state info about player

    this.health = 30;                                                               // player health 
    this.startTime = this.game.time.time;;                                          // starting game time  

}


Player.prototype.update = function() {
		this.state.tint = this.tint;
		this.state.x = this.sprite.x;
        this.state.y = this.sprite.y;
        this.state.alive = this.alive;
        this.state.health = this.health;
    
        // Send your own state to server on your update and let
        // it do whatever with it. 
        this.proxy.handleState(this.player_id, this.state);

        if (this.upKey.isDown)
        {
            this.sprite.y-=3;
        }
        else if (this.downKey.isDown)
        {
            this.sprite.y+=3;
        }

        if (this.leftKey.isDown)
        {
            this.sprite.x-=3;
        }
        else if (this.rightKey.isDown)
        {
            this.sprite.x+=3;
        } 
    
        this.old_x = this.sprite.x;
        this.old_y = this.sprite.y;
};


Player.prototype.render = function() {

};

Player.prototype.kill = function() {
    this.alive = false;
    this.sprite.kill();
};
/* function player(index, game, proxyServer) {

	
    player.prototype.init = function(index, game, proxyServer){
    
		this.game = game;
		
        this.player_id = index;
    
        this.proxy = proxyServer;
    
        this.sprite = this.game.add.sprite(this.x, this.y, 'dude');
    
        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.health = 30;
	    
        this.state = {alive:true, tint:this.tint, x:this.x, y:this.y};
        this.x = 0; 
        this.y = 0;
        this.alive = true;
        this.tint = Math.random() * 0xffffff;
		this.sprite.tint = this.tint;
        this.sprite.id = index;
        this.state.alive = true;
        this.startTime = this.game.time.time;
        
    };
    
    // Part of your assignment 
    // you need to 
    player.prototype.updateState = function (enemy_id, state){
        if(this.game.time.time - this.startTime > 2000){
            console.log(game.time.time);
            for(s in this.state){
                console.log(this.state[s]);
            }
            this.startTime = this.game.time.time;
        }
    };

    player.prototype.update = function () {
        this.state.tint = this.tint;
        this.state.x = this.sprite.x;
        this.state.y = this.sprite.y;
        this.state.alive = this.alive;
        this.state.health = this.health;
    
        // Send your own state to server on your update and let
        // it do whatever with it. 
        this.proxy.handleState(this.player_id, this.state);

        if (this.upKey.isDown)
        {
            this.sprite.y-=3;
        }
        else if (this.downKey.isDown)
        {
            this.sprite.y+=3;
        }

        if (this.leftKey.isDown)
        {
            this.sprite.x-=3;
        }
        else if (this.rightKey.isDown)
        {
            this.sprite.x+=3;
        } 
    
        this.old_x = sprite.x;
        this.old_y = sprite.y;
    };
    
    player.prototype.render = function() {
        this.game.debug.text( "This is debug text", 100, 380 );
    };

    player.prototype.kill = function() {
        this.alive = false;
        this.sprite.kill();
    };
    
    this.init(index, game, proxyServer);
    
    return {
        render : this.render,
        updateState : this.updateState,
        update : this.update,
        kill : this.kill
    };
}; */