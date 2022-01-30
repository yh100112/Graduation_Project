var express = require('express');
var router = express.Router();

var db_config = require(__dirname + '/../assets/config/database.js');
var conn = db_config.init();

db_config.connect(conn);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('views/food/foodList.html');
});

router.get('/list', function(req, res, next) {
  var sql = 'SELECT * FROM FOOD';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    //else res.render('ai.html', {list : rows});
    else res.send(rows)
  })
});

module.exports = router;