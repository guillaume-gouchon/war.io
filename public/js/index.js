//switch between touch and mouse events
var inputEvents;
if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
	inputEvents = 'touchstart';
} else {
	inputEvents = 'click';
}

//adds / update player's name
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

//init the sound manager
soundManager.init();

//init music button
if(utils.readCookie('rts_music_enabled') == 'true') {
	gameManager.musicEnabled = true;
	$('#music').addClass('musicEnabled').html('On');
	soundManager.playMusic();
}

//adds armies buttons
initArmyChooser();
$('div', '#factions').first().addClass('checked');


$('#mainTitle').addClass('moveToLeft');

//check if webGL is supported
if (!isWebGLEnabled()) {
	// Browser has no idea what WebGL is. Suggest they
	// get a new browser by presenting the user with link to
	// http://get.webgl.org
	$('#errorWebGL').fadeIn();
} else {
	//buttons entrance
	$('#gameManagerButtons').addClass('moveToTopHalf');
}


var gameInitData = {
	mapType: 'random',
	mapSize: 'small',
	vegetation: 'standard',
	initialResources: 'standard'
};

//solo mode
$('#soloGameButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$(this).unbind('click');
	hideWelcomeScreen();
	$('#loadingLabel').html('Loading');
	$('#loadingTitle').removeClass('hide').addClass('moveToLeft');
	gameInitData.army = $('.checked', '#factions').attr('data-army');
	gameManager.isOfflineGame = true;
	setTimeout(function () {
		gameManager.initGame(gameInitData);
	}, 600);
});

//create game
$('#createGameButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	hideWelcomeScreen();
	$('#setupNewGame').removeClass('hide').addClass('moveToTop');
	$('#subTitle').html('How many players ?').removeClass('hide').addClass('moveToLeft');
});

//confirm game creation
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

//join game
$('#joinGameButton').click(function () {
	soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
	$('#lstGames').html('');
	hideWelcomeScreen();
	$('#joinGame').removeClass('hide').addClass('moveToTop');
	$('#subTitle').html('Join a Game').removeClass('hide').addClass('moveToLeft');
	gameManager.socket.emit('enter', null);

	gameManager.socket.on('joinListUpdate', function (data) {
		updateGamesList(data);

		//confirm join game
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

//back home buttons
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

//footer links
$('a', 'footer').bind(inputEvents, function () {
	
	closePopups();

	var element;
	switch (parseInt($(this).attr('data-id'))) {
		case 0:
			element = $('#about');
			break;
		case 1:
			element = $('#credits');
			break;
		case 2:
			element = $('#share');
			break;
		case 3:
			element = $('#tutorial');
			break;
		case 4:
			element = $('#devNotes');
			break;
	}

	//animation
	element.css('top', (window.innerHeight - element.height()) / 2);
	element.css('left', (window.innerWidth - element.width()) / 2);

	return false;
});

//hide popups
$('#introScreen').bind(inputEvents, function () {
    closePopups();	
});

$(".popup").not('#tutorial').click(function (e) {
    e.stopPropagation();
});

//custom radio buttons
$('.customRadio').bind(inputEvents, function () {
	$('.customRadio[data-name="' + $(this).attr('data-name') + '"]').removeClass('checked');
	$(this).addClass('checked');
});

//music button
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

//preload necessary image files
preloadImages();


function closePopups() {
	$('.popup').css('top', -1200);
}

function initArmyChooser () {
	for (var i in gameData.RACES) {
		var army = gameData.RACES[i];
		$('#factions').append(createArmyBox(army));
	}
}

function createArmyBox (army) {
	return '<div class="customRadio smallButton spriteBefore sprite-' + army.image.replace('.png', '') + '" data-army="' + army.id + '">' + army.name + '</div>';
}

function preloadImages() {
	var images = new Array()
	function preload() {

		for (i = 0; i < preload.arguments.length; i++) {
			images[i] = new Image()
			images[i].src = preload.arguments[i]
			$('#imagesPreload').append(images[i]);
		}
	}
	preload(
		gameSurface.IMG_PATH + 'sprite.png',
		gameSurface.IMG_PATH + 'cursor.png',
		gameSurface.IMG_PATH + 'cursor_hover.png',
		gameSurface.IMG_PATH + 'cursor_attack.png'
	)
}

function isWebGLEnabled() {
	try { 
		return !! window.WebGLRenderingContext && !! document.createElement('canvas').getContext('experimental-webgl');
	} catch(e) { 
		return false; 
	}
}

function showWelcomeScreen() {
	$('#mainTitle').removeClass('hideToLeft');
	$('#gameManagerButtons').addClass('moveToTopHalf');
	$('header').fadeIn();
	$('footer').fadeIn();
}

function hideWelcomeScreen() {
	closePopups();
	$('#mainTitle').addClass('hideToLeft');
	$('#gameManagerButtons').removeClass('moveToTopHalf');
	$('header').fadeOut();
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

$(document).ready(function () {
	$('#tutorial').removeClass('hide');

	$('ul', '#tutorial').roundabout({
		easing: 'easeOutQuad',
		enableDrag: true,
		dropEasing: 'easeOutBounce',
		responsive: true
	});

	$('div', '#tutorial li').each(function () {
		$(this).css('top', (300 - $(this).height()) / 2);
	});

});