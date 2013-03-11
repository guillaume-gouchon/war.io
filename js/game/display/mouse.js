display.MOUSE_ICONS = {
	default : 'default', 
	arrowTop : 'n-resize',
	arrowTopRight : 'ne-resize',
	arrowTopLeft : 'nw-resize',
	arrowBottom : 's-resize',
	arrowBottomRight : 'se-resize',
	arrowBottomLeft : 'sw-resize',
	arrowRight : 'e-resize',
	arrotLeft : 'w-resize',
	select : 'crosshair'
}

/**
*	Updates the mouse display
*/
display.updateMouse = function (mouseIcon) {
	document.body.style.cursor = mouseIcon;
}