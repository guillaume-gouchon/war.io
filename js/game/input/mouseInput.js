/**
*	Binds the different mouse inputs needed to the events
*/

gameSurface.canvas.onmousedown = function (event) {
  return inputDispatcher.onLeftClick(event);
}

gameSurface.canvas.oncontextmenu = function (event) {
  return inputDispatcher.onRightClick(event);
}

gameSurface.canvas.onmousemove = function (event) {
	return inputDispatcher.onMouseMove(event); 
}

gameSurface.canvas.onmouseup = function (event) {
  return inputDispatcher.onMouseUp(event);
}

gameSurface.canvas.onmousewheel = function (event) {
  return inputDispatcher.onMouseWheel(event);
}

gameSurface.canvas.ondblclick = function (event) {
	return inputDispatcher.onDoubleClick(event);
}