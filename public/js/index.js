$(document).ready(function() {

	initArmyChooser();

	$('#chooseArmy').addClass('moveToLeft');
	$('#armies').addClass('moveToTop');
	$('#footer').fadeIn();
	closePopups();

	var hasClicked = false;

	$('.armyBox').click(function () {
		if (!hasClicked) {
			closePopups();
			hasClicked = true;
			$('#chooseArmy').addClass('hideToLeft');
			$('#armies').removeClass('moveToTop');
			$('#footer').fadeOut();

			$('#loading').removeClass('hide').addClass('moveToLeft');

			var army = $(this).attr('data-army');

			setTimeout(function () {
				var gameInitData = {};
				gameInitData.army = army;
				gameInitData.mapType = 'random';
				gameInitData.mapSize = 'medium';
				gameInitData.vegetation = 'standard';
				gameInitData.initialResources = 'standard';
				gameManager.initGame(gameInitData);
			}, 800);
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
	return '<div class="armyBox" data-army="' + army.id + '"><img src="' + gameSurface.IMG_PATH + army.image + '"/>' 
												+ army.name + '</div>';
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
		gameSurface.IMG_PATH + 'boxHover.png',
		gameSurface.IMG_PATH + 'boxSelect.png',
		gameSurface.IMG_PATH + 'cursor.png',
		gameSurface.IMG_PATH + 'cursor_hover.png',
		gameSurface.IMG_PATH + 'cursor_attack.png'
	)
}