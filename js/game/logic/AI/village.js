var AI = {};


/**
*	CONSTANTS
*/
AI.RESOURCE_DISTANCE_THRESHOLD = 10;


AI.searchForNewResources = function (builder, fromWhere, resourceType) {
	var nearestResource = mapLogic.getNearestResource(fromWhere, resourceType);
	if(tools.getElementsDistance(fromWhere, nearestResource) < this.RESOURCE_DISTANCE_THRESHOLD) {
		builder.action = nearestResource;
		builder.patrol = nearestResource;
	} else {
		builder.action = null;
		builder.patrol = null;
	}
}