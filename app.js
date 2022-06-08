const express = require('express');
const request = require('request');
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const bodyParser = require('body-parser');
require('dotenv').config({path:"./env/.env"});
const att = require('./attendance_check')
const com = require('./common');
const db = require('./sqlconnect');
const main = require("./main_page")
const man_stu = require("./manage_student");
const man_lec = require("./manage_lecturer");

var app = express();
app.use(bodyParser.json());

const TARGET_URL = process.env.TARGET_URL;
const TARGET_URL_PUSH = process.env.TARGET_URL_PUSH;
const MULTI_TARGET_URL = process.env.MULTI_TARGET_URL;
const TOKEN = process.env.TOKEN;
const domain = process.env.DOMAIN
const sslport = 23023;

// DB 로드.
var user_info = []; // [값들]
var subject_info = []; // [값들]
var subject_attendance = {} // { subject_id : [출석부들]}
var conn = db.makeconnection();
db.sendSQL(conn, "select * from user_info;", user_info);
db.sendSQL(conn, 'select * from subject_info;', subject_info);


// 어떠한 push에 대한 답을 기다리고 있는지를 저장.
// 출석코드 입력을 기다리는 경우 -> 1
// 교수자가 출석체크 여부에 대한 답을 하길 기다리는 경우 -> 2
// gps 정보 입력을 기다리는 경우 -> 3
var res_waiting = {}; //{userId : [flag, {subject_info}]}

var select = {};

app.post('/hook', function (req, res) {

  try{
    if(req.body.events[0].postback['data'] == 'ignore') return;
  } catch (error) {}
  
  var eventObj = req.body.events[0];
  var source = eventObj.source;
  var message = eventObj.message;

  // request log
  console.log('======================', new Date() ,'======================');
  console.log('[request]', req.body);
  console.log('[request source] ', eventObj.source);
  console.log('[request message]', eventObj.message);
    
  var inputtime = new Date();
  var userId = eventObj.source.userId;
    
  if(!(userId in res_waiting)) {
    if(eventObj.message == undefined) {
      res_waiting[userId] = [44, null];
    } else {
      res_waiting[userId] = [0, null];
    }        
  }

  switch(res_waiting[userId][0]) {     
    case 1: // 4자리 코드 입력을 기다리는 경우
      att.wait_for_attendance_code(conn, userId, eventObj, inputtime, res_waiting, user_info, subject_attendance);
      break;
    case 2: // 교수자의 출석체크 여부를 기다리는 경우
      att.wait_for_lecturer_response_att(userId, eventObj, res_waiting, subject_attendance, user_info);
      res_waiting[userId][1]["conducted_lecture"] = res_waiting[userId][1]["conducted_lecture"] + 1;
      break;
    case 3: // gps정보 입력을 기다리는 경우
      att.wait_for_gps(conn, userId, eventObj, res_waiting, user_info, subject_attendance);
      db.update_SQL_subject_info_conducted(conn, subject_info);
      db.update_SQL_attendance(conn, subject_attendance);
      break;
    case 4: // main의 선택을 기다리는 경우
      if(["checkstart", "announcement_check", "check_att", "check_att_all", "announcement_in","decess","att_in"].includes(eventObj.message.text)) {
        select[userId] = eventObj.message.text;   
        select_subject(userId, subject_attendance, user_info, subject_info);      
        break;
      }  
    case 5:
      if(eventObj.message.text.slice(0,5) == "subj_") {
        var subj_id = eventObj.message.text.split('_')[1];
        switch(select[userId]) {
          case "check_att":
            man_stu.check_att_student(userId, subj_id, subject_info, subject_attendance, user_info);
            res_waiting[userId][0] = 0;
            break;
          case "announcement_check":
            man_stu.announcement_check(userId, subj_id, subject_info);
            res_waiting[userId][0] = 0;
            break;
          case "check_att_all":
            man_lec.select_when(userId, subj_id, subject_info, res_waiting);
            select[userId] = [select[userId], subj_id, 1]
            break;
          case "att_in":
            man_lec.select_when(userId, subj_id, subject_info, res_waiting);
            select[userId] = [select[userId], subj_id, 2, 0]
            break;
          case "announcement_in":
            man_lec.push_writeannouncement(userId, res_waiting, com.find_by_value(subj_id, subject_info)["subject_name"]);
            select[userId] = [select[userId], subj_id];
            break;
          case "decess":
            man_lec.push_ifdecess(userId, res_waiting, com.find_by_value(subj_id, subject_info)["subject_name"], subject_info);
            select[userId] = [select[userId], subj_id];
            break; 
          case "checkstart":
            att.push_ifstartAttcheck(userId, subj_id, subject_info, res_waiting, subject_attendance, conn);
            break;
          }
          break; 
        }
        // select[userId] = ['첫메뉴입력', '과목id', '함수재분류', '학생이터레이터', '차시번호']
    case 6:
      if(eventObj.postback != undefined) {
        if(eventObj.postback.data.slice(0,7) == "cal_sw_") {
          switch(select[userId][2]) {
            case 1:
              man_lec.check_att_lecturer(userId, select[userId][1], subject_info, subject_attendance, user_info, eventObj.postback.data);
              res_waiting[userId][0] = 0
              break;
            case 2:
              select[userId].push(eventObj.postback.data.split("_")[2])
              man_lec.change_att(userId, user_info, select[userId], subject_attendance[select[userId][1]], select[userId][4], res_waiting);
              break;
          } 
          break;         
        }
      }
    case 7:
      if(eventObj.postback != undefined) {
        if(eventObj.postback.data.slice(0, 4) == "att_") {
          var attdata = eventObj.postback.data.split('_')[1]
          man_lec.change_stu_att(attdata, select[userId], subject_attendance);
          select[userId][3] = select[userId][3] + 1;
          man_lec.change_att(userId, user_info, select[userId], subject_attendance[select[userId][1]], select[userId][4], res_waiting);
          db.update_SQL_attendance(conn, subject_attendance);
          break;
        }
      }
    case 8:
      if(res_waiting[userId][0] == 8) {
        man_lec.change_announcement(userId, select[userId][1], subject_info, eventObj.message.text, subject_attendance, user_info);
        db.update_SQL_subject_info_announcement(conn, subject_info);
        res_waiting[userId][0] = 0;
        break;
      }
    case 9:
      if(eventObj.postback != undefined) {
        if(eventObj.postback.data == 'yes!') {
          var codnum = com.find_by_value(select[userId][1],subject_info)['conducted_lecture'];
          com.find_by_value(select[userId][1],subject_info)['conducted_lecture'] = codnum + 1;
          man_lec.decess(userId, select[userId][1], subject_attendance, subject_info, user_info);
          db.update_SQL_subject_info_conducted(conn, subject_info);
          db.update_SQL_attendance(conn, subject_attendance);
        } else {
          request.post({
            url: process.env.TARGET_URL_PUSH,
            headers: {
                    'Authorization': `Bearer ${process.env.TOKEN}`
                  },
            json: {
                    "to": `${userId}`,
                    "messages":[
                  {
                    "type": "text",
                    "text": "휴강처리되지 않았습니다."
                  }
                  ]
                  }
            },(error, response, body) => {
              console.log(body)
          });
        } 
        res_waiting[userId][0] = 0;
        break;
      }
    case 44:
      if(res_waiting[userId][0] == 44) {
        Authorize(userId, eventObj.message.text, user_info, res_waiting);
        break;  
      }   
    default:
      main.make_main_page(userId, user_info, res_waiting, subject_info, conn, subject_attendance);
      break;
  }
  res.sendStatus(200);
});

function Authorize(userId, text, user_info, res_waiting) {
  var usr = com.find_by_value(text, user_info);
  if(usr == false) {
    request.post(
      {
          url: process.env.TARGET_URL_PUSH,
          headers: {
              'Authorization': `Bearer ${process.env.TOKEN}`
          },
          json: {
              "to": `${userId}`,
              "messages":[
                  {
                      "type": "text",
                      "text": "인증실패 : 토큰을 다시 입력해주십시오."
                  }                  
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
  } else {
    usr["userId"] = userId;
    usr["Authorized"] = 1;
    db.update_SQL_user_info(conn, userId, text);
    request.post(
      {
          url: process.env.TARGET_URL_PUSH,
          headers: {
              'Authorization': `Bearer ${process.env.TOKEN}`
          },
          json: {
              "to": `${userId}`,
              "messages":[
                  {
                      "type": "text",
                      "text": "인증성공 : 반갑습니다. " + usr['Name'] + '님'
                  }                  
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
    res_waiting[userId][0] = 0;
  }
}

function select_subject(userId, subject_attendance, user_info, subject_info) {
  var subject_list = {};
  var student_id = com.find_by_value(userId, user_info)['id'];
  if(com.is_student(userId, user_info)){
    for (var i in subject_attendance) {
      for (var l in subject_attendance[i]) {
        var temp_std_id = subject_attendance[i][l]['student_id'];
        if(temp_std_id == student_id) {
          subject_list[i] = com.find_by_value(i,subject_info)["subject_name"];
        }
      }
    }
  } else {
    for (var i in subject_info) {
      if(subject_info[i]["lecturer_id"] == student_id) {
        subject_list[subject_info[i]["subject_id"]] = subject_info[i]["subject_name"];
      }
    }
  }
  
  var message_list = [];
  for(var i in subject_list) {
    mes_str = {
      "type":"message",
      "label":subject_list[i],
      "text":"subj_"+i
    }
    message_list.push(mes_str)
  }
  request.post(
    {
        url: TARGET_URL_PUSH,
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        },
        json: {
            "to": `${userId}`,
            "messages":[
                {
                    "type": "template",
                    "altText": "This is a buttons template",
                    "template": {
                        "type": "buttons",
                        "title": "출석노트",
                        "text": "과목을 선택해주시기 바랍니다.",
                        "actions": message_list
                    }
                  }
            ]
        }
    },(error, response, body) => {
        console.log(body)
    });

    res_waiting[userId][0] = 5;
}

try {
    const option = {
      ca: fs.readFileSync('/etc/letsencrypt/live/' + domain +'/fullchain.pem'),
      key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/privkey.pem'), 'utf8').toString(),
      cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/cert.pem'), 'utf8').toString(),
    };  
    HTTPS.createServer(option, app).listen(sslport, () => {
      console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
  } catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
  }