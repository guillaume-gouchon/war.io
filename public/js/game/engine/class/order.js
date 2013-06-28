gameData.Order = function (type, moveTo, elementId, info) {
	
	this.type = type;
	this.moveTo = moveTo;
	this.id = elementId;
	this.info = null;

	this.toJSON = function () {
		return this;
	}
}
