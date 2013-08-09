gameData.Order = function (type, moveTo, elementId, info) {
	
	this.type = type;
	this.moveTo = moveTo;
	this.id = elementId;
	this.info = info;

	this.toJSON = function () {
		var moveTo = null;
		if (this.moveTo != null) {
			moveTo = {x: this.moveTo.x, y: this.moveTo.y};
		}
		return {
			type : this.type,
			moveTo : moveTo,
			id : this.id,
			info : this.info
		}
	}
};
