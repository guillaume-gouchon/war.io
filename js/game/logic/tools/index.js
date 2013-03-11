var tools = {};


/**
*	Returns a copy of a complex object.
*/
tools.cloneObject = function(object) {
  var newObj = (object instanceof Array) ? [] : {};
  for (i in object) {
    if (object[i] && typeof object[i] == "object") {
      newObj[i] = this.cloneObject(object[i]);
    } else newObj[i] = object[i]
  } return newObj;
};