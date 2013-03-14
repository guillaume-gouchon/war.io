/**
*	Binds the different keyboard inputs needed to the events
*/

document.onkeydown = function (event) {
  return inputDispatcher.onKeyDown(event);
}

document.onkeyup = function (event) {
  return inputDispatcher.onKeyUp(event);
}
