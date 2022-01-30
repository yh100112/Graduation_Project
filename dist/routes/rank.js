var express = require('express');
var router = express.Router();

var db_config = require(__dirname + '/../assets/config/database.js');
var conn = db_config.init();

db_config.connect(conn);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('views/rank/rankList.html');
});

router.post('/userRank', function(req, res, next) {
  var sql = 'SELECT `Nickname`, `Rank` FROM `USER` WHERE `Rank` != 0';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows)
  })
});

router.post('/foodRank', function(req, res, next) {
  var sql = 'SELECT B.kor_F_name, COUNT(*) AS count FROM MANAGER A left join FOOD B on A.F_name = B.F_name GROUP BY A.F_name ORDER BY count DESC limit 3';
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows)
  })
});

module.exports = router;