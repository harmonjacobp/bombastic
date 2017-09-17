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
	console.log(lobbyLog10);
	do{
	    name = ''+((Math.random()*1000*lobbyLog10)>>0);
	}while(lobby.has(name));
	return name;
    }
    return setToArr(freshNames)[(Math.random()*freshNames.size)>>0];
}
    
var server = ws.createServer(function(client){
    lobby.add({socket:client, agentName:getFreshName()});
    updateLobby();
    var textListener = function(rawMsg){
	var msg = JSON.parse(rawMsg);
	switch(msg.cmd){
	case 'startGame':
	    if(lobby.size < 2){
		return;
	    }
	    console.log('go go go!');
	    mapSet(function(x){x.socket.removeListener('text', textListener);
			       x.socket.removeListener('close', closeListener);
			       x.socket.send(JSON.stringify({cmd:'gamePreparing'}));}, lobby);
//	    bomb.startGame(lobby);
	    lobby = new Set([]);
	    break;
	default: console.log('the client is dumb');
	}
    };

    var closeListener = function(code, reason){
	var el;
	mapSet(function(x){if(x.socket == client){
	    el = x;}}, lobby);
	lobby.delete(el);
	console.log('removed');
	updateLobby();
    };
    client.on("text", textListener);
    client.on("close", closeListener);
}).listen(8887);


// function startGame(players){
//     var buttModule = {friendlyName="Button",
// 		     function create};
//     var wireModule = {friendlyName="Wire"};
//     var modules = [buttModule, wireModule];
//     for(var i = 0; i < players.length; i++){
	
//     }
//     var procMsg = function(msg, player){
// 	switch(msg.cmd){



// 	default:
	    
// 	}

//     }





// }
