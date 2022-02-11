var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // Here's where we include socket.io as a node module 


// Serve the index page 
//app.get("/", function (request, response) {
//  response.sendFile(__dirname + '/index2.html'); 
//});
app.use(express.static('public'));
// Listen on port 5000
app.set('port', (process.env.PORT || 5000));

http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

	//get random range
	function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
	}

var players = {}; //Keeps a table of all players, the key is the socket id
var bullet_array = []; // Keeps track of all the bullets to update them on the server 
	var WORLD_SIZE = {w:2400,h:1600};
	var ground_tiles = [];
	var water_tiles = [];
	var tile_sprite = {x:0,y:0};
	var water_sprite = {x:0,y:0};

                // Create terrain tiles 
                for(var i=0;i<=WORLD_SIZE.w/64+1;i++){
                    for(var j=0;j<=WORLD_SIZE.h/64+1;j++){
						const tile_sprite = {x:i,y:j};
                        tile_sprite.x = i * 64;
						tile_sprite.y = j * 64;
						tile_sprite.alpha = getRandomArbitrary(0.6, 0.9);
						tile_sprite.type = 4;
                        ground_tiles.push(tile_sprite);
                    }
                }
				for(var i=0;i<=WORLD_SIZE.w/64+1;i++){
					for(var j=0;j<=WORLD_SIZE.h/64+1;j++){
					var alpha = getRandomArbitrary(0.0, 1.0);
					const water_sprite = {x:i,y:j};
					if(alpha>0.9){
					
					water_sprite.x = i * 64;
					water_sprite.y = j * 64;
					water_sprite.alpha = alpha;
					water_sprite.type = Math.round(getRandomArbitrary(0,2));
					}
					water_tiles.push(water_sprite);			
					}
				}

// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
	// Listen for a new player trying to connect
	socket.on('new-player',function(state){
		console.log("New player joined with state:",state);
		players[socket.id] = state;
		// Broadcast a signal to everyone containing the updated players list
		socket.emit('generate-map1',ground_tiles);
		socket.emit('generate-map2',water_tiles);
		io.emit('update-players',players);
	})
  
  // Listen for a disconnection and update our player table 
  socket.on('disconnect',function(state){
    delete players[socket.id];
    io.emit('update-players',players);
	console.log("player",players[socket.id],"has left")
  }) 
  
  socket.on('del-bul',function(state){
    io.emit('bullets-update',state);
	console.log("logged:");
  }) 
  
  // Listen for move events and tell all other clients that something has moved 
  socket.on('move-player',function(position_data){
    if(players[socket.id] == undefined) return; // Happens if the server restarts and a client is still connected 
    players[socket.id].x = position_data.x;  
    players[socket.id].y = position_data.y; 
    players[socket.id].angle = position_data.angle; 
    io.emit('update-players',players);
  })

  
  // Listen for shoot-bullet events and add it to our bullet array
  socket.on('shoot-bullet',function(data){
    if(players[socket.id] == undefined) return;
    data.owner_id = socket.id; // Attach id of the player to the bullet 
	var new_bullet = data;
    if(Math.abs(data.speed_x) > 25 || Math.abs(data.speed_y) > 25){
      console.log("Player",socket.id,"is cheating!");
    }
    bullet_array.push(new_bullet);
	io.emit("bullets-update",bullet_array);
  });
})

// Update the bullets 60 times per frame and send updates 
function ServerGameLoop(){
  for(var i=0;i<bullet_array.length;i++){
    var bullet = bullet_array[i];
	  
	bullet.x += bullet.speed_x; 
	bullet.y += bullet.speed_y; 

	for(water_sprite in water_tiles)
	/*for(var jj=0;jj<water_tiles;jj++)*/{
	  if(bullet.owner_id != id){
		var aa = water_tiles[water_sprite].x - bullet.x;
		var bb = water_tiles[water_sprite].y - bullet.y;
		var bdist = Math.hypot(aa,bb);
		if(bdist < 32){
		//bullet.speed_x = 0; 
		//bullet.speed_y = 0; 
        bullet_array.splice(i,1);
        i--;
		io.emit("bullets-update",bullet_array);
		console.log("bullet collided with world");
		}
	  }
	}
    
    // Check if this bullet is close enough to hit any player 
    for(var id in players){
      if(bullet.owner_id != id){
        // And your own bullet shouldn't kill you
        var dx = players[id].x - bullet.x; 
        var dy = players[id].y - bullet.y;
        var dist = Math.hypot(dx,dy);
        if(dist < 32){
          io.emit('player-hit',id); // Tell everyone this player got hit
        }
      }
    }
    
    // Remove if it goes too far off screen 
    if(bullet.x < 0 || bullet.x > 2400 || bullet.y < 0 || bullet.y > 1600){
		//bullet.destroy();
        bullet_array.splice(i,1);
        i--;
		io.emit("bullets-update",bullet_array);
		console.log("bullet deleted edge of screen")
    }
       
  }
  // Tell everyone where all the bullets are by sending the whole array
  io.emit("bullets-update",bullet_array);
}

setInterval(ServerGameLoop, 16); 
