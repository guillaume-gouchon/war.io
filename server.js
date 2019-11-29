const express = require('express');
const path = require('path');

const app = express();

// port
app.set('port', process.env.PORT || 8080);

// serve html
app.use(express.static(path.join(__dirname, './dist')));
app.get('/', (req, res, next) => {
	res.sendFile(path.join(__dirname, './dist/index.html'));
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
