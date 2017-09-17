String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};
function start(server){
	
	function buildBoard(){
		var lobby = document.getElementById("lobby");
		lobby.parentNode.removeChild(lobby);
		var body = document.getElementsByTagName("body")[0];
		body.innerHTML = '<span id="game"><h1>BOMBASTIC!</h1><h2 id="agentIDDisplayinator"></h2><div id="timer">5:00</div><div id="text"></div><div id="bomb"><img src="Desk (Project bomb).png" /></div><div id="textBox"><img src="Text Box.png" /></div></span><audio id="tick" src="Countdown Clock Sound.ogg"></audio>';
		//<div id="buttonModule"><img src="Button.png"></div><div id="circuitBoard"><img src="Circuit Board.png"></div><div class="wire" id="first"><img id="firstImage" src="Blue Wire.png" onclick="cutWire(\'first\')"></div><div class="wire" id="second"><img src="Red Wire.png"></div><div class="wire" id="third"><img src="Green Wire.png"></div></div><div id="firstWireButton">';
	}
	function updateTimer(){
			var timeLeft = end - new Date().getTime();
			if(timeLeft < 0){
				document.getElementById("timer").textContent = "0:00";
				//Nuke();
				return;
			}
			var m = (timeLeft/60000)>>0;
			var s = ((timeLeft/1000)%60)>>0;
			var old = document.getElementById('timer').textContent;
			document.getElementById("timer").textContent = m + ':' + (s<10?'0':'') + s;
			if(old != document.getElementById('timer')){
					mysteriousTickingNoise.play();
			}
	
			setTimeout(updateTimer, 1000);
			
	}
	function Nuke(){
		mysteriousTickingNoise.pause();
		var game = document.getElementById("game");
		game.parentNode.removeChild(game);
		var body = document.getElementsByTagName("body")[0];
		body.innerHTML = '<div><img src="nuke.gif" alt="NOPE!" style="width:100%;height:100%"></div><div id="Button"><button type="button">play again</button>';
	}
	
	function YouWon(){
		mysteriousTickingNoise.pause();
		var game = document.getElementById("game");
		game.parentNode.removeChild(game);	
		var body = document.getElementsByTagName("body")[0];
		body.innerHTML = '<h1>BOMBASTICALLY FANTASTIC!</h1><h2?You won the game!</h2><div id="Button"><button type="button">play again</button><audio id="music" src="boombastic.ogg" controls autoplay></audio>';
	}
	function makeButtons(){
		var button1 = document.createElement("");
		button1.innerHTML = "Do Something";
		button1.img.src = "/var/www/html/Red Wire.png";
		var button2 = document.createElement("");
		button2.innerHTML = "Do Something";
		button2.img.src = "/var/www/html/Blue Wire.png";
		var button3 = document.createElement("");
		button3.innerHTML = "Do Something";
		button3.img.src = "/var/www/html/Green Wire.png";
	}
	
	
	function procMsg(msg){
		switch(msg.cmd){
				case 'updateTimeRemaining':
					end = new Date().getTime() + msg.timeRemainingMillis;
				break;
				case 'changeAgentID':
				var disp = document.getElementById('agentIDDisplayinator');
				disp.textContent = 'Agent '+msg.agentID;
				if(msg.agentID == "Orange"){
					disp.style.color = 'orange';
				}else{
					disp.style.color = 'black';
				}
				break;
				case 'loadBoard':
					var top = 400;
					var left = 190;
					var width = 285;
					var height = 155;
					function drawBasicModule(img, class_, listener){
						return function(x, y, module){
							var div = document.createElement('div');
							div.className = class_
							var el = document.createElement('img');
							el.src = img;
							el.id = 'module'+module.type+'_'+module.position;
							if(listener != null){
								el.setAttribute('onclick', listener(el.id));
							}
							div.style.top = (top+height*y)+'px';
							div.style.left = (left+width*x)+'px';
							div.appendChild(el);
							return div;
						}
					}
					var moduleInfo = {button:{draw:function(x,y,module){
						var buttonStyleImageMap = {red:'Button.png',
						square:'Square Button.png',
						radioactive:'Nuke Button.png'};
						return drawBasicModule(buttonStyleImageMap[module.style], 'buttonModule', function(id){return 'clickButton("'+id+'")';})(x, y, module);
						}}
						,
					wire:{draw:function(x, y, module){
						var span = document.createElement('span');
						var board = drawBasicModule('Circuit Board.png', 'circuitBoard', null)(x, y, module);
						span.appendChild(board);
						var boardTop = top+height*y;
						var boardLeft = left+width*x;
						console.log(module);
						console.log(module.wires);
						for(var i = 0; i < module.wires.length; i++){
							var div = document.createElement('div');
							div.className = 'wire';
							div.style.top = (boardTop-10+30*(1<=i)+40*(2<=i))+'px';
							div.style.left = (boardLeft+6)+'px';
							var el = document.createElement('img');
							el.src = module.wires[i].capitalize()+' Wire.png';
							el.id = "wire_"+module.position+'_'+i;
							var color = module.wires[i];
							el.setAttribute('onclick', 'cutWire("'+el.id+'", "'+color+'")');

							div.appendChild(el);
							span.appendChild(div);
						}
						return span;
					}}};
					modules = msg.modules;
					var body = document.getElementsByTagName('body')[0];
					for(var i = 0; i < modules.length; i++){
						x = i % 2;
						y = (i / 2)>>0;
						var m = modules[i];
						console.log(m);
						console.log(m.type);
						var el = moduleInfo[m.type].draw(x, y, m);
						body.appendChild(el);
					}
					break;
				case "dispMsgForUser":
					document.getElementById('text').textContent =">"+ msg.msgForUser;
					break;
				case "gameFatalError":
					alert(msg.friendlyErrorMsg+' Page will reload upon acknowledgement.');
					window.location.reload(true);
					break;
				case "loseGame":
					Nuke();
					break;
				case "winGame":
					YouWon();
					break;
				default:
				console.log('unknown command:'+msg.cmd);
				console.log('failing silently');
		}
	}
	
	buildBoard();
	
	var mysteriousTickingNoise = document.getElementById('tick');
	
	procMsg({cmd:'changeAgentID', agentID:'<Authorizing File Desciptors...>'});
	procMsg({cmd:'dispMsgForUser',  msgForUser:'Processing Interim Descriptors... '});
	
	var end = new Date().getTime() + 200;
	
	
	updateTimer();
	
	var ButtonActionList = ["push the ","press the "];
	var WireQualities = ["red wire ","green wire ","blue wire "];
	var WireActionList = ["cut the ","snip the "];

	var instruct1 = 'Tell ' + +' to '+ButtonActionList[Math.floor((Math.random()*2)+1)] + 'the red button'  //tell agent<clientname> to <action> <item>
	var instruct2 = 'Tell'+ +' to '+WireActionList[Math.floor((Math.random()*2)+1)]+WireQualities[Math.floor((Math.random()*3)+1)];
	
	var serverListener = function (rawMsg){
			console.log(rawMsg);
				procMsg(JSON.parse(rawMsg.data))
				};
	server.addEventListener("message",serverListener);
	server.send(JSON.stringify({cmd:"clientIsReady"}));
}
function cutWire(wireInput, color){
	console.log(color);
		console.log("CUTTTTT");
		
		var wire = document.getElementById(wireInput);
		console.log(wire.src);
		wire.setAttribute('onclick', null);
		wire.src = color.capitalize()+' Wire Cut.png';
		var modulePositionIndex = wireInput.indexOf('_')+1;
		var modulePosition = parseInt(wireInput.substring(modulePositionIndex));
		var wirePositionIndex = wireInput.indexOf('_', modulePositionIndex)+1;
		var wirePosition = parseInt(wireInput.substring(wirePositionIndex));
		server.send(JSON.stringify({cmd:'gameCutWire', modulePosition:modulePosition, wirePosition:wirePosition}));
	}
function clickButton(buttonId){
		var modulePositionIndex = buttonId.indexOf('_')+1;
		var modulePosition = parseInt(buttonId.substring(modulePositionIndex));
		server.send(JSON.stringify({cmd:'gameClickButton', modulePosition:modulePosition}));
}
