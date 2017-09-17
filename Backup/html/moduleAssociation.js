function start(){
	
	
	
	
	
	function buildBoard(){
		var lobby = document.getElementById("lobby");
		lobby.parentNode.removeChild(lobby);
		var body = document.getElementsByTagName("body")[0];
		body.innerHTML = '<h1>BOMBASTIC</h1><h2 id="agentIDDisplayinator"></h2><div id="bomb"><img src="Desk (Project bomb).png"></div><div id="buttonModule"><img src="Button.png"></div><div id="circuitBoard"><img src="Circuit Board.png"></div><div class="wire" id="first"><img src="Blue Wire.png"></div><div class="wire" id="second"><img src="Red Wire.png"></div><div class="wire" id="third"><img src="Green Wire.png"></div><div id="timer">5:00</div>';
	}
	function updateTimer(){
		var timeLeft = end - new Date().getTime();
		var m = (timeLeft/60000)>>0;
		var s = ((timeLeft/1000)%60)>>0;
		document.getElementById("timer").textContent = m + ':' + (s<10?'0':'') + s; 
		setTimeout(updateTimer, 1000);
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
				break;//everything
				
				default:
				console.log('unknown command:'+msg.cmd);
				console.log('failing silently');
		}
	}
	buildBoard();
	
	procMsg({cmd:'changeAgentID', agentID:'Ross'});
	
	var end = new Date().getTime() + 300200;
	
	
	updateTimer();
	
	
	
	var ButtonActionList = ["push the ","press the "];
	var WireQualities = ["red wire ","green wire ","blue wire "];
	var WireActionList = ["cut the ","snip the "];

	var instruct1 = 'Tell ' + +' to '+ButtonActionList[Math.floor((Math.random()*2)+1)] + 'the red button'  //tell agent<clientname> to <action> <item>
	var instruct2 = 'Tell'+ +' to '+WireActionList[Math.floor((Math.random()*2)+1)]+WireQualities[Math.floor((Math.random()*3)+1)];
}