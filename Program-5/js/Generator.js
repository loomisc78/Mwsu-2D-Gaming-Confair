
BasicGame.Generator = function (game) {

};

BasicGame.Generator.prototype = {

    //the majority of the map generation concept and design from 
    //bigbadwaffle @ http://jsfiddle.net/bigbadwaffle/YeazH/
    
    preload: function(){
        console.log(this.state.current);
        //define the map properties
        this.mapProp = {
            tileWth: 12,
            tileHgt: 12,
            mapPixWth: this.game.width,
            mapPixHgt: this.game.height
        };
        
        
        
        //the number of tiles for the width and height
        this.mapSizeW = this.mapProp.mapPixWth / this.mapProp.tileWth;
        this.mapSizeH = this.mapProp.mapPixHgt / this.mapProp.tileHgt;
        
        console.log(this.mapSizeW);
        console.log(this.mapSizeH);
                
        //create a 2d array to hold the tile map
        this.map = [];
        
        //room parameters, maximum number of rooms, and the maximum number of retries 
        //due to a room overlapping another room. Map stops generating rooms when a room
        //overlaps a number of times equal to maxRoomFails
        this.room_count = this.game.rnd.integerInRange(10, 30);
        this.placed_rooms = 0;
        this.maxRoomFails = 20;
        
        //array to hold the rooms
        this.rooms = [];        
        
        this.defineMap();        
    },//end preload*************************************************************************
    
    create: function (){
    
    },//end create*************************************************************************
        
    update: function (){
    
    },//end update*************************************************************************
        
    render: function (){
        
    },//end render*************************************************************************
    
    defineMap: function(){
        //fill the map with 0
        for (var x = 0; x < this.mapSizeH; x++){
            this.map[x] = [];
            for (var y = 0; y < this.mapSizeW; y++)
                {
                    this.map[x][y] = 0;
                }            
        } 
        this.consoleMap();
        //minimum room size, maximum room size, and the number of times a room has failed 
        //to place because of overlapping
        var minRoom = 5;
        var maxRoom = 15;
        var roomFails = 0;
        
        //generate and place a room
        for (var i = 0; i < this.room_count && roomFails < this.maxRoomFails; i++){
            var room = {};
            
            //generate random values for x, y, width and height
            room.x = this.game.rnd.integerInRange(1, this.mapSizeW - maxRoom - 1);
            room.y = this.game.rnd.integerInRange(1, this.mapSizeH - maxRoom - 1);
            room.width = this.game.rnd.integerInRange(minRoom, maxRoom);
            room.height = this.game.rnd.integerInRange(minRoom, maxRoom);
            
            //check for collision with rooms that have already been created
            if (this.doesCollide(room)){
                i--;
                roomFails ++;
                continue;
            }
            
            //shrink the width and height
            room.width --;
            room.height --;
            
            //push the current room onto the list
            this.rooms.push(room);
            roomFails = 0;
        }
        console.log(this.rooms.length);  
        //loop through rooms and connect them to the closest room
        for (i = 0; i < this.rooms.length; i++){
            var roomA = this.rooms[i];
            var roomB = this.findClosestRoom(roomA);
            
            //pick a random point in room A
            pointA = {
                colA: this.game.rnd.integerInRange(roomA.x, roomA.x + roomA.width),
                rowA: this.game.rnd.integerInRange(roomA.y, roomA.y + roomA.height)
            };
            
            //pick a random point in room B
            pointB = {
                colB: this.game.rnd.integerInRange(roomB.x, roomB.x + roomB.width),
                rowB: this.game.rnd.integerInRange(roomB.y, roomB.y + roomB.height)
            };
            
            //move along the line from pointA to pointB putting 1 in each location along the way
            while ((pointB.colB != pointA.colA) || (pointB.rowB != pointA.rowA)){
                if (pointB.rowB != pointA.rowA) {
                    if (pointB.colB > pointA.colA) 
                        pointB.colB--;
                    else 
                        pointB.colB++;
                } else if (pointB.rowB != pointA.rowA) {
                    if (pointB.rowB > pointA.rowA) 
                        pointB.rowB--;
                    else 
                        pointB.rowB++;
                }
                console.log(this.map[pointB.rowB][pointB.colB]);
                //console.log(pointB.rowB + " " + pointB.colB);
                this.map[pointB.rowB][pointB.colB] = 1;
            }
        }
        
        //loop through the rooms and assign each square to 1 of each room to set the room floors
        for (i = 0; i < this.rooms.length; i++) {
            var room = this.rooms[i];
            for (var x = room.x; x < room.x + room.width; x++) {
                for (var y = room.y; y < room.y + room.height; y++) {
                    this.map[x][y] = 1;
                }
            }
        }
        
        //loop through the map and set walls, for each square that has a 1 place a 2 in any adjacent 
        //square that has 0
        for (var x = 0; x < this.mapSizeH; x++) {
            for (var y = 0; y < this.mapSizeW; y++) {
                if (this.map[x][y] == 1) {
                    for (var xx = x - 1; xx <= x + 1; xx++) {
                        for (var yy = y - 1; yy <= y + 1; yy++) {
                            if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
                        }
                    }
                }
            }
        }
        this.consoleMap();
        console.log(this.map);
    },//end defineMap*********************************************************************
    
    doesCollide(room){
        //loop through the rooms looking for one overlapping x and/or y values
        for (var i = 0; i < this.rooms.length; i++) {
            var check = this.rooms[i];
            if (!((room.x + room.width < check.x) || 
                  (room.x > check.x + check.width) || 
                  (room.y + room.height < check.y) || 
                  (room.y > check.y + check.height))) 
                return true;
        }
        return false;

    },//end doesCollide********************************************************************
    
    findClosestRoom(room){
        var mid = {
            x: room.x + (room.width / 2),
            y: room.y + (room.height / 2)
        };
        var closest = null;
        var closest_distance = 1000;
        
        //loop through rooms looking for the closeset one
        for (var i = 0; i < this.rooms.length; i++){
            var check = this.rooms[i];
            if (check == room)
                continue;
            
            var check_mid = {
                x: check.x + (check.width / 2),
                y: check.y + (check.height / 2)
            };
            
            var distance = Math.min(Math.abs(mid.x - check_mid.x) -
                                   (room.width / 2) - (check.width / 2), 
                                   Math.abs(mid.y - check_mid.y) -
                                   (room.height / 2) - (check.height / 2));
            if (distance < closest_distance){
                closest_distance = distance;
                closest = check;
            }            
        }
        return closest;        
    },//end findClosestRoom*****************************************************************
    
    consoleMap: function(){
            var rows = this.mapSizeH;
            var cols = this.mapSizeW;
            var line = "";
            for (var r = 0; r < rows; r++) {
                line = "";
                for (var c = 0; c < cols; c++) {
                    line += this.map[r][c] + " ";
                }
                console.log(line);
            }
    }//end consoleMap*********************************************************************
}

    
    
    