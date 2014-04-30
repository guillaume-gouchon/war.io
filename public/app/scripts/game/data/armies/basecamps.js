/**
*	Lists the buildings and the units a player is getting when starting a new game
*/
gameData.BASECAMPS[gameData.RACES.human.id] = {
		buildings : [gameData.ELEMENTS[gameData.FAMILIES.building][gameData.RACES.human.id].hq],
		units : [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id].builder,
				gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id].builder,
				gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id].builder,
				gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id].builder]
};
