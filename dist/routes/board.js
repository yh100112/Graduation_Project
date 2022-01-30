var fs = require('fs');
var express = require('express');
const { resolve } = require('upath');
var router = express.Router();

const multer = require('multer');
const { cat } = require('shelljs');
const e = require('express');
const cons = require('consolidate');
const upload = multer({dest: __dirname + '/../upload'})

var db_config = require(__dirname + '/../assets/config/database.js');
var conn = db_config.init();

db_config.connect(conn);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('views/board/boardList.html');
});

/* POST create page. */
router.post('/create', upload.single('Upload'), function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var path = req.file.path;
  path = path.replace(/\\/g, "/");
  var content = data.content;

  var boardSql = 'INSERT INTO BOARD(`Content`, `Hit`, `ID`, `image`, `Date`) VALUES (?, ?, ?, ?, ?)';
  var boardParams = [content, 0, id, path, new Date()];
  conn.query(boardSql, boardParams, function (err, rows, fields) {
    if(err) {
      console.log('qeury is not excuted. select fail...\n' + err);
    } else {
      res.send("success");
    }
  });
});

router.post('/list', async function(req, res, next) {
  var boardSql = 'SELECT A.ID, A.Content, A.Hit, A.Image, A.Date, B.NickName, B.Rank, B.Profile FROM BOARD A JOIN USER B on A.ID = B.ID ORDER BY A.Date DESC';
  conn.query(boardSql, async function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else {
      try {
        for(let i = 0; i < rows.length; i++) {
          var date = new Date(rows[i].Date)
          date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
          var loveCountSql = 'SELECT COUNT(*) AS count FROM LOVE WHERE ID = ? AND `Date` = ?';
          var loveCountParams = [rows[i].ID, date]
          var loveCount = await sql(loveCountSql, loveCountParams)
          rows[i].loveCount = loveCount[0].count

          var commentCountSql = 'SELECT `C_content`, `C_writer`, `C_date`, `Group`, `Class` FROM COMMENT WHERE ID = ? AND `Date` = ?';
          var commentCountParams = [rows[i].ID, date]
          var comment = await sql(commentCountSql, commentCountParams)
          rows[i].comment = comment
        }
      } catch(err) {
        console.log('qeury is not excuted. select fail...\n' + err);
      }
      res.send(rows)
    }
  })
});

router.post('/detail', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var date = data.date;

  var deleteSql = 'SELECT * FROM BOARD WHERE ID = ? AND Date = ?';
  var deleteParams = [id, date];
  conn.query(deleteSql, deleteParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows)
  })
});

router.post('/modify', upload.single('Upload'), function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var path = req.file.path;
  path = path.replace(/\\/g, "/");
  var content = data.content;
  var date = data.date;

  var fileDeleteSql = 'SELECT * FROM BOARD WHERE `ID` = ? AND `Date` = ?';
  var fileDeleteParams = [id, date];
  conn.query(fileDeleteSql, fileDeleteParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else {
      fileName = rows[0].Image.split('/')[rows[0].Image.split('/').length - 1];
      fs.unlink("dist/upload/" + fileName + "", (err)=>{
        if( err ) console.log(err);
        console.log('BOARD FILE DELETED');
      });
      var modifySql = 'UPDATE BOARD SET `Image` = ?, `Content` = ? WHERE `ID` = ? AND `Date` = ?';
      var modifyParams = [path, content, id, date];
      conn.query(modifySql, modifyParams, function (err, rows, fields) {
        if(err) console.log('qeury is not excuted. select fail...\n' + err);
        else res.send("success")
      })
    }
  })
});

router.post('/delete', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var date = data.date;

  var deleteSql = 'DELETE FROM BOARD WHERE ID = ? AND Date = ?';
  var deleteParams = [id, date];
  conn.query(deleteSql, deleteParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send("success")
  })
});

router.post('/comment', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var date = data.date;

  var commentSql = 'SELECT `C_content`, `C_writer`, `C_date`, `Group`, `Class` FROM COMMENT WHERE ID = ? AND `Date` = ? ORDER BY `Group`';
  var commentParams = [id, date];
  conn.query(commentSql, commentParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows)
  })
});

router.post('/comment/create', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var date = data.date;
  var C_writer = data.C_writer;
  var C_content = data.C_content;

  var commentSql = 'SELECT MAX(`Group`) AS `Group` FROM COMMENT WHERE ID = ? AND `Date` = ?';
  var commentParams = [id, date];
  conn.query(commentSql, commentParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else {
      var C_group = rows[0].Group
      var commentInsertSql = 'INSERT INTO COMMENT (ID, C_content, C_writer, `Date`, C_date, `Group`, Class) VALUES (?, ?, ?, ?, ?, ?, ?);';
      var commentInsertParams = [id, C_content, C_writer, date, new Date(), (C_group + 1), 0];
      conn.query(commentInsertSql, commentInsertParams, function (err, rows, fields) {
        if(err) console.log('qeury is not excuted. select fail...\n' + err);
        else res.send("success")
      })
    }
  })
});

router.post('/comment/detail', function(req, res, next) {
  var data = req.body;

  var nickName = data.nickName;
  var date = data.date;

  var modifySql = 'SELECT * FROM COMMENT WHERE `C_writer` = ? AND `C_date` = ?';
  var modifyParams = [nickName, date];
  conn.query(modifySql, modifyParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows)
  })
});

router.post('/comment/modify', function(req, res, next) {
  var data = req.body;

  var nickName = data.nickName;
  var content = data.content;
  var date = data.date;

  var modifySql = 'UPDATE COMMENT SET `C_content` = ? WHERE `C_writer` = ? AND `C_date` = ?';
  var modifyParams = [content, nickName, date];
  conn.query(modifySql, modifyParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send("success")
  })
});

router.post('/comment/delete', function(req, res, next) {
  var data = req.body;

  var nickName = data.nickName;
  var date = data.date;
  var classNum = data.classNum;

  var deleteSql = 'UPDATE COMMENT SET `C_content` = ? WHERE C_writer = ? AND C_date = ? AND `Class` = ?';
  var deleteParams = ['삭제된 메시지 입니다.', nickName, date, classNum];
  conn.query(deleteSql, deleteParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send("success")
  })
});

router.post('/reply/create', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var date = data.date;
  var C_writer = data.C_writer;
  var C_content = data.C_content;
  var C_group = data.group;

  var commentSql = 'SELECT MAX(`Class`) AS `Class` FROM COMMENT WHERE ID = ? AND `Date` = ? AND `Group` = ?';
  var commentParams = [id, date, C_group];
  conn.query(commentSql, commentParams, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else {
      var C_class = rows[0].Class
      var commentInsertSql = 'INSERT INTO COMMENT (ID, C_content, C_writer, `Date`, C_date, `Group`, Class) VALUES (?, ?, ?, ?, ?, ?, ?);';
      var commentInsertParams = [id, C_content, C_writer, date, new Date(), C_group, (C_class + 1)];
      conn.query(commentInsertSql, commentInsertParams, function (err, rows, fields) {
        if(err) console.log('qeury is not excuted. select fail...\n' + err);
        else res.send("success")
      })
    }
  })
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