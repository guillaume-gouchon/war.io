var orderDispatcher = {};


orderDispatcher.sendOrderToEngine = function (type, params) {
	if (gameManager.isOfflineGame) {
		order.dispatchReceivedOrder(type, params);
	} else {
		//send order to external server
		socket.emit('order', [type, params]);
	}
}