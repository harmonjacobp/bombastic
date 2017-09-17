console.log('starting');

Set.prototype.isSuperset = function(subset) {
    for (var elem of subset) {
	if (!this.has(elem)) {
	    return false;
	}
    }
    return true;
}

Set.prototype.union = function(setB) {
    var union = new Set(this);
    for (var elem of setB) {
	union.add(elem);
    }
    return union;
}

Set.prototype.intersection = function(setB) {
    var intersection = new Set();
    for (var elem of setB) {
	if (this.has(elem)) {
	    intersection.add(elem);
	}
    }
    return intersection;
}

Set.prototype.difference = function(setB) {
    var difference = new Set(this);
    for (var elem of setB) {
	difference.delete(elem);
    }
    return difference;
}

process.on('uncaughtException', function(e){
    if(e.code != "ECONNRESET"){
	throw e;
    }else{
	console.log('Captured econnreset, and added to poke^H`mon collection');
    }
});


// const pg = require("pg");
// const sql = new pg.Client('postgres://bross:yummyturd@localhost:3211/bombastic');
// sql.connect();
// const res = sql.query('SELECT VERSION');
// res.on('row', function(row){
//     console.log(row);
// });

var ws = require("nodejs-websocket");

var agentNames = new Set(['007',
			  '42',
			  '47',
			  'Archer',
			  'Bond',
			  'Bourne',
			  'Carter',
			  'Cooper',
			  'Eggsy',
			  'English',
			  'Hunt',
			  'Jay',
			  'Machete',
			  'Orange',
			  'P',
			  'Powers',
			  'Smith',
			  'Smagent',
			  'Snake'
			 ]);

var lobby = new Set([]);

function updateLobby(){
    var msg = {cmd:'updateLobby',
	       playerList:setToArr(mapSet(function(x){return x.agentName;}, lobby))
	      };
    mapSet(function(x){
	try{
	    x.socket.send(JSON.stringify(msg));
	}catch(e){
	}}, lobby);
}
function map(f, xs){
    var ys = [];
    for(var i = 0; i < xs.length; i++){
	ys[i] = f(xs[i]);}
    return ys;}

function mapSet(f, xs){
    return new Set(map(f, Array.from(xs)));
    var ys = new Set();
    for(let x of xs){
	ys.add(f(x));}
    return ys;}

function setToArr(xs){
    return Array.from(xs);
    var ys = [];
    for(let x of xs){
	ys[ys.length] = x;}
    return ys;}

var log10 = Math.log(10);
function getFreshName(){
    var usedNames = mapSet(function(x){return x.agentName;}, lobby);
    var freshNames = agentNames.difference(usedNames);
    if(freshNames.size == 0){
	var name;
	var lobbyLog10 = Math.max(1, Math.log10(lobby.size))>>0;
	do{
	    name = ''+((Math.random()*1000*lobbyLog10)>>0);
	}while(lobby.has(name));
	return name;
    }
    return setToArr(freshNames)[(Math.random()*freshNames.size)>>0];
}
    
var server = ws.createServer(function(client){
    var agentName = getFreshName();
    var player = {socket:client, agentName:agentName, textListener:null, closeListener:null};
    player.textListener = function(rawMsg){
	var msg = JSON.parse(rawMsg);
	switch(msg.cmd){
	case 'startGame':
	    if(lobby.size < 2){
		return;
	    }
	    mapSet(function(x){x.socket.removeListener('text', x.textListener);
			       x.socket.removeListener('close', x.closeListener);
			       x.socket.send(JSON.stringify({cmd:'gamePreparing'}));}, lobby);
	    startGame(setToArr(lobby));
	    lobby = new Set([]);
	    break;
	default:
	    console.log('in lobby, client send unrecognized cmd:'+msg.cmd+' agent:'+agentName);
	}
    };
    player.closeListener = function(code, reason){
	var el;
	mapSet(function(x){if(x.socket == client){
	    el = x;}}, lobby);
	lobby.delete(el);
	updateLobby();
    };
    lobby.add(player);
    client.send(JSON.stringify({cmd:'changeAgentId', agentId:agentName}));
    updateLobby();
    client.on("text", player.textListener);
    client.on("close", player.closeListener);
}).listen(8887);

function randArr(xs){return xs[(Math.random()*xs.length)>>0];}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
	if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function numberrd(n){
    if(10 < n && n < 20){
	return n+'th';
    }
    switch(n % 10){
    case 1: return n+'st';
    case 2: return n+'nd';
    case 3: return n+'rd';
    default: return n+'th';
    }
}

function clone_arr(xs){
    var ys = [];
    for(var i = 0; i < xs.length; i++){
	ys[i] = xs[i];
    }
    return ys;
}

function clone_actions(actions){
    var copy = {};
    var keys = Object.keys(actions);
    for(var i = 0; i < keys.length; i++){
	copy[keys[i]] = clone_arr(actions[keys[i]]);
    }
    return copy;
}

function startGame(players){
    console.log('starting game with '+players.length);
    function dispMsgForMany(playerList, x){
	for(var i = 0; i < playerList.length; i++){
	    playerList[i].socket.send(JSON.stringify({cmd:'dispMsgForUser', msgForUser:x}));
	}
    }
    var colors = ["red", "green", "blue"];
    var getRandColor = function(){
	return randArr(colors);
    };
    var buttModule = {type:'button',
		      friendlyName:"Button",
		      create:function(position){
			  var butt = clone(buttModule);
			  butt.position = position;
			  var styles = ["red", "square", "radioactive"];
			  butt.style = randArr(styles);
			  butt.genIdentifiers();
			  butt.genActions();
			  return butt;
		      },
		      genIdentifiers:function(){
			  this.identifiers = new Set(['the agent with a '+this.style+' button']);
		      },
		      genActions:function(){
			  this.actions = new Set(['press the '+this.style+' button']);
		      },
		      procClientAction:function(player, actionData){
			  if(currentActions[player.agentName] == null){return null;}
			  var action = currentActions[player.agentName];
			  if(action.position != this.position){
			      console.log('player:'+player.agentName+' expected position:'+this.position+' got:'+action.position);
			      return false;
			  }
			  return true;
		      }
		     };
    var wireModule = {type:'wire',
		      friendlyName:"Wire",
		      create:function(position){
			  var wire = clone(wireModule);
			  wire.position = position;
			  var numWires = 3;
			  wire.wires = [];
			  for(var i = 0; i < numWires; i++){
			      wire.wires[i] = getRandColor();
			  }
			  wire.genIdentifiers();
			  wire.genActions();
			  return wire;
		      },
		      genIdentifiers:function(){
			  var ids = new Set([]);
			  for(var i = 0; i < colors.length; i++){
			      var count = 0;
			      map(function(x){count += (colors[i] == x);}, this.wires);
			      ids.add('the agent with a module with ' + (count == 0 ? 'no' : (count == this.wires.length && count != 1 ? 'all' : count))+' '+colors[i]+(count == 1 ? ' wire' : ' wires'));
			      if(this.wires.length == 3 && count == 2 && this.wires[1] == colors[i]){
				  ids.add("the agent with a module with 2 adjacent "+colors[i]+" wires");
			      }
			  }
			  for(var i = 0; i < this.wires.length; i++){
			      ids.add('the agent with a module whose '+(i == this.wires.length-1 ? 'last' : numberrd(i+1))+' wire is '+this.wires[i]);
			  }
			  this.identifiers = ids;
		      },
		      genActions:function(){
			  var actions = new Set([]);
			  var numWiresOfColor = {};
			  for(var i = 0; i < colors.length; i++){
			      var count = 0;
			      map(function(x){count += (colors[i] == x);}, this.wires);
			      numWiresOfColor[colors[i]] = count;
			      if(count == 0){
				  continue;
			      }else if(1 < count){
				  actions.add('cut all '+colors[i]+' wires in the module with the most of that color');
			      }else{
				  actions.add('cut the lone '+colors[i]+' wire');
			      }
			  }
			  this.actions = actions;
		      },
		      procClientAction:function(player, actionData){
			  if(currentActions[player.agentName] == null){return null;}
			  var wirePosition = actionData;
			  var wireColor = this.wires[wirePosition];
			  var action = currentActions[player.agentName];
			  if(action.position != this.position){
			      console.log('player:'+player.agentName+' wrong module position, got:'+action.position+', expected:'+this.position);
			      return false;
			  }
			  if(this.wires[wirePosition].indexOf('cut') != -1){return null;}
			  if(action.action.indexOf(this.wires[wirePosition]) == -1){
			      console.log('player:'+player.agentName+' wrong color, got:'+this.wires[wirePosition]+', expected:'+action.action);
			      return false;
			  }
			  // if(action.action.indexOf('last') != -1 && wirePosition != this.wires.length-1){
			  //     console.log('wrong position, got:'+action.position+', expected:'+this.position);
			  //     return false;
			  // } else{
			  //     var indexOfDesiredWirePosition = action.action.indexOf('whose');
			  //     if(indexOfDesiredWirePosition != -1){
			  // 	  indexOfDesiredWirePosition++;
			  // 	  if(parseInt(action.action.substring(indexOfDesiredWirePosition)) != wirePosition){
			  // 	      return false;
			  // 	  }
			  //     }
			  // }
			  this.wires[wirePosition] += ' cut';
			  if(action.action.indexOf('all') != -1){
			      for(var i = 0; i < this.wires.length; i++){
				  if(this.wires[i].indexOf(wireColor) != -1 && this.wires[i].indexOf('cut') == -1){
				      return null;
				  }
			      }
			  }
			  return true;
		      }

		     };
    var modules = [buttModule, wireModule];
    var getRandModule = function(position){
	return randArr(modules).create(position);
    };
    console.log('creating modules');
    var numModules = 4;
    var minNumActionsByPlayer = 9001;
    for(var i = 0; i < players.length; i++){
	var ids = new Set(['Agent '+players[i].agentName]);
	players[i].modules = [];
	players[i].actions = {};
	var numActions = 0;
	for(var j = 0; j < numModules; j++){
	    players[i].modules[j] = getRandModule(j);
	    ids = ids.union(players[i].modules[j].identifiers);
	    players[i].nonUniqueIdentifiers = ids;
	    numActions += players[i].modules[j].actions.size;
	    mapSet(function(action){
		if(players[i].actions[action] == null){
		    players[i].actions[action] = [j];
		}else{
		    players[i].actions[action][players[i].actions[action].length] = j;
		}
	    }, players[i].modules[j].actions);
	}
	players[i].numActions = numActions;
	minNumActionsByPlayer = Math.min(minNumActionsByPlayer, numActions);
    }
    console.log('ensuring unique ids');
    for(var i = 0; i < players.length; i++){
	players[i].identifiers = players[i].nonUniqueIdentifiers;
	for(var j = 0; j < players.length; j++){
	    if(i == j){continue;}
	    players[i].identifiers = players[i].identifiers.difference(players[j].nonUniqueIdentifiers);
	}
	players[i].identifiersArr = setToArr(players[i].identifiers);

	players[i].untrimmedActions = clone_actions(players[i].actions);
	while(minNumActionsByPlayer < players[i].numActions){
	    var randKey = randArr(Object.keys(players[i].actions));
	    players[i].actions[randKey].splice((Math.random()*players[i].actions[randKey].length)>>0, 1);
	    if(players[i].actions[randKey].length == 0){
		delete players[i].actions[randKey];
	    }
	    players[i].numActions--;
	}
    }
    var endTime = new Date().getTime() + 30*players.length*1000 + 900;
    
    console.log('generated game setup');
    var GS_WAIT_FOR_PLAYERS_READY = 0;
    var GS_PLAYING = 1;
    var GS_ENDING = 2;
    var GS_ENDED = 3;
    var GS_DEAD = 4;
    var gameState = GS_WAIT_FOR_PLAYERS_READY;
    var procMsg = function(msg, player){
	switch(msg.cmd){
	case 'clientIsReady':
	    if(gameState != GS_WAIT_FOR_PLAYERS_READY){
		console.log('player issued clinetIsReady outside of GS_WAIT_FOR_PLAYERS_READY, gameState:'+gameState);
	    }
	    for(var i = 0; i < readyPlayers.length; i++){
		if(readyPlayers[i].agentName == player.agentName){
		    console.log('player tried to ready twice:'+player.agentName);
		    return;
		}
	    }
	    player.index = readyPlayers.length;
	    readyPlayers[readyPlayers.length] = player;
	    player.socket.send(JSON.stringify({cmd:'loadBoard', modules:player.modules}));
	    player.socket.send(JSON.stringify({cmd:'changeAgentID', agentID:player.agentName}));
	    player.socket.send(JSON.stringify({cmd:'updateTimeRemaining', timeRemainingMillis:endTime - new Date().getTime()}));
	    dispMsgForMany(readyPlayers, readyPlayers.length+'/'+players.length+' ready...');
	    if(players.length == readyPlayers.length){
		startPlaying();
	    }

	    break;
	case 'gameCutWire':
	    checkActionResult(player, player.modules[msg.modulePosition].procClientAction(player, msg.wirePosition));
	    break;
	case 'gameClickButton':
	    checkActionResult(player, player.modules[msg.modulePosition].procClientAction(player, null));
	    break;
	default:
	    console.log('recvd invalid cmd:'+msg.cmd+' from player:'+player.agentName);
	}

    }
    var readyPlayers = [];
    function textListener(player){
	return function(rawMsg){
	    procMsg(JSON.parse(rawMsg), player);
	}
    }
    function gameFatalError(msg){
	console.log('entering gamestate GS_DEAD:'+msg);
	for(var i = 0; i < readyPlayers.length; i++){
	    if(readyPlayers[i] != null){
		readyPlayers[i].socket.send(JSON.stringify({cmd:'gameFatalError', friendlyErrorMsg:msg}));
	    }
	}
	gameState = GS_DEAD;
	endGame();
	console.log('entered gamestate GS_DEAD');
    }

    function endGame(){
	if(gameState != GS_ENDED && gameState != GS_DEAD){
	    console.log('WARN: called endGame() in invalid state, expected GS_ENDED or GS_DEAD, got:'+gameState);
	}
	for(var i = 0; i < readyPlayers.length; i++){
	    if(readyPlayers[i] != null){
		readyPlayers[i].socket.removeListener('text', readyPlayers[i].textListener);
		readyPlayers[i].socket.removeListener('close', readyPlayers[i].closeListener);
		readyPlayers[i].socket.close();
		readyPlayers[i] = null;
	    }
	}
    }

    function ignoreClients(){
	if(gameState != GS_ENDING){
	    console.log('ERR: called ignoreClients() in invalid state, expected GS_ENDING, got:'+gameState);
	}
	for(var i = 0; i < readyPlayers.length; i++){
	    if(readyPlayers[i] != null){
		readyPlayers[i].socket.removeListener('text', readyPlayers[i].textListener);
	    }
	}
    }

    function closeListener(player){
	return function(){
	    for(var i = 0; i < readyPlayers.length; i++){
		if(readyPlayers[i].agentName == player.agentName){
		    readyPlayers[i] = null;
		}
	    }
	    gameFatalError('Agent '+player.agentName+' has left the game. The game cannot continue.');
	}
    }

    function constructActionMsg(player){
	var identifier = randArr(player.identifiersArr);
	var actionKey = randArr(Object.keys(player.actions));
	var actionPosition = randArr(player.actions[actionKey]);

	//remove action from those available
	for(var i = 0; i < player.actions[actionKey].length; i++){
	    if(player.actions[actionKey][i] == actionPosition){
		player.actions[actionKey].splice(i, 1);
		break;
	    }
	}
	if(player.actions[actionKey].length == 0){
	    delete player.actions[actionKey];
	}
	player.numActions--;
	
	var possiblePositions = new Set(player.untrimmedActions[actionKey]);
	var pP = possiblePositions;
	var numPossibilitiesOnLeft = pP.has(0) + pP.has(2);
	var numPossibilitiesOnRight = pP.has(1) + pP.has(3);
	var numPossibilitiesOnTop = pP.has(0) + pP.has(1);
	var numPossibilitiesOnBottom = pP.has(2) + pP.has(3);
	var positionDescription = '';
	switch(actionPosition){
	case 0:
	    if(1 < numPossibilitiesOnLeft){positionDescription += 'top';}
	    if(1 < numPossibilitiesOnTop){positionDescription += (positionDescription.length == 0 ? '' : '-')+'left';}
	    break;
	case 1:
	    if(1 < numPossibilitiesOnRight){positionDescription += 'top';}
	    if(1 < numPossibilitiesOnTop){positionDescription += (positionDescription.length == 0 ? '' : '-')+'right';}
	    break;
	case 2:
	    if(1 < numPossibilitiesOnLeft){positionDescription += 'bottom';}
	    if(1 < numPossibilitiesOnBottom){positionDescription += (positionDescription.length == 0 ? '' : '-')+'left';}
	    break;
	case 3:
	    if(1 < numPossibilitiesOnRight){positionDescription += 'bottom';}
	    if(1 < numPossibilitiesOnBottom){positionDescription += (positionDescription.length == 0 ? '' : '-')+'right';}
	    break;
	default:
	    gameFatalError('Internal error code 598454. Sorry.');
	}
	//diagonal
	if(pP.size != 1 && positionDescription == ''){
	    positionDescription = (actionPosition == 0 || actionPosition == 2) ? 'left' : 'right';
	}
	var askSynonyms = ['Ask', 'Tell', 'Pleade for', 'Beg', 'Coerce', 'Instruct'];
	return {player:player,
		humanMsg:randArr(askSynonyms)+' '+identifier+' to '+actionKey+(positionDescription == '' ? '' : ' on the '+positionDescription)+'.',
		action:actionKey,
		position:actionPosition};
    }
    var queuedPlayerForAction = 0;
    var queuedActions = []
    function getNextActionMsg(playerIndex){
	for(var i = queuedActions.length-1; 0 <= i; i--){
	    if(queuedActions[i].player != readyPlayers[playerIndex]){
		var ret = queuedActions[i];
		if(currentActions[queuedActions[i].player.index] == null){
		    queuedActions.splice(i, 1);
		    return ret;
		}else{
		    continue;
		}
	    }
	}
	var originallyQueued = queuedPlayerForAction;
	var loops = 0;
	do{
	    queuedPlayerForAction++;
	    if(readyPlayers.length <= queuedPlayerForAction){queuedPlayerForAction = 0;}
	    if(loops++ != 0 && originallyQueued == queuedPlayerForAction){
		return null;
	    }
	}while(readyPlayers[queuedPlayerForAction].numActions == 0 && currentActions[queuedPlayerForAction] != null);
	constructed = constructActionMsg(readyPlayers[queuedPlayerForAction]);
	if(queuedPlayerForAction == playerIndex){
	    queuedActions[queuedActions.length] = constructed;
	    return getNextActionMsg(playerIndex);
	}else{
	    return constructed;
	}
    }
    function sendActionMsgToPlayer(player, humanMsg){
	sendMsgToPlayer(player, humanMsg);
    }
    function sendMsgToPlayer(player, msg){
	player.socket.send(JSON.stringify({cmd:'dispMsgForUser', msgForUser:msg}));
    }

    function loseGame(){
	gameState = GS_ENDING;
	ignoreClients();
	map(function(x){x.socket.send(JSON.stringify({cmd:'changeAgentID', agentID:'Agent '+x.agentName+' <Security Token Revoked!>'}));}, readyPlayers);
	map(function(x){sendMsgToPlayer(x, 'Sys');}, readyPlayers);
	setTimeout(loseGame2, 1000);
    }
    function loseGame2(){
	map(function(x){sendMsgToPlayer(x, 'System   Critical//');}, readyPlayers);
	setTimeout(loseGame3, 2000);
    }
    function loseGame3(){
	map(function(x){sendMsgToPlayer(x, 'System   Critical//\nEEEEEEEEEEEEEEEEEEEEEEEEEEEERRRRRR\nTainted! P 0xff0eabef29d8e02da7e6');}, readyPlayers);
	setTimeout(loseGame4, 2000);
    }
    function loseGame4(){
	map(function(x){if(x != null){x.socket.send(JSON.stringify({cmd:'loseGame'}));}}, readyPlayers);
	gameState = GS_ENDED;
	endGame();
    }
    
    function checkActionResult(player, actionResult){
	if(actionResult == false){
	    loseGame();
	}else if(actionResult == null){
	    // do nothing, they're partway throught action
	}else if(actionResult == true){
	    var action = currentActions[player.agentName];
	    
	    currentActions[player.agentName] = null;
	    sendMsgToPlayer(action.dispatcher, 'Excellent work. Await further instructions.');
	    // delay, so we don't always give back the same agent again
	    setTimeout(function(){
		var nextAction = getNextActionMsg(action.dispatcher.index);
		if(nextAction == null){
		    sendMsgToPlayer(action.dispatcher, 'You have fully informed all other agents. No further communications from you are required.');
		    finishedPlayers[finishedPlayers.length] = action.dispatcher;
		    if(finishedPlayers.length == readyPlayers.length){
			map(function(x){x.socket.send(JSON.stringify({cmd:'winGame'}));}, readyPlayers);
			gameState = GS_ENDED;
			endGame();
		    }
		}else{
		    nextAction.dispatcher = action.dispatcher;
		    currentActions[nextAction.player.agentName] = nextAction;
		    console.log('player:'+nextAction.player.agentName+' dispatcher:'+nextAction.dispatcher.agentName+' msg:'+nextAction.humanMsg);
		    sendActionMsgToPlayer(nextAction.dispatcher, nextAction.humanMsg);
		}
	    }, Math.random()*8000);
	}else{
	    gameFatalError('Internal error code 57370934');
	}
    }

    
    console.log('game is in GS_WAIT_FOR_PLAYERS_READY');
    for(var i = 0; i < players.length; i++){
	players[i].textListener = textListener(players[i]);
	players[i].socket.on('text', players[i].textListener);
	players[i].closeListener = closeListener(players[i]);
	players[i].socket.on('close', players[i].closeListener);
	players[i].socket.send(JSON.stringify({cmd:'gamePrepared'}));
    }
    console.log('game has been reported as prepared for all players');

    var currentActions = {};
    var finishedPlayers = [];

    function watchdog(){
	if(gameState != GS_PLAYING){
	    return;
	}
	var millisToEnd = endTime - new Date().getTime();
	map(function(player){player.socket.send(JSON.stringify({cmd:'updateTimeRemaining', timeRemainingMillis:millisToEnd}));}, readyPlayers);
	if(millisToEnd < 0){
	    loseGame();
	    return;
	}
	setTimeout(watchdog, Math.min(millisToEnd, 1500));
    }
    
    function startPlaying(){
	console.log('game entering state GS_PLAYING');
	gameState = GS_PLAYING;
	endTime = new Date().getTime() + 30*players.length*1000 + 900;
	map(function(player){player.socket.send(JSON.stringify({cmd:'updateTimeRemaining', timeRemainingMillis:endTime - new Date().getTime()}));}, readyPlayers);
	watchdog();
	dispMsgForMany(readyPlayers, 'All players ready, game is starting momentarily...');
	for(var i = 0; i < readyPlayers.length; i++){
	    var action = getNextActionMsg(i);
	    action.dispatcher = readyPlayers[i];
	    currentActions[action.player.agentName] = action;
	    console.log('player:'+action.player.agentName+' dispatcher:'+action.dispatcher.agentName+' msg:'+action.humanMsg);
	    sendActionMsgToPlayer(readyPlayers[i], action.humanMsg);
	}
	
	
    }



}
