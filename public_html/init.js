(function () {

	// Everything that runs as soon as the page loads; sets up the page and handles the
	// connection to the server.

	var gameState = new GameState();

	$( document ).ready(function () {
		// Set up the game
		
		// Load assets
		// TODO: audio assets
		var imageAssets = ["wood.jpg", "card_back.png"];
		var promises = [];
		var assetsLoaded = 0;

		for (var i = 0; i < imageAssets.length; i++) {
			(function(url, promise) {
				var img =  new Image();
				img.onload = function() {
					// Increment the loading counter to convince the user we're doing something
					assetsLoaded += 1;
					document.getElementById("loading-assets").innerHTML = assetsLoaded;

					promise.resolve();
				};
				img.src = "assets/"+url;

				gameState.loadImage(img);
			})(imageAssets[i], promises[i] = $.Deferred());
		}

		// Once all the promises have resolved (all assets loaded), call the function to 
		// display the welcome page.
		$.when.apply($, promises).done(welcomePage);
	});

	function welcomePage() {
		// Transition loading screen -> welcome page

		console.log("Assets loaded successfully");

		$("#welcome-join").bind("click touchstart", joinGame);

		$("#loading").toggleClass("reveal");
		$("#welcome").toggleClass("reveal");
	}

	function joinGame() {
		// Communicate with the server, make sure we join the game ok, render the board

		if (gameState.conn != null) {
			alert(strings["already_connecting"]);
			return;
		}
		
		gameState.lobby = $("#welcome-lobby").val() || $("#welcome-lobby").attr("placeholder");
		gameState.name  = $("#welcome-username").val() || $("#welcome-username").attr("placeholder");

		if (gameState.name.includes(" ")) {
			alert(strings["one_word"]);
			return;
		}
		if (gameState.lobby.includes(" ")) {
			alert(strings["lobby_one_word"]);
			return;
		}

		gameState.conn = new WebSocket("ws://" + location.host + "/ws");

		gameState.conn.onopen = function () {
			gameState.conn.send("join_lobby " + gameState.lobby + " " + gameState.name);
		}

		gameState.conn.onmessage = function(ev) {
			// We wrap this in an anonymous function so that 'this'
			// will refer to the GameState object and not the WebSocket
			// (I don't have a clue how javascript OOP works)
			gameState.readFromServer(ev);
		};
	}
})();