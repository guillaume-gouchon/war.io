var AI = {};


/**
*	CONSTANTS
*/
AI.RESOURCE_DISTANCE_THRESHOLD = 10;


/**
* Search for new resources to gather.
*/
AI.searchForNewResources = function (builder, fromWhere, resourceType) {
	var nearestResource = mapLogic.getNearestResource(fromWhere, resourceType);
	if(tools.getElementsDistance(fromWhere, nearestResource) < this.RESOURCE_DISTANCE_THRESHOLD) {
		builder.a = nearestResource;
		builder.pa = nearestResource;
	} else {
		builder.a = null;
		builder.pa = null;
	}
}
