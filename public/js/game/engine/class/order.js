gameData.Order = function (type, moveTo, elementId) {
	
	this.type = type;
	this.moveTo = moveTo;
	this.id = elementId;

	this.toJSON = function () {
		return this;
	}
}
