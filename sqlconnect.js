var mysql      = require('mysql');
require('dotenv').config({path:"./env/.env"});

exports.makeconnection = function() {
  var connection = mysql.createConnection({
    host     : process.env.DB_HOST,    // 호스트 주소
    user     : process.env.DB_USERNAME,           // mysql user
    password : process.env.DB_PASSWORD,       // mysql password
    database : process.env.DB_NAME         // mysql 데이터베이스
  });
  connection.connect();
  return connection;
}

exports.sendSQL = function(connection, sqlline, dataset) {
  connection.query(sqlline, 
  function (error, results, fields) {
    if (error) throw error;
    for(var i in results) {
      datad = {};
      for(var l in results[i]) {
        datad[l] = results[i][l];
      }
      dataset.push(datad);
    } // call by reference를 위해 array이용
  });
}

exports.sendSQL_update = function(connection, sqlline) {
  connection.query(sqlline, 
  function (error, results, fields) {
    if (error) throw error;    
  });
}

exports.sendSQL_att = function(connection, sqlline, dataset, subject_id) {
  connection.query(sqlline, 
    function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      var dataList = [];
      for(var i in results) {
        datad = {};
        for(var l in results[i]) {
          datad[l] = results[i][l];
        }
        dataList.push(datad);
      } // call by reference를 위해 array이용
      dataset[subject_id] = dataList;
    });
}

exports.update_SQL_user_info = function (connection, userId, token) {
  sqlline = "update user_info set userId = '" + userId + "', Authorized = 1 where token = '" + token +"';";
  connection.query(sqlline, 
    function (error, result, fields) {
      if (error) console.log(error);
    });
}

exports.update_SQL_attendance = function (connection, subject_attendance) {
  for (var subj_id in subject_attendance) {
    var attendance = subject_attendance[subj_id];
    var sqlline;
    for (var std in attendance) {
      var std_id = attendance[std]["student_id"]
      sqlline = "update subject_"+subj_id+"_attendance set ";
      for(var l = 1;l<=48;l++) {
        var cls = "class_" + l.toString();
        sqlline = sqlline + cls + " = " + attendance[std][cls] + ", ";
        var time = "time_" + l.toString();
        sqlline = sqlline + time + " = " + attendance[std][time];
        if(l != 48) {
          sqlline = sqlline + ', '
        }
      }
      sqlline = sqlline+ " where student_id = " + std_id.toString() + ";";
      connection.query(sqlline, 
        function (error, result, fields) {
          if (error) console.log(error);
        });
    }

    
  }
}

exports.update_SQL_subject_info_announcement = function (connection, subject_info) {
  for (var i in subject_info) {
    var sbj_id = subject_info[i]["subject_id"];
    var sbj_announce = subject_info[i]["announcement"];
    sqlline = "update subject_info set announcement = '" + sbj_announce + "' where subject_id = '" + sbj_id.toString() + "';";
    connection.query(sqlline, 
      function (error, result, fields) {
        if (error) console.log(error);
      });
  }
}

exports.update_SQL_subject_info_conducted = function (connection, subject_info) {
  for (var i in subject_info) {
    var sbj_id = subject_info[i]["subject_id"];
    var sbj_announce = subject_info[i]["conducted_lecture"];
    var sqlline = "update subject_info set conducted_lecture = " + sbj_announce + " where subject_id = '" + sbj_id.toString() + "';";
    connection.query(sqlline, 
      function (error, result, fields) {
        if (error) console.log(error);
      });
  }
}

exports.endconnection = function(connection) {
  connection.end();
}