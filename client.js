//this file is just a reference

	    var WINDOW_WIDTH = 1200;
            var WINDOW_HEIGHT = 800;
	
	
	var config = {
		type: Phaser.AUTO,
		width: WINDOW_WIDTH,
		height: WINDOW_HEIGHT,
		pixelArt: false,
		roundPixels: true,
		scene: {
			preload: preload,
			create: create,
			update: update,
			render: render,
		}
	};
	
	var game = new Phaser.Game(config);
	
	
	var WORLD_SIZE = {w:2400,h:1600};
	var ground_tiles = [];
	var water_tiles = [];
	var bullet_array = [];
	var playerBullet_array = [];
	var flash_array = [];
	var serverflash_array = [];
    var socket; //Declare it in this scope, initialize in the `create` function
    var other_players = {};
	var POS ={x:Math.random() * WORLD_SIZE.w/2 + WORLD_SIZE.w/2,y:Math.random() * WORLD_SIZE.h/2 + WORLD_SIZE.h/2};
	
	
	var player = {
		sprite:null,
		xprevious:0,
		yprevious:0,
		speed_x:0,
		speed_y:0,
		speed:0.3,
		friction:0.9,
		shot:false,
		update: function(camera,scene,socket){
		//rotate towards mouse
		let angle=Phaser.Math.Angle.Between(this.sprite.x + camera.x,this.sprite.y + camera.y,scene.input.mousePointer.x,scene.input.mousePointer.y);
		this.sprite.rotation=(angle+Math.PI*2);
		//update position
		this.sprite.x += this.speed_x;
		this.sprite.y += this.speed_y;
		//friction
		this.speed_x *= this.friction;
		this.speed_y *= this.friction;
		//shoot bullet
		if(this.shot){
			//create speed vector
		    var speed_x = Math.cos(this.sprite.rotation + Math.PI * 2) * 25;
            var speed_y = Math.sin(this.sprite.rotation + Math.PI * 2) * 25;
			//create sprite objects
			playerbullet = scene.add.sprite(this.sprite.x,this.sprite.y,'bullet').setOrigin(-1.75,getRandomArbitrary(-0.25,0.25));
			playerflash = scene.add.sprite(this.sprite.x,this.sprite.y,'flash').setOrigin(-0.60,0);
			//set variables
			playerflash.rotation = this.sprite.rotation;
			playerflash.alpha = 1;
			playerbullet.rotation = this.sprite.rotation;
			playerbullet.speed = this.speed;
			playerbullet.speed_x = speed_x;
			playerbullet.speed_y = speed_y;
			this.shot = false;
			//store bullet and muzzle flash object data in arrays
			playerBullet_array.push(playerbullet);
			flash_array.push(playerflash);
			socket.emit('shoot-bullet',{x:this.sprite.x,y:this.sprite.y,angle:this.sprite.rotation,speed_x:speed_x,speed_y:speed_y});
		}
                    // To make player flash when they are hit, set player.spite.alpha = 0
                    if(this.sprite.alpha < 1){
                        this.sprite.alpha += (1 - this.sprite.alpha) * 0.16;
                    } else {
                        this.sprite.alpha = 1;
                    }
		if(socket != undefined){
			if(this.sprite.x != this.xprevious || this.sprite.y != this.yprevious || this.sprite.rotation != this.aprevious)
			{
		socket.emit('move-player',{x:player.sprite.x,y:player.sprite.y,angle:player.sprite.rotation});
		this.xprevious=this.sprite.x;
		this.yprevious=this.sprite.y;
		this.aprevious=this.sprite.rotation;
			}
		}
		}
	};
	

	
	//player bullet object
		var playerbullet = {
			sprite:null,
			speed:player.speed,
			rotation:0,
			blendMode: 'ADD'
			};
			
		/*var Oplayerbullet = {
			sprite:null,
			speed_x:null,
			speed_y:null,
			speed:player.speed,
			rotation:0,
			blendMode: 'ADD'
			};*/
	//player flash object
		var playerflash = {
			sprite:null,
			rotation:0,
			blendMode: 'ADD'
			};
			
		/*var serverflash = {
			sprite:null,
			rotation:0,
			alpha:1,
			blendMode: 'ADD'
			};*/
					
	
	function preload(){
	this.load.image('water','images/water_tile.png');
	this.load.image('grass','images/grass.png');
	this.load.image('sand','images/sand.png');
	this.load.image('rock','images/rock.png');
	this.load.image('rockg','images/rockg.png');
	this.load.image('tree','images/tree.png');
	this.load.image('player','images/survivor-idle_rifle_0.png');
	this.load.image('bullet','images/bullet.png');
	this.load.image('flash','images/flash.png');
	}
			
			function addOtherPlayers(self,playerInfo){
				const otherPlayer = self.add.sprite(playerInfo.x,playerInfo.y,'player').setOrigin(0.2,0.5);
				otherPlayer.rotation = playerInfo.angle;
				otherPlayer.depth = 100;
				return otherPlayer;
			}
			
			function addPlayer(self){
				player.sprite = self.add.sprite(POS.x,POS.y,'player');
				player.sprite.setOrigin(0.2,0.5);
				player.update(self.cameras.main,self);
			}
			
			function addOtherFlash(self,playerInfo){
				var serverflash = self.add.sprite(playerInfo.x,playerInfo.y,'flash').setOrigin(-0.60,0);
				serverflash.rotation = playerInfo.angle;
				serverflash.alpha = 1;
				serverflash_array.push(serverflash);
			}
			
			function createTile(self,xx,yy,alpha,type){
					if(type == 0){var sprite = 'rock';}
					if(type == 1){var sprite = 'rockg';}
					if(type == 2){var sprite = 'tree';}
					if(type == 4){var sprite = 'grass';}
					const tile = self.add.sprite(xx,yy,sprite);
					tile.alpha = alpha;
				

				
			}
			
			function addOtherBullets(self,playerInfo){
				var Oplayerbullet = self.add.sprite(playerInfo.x,playerInfo.y,'bullet').setOrigin(-1.75,getRandomArbitrary(-0.25,0.25));
				Oplayerbullet.rotation = playerInfo.angle;
				Oplayerbullet.speed_x = playerInfo.speed_x;//Math.cos(playerInfo.angle + Math.PI/2) * 20;
				Oplayerbullet.speed_y = playerInfo.speed_y;//Math.sin(playerInfo.angle + Math.PI/2) * 20;
				bullet_array.push(Oplayerbullet);
				return Oplayerbullet;
				
			}
	
	function create(){
                // Create terrain tiles 
				// this is now done on the server so we listen for map messages
                /*for(var i=0;i<=WORLD_SIZE.w/64+1;i++){
                    for(var j=0;j<=WORLD_SIZE.h/64+1;j++){
                        var tile_sprite = this.add.sprite(i * 64, j * 64, 'grass');
						tile_sprite.alpha = getRandomArbitrary(0.6, 0.9);
                        ground_tiles.push(tile_sprite);
                    }
                }
				for(var i=0;i<=WORLD_SIZE.w/64+1;i++){
					for(var j=0;j<=WORLD_SIZE.h/64+1;j++){
					var alpha = getRandomArbitrary(0.0, 1.0);
					if(alpha>0.8){
					var water_sprite = this.add.sprite(i * 64, j * 64, 'sand');
					water_sprite.alpha = alpha;
					}
					water_tiles.push(water_sprite);			
					}
				}*/
				//end terrain

				//reference camera in this instance
				var camera = this.cameras.main;
				var self = this;
				camera.setBounds(0,0,WORLD_SIZE.w,WORLD_SIZE.h);
				camera.width=2400;
				camera.height=1600;
				
				//instantiate player

				
				//initialize websocket connection
				socket = io();
				socket.emit('new-player',{x:POS.x,y:POS.y,angle:0,type:1})
                //listen for mapping messages from server
				//make sure to create the player last or use depth
				socket.on('generate-map1',function(map_data){
					for(i=0;i<map_data.length;i++){
						createTile(self,map_data[i].x,map_data[i].y,map_data[i].alpha,map_data[i].type);
						}

				})
				socket.on('generate-map2',function(map_data){
					for(i=0;i<map_data.length;i++){
						if(map_data[i] != undefined){
						createTile(self,map_data[i].x,map_data[i].y,1,map_data[i].type);
						water_tiles.push(map_data[i]);
						}
					}
					addPlayer(self);
				})
				// Listen for other players connecting
                socket.on('update-players',function(players_data){
                    var players_found = {};

                    // Loop over all the player data received
                    for(var id in players_data){
                        // If the player hasn't been created yet
                        if(other_players[id] == undefined && id != socket.id){ // Make sure you don't create yourself
                            var data = players_data[id];
							//var p = this.add.sprite(data.x,data.y,'player');//CreateShip(data.type,data.x,data.y,data.angle);
							var p = addOtherPlayers(self,data);
                            other_players[id] = p;
                            console.log("Created new player at (" + data.x + ", " + data.y + ")");
                        }
                        players_found[id] = true;
                        
                        // Update positions of other players 
                        if(id != socket.id){
                          other_players[id].target_x  = players_data[id].x; // Update target, not actual position, so we can interpolate
                          other_players[id].target_y  = players_data[id].y;
                          other_players[id].target_rotation  = players_data[id].angle;
                        }
                        
                        
                    }
                    // Check if a player is missing and delete them 
                    for(var id in other_players){
                        if(!players_found[id]){
                            other_players[id].destroy();
                            delete other_players[id];
                        }
                    }
                   
                })
				
                // Listen for bullet update events 
                socket.on('bullets-update',function(server_bullet_array){
                 //loop through bullets
                 for(var i=0;i<server_bullet_array.length;i++){
				 //update only if its not my bullet
				 if(server_bullet_array[i].owner_id !== socket.id)
				 {
                      if(bullet_array[i] == undefined){
						  addOtherFlash(self,server_bullet_array[i]);
                          bullet_array[i]=addOtherBullets(self,server_bullet_array[i]);
						//serverflash = addOtherFlash(self,server_bullet_array[i]);
						//var serverflash = addOtherFlash(self,server_bullet_array[i]);
						  //console.log("Bullet from socket.id:",server_bullet_array[i].owner_id);
                      } else {
                          //Otherwise, just update it! 
                          bullet_array[i].x = server_bullet_array[i].x; 
                          bullet_array[i].y = server_bullet_array[i].y;
						  bullet_array[i].rotation = server_bullet_array[i].angle;
                      }
					  }
                  }
                  // Otherwise if there's too many, delete the extra 
                  for(var i=server_bullet_array.length;i<bullet_array.length;i++){
					  if(server_bullet_array[i] != undefined){
				  if(server_bullet_array[i].owner_id !== socket.id){
                       bullet_array[i].destroy();
                       bullet_array.splice(i,1);
                       i--;
					   }
                   }
				}
                })
				
                // Listen for any player hit events and make that player flash 
                socket.on('player-hit',function(id){
                    if(id == socket.id){
                        //If this is you
                        player.sprite.alpha = 0;
                    } else {
                        // Find the right player 
                        other_players[id].alpha = 0;
                    }
				})
				
				//initiate controls
				this.input.mouse.capture = true;
				this.input.mouse.disableContextMenu();
				this.input.on('pointerdown',function(pointer){
					if(pointer.leftButtonDown())
					{
					player.shot = true;
					} else {
					player.shot = false;
					}
				}, this);
				this.cursors = this.input.keyboard.createCursorKeys();
				this.cursors = this.input.keyboard.addKeys(
				{up:Phaser.Input.Keyboard.KeyCodes.W,
				down:Phaser.Input.Keyboard.KeyCodes.S,
				left:Phaser.Input.Keyboard.KeyCodes.A,
				right:Phaser.Input.Keyboard.KeyCodes.D});
				
	}
	
	function update(){
	//call the players step event and pass context
	if(player.sprite != null){
	player.update(this.cameras.main,this,socket);
	
	//camera follows player with damping
	var camera = this.cameras.main;
	var camera_x = player.sprite.x - WINDOW_WIDTH/2;
	var camera_y = player.sprite.y - WINDOW_HEIGHT/2;
		camera.x -= (camera_x + camera.x + this.input.x - WINDOW_WIDTH/2) * 0.04;
		camera.y -= (camera_y + camera.y + this.input.y - WINDOW_HEIGHT/2) * 0.04;
		
                for(var id in other_players){
                    if(other_players[id].alpha < 1){
                        other_players[id].alpha += (1 - other_players[id].alpha) * 0.16;
                    } else {
                        other_players[id].alpha = 1;
                    }
            }
	}
	
	//loop through muzzle flash array and update each object 
	if(flash_array != undefined){
		for(var i=0;i<flash_array.length;i++){
		var flash = flash_array[i];
		if(flash.alpha>0){
			flash.alpha-=0.12;
			flash.x = player.sprite.x;
			flash.y = player.sprite.y;
			}
		if(flash.alpha<=0){
		flash_array.splice(i,1);
		i--;
		flash.destroy();
		}
		}
	}
		for(var i=0;i<serverflash_array.length;i++){
		var sflash = serverflash_array[i];
		if(sflash.alpha>0){
			sflash.alpha-=0.12;
			//sflash.x = serverflash_array[i].x;
			//sflash.y = serverflash_array[i].y;
			}
		if(sflash.alpha<=0){
		serverflash_array.splice(i,1);
		i--;
		sflash.destroy();
		}
	}
		
	//Simple Collision Detection System
	//checks each direction, and loops through all collidable tiles and moves the player back 
	//based on the distance to each tile
	//handles everything except diagonal for now
	if(player.speed_x<0){
			for(var i=0;i<=water_tiles.length;i++){
				if(water_tiles[i] != undefined){
					var tile = water_tiles[i];
					var dist = Phaser.Math.Distance.Between(tile.x+16,tile.y,player.sprite.x,player.sprite.y);
				if(dist<32){
					player.speed_x += Math.cos(( - 90) + Math.PI/2) * player.speed;
				}
			}
		}
	}
	else
	if(player.speed_x>0){
			for(var i=0;i<=water_tiles.length;i++){
				if(water_tiles[i] != undefined){
					var tile = water_tiles[i];
					var dist = Phaser.Math.Distance.Between(tile.x-16,tile.y,player.sprite.x,player.sprite.y);
				if(dist<32){
					player.speed_x -= Math.cos(( - 90) + Math.PI/2) * player.speed;
				}
			}
		}
	}
	if(player.speed_y<0){
			for(var i=0;i<=water_tiles.length;i++){
				if(water_tiles[i] != undefined){
					var tile = water_tiles[i];
					var dist = Phaser.Math.Distance.Between(tile.x,tile.y+16,player.sprite.x,player.sprite.y);
				if(dist<32){
					player.speed_y += Math.sin(  Math.PI/2)* player.speed;
				}
			}
		}
	}
	else
	if(player.speed_y>0){
			for(var i=0;i<=water_tiles.length;i++){
				if(water_tiles[i] != undefined){
					var tile = water_tiles[i];
					var dist = Phaser.Math.Distance.Between(tile.x,tile.y-16,player.sprite.x,player.sprite.y);
				if(dist<32){
					player.speed_y -= Math.sin(  Math.PI/2)* player.speed;
				}
			}
		}
	}
				
	//player controls
	if (this.cursors.left.isDown) 
		{player.speed_x -= Math.cos(( - 90) + Math.PI/2) * player.speed;}
	if (this.cursors.right.isDown) 
		{player.speed_x += Math.cos(( - 90) + Math.PI/2) * player.speed;}
	if (this.cursors.up.isDown) 
		{player.speed_y -= Math.sin(  Math.PI/2) * player.speed;}
	if (this.cursors.down.isDown) 
		{player.speed_y += Math.sin( Math.PI/2) * player.speed;}
	
	//loop through server bullets
		/*for(var i=0;i<bullet_array.length;i++){
		if(bullet_array[i] != undefined){
		//Oplayerbullet = bullet_array[i];
		bullet_array[i].x += bullet_array[i].speed_x; 
		bullet_array[i].y += bullet_array[i].speed_y; 
		/*if(servbullet.x < 0 || servbullet.x > WORLD_SIZE.w || servbullet.y < 0 || servbullet.y > WORLD_SIZE.h){
			servbullet.destroy();
			bullet_array.splice(i,1);
			i--;
			console.log('bullet deleted');
			socket.emit('del-bul',bullet_array);
		}
		for(j=0;j<water_tiles.length;j++){
			var dist = Phaser.Math.Distance.Between(servbullet.x,servbullet.y,water_tiles[j].x,water_tiles[j].y);
			if(dist<32){
			servbullet.destroy();
			bullet_array.splice(i,1);
			i--;
			console.log('bullet deleted');
			socket.emit('del-bul',bullet_array);
			}
		}
		}
	}*/
	
		
	//loop through player bullets array and update each object
	for(var i=0;i<playerBullet_array.length;i++){
		if(playerBullet_array[i] != undefined){
		var bullet = playerBullet_array[i];
		bullet.x += bullet.speed_x; 
		bullet.y += bullet.speed_y; 
    // Remove if it goes too far off screen 
		if(bullet.x < 0 || bullet.x > WORLD_SIZE.w || bullet.y < 0 || bullet.y > WORLD_SIZE.h){
			bullet.destroy();
			playerBullet_array.splice(i,1);
			i--;
			console.log('bullet deleted');
		}
		for(j=0;j<water_tiles.length;j++){
			var dist = Phaser.Math.Distance.Between(bullet.x,bullet.y,water_tiles[j].x,water_tiles[j].y);
			if(dist<32){
			bullet.destroy();
			playerBullet_array.splice(i,1);
			i--;
			console.log('bullet deleted');
			}
		}
		}
	}
	
	//loop through certain tiles
	/*for(var i=0;i<water_tiles.length;i++){
		if(water_tiles[i] != undefined){
		var tile = water_tiles[i];
		var dist = Phaser.Math.Distance.Between(tile.x,tile.y,player.sprite.x,player.sprite.y);
			if(dist<48){
				//console.log('collision');
				//player.sprite.x = player.xprevious-player.speed_x;
				//player.sprite.y = player.yprevious-player.speed_y;
				player.sprite.x += player.speed_x/4*-1;
				player.sprite.y += player.speed_y/4*-1;
				//player.speed_x -= (player.speed_x )*0.5;
				//player.speed_y -= (player.speed_y )*0.5;
			} 
	}
	}*/
		
                // Interpolate all players to where they should be 
                for(var id in other_players){
                    var p = other_players[id];
                    if(p.target_x != undefined){
                        p.x += (p.target_x - p.x) * 0.16;
                        p.y += (p.target_y - p.y) * 0.16;
                        // Intepolate angle while avoiding the positive/negative issue 
                        var angle = p.target_rotation;
                        var dir = (angle - p.rotation) / (Math.PI * 2);
                        dir -= Math.round(dir);
                        dir = dir * Math.PI * 2;
                        p.rotation += dir * 0.16;
                    }
                }
		
	}
		
	//contains render updates
	function render(){
	
	}
	
	//get random range
	function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
	}
	
	//setInterval(updateTile, 200,[water_tiles,player]);
