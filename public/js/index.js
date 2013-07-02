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
$('div', '#armies').first().addClass('checked');

// init map configurations
initMapSizes();
initMapInitialResources();


// init players choosers
for (var i = 0; i < 6; i++) {
	addPlayer();
}
$('#nbPlayers').change(function () {
	updatePlayers($(this).val());
});

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
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$('.modal').modal('hide');
});

// create new game button
$('#createGameButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
});

// tutorial button
$('#tutorialButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$(this).unbind('click');
	showLoadingScreen('Loading');
	var tutorialInitData = {
		mapType: gameData.MAP_TYPES.random.id,
		mapSize: gameData.MAP_SIZES.small.id,
		vegetation: gameData.VEGETATION_TYPES.standard.id,
		initialResources: gameData.INITIAL_RESOURCES.standard.id
	}
	tutorialInitData.army = $('.checked', '#armies').attr('data-army');
	gameManager.isOfflineGame = true;
	gameManager.initGame(tutorialInitData);
	removeWebsiteDom();
});

// create game !
$('#confirmGameCreation').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$(this).unbind('click');
	$('.modal').modal('hide');
	showLoadingScreen('Loading');
	var gameInitData = {
		mapType: gameData.MAP_TYPES.random.id,
		mapSize: $('#mapSize').val(),
		vegetation: gameData.VEGETATION_TYPES.standard.id,
		initialResources: $('#initialResources').val()
	};
	gameInitData.army = $('.checked', '#armies').attr('data-army');
	gameInitData.nbPlayers = $('#nbPlayers').val();
	gameManager.initGame(gameInitData);
	removeWebsiteDom();
});












// join game
$('#joinGameButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$('#lstGames').html('');
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

function initArmyButtons () {
	for (var i in gameData.RACES) {
		var army = gameData.RACES[i];
		$('#armies').append('<div class="customRadio" data-name="armies" data-army="' + army.id + '">' + army.name + '</div>');
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


function removeWebsiteDom() {
	$('#website').remove();
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
	$('#loadingScreen').removeClass('hideI');
	$('#loadingProgress').css('left', (window.innerWidth - $('#loadingProgress').width()) / 2);
}

function updateLoadingProgress(progress) {
	$('.bar', '#loadingProgress').css('width', progress + '%');
}

function addPlayer() {
	var i = $('.player', '#players').length;
	if (i > 0) {
		$('#players').append('<div class="player ' + (i > 3 ? 'hideI' : '') + '">Player ' + (i+1) + '<div class="customRadio checked" data-name="player' + i + '" data-value ="0">Human</div>'
		 + '<div class="customRadio" data-name="player' + i + '" data-value ="0">IA</div></div>');
	} else {
		$('#players').append('<div class="player">Player 1<div class="checked">Me</div></div>');
	}
}

function updatePlayers(nbPlayers) {
	console.log($('.player', '#players'))
	for (var i = 0; i < 7; i++) {
		if (i <= nbPlayers) {
			$('.player:nth-child(' + i + ')', '#players').removeClass('hideI');
		} else {
			$('.player:nth-child(' + i + ')', '#players').addClass('hideI');
		}
	}
}

//custom radio buttons
$('.customRadio').click(function () {
	$('.customRadio[data-name="' + $(this).attr('data-name') + '"]').removeClass('checked');
	$(this).addClass('checked');
});
