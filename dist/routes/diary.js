const cons = require('consolidate');
var express = require('express');
var router = express.Router();

var db_config = require(__dirname + '/../assets/config/database.js');
var conn = db_config.init();

db_config.connect(conn);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('views/diary/diarySearch.html');
});

/* POST searchList page. */
router.post('/searchList', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var day = data.day;
  
  var sql = "SELECT * FROM `MANAGER` A JOIN `FOOD` B ON A.F_name = B.F_name WHERE DATE(`G_date`) = ? AND `ID` = ?";
  var sqlParam = [day, id]
  conn.query(sql, sqlParam, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows)
  })
});

/* POST home page. */
router.get('/plus', function(req, res, next) {
  res.render('views/diary/diaryPlus.html');
});

/* POST home page. */
router.post('/plus', function(req, res, next) {
  day = req.body.day;
  meal = req.body.meal;
  if(day != undefined && meal != undefined)
    res.clearCookie('day').clearCookie('meal').cookie('day', day).cookie('meal', meal).send("success");
  else
    res.send("error");
});

/* POST list page. */
router.post('/list', function(req, res, next) {
  var data = req.body;

  probability = 1;
 
  data.sort(({ probability: a }, { probability: b }) => Math.abs(a - probability) - Math.abs(b - probability));
  
  var sql = 'SELECT * FROM FOOD WHERE F_name LIKE ' + conn.escape('%' + data[0].name + '%');
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows)
  })
});

/* POST create page. */
router.post('/create', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var name = data.name;
  var kcal = data.kcal;
  var tan = data.tan;
  var dan = data.dan;
  var gi = data.gi;
  var gram = data.gram;
  var meal = data.meal;
  var day = data.day;

  var sql = "SELECT * FROM GOAL WHERE ID = '" + id + "' ORDER BY Reset DESC"
  conn.query(sql, function (err, rows, fields) {
    if(err) {
      console.log('qeury is not excuted. select fail...\n' + err);
    } else {
      var reset = rows[0].Reset;
      var managerSql = 'INSERT INTO MANAGER(`G_date`, `F_name`, `M_kcal`, `M_tan`, `M_dan`, `M_gi`, `Meal`, `Gram`, `ID`, `Reset`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      var userParams = [day, name, parseFloat(kcal), parseFloat(tan), parseFloat(dan), parseFloat(gi), meal, parseFloat(gram), id, reset];
      conn.query(managerSql, userParams, function (err, rows, fields) {
        if(err) {
          res.send("error");
          console.log('qeury is not excuted. select fail...\n' + err);
        } else {
          res.send("success");
        }
      })
    }
  });
});

/* POST delete page. */
router.post('/delete', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var name = data.name;
  var kcal = data.kcal;
  var date = data.date;

  var managerSql = 'DELETE FROM MANAGER WHERE `ID`=? AND `G_date`=? AND `M_kcal`=? AND `F_name`=?';
  var userParams = [id, new Date(date), kcal, name];
  conn.query(managerSql, userParams, function (err, rows, fields) {
    if(err) {
      res.send("error");
      console.log('qeury is not excuted. select fail...\n' + err);
    } else {
      res.send("success");
    }
  })
});

module.exports = router;