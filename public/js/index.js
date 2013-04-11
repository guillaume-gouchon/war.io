$(document).ready(function() {

	initArmyChooser();

	$('#chooseArmy').addClass('moveToLeft');
	$('#armies').addClass('moveToTop');

	var hasClicked = false;

	$('.armyBox').click(function () {
		if (!hasClicked) {
			hasClicked = true;
			$('#chooseArmy').addClass('hideToLeft');
			$('#armies').removeClass('moveToTop');

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