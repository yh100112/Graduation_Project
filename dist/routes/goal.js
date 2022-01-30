var express = require('express');
var date = require('date-utils');
const schedule = require('node-schedule');
const cons = require('consolidate');
var router = express.Router();

var db_config = require(__dirname + '/../assets/config/database.js');
var conn = db_config.init();

db_config.connect(conn);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('views/goal/goal.html');
});

/* POST list page. */
router.post('/list', function(req, res, next) {
  var data = req.body;

  var id = data.id;

  var result = new Array();

  var newDate = new Date();
  var bgnde = newDate.toFormat('YYYY-MM-DD');
  newDate.setDate(newDate.getDate() + 1);
  var endde = newDate.toFormat('YYYY-MM-DD');

  var sql = 'SELECT * FROM GOAL WHERE `ID` = ? ORDER BY Reset DESC';
  var params = [id];
  conn.query(sql, params, function (err, rows, fields) {
    if(err) {
      console.log('qeury is not excuted. select fail...\n' + err);
    } else {
      result[0] = rows[0];
      var managerSql = "SELECT * FROM `MANAGER` A WHERE G_date BETWEEN ? AND ? AND `ID` = ?";
      var managerParams = [bgnde, endde, id]
      conn.query(managerSql, managerParams, function (err, rows, fields) {
        if(err) {
          res.send("error");
          console.log('qeury is not excuted. select fail...\n' + err);
        } else {
          for(var i = 0; i < rows.length; i++) {
            result[i + 1] = rows[i]
          }
          res.send(result);
        }
      })
    }
  })
});

/* rank score schedule */
function score() {
  var newDate = new Date();
  var bgnde = newDate.toFormat('YYYY-MM-DD');
  newDate.setDate(newDate.getDate() + 1);
  var endde = newDate.toFormat('YYYY-MM-DD');

  var memberSql = 'SELECT * FROM `MEMBER`;';
  conn.query(memberSql, function (err, rows, fields) {
    if(err) {
      console.log('qeury is not excuted. select fail...\n' + err);
    } else {
      for(var i = 0; i < rows.length; i++) {
        var goalSql = 'SELECT * FROM (SELECT * FROM GOAL WHERE `ID` = ? ORDER BY Reset DESC LIMIT 18446744073709551615) A GROUP BY A.`ID`;';
        var goalParams = [rows[i].ID];
        conn.query(goalSql, goalParams, function (err, goalRows, fields) {
          if(err) {
            console.log('qeury is not excuted. select fail... Ranking_score update error\n' + err);
          } else {
            var result = new Array();

            for(var k = 0; k < goalRows.length; k++) {
              result[0] = goalRows[0];
            }
            var managerSql = "SELECT * FROM `MANAGER` A WHERE `ID` = '" + result[0].ID + "' AND G_date BETWEEN '" + bgnde + "' AND '" + endde + "';";
            conn.query(managerSql, function (err, managerRows, fields) {
              if(err) {
                console.log('qeury is not excuted. select fail... Ranking_score update error\n' + err);
              } else {
                for(var j = 0; j < managerRows.length; j++) {
                  result[j + 1] = managerRows[j]
                }

                var totalScore = 0;
                var inKcal = 0, inTan = 0, inDan = 0, inGi = 0;
                for(var i = 1; i < result.length; i++) {
                  inKcal = inKcal + result[i].M_kcal
                  inTan = inTan + result[i].M_tan
                  inDan = inDan + result[i].M_dan
                  inGi = inGi + result[i].M_gi
                }
                
                var G_kcal = result[0].G_kcal;
                var G_tan = result[0].G_tan;
                var G_dan = result[0].G_dan;
                var G_gi = result[0].G_gi;
                var G_id = result[0].ID;

                var scopeKcal = scope(G_kcal, inKcal)
                var scopeTan = scope(G_tan, inTan)
                var scopeDan = scope(G_dan, inDan)
                var scopeGi = scope(G_gi, inGi)

                var demeritKcal = demerit(G_kcal, inKcal)
                var demeritTan = demerit(G_tan, inTan)
                var demeritDan = demerit(G_dan, inDan)
                var demeritGi = demerit(G_gi, inGi)

                totalScore = scopeKcal + scopeTan + scopeDan + scopeGi
                                + demeritKcal + demeritTan + demeritDan + demeritGi
                
                var userSql = "UPDATE USER SET `Ranking_score` = ? WHERE `ID` = ?;";
                var userParams = [totalScore, G_id];
                conn.query(userSql, userParams, function (err, rows, fields) {
                  if(err) {
                    console.log('qeury is not excuted. select fail... Ranking_score update error\n' + err);
                  } else {
                    console.log("rank score success");
                  }
                })
              }
            })
          }
        })
      }
    }
  })
};

function scope(goal, data) {
  var totalScore = 0;
  if(goal * 0.9 <= data && goal >= data) {
    totalScore = 5
  } else if(goal <= data) {
    totalScore = 0
  } else if(goal * 0.8 <= data) {
    totalScore = 4
  } else if(goal * 0.7 <= data) {
    totalScore = 3
  } else if(goal * 0.6 <= data) {
    totalScore = 2
  } else if(goal * 0.5 <= data) {
    totalScore = 1
  }
  return totalScore;
}

function demerit(goal, data) {
  var totalScore = 0;
  if(goal < data && goal * 0.05 + goal >= data) {
    totalScore = -1
  } else if(goal * 0.05 + goal < data && goal * 0.1 + goal >= data) {
    totalScore = -2
  } else if(goal * 0.1 + goal < data && goal * 0.15 + goal >= data) {
    totalScore = -3
  } else if(goal * 0.15 + goal < data && goal * 0.2 + goal >= data) {
    totalScore = -4
  } else if(goal * 0.2 + goal <= data) {
    totalScore = -5
  }
  return totalScore
}

/* ranking schedule */
function ranking() {
  var sql = "SELECT `Ranking_score`, `ID` FROM `USER`;"
  conn.query(sql, function (err, rows, fields) {
    if(err) {
      console.log('qeury is not excuted. select fail...\n' + err);
    } else {
      for(var i = 0; i < rows.length; i++) {
        var score = rows[i].Ranking_score
        ranking = 0;
        if(score >= 120) {
          ranking = 1;
        } else if(score < 120 && score >= 100) {
          ranking = 2;
        } else if(score < 100 && score >= 80) {
          ranking = 3;
        }

        var userSql = "UPDATE USER SET `Rank` = ?, `Ranking_score` = ? WHERE `ID` = ?;";
        var userParams = [ranking, 0, rows[i].ID];
        conn.query(userSql, userParams, function(err, rows, fields) {
          if(err) {
            console.log('qeury is not excuted. select fail... ranking update error\n' + err);
          } else {
            console.log("ranking update success")
          }
        });
      }
    }
  })
};

let score_schedule = schedule.scheduleJob('30 * 0 * * 0-6', function() {
  score();
})

let ranking_schedule = schedule.scheduleJob('1 * 0 * * 1', function() {
  ranking();
})

module.exports = router;