function centerElement(element) {
	element.css('top', (window.innerHeight - element.height()) / 2);
	element.css('left', (window.innerWidth - element.width()) / 2);
}

centerElement($('#mainButtons'));

// preload necessary image files
preloadImages();

gameManager.playerId = gameManager.getPlayerId();
gameManager.playerName = gameManager.getPlayerName();

// init the sound manager
soundManager.init();

gameManager.musicEnabled = true;

// check if webGL is supported
if (!isWebGLEnabled()) {
	// Browser has no idea what WebGL is. Suggest they
	// get a new browser by presenting the user with link to
	// http://get.webgl.org
	$('#errorWebGL').modal('show');
}

// cancel buttons
$('.cancelButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$('.modal').modal('hide');
});

// quick game button
$('#playBtn').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$(this).unbind('click');
	showLoadingScreen('Loading');

	var armyId = gameData.RACES.human.id;
	var mapType = gameData.MAP_TYPES.standard.id;
	var mapSize = gameData.MAP_SIZES.small.id;
	var initialResources = gameData.INITIAL_RESOURCES.standard.id;
	var vegetation = gameData.VEGETATION_TYPES.standard.id;
	var victoryCondition = gameData.VICTORY_CONDITIONS.annihilation.id;
	var nbPlayers = 2;
	var aiPlayers = [gameData.RACES.human.id];
	var game = gameManager.createGameObject(gameManager.playerId, gameManager.playerName, armyId, mapType,
		mapSize, initialResources, vegetation, victoryCondition, nbPlayers, aiPlayers);

	requestFullScreen();

	// launch quick game
	gameManager.startOfflineGame(game);
	removeWebsiteDom();
});

function preloadImages() {
	var images = new Array();
	var imageLoaded = 0;
	function preload() {
		for (i = 0; i < preload.arguments.length; i++) {
			images[i] = new Image();
			images[i].src = preload.arguments[i];
			images[i].onload = function () {
				imageLoaded++;
				if (imageLoaded >= 2) {
					$('#websiteLoading').fadeOut();
				}
			}
			$('#imagesPreload').append(images[i]);
		}
	}
	preload(
		GUI.IMAGES_PATH + 'cursor.png',
		GUI.IMAGES_PATH + 'cursor_hover.png',
		GUI.IMAGES_PATH + 'cursor_attack.png',
		GUI.IMAGES_PATH + 'cursor_cross.png',
		GUI.IMAGES_PATH + 'cursor_cross_hover.png',
		GUI.IMAGES_PATH + 'cursor_h.png',
		GUI.IMAGES_PATH + 'cursor_v.png',
		GUI.IMAGES_PATH + 'cursor_sw.png',
		GUI.IMAGES_PATH + 'cursor_se.png'
	)
}

function isWebGLEnabled() {
	try {
		return !! window.WebGLRenderingContext && !! document.createElement('canvas').getContext('experimental-webgl');
	} catch(e) {
		return false;
	}
}

function removeWebsiteDom() {
	$('#website').remove();
}

function showLoadingScreen(text) {
	$('#labelLoading').html(text);
	$('#loadingScreen').removeClass('hide');
	$('#loadingProgress').css('left', (window.innerWidth - $('#loadingProgress').width()) / 2);
}

function requestFullScreen() {
	var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null)
	|| (document.mozFullScreen || document.webkitIsFullScreen);
	var docElm = document.documentElement;
	if (!isInFullScreen) {
		if (docElm.webkitRequestFullScreen) {
			docElm.webkitRequestFullscreen();
		} else if (docElm.mozRequestFullScreen) {
			docElm.mozRequestFullScreen();
		} else if (docElm.requestFullscreen) {
			docElm.requestFullscreen();
		}
	}
}
