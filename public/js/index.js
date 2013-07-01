// handle player's name
$('input', '#playerName').val(gameManager.getPlayerName());
$('input', '#playerName').change(function () {
	gameManager.updatePlayerName($(this).val());
});
$('input', '#playerName').click(function () {
	$(this).select();
});
$('input', '#playerName').keydown(function (e) {
	if (e.which == 13) {
		$(this).blur();
	}
});

// center main buttons
centerElement($('#mainButtons'));

// init the sound manager
soundManager.init();

// init music button
if(utils.readCookie('rts_music_enabled') == 'true') {
	gameManager.musicEnabled = true;
	$('#music').addClass('musicEnabled').html('On');
	soundManager.playMusic();
}
$('#music').click(function () {
	gameManager.musicEnabled = !gameManager.musicEnabled;
	if(!gameManager.musicEnabled) {
		$('#music').removeClass('musicEnabled').html('Off');
		soundManager.stopMusic();
	} else {
		$('#music').addClass('musicEnabled').html('On');
		soundManager.playMusic();
	}
	utils.createCookie('rts_music_enabled', gameManager.musicEnabled);
});

// init armies buttons
initArmyButtons();
$('input', '#armies').first().attr('checked', 'checked');

// init map configurations
initMapSizes();
initMapInitialResources();

// check if webGL is supported
if (!isWebGLEnabled()) {
	// Browser has no idea what WebGL is. Suggest they
	// get a new browser by presenting the user with link to
	// http://get.webgl.org
	$('#errorWebGL').modal('show');
}

// preload necessary image files
preloadImages();

// cancel buttons
$('.cancelButton').click(function () {
	$('.modal').modal('hide');
});

// create new game button
$('#createGameButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
});

var gameInitData = {
	mapType: 'random',
	mapSize: 'small',
	vegetation: 'standard',
	initialResources: 'standard'
};

// tutorial button
$('#tutorialButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$(this).unbind('click');
	showLoadingScreen('Loading');
	hideWelcomeScreen();
	var tutorialInitData = {
		mapType: 'random',
		mapSize: 'small',
		vegetation: 'standard',
		initialResources: 'standard'
	}
	tutorialInitData.army = $('input[name="armies"]', '#armies').val();
	gameManager.isOfflineGame = true;
	startGame();
	gameManager.initGame(tutorialInitData);
});












// confirm game creation
$('#confirmGameCreation').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$(this).unbind('click');
	$('#subTitle').addClass('hide');
	$('#loadingTitle').removeClass('hide').addClass('moveToLeft');
	$('#setupNewGame').removeClass('moveToTop');
	gameInitData.army = $('.checked', '#factions').attr('data-army');
	gameInitData.nbPlayers = $('.checked', '#setupNewGame').attr('data-value');
	setTimeout(function () {
		gameManager.initGame(gameInitData);
	}, 600);
});

// join game
$('#joinGameButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$('#lstGames').html('');
	hideWelcomeScreen();
	$('#joinGame').removeClass('hide').addClass('moveToTop');
	$('#subTitle').html('Join a Game').removeClass('hide').addClass('moveToLeft');
	gameManager.socket.emit('enter', null);

	gameManager.socket.on('joinListUpdate', function (data) {
		updateGamesList(data);

		// confirm join game
		$('.joinableGame', '#lstGames').click(function () {
			soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
			$('#subTitle').addClass('hide');
			$('#loadingTitle').removeClass('hide').addClass('moveToLeft');
			$('#joinGame').removeClass('moveToTop');
			gameInitData.army = $('.checked', '#factions').attr('data-army');
			gameInitData.gameId = $(this).attr('data-id');
			setTimeout(function () {
				gameManager.initGame(gameInitData);
			}, 600);
		});
	});
});

// back home buttons
$('.backButton', '#setupNewGame').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$('#subTitle').addClass('hide').removeClass('moveToLeft');
	$('#setupNewGame').addClass('hide').removeClass('moveToTop');
	showWelcomeScreen();
});
$('.backButton', '#joinGame').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$('#subTitle').addClass('hide').removeClass('moveToLeft');
	$('#joinGame').addClass('hide').removeClass('moveToTop');
	showWelcomeScreen();
});

function initArmyButtons () {
	for (var i in gameData.RACES) {
		var army = gameData.RACES[i];
		$('#armies').append('<label class="radio">'
			+ '<input type="radio" name="armies" value="' + army.id + '"/>'
			+ army.name
	  		+ '</label>');
	}
}

function initMapSizes () {
	for (var i in gameData.MAP_SIZES) {
		var mapSize = gameData.MAP_SIZES[i];
		$('#mapSize').append('<option value="' + i + '" ' + (i == 'medium' ? 'selected' : '') + '>'
			+ mapSize.name + '</option>');
	}
}

function initMapInitialResources () {
	for (var i in gameData.INITIAL_RESOURCES) {
		var mapSize = gameData.INITIAL_RESOURCES[i];
		$('#initialResources').append('<option value="' + i + '" ' + (i == 'standard' ? 'selected' : '') + '>'
			+ mapSize.name + '</option>');
	}
}

function preloadImages() {
	var images = new Array();
	function preload() {

		for (i = 0; i < preload.arguments.length; i++) {
			images[i] = new Image()
			images[i].src = preload.arguments[i]
			$('#imagesPreload').append(images[i]);
		}
	}
	preload(
		GUI.IMAGES_PATH + 'sprite.png',
		GUI.IMAGES_PATH + 'cursor.png',
		GUI.IMAGES_PATH + 'cursor_hover.png',
		GUI.IMAGES_PATH + 'cursor_attack.png'
	)
}

function isWebGLEnabled() {
	try { 
		return !! window.WebGLRenderingContext && !! document.createElement('canvas').getContext('experimental-webgl');
	} catch(e) { 
		return false; 
	}
}

function centerElement(element) {
	element.css('top', (window.innerHeight - element.height()) / 2);
	element.css('left', (window.innerWidth - element.width()) / 2);
}


function startGame() {
	$('#website').remove();
}


function showWelcomeScreen() {
	$('#mainButtons').fadeIn();
	$('footer').fadeIn();
}

function hideWelcomeScreen() {
	$('#mainButtons').fadeOut();
	$('footer').fadeOut();
}

function updateGamesList(games) {
	$('#lstGames').html('');
	for (var i in games) {
		var game = games[i];
		$('#lstGames').append('<div class="joinableGame bigButton" data-id="' + game.id + '">' + game.name + '<span>' + game.currentPlayers + ' / ' + game.maxPlayers + '</span></div>')
	}

	if (games.length == 0) {
		$('#lstGames').append('<div id="noGames">No games available yet... create one !</div>');	
	}
}

function showLoadingScreen(text) {
	$('#labelLoading', '#loadingScreen').html(text);
	$('#loadingScreen').removeClass('hide');
	$('#loadingProgress').css('left', (window.innerWidth - $('#loadingProgress').width()) / 2);
}

function updateLoadingProgress(progress) {
	$('.bar', '#loadingProgress').css('width', progress + '%');
}
