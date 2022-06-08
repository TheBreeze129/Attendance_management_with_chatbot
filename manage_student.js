const request = require('request');
require('dotenv').config({path:"./env/.env"});
const com = require('./common');

exports.announcement_check = function (userId, subj_id, subject_info) {
  var announcement = com.find_by_value(subj_id, subject_info)['announcement'];
  var ann_list = announcement.split("///");
  var message_list = [];
  for(var i in ann_list) {
    mes_str = {
      "type":"postback",
      "label":ann_list[i],
      "data":'ignore'
    }
    message_list.push(mes_str)
  }
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
              "type": "template",
              "altText": "This is a buttons template",
              "template": {
                  "type": "buttons",
                  "title": "공지 확인",
                  "text": "선택하진 과목의 최근 공지 3개입니다.",
                  "actions": message_list
              }
            }
          ]
        }
      },(error, response, body) => {
          console.log(body)
      });
  }
  
exports.check_att_student = function(userId, subj_id, subject_info, subject_attendance, user_info) {
  var student_id = com.find_by_value(userId, user_info)['id'];
  var attendance = com.find_by_value(student_id, subject_attendance[subj_id]);
  var conducted = com.find_by_value(subj_id, subject_info)["conducted_lecture"];
  if(conducted != 0) {
    var postbacks = [];
    for(var i = 1; i<=conducted; i++) {
      var att = attendance["class_"+i.toString()];
      var att_str;
      switch(att) {
        case 1:
          att_str = '출석';
          break;
        case 2:
          att_str = '지각';
          break;
        case 3:
          att_str = '결석';
          break;
        case 4:
          att_str = "휴강";
          break;
      }
      var pb = {
        "type": "postback",
        "label": i.toString()+'차시 : '+att_str,
        "data": "ignore"
      }
      postbacks.push(pb);
    }
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
                "type": "template",
                "altText": "This is a buttons template",
                "template": {
                    "type": "buttons",
                    "title": "출석노트",
                    "text": "귀하의 출석 현황입니다.",
                    "actions": postbacks
                }
              }
            ]
         }
        },(error, response, body) => {
            console.log(body)
      });
  }
    
}