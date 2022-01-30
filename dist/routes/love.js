var express = require('express');
const { resolve } = require('upath');
var router = express.Router();

var db_config = require(__dirname + '/../assets/config/database.js');
var conn = db_config.init();

db_config.connect(conn);

router.post('/list', async function(req, res, next) {
  var data = req.body;

  var id = data.id;

  const nickName = await sql("SELECT * FROM `USER` WHERE ID = ?;", id);
  var sqlNickName = nickName[0].Nickname
  const result = await sql("SELECT * FROM `LOVE` WHERE NickName = ?;", sqlNickName);

  res.send(result)
});

router.post('/check', async function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var nickName = data.nickName;
  var date = data.date;

  var sqlNickName = ""
  var sqlId = ""

  const idResult = await sql("SELECT * FROM `USER` WHERE Nickname = ?;", nickName);
  const nickNameResult = await sql("SELECT * FROM `USER` WHERE ID = ?;", id);

  sqlId = idResult[0].ID
  sqlNickName = nickNameResult[0].Nickname

  var loveSql = "SELECT * FROM `LOVE` WHERE `ID` = ? AND `Date` = ? AND `NickName` = ?;"
  var loveParams = [sqlId, date, sqlNickName];
  conn.query(loveSql, loveParams, function(err, rows, fields) {
    if(err) {
      console.log(err);
      res.send("error")
    } else {
      var len = Object.values(JSON.parse(JSON.stringify(rows))).length

      if(len != 1) {
        var loveInsertSql = 'INSERT INTO LOVE(`ID`, `Date`, `NickName`) VALUES (?, ?, ?)';
        conn.query(loveInsertSql, loveParams, function(err, rows, fields) {
          if(err) {
            console.log(err);
            res.send("error")
          } else {
            res.send("success");
          }
        });
      } else {
        var loveDeleteSql = 'DELETE FROM LOVE WHERE ID = ? AND Date = ? AND NickName = ?';
        conn.query(loveDeleteSql, loveParams, function(err, rows, fields) {
          if(err) {
            console.log(err);
            res.send("error")
          } else {
            res.send("success");
          }
        });
      }
    }
  });
});

function sql(sql, params) {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, function (err, rows, fields) {
      if(err) console.log('qeury is not excuted. select fail...\n' + err);
      else {
        resolve(rows)
      }
    })
  })
};

module.exports = router;