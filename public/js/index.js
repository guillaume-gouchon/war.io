$(document).ready(function() {

	initArmyChooser();

	$('#chooseArmy').addClass('moveToLeft');
	$('#armies').addClass('moveToTop');
	$('#footer').fadeIn();
	closePopups();

	var hasClicked = false;

	var gameInitData = {};

	$('.armyBox').click(function () {
		if (!hasClicked) {
			var army = $(this).attr('data-army');
			gameInitData.army = army;
			gameInitData.mapType = 'random';
			gameInitData.mapSize = 'medium';
			gameInitData.vegetation = 'standard';
			gameInitData.initialResources = 'standard';

			closePopups();
			hasClicked = true;
			$('#chooseArmy').addClass('hideToLeft');
			$('#armies').removeClass('moveToTop');
			$('#footer').fadeOut();

			$('#loading').removeClass('hide').addClass('moveToLeft');

			//check if webGL is supported
			if (!window.WebGLRenderingContext) {
				// Browser has no idea what WebGL is. Suggest they
				// get a new browser by presenting the user with link to
				// http://get.webgl.org
				$('#errorWebGL').fadeIn();
				return;   
			} else {
				$('#playOffline').fadeIn();
				hasClicked = false;
			}

			setTimeout(function () {
				gameManager.initGame(gameInitData);
			}, 800);
		}
	});

	$('a', '#playOffline').click(function () {
		if (!hasClicked) {
			hasClicked = true;
			$('#playOffline').fadeOut();
			gameManager.isOfflineGame = true;
			gameManager.initGame(gameInitData);
			try {
				gameManager.disconnect();
			} catch (e) {
			}
		}
	});

	$('a', '#footer').click(function () {
		closePopups();
		switch (parseInt($(this).attr('data-id'))) {
			case 0:
				$('#about').fadeIn();
				$('#about').css('top', window.innerHeight / 2 - $('#about').height() / 2);
				$('#about').css('left', window.innerWidth / 2 - $('#about').width() / 2);				
				$('#about').removeClass('hide');
				break;
			case 1:
				$('#credits').fadeIn();
				$('#credits').css('top', window.innerHeight / 2 - $('#credits').height() / 2);
				$('#credits').css('left', window.innerWidth / 2 - $('#credits').width() / 2);				
				$('#credits').removeClass('hide');
				break;
			case 2:
				$('#share').fadeIn();
				$('#share').css('top', window.innerHeight / 2 - $('#share').height() / 2);
				$('#share').css('left', window.innerWidth / 2 - $('#share').width() / 2);				
				$('#share').removeClass('hide');
				break;
		}
		return false;
	});

	$('#introScreen').click(function () {
		closePopups();
	});

	function closePopups() {
		$('.popup').fadeOut();
		$('.popup').css('top', -500);
		$('.popup').css('left', window.innerWidth / 2);
	}


	preloadImages();

});

/*function initMapChooser() {

	for (var i in gameData.MAP_SIZES) {
		$('#mapSize').append('<option value="' + i + '">' + gameData.MAP_SIZES[i].name + '</option>');
	}

	for (var i in gameData.VEGETATION_TYPES) {
		$('#vegetation').append('<option value="' + i + '">' + gameData.VEGETATION_TYPES[i].name + '</option>');
	}

	for (var i in gameData.INITIAL_RESOURCES) {
		$('#initialResources').append('<option value="' + i + '">' + gameData.INITIAL_RESOURCES[i].name + '</option>');
	}

}*/

function initArmyChooser () {
	for (var i in gameData.RACES) {
		var army = gameData.RACES[i];
		$('#armies').append(createArmyBox(army));
	}
}

function createArmyBox (army) {
	return '<div class="armyBox" data-army="' + army.id + '"><div class="spriteBefore sprite-' + army.image.replace('.png', '') + '">' + army.name + '</div></div>';
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