var fs = require('fs');
var { smtpTransport } = require(__dirname + '/../assets/config/email');
var express = require('express');
var router = express.Router();

const multer = require('multer');
const upload = multer({dest: __dirname + '/../upload'})

var db_config = require(__dirname + '/../assets/config/database.js');
var conn = db_config.init();

db_config.connect(conn);

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.clearCookie('userData').render('views/user/login.html');
});

/* POST login check. */
router.post('/login/check', function(req, res, next) {
  var data = req.body;

  id = data.id;
  pw = data.pw;

  var sql = "SELECT * FROM `MEMBER` WHERE ID = '" + id + "' AND Password = + '" + pw + "';"
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else {
      if(rows != "") {
        res.cookie('userData', rows[0].ID).send(rows);
      } else {
        res.send(rows);
      }
    }
  })
});

/* GET login page. */
router.get('/password', function(req, res, next) {
  res.render('views/user/password.html');
});

/* POST myPage detail. */
router.post('/password/check', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var email = data.email;

  var sql = "SELECT * FROM USER A INNER JOIN `MEMBER` B ON A.ID = B.ID WHERE A.ID = ?";
  var sqlParam = [id]
  conn.query(sql, sqlParam, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else {
      if(email == rows[0].Email) {
        res.send("success")
      } else {
        res.send("wrong")
      }
    }
  });
});

/* post register email check. */
router.post('/password/reset', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var sendEmail = data.email;
  /* min ~ max까지 랜덤으로 숫자를 생성하는 함수 */ 
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$%^&*";
  const stringLength = 8;

  var randomString = "";
  for (let i = 0; i < stringLength; i++) {
    let randomNum = Math.floor(Math.random() * chars.length);
    randomString += chars.substring(randomNum, randomNum + 1);
  }
  
  const mailOptions = {
    from: "3142314@naver.com",
    to: sendEmail,
    subject: "[칼로리 가이드]임시비밀번호 이메일 입니다",
    text: "임시비밀번호는 : " + randomString + " 입니다."
  };

  smtpTransport.sendMail(mailOptions, (error, responses) => {
    if (error) {
      return res.send(error)
    } else {
      var sql = "UPDATE `MEMBER` SET `Password` = ? WHERE ID = ?";
      var sqlParam = [randomString, id]
      conn.query(sql, sqlParam, function (err, rows, fields) {
        if(err) console.log('qeury is not excuted. select fail...\n' + err);
        else res.send("success");
      });
    }
    smtpTransport.close();
  });
});

/* GET myPage page. */
router.get('/myPage', function(req, res, next) {
  res.render('views/user/myPage.html');
});

/* POST myPage detail. */
router.post('/myPage/detail', function(req, res, next) {
  var data = req.body;

  id = data.id;

  var sql = "SELECT * FROM USER A, `MEMBER` B WHERE A.ID = '" + id + "' AND B.ID = '" + id + "';"
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    else res.send(rows);
  });
});

/* POST myPage check. */
router.post('/myPage/check', upload.single('Profile'), function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var nickName = data.nickName;
  var pw = data.pw;
  var height = data.height;
  var weight = data.weight;
  var age = data.age;
  var gender = data.gender;
  var goal = data.goal;
  var activity = data.activity;
  var email = data.email;

  var path = "";
  if(req.file == undefined) {
    path = __dirname.replace(/\\/g, '/') + '/dist/img/profile.png'
  } else {
    path = req.file.path.replace(/\\/g, '/');
  }

  var RMR = 0;
  var pound = Number(weight) / 0.453;
  if(Number(gender) == 1) {
    RMR = 66 + (13.7 * Number(weight) + (5 * Number(height) - (6.8 * Number(age))));
  } else {
    RMR = 655 + (9.6 * Number(weight) + (1.7 * Number(height)) - (4.6 * Number(age)));
  }
  var G_kcal = "";
  var G_tan = "";
  var G_dan = "";
  var G_gi = "";
  var keepKcal = RMR * parseFloat(activity);
  if(Number(goal) == 1) {
    G_kcal = keepKcal;
    G_dan = pound * 0.9;
    G_gi = pound * 0.4;
    G_dan_kcal = G_dan * 4
    G_gi_kcal = G_gi * 4
    G_tan_kcal = keepKcal - (G_dan_kcal + G_gi_kcal);
    G_tan = G_tan_kcal / 9;
  } else if(Number(goal) == 2) {
    G_kcal = keepKcal + (keepKcal * 0.15);
    G_dan = pound * 0.9;
    G_gi = (pound * 0.4) + 15;
    G_dan_kcal = G_dan * 4
    G_gi_kcal = G_gi * 4
    G_tan_kcal = G_kcal - (G_dan_kcal + G_gi_kcal);
    G_tan = G_tan_kcal / 9;
  } else {
    G_kcal = keepKcal - 500;
    G_dan = pound * 1.3;
    G_gi = pound * 0.3;
    G_dan_kcal = G_dan * 4
    G_gi_kcal = G_gi * 4
    G_tan_kcal = G_kcal - (G_dan_kcal + G_gi_kcal);
    G_tan = G_tan_kcal / 9;
  }

  var sql = "SELECT * FROM GOAL WHERE ID = '" + id + "' ORDER BY Reset DESC;"
  conn.query(sql, function (err, rows, fields) {
    if(err) {
      console.log('qeury is not excuted. select fail...\n' + err);
    } else {
      var reset = rows[0].Reset;
      var memberSql = 'UPDATE MEMBER SET `ID` = ?, `Password` = ? WHERE `ID` = ?';
      var memberParams = [id, pw, id];
      conn.query(memberSql, memberParams, function(err, rows, fields) {
        if(err) {
          console.log(err);
          res.send("error")
        } else {
          var sql = "SELECT * FROM USER WHERE ID = '" + id + "';"
          conn.query(sql, function (err, rows, fields) {
            if(err) {
              console.log('qeury is not excuted. select fail...\n' + err);
              res.send("error")
            } else {
              fileName = rows[0].Profile.split('/')[rows[0].Profile.split('/').length - 1];
              if(rows[0].Profile != __dirname + '/dist/img/profile.png') {
                fs.unlink("dist/upload/" + fileName + "", (err)=>{
                  if( err ) console.log(err);
                  console.log('USER FILE DELETED');
                });
              }
              var userSql = 'UPDATE USER SET `Email` = ?, `Nickname` = ?, `Age` = ?, `Gender` = ?, `Height` = ?, `Weight` = ?, `Activity` = ?, `Goal` = ?, `ID` = ?, `Rank` = ?, `Ranking_score` = ?, `Profile` = ? WHERE `ID` = ?';
              var userParams = [email, nickName, Number(age), Number(gender), Number(height), Number(weight), parseFloat(activity), Number(goal), id, 0, 0, path, id];
              conn.query(userSql, userParams, function(err, rows, fields) {
                if(err) {
                  console.log(err);
                  res.send("error")
                } else {
                  var userSql = 'INSERT INTO GOAL(`G_kcal`, `G_tan`, `G_dan`, `G_gi`, `Reset`, `ID`) VALUES (?, ?, ?, ?, ?, ?)';
                  var userParams = [parseFloat(G_kcal), parseFloat(G_tan), parseFloat(G_dan), parseFloat(G_gi), reset + 1, id];
                  conn.query(userSql, userParams, function(err, rows, fields) {
                    if(err) {
                      console.log(err);
                      res.send("error")
                    } else {
                      res.send("success");
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('views/user/register.html');
});

/* post register email check. */
router.post('/email/check', function(req, res, next) {
  var data = req.body;

  var sendEmail = data.email;
  /* min ~ max까지 랜덤으로 숫자를 생성하는 함수 */ 
    var ranNum = Math.floor(Math.random()*(999999-111111+1)) + 111111;

    const mailOptions = {
      from: "3142314@naver.com",
      to: sendEmail,
      subject: "[칼로리 가이드]인증 관련 이메일 입니다",
      text: "오른쪽 숫자 6자리를 입력해주세요 : " + ranNum
  };

  smtpTransport.sendMail(mailOptions, (error, responses) => {
      if (error) {
          return res.send(error)
      } else {
        /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
          var num = {
            num : ranNum
          }
          res.json(num)
      }
      smtpTransport.close();
  });
});

/* POST register check. */
router.post('/register/check', upload.single('Profile'), function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var nickName = data.nickName;
  var pw = data.pw;
  var height = data.height;
  var weight = data.weight;
  var age = data.age;
  var gender = data.gender;
  var goal = data.goal;
  var activity = data.activity;
  var email = data.email;

  var path = ""
  if(req.file == undefined) {
    path = __dirname + '/dist/img/profile.png'
  } else {
    path = req.file.path
  }

  var RMR = 0;
  var pound = Number(weight) / 0.453;
  if(Number(gender) == 1) {
    RMR = 66 + (13.7 * Number(weight) + (5 * Number(height) - (6.8 * Number(age))));
  } else {
    RMR = 655 + (9.6 * Number(weight) + (1.7 * Number(height)) - (4.6 * Number(age)));
  }
  var G_kcal = "";
  var G_tan = "";
  var G_dan = "";
  var G_gi = "";
  var keepKcal = RMR * parseFloat(activity);
  if(Number(goal) == 1) {
    G_kcal = keepKcal;
    G_dan = pound * 0.9;
    G_gi = pound * 0.4;
    G_dan_kcal = G_dan * 4
    G_gi_kcal = G_gi * 4
    G_tan_kcal = keepKcal - (G_dan_kcal + G_gi_kcal);
    G_tan = G_tan_kcal / 9;
  } else if(Number(goal) == 2) {
    G_kcal = keepKcal + (keepKcal * 0.15);
    G_dan = pound * 0.9;
    G_gi = (pound * 0.4) + 15;
    G_dan_kcal = G_dan * 4
    G_gi_kcal = G_gi * 4
    G_tan_kcal = G_kcal - (G_dan_kcal + G_gi_kcal);
    G_tan = G_tan_kcal / 9;
  } else {
    G_kcal = keepKcal - 500;
    G_dan = pound * 1.3;
    G_gi = pound * 0.3;
    G_dan_kcal = G_dan * 4
    G_gi_kcal = G_gi * 4
    G_tan_kcal = G_kcal - (G_dan_kcal + G_gi_kcal);
    G_tan = G_tan_kcal / 9;
  }

  var memberSql = 'INSERT INTO MEMBER(`ID`, `Password`) VALUES (?,?)';
  var memberParams = [id,pw];
  conn.query(memberSql, memberParams, function(err, rows, fields) {
    if(err) {
      console.log(err);
      res.send("error")
    } else {
      var userSql = 'INSERT INTO USER(`Email`, `Nickname`, `Age`, `Gender`, `Height`, `Weight`, `Activity`, `Goal`, `ID`, `Rank`, `Ranking_score`, `Profile`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      var userParams = [email, nickName, Number(age), Number(gender), Number(height), Number(weight), parseFloat(activity), Number(goal), id, 0, 0, path];
      conn.query(userSql, userParams, function(err, rows, fields) {
        if(err) {
          console.log(err);
          res.send("error")
        } else {
          var userSql = 'INSERT INTO GOAL(`G_kcal`, `G_tan`, `G_dan`, `G_gi`, `Reset`, `ID`) VALUES (?, ?, ?, ?, ?, ?)';
          var userParams = [parseFloat(G_kcal), parseFloat(G_tan), parseFloat(G_dan), parseFloat(G_gi), 0, id];
          conn.query(userSql, userParams, function(err, rows, fields) {
            if(err) {
              console.log(err);
              res.send("error")
            } else {
              res.send("success");
            }
          });
        }
      });
    }
  });
});

router.get('/findPW', function(req, res, next) {
  res.render('views/user/password.html');
});

router.post('/list', function(req, res, next) {
  var data = req.body;

  probability = 1;
 
  data.sort(({ probability: a }, { probability: b }) => Math.abs(a - probability) - Math.abs(b - probability));
  
  var sql = 'SELECT * FROM FOOD WHERE F_name LIKE ' + conn.escape('%' + data[0].name + '%');
  conn.query(sql, function (err, rows, fields) {
    if(err) console.log('qeury is not excuted. select fail...\n' + err);
    //else res.render('ai.html', {list : rows});
    else res.send(rows)
  })

  return "nice";
});

router.post('/info', function(req, res, next) {
  var data = req.body;

  var id = data.id;
  var nickName = data.nickName;
  
  if(id != undefined) {
    var infoSql = 'SELECT * FROM `USER` WHERE ID = ?';
    var infoParams = [id]
    conn.query(infoSql, infoParams, function (err, rows, fields) {
      if(err) console.log('qeury is not excuted. select fail...\n' + err);
      else res.send(rows)
    })
  } else {
    var infoSql = 'SELECT * FROM `USER` WHERE Nickname = ?';
    var infoParams = [nickName]
    conn.query(infoSql, infoParams, function (err, rows, fields) {
      if(err) console.log('qeury is not excuted. select fail...\n' + err);
      else res.send(rows)
    })
  }
});

module.exports = router;