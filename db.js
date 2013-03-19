module.exports = function(app){

    var mongoose = require('mongoose'),
    db = mongoose.connect('localhost', 'o3');
    app.db = db;

    return {
      "close": function disconnect (callback) {
        if (client.connected) client.quit();
        if (callback) client.on('close', callback);
      }
    }

};
