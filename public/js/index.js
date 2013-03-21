$(document).ready(function() {

	initMapChooser();

	$('#playButton').click(function () {
		var gameInitData = {};
		gameInitData.mapType = 'random';
		gameInitData.mapSize = $('#mapSize').val();
		gameInitData.vegetation = $('#vegetation').val();
		gameInitData.initialResources = $('#initialResources').val();
		gameManager.joinGame(gameInitData);
	});

});

function initMapChooser() {

	for (var i in gameData.MAP_SIZES) {
		$('#mapSize').append('<option value="' + i + '">' + gameData.MAP_SIZES[i].name + '</option>');
	}

	for (var i in gameData.VEGETATION_TYPES) {
		$('#vegetation').append('<option value="' + i + '">' + gameData.VEGETATION_TYPES[i].name + '</option>');
	}

	for (var i in gameData.INITIAL_RESOURCES) {
		$('#initialResources').append('<option value="' + i + '">' + gameData.INITIAL_RESOURCES[i].name + '</option>');
	}

}