const request = require('request');
require('dotenv').config({path:"./env/.env"});
const db = require('./sqlconnect');
const com = require('./common');

exports.make_main_page = function(userId, user_info, res_waiting, subject_info, conn, subject_attendance) {
    for(var i in subject_info) {
      var subject_id = subject_info[i]['subject_id'];
      var sqlline = 'select * from subject_' + subject_id + '_attendance;';
      db.sendSQL_att(conn, sqlline, subject_attendance, subject_id);
    }
    if(com.is_student(userId, user_info)) {
      student_main(userId, res_waiting);
    }
    else {
      lecture_main(userId, res_waiting)
    }
}

function lecture_main(userId, res_waiting) {
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
                            "text": "인증 출석 시작을 위해서는 checkstart를 입력해주시기 바랍니다.",
                            "actions": [
                                {
                                    "type":"message",
                                    "label":"출석 확인",
                                    "text":"check_att_all"
                                },
                                {
                                    "type":"message",
                                    "label":"출석 입력",
                                    "text":"att_in"
                                },
                                {
                                    "type":"message",
                                    "label":"공지하기",
                                    "text":"announcement_in"
                                },
                                {
                                    "type":"message",
                                    "label":"휴강처리",
                                    "text":"decess"
                                }
                            ]
                        }
                    }
                ]
            }
        },(error, response, body) => {
          console.log(body)
        });
  
    res_waiting[userId][0] = 4;
}

function student_main(userId, res_waiting) {
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
                            "text": "원하시는 기능을 선택해주시기 바랍니다.",
                            "actions": [
                                {
                                    "type":"message",
                                    "label":"출석 확인",
                                    "text":"check_att"
                                },
                                {
                                    "type":"message",
                                    "label":"과목 공지 확인",
                                    "text":"announcement_check"
                                }  
                            ]
                        }
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
        });
  
    res_waiting[userId][0] = 4;
}