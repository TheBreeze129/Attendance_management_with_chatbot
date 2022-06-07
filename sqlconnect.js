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

exports.endconnection = function(connection) {
  connection.end();
}
