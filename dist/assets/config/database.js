var mysql = require('mysql');
var db_info = {
    host: 'teamdb.cyvuw7qeaj7w.ap-northeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'user',
    password: 'qwer1234',
    database: 'calorie'
}

module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}