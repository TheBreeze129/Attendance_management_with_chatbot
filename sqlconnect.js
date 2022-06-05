const mysql = require('mysql');
const tunnel = require('tunnel-ssh');
const fs = require('fs');
require('dotenv').config({path:"./env/.env"});
const bodyParser = require('body-parser');
const request = require('request');

const ssh_config = {
    username: process.env.SSH_USER,
    privateKey: fs.readFileSync('./env/labsuser.pem'),
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT,
    dstHost: process.env.SSH_DB_HOST,
    dstPort: process.env.SSH_DB_PORT,
};

exports.SQLconnection = function(sqlline) {
    tunnel(ssh_config, (error, server) => {
        if (error) {
          throw error;
        } else if (server !== null) {
          const conn = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
          });
          conn.connect();
          conn.query(sqlline, function(error, results, fields) {
            conn.end();
            server.close();
            if (error) { console.log(error); };
            var dataList = [];
            for (var i in results) {
              let line = {}
              for(var l in results[i]) {
                line[l] = results[i][l];
              }
              dataList.push(line);
            }            
            request.post({
              uri: process.env.SQL_RES_URL,
              method: 'POST',
              body: {
                sql: sqlline,
                resdata: dataList,
                Authorization: process.env.TOKEN
              },
              data : 1000,
              json:true
            }, function (error, response, body) {

            });
            
            
          })
          
        }
    });
}