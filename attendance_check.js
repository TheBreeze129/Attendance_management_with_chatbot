const com = require('./common');
const err = require('./error');
const request = require('request');
require('dotenv').config({path:"./env/.env"});

var att_code_info = {};

const TARGET_URL = process.env.TARGET_URL;
const TARGET_URL_PUSH = process.env.TARGET_URL_PUSH;
const MULTI_TARGET_URL = process.env.MULTI_TARGET_URL;
const TOKEN = process.env.TOKEN;
const domain = process.env.DOMAIN
const sslport = 23023;



user_info = [{'id' : 1, 'userId' : "Ubdb4477feb9079433b2ecb3012afe714",
'uniqueId' : 2019102217, 'Name' : '이형우', 'Authorized' : 1, 'is_lecturer' : 0}];
var subject_info = {'id' : 1, "subject_id" : "OSS", 'subject_name' : "오픈소스SW개발 00분반", 'Lecturer_id' : 20002000,
'Class_lat' : 37.488392442968376, 'Class_lon' : 126.74048865297846, 'Announcement' : "6/3 휴강합니다. \\\ 텀프 제출 바랍니다."};

var select;



exports.wait_for_attendance_code = function(userId, eventObj, inputtime, res_waiting) {
    // 학생이 출석 코드를 기다리는 경우
    if(com.is_student(userId)) {
      var inclass = find_inclass(userId);
      for(const key of inclass) {
        if(key in att_code_info) {
          if(eventObj.message.text.length == 4 && parseInt(eventObj.message.text) < 10000) {
            res_waiting[userId] = 0;
            att_code_info[key][3][userId] = attendance_check(inputtime, key, att_code_info[key], userId, eventObj.message.text);
            if(att_code_info[key][3][userId] > 0 && att_code_info[key][2]) {
              start_gpscheck(userId, res_waiting);
            }
            else if(att_code_info[key][3][userId] > 0) {
              success_attcheck(userId, subject_info["subject_id"]);
            }
          }
        }
        else {
          err.notlistenclass(userId);
        }
      }
    }
    else {
      err.notstudent(userId);
    }
};

exports.wait_for_lecturer_response_att = function (userId, eventObj, res_waiting) {
    if(com.is_lecturer(userId)) {
      if(eventObj.message.text == 'contact') {
        res_waiting[userId] = 0;
        start_attcheck(userId, true, res_waiting);
        push_startattcheck(111, res_waiting);
      }
      else if(eventObj.message.text == 'uncontact') {
        res_waiting[userId] = 0;
        start_attcheck(userId, false, res_waiting);
        push_startattcheck(111, res_waiting);
      }
      else if(eventObj.message.text == 'callname') {
        res_waiting[userId] = 0;
        deny_attcheck(userId);
      }
    }
}
  
exports.wait_for_gps = function (userId, eventObj, res_waiting) {
    if(com.is_student(userId)) {
      if(eventObj.message.text.slice(0,22) == "https://www.gosur.com/") {
        res_waiting[userId] = 0;  
        var gps = gpscheck(subject_info["Class_lat"], subject_info["Class_lon"], eventObj.message.text);
        if(!gps) {
          err.gpsnotmatch(userId);
        }
        else {
          success_attcheck(userId, subject_info["subject_id"]);
        }
      }
    }
}
  
function success_attcheck(userId, subject_id) {
    var str = ""
    if(att_code_info[subject_id][3][userId] == 1) {
      str = "정상 출석처리되었습니다.";
    }
    else if(att_code_info[subject_id][3][userId] == 2) {
      str = "지각 처리되었습니다.";
    }
    else if (att_code_info[subject_id][3][userId] == 0) {
      str = "결석 처리되었습니다.";
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
                      "type":"text",
                      "text": str + ""
                  }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      }); 
  
}
  
function gpscheck(lat, lon, text) {
    var data = text.split("=")[3].slice(0,-2).split(",");
    var lat1 = parseFloat(data[0]);
    var lon1 = parseFloat(data[1]);
    var dis = getDistance(lat1, lon1, lat, lon);
    if(dis < 1000) {
      return true;
    }
    else {
      return false;
    }
}
  
function getDistance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2))
        return 0;
    
    var radLat1 = Math.PI * lat1 / 180;
    var radLat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radTheta = Math.PI * theta / 180;
    var dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
    if (dist > 1)
        dist = 1;
    
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344 * 1000;
    if (dist < 100) dist = Math.round(dist / 10) * 10;
    else dist = Math.round(dist / 100) * 100;
    
    return dist;
}
  
function start_gpscheck(userId, res_waiting) {
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
                          "title": "현재 위치 확인",
                          "text": "아래 버튼을 누른 후 URL을 복사, 전송해주시기 바랍니다.",
                          "actions": [
                              {
                                "type": "uri",
                                "label": "위치 확인",
                                "uri": "https://www.gosur.com/map/south-korea/?search=%EC%8B%A4%EC%8B%9C%EA%B0%84+%EC%9C%84%EC%84%B1+%EC%A7%80%EB%8F%84&lang=ko"
                              }
                          ]
                      }
                    }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
  
      res_waiting[userId] = 3;
}
  
function deny_attcheck(userId) {
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
                      "type":"text",
                      "text": "인증출석을 거부하셨습니다. 호명출석 등의 수단으로 진행 후 입력해주시기 바랍니다."
                  }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
}
  
function start_attcheck(userId, contact, res_waiting) {
    var attendance_code = Math.floor(Math.random() * 10000).toString()
    while(attendance_code.length < 4) {
      attendance_code = '0' + attendance_code;
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
                    "type":"text",
                    "text": subject_info["subject_name"] + "수업의 출석인증을 시작합니다. 교강사 여러분께서는 다음 출석번호를 구두로 수강생에게 전달해주시면 감사하겠습니다."
                },
                {
                    "type":"text",
                    "text": "출석인증번호 : " + attendance_code
                }
            ]
        }
    },(error, response, body) => {
        console.log(body)
    });
  
    att_code_info[subject_info["subject_id"]] = [attendance_code, new Date(), contact, {}];

}

function push_startattcheck(subject_id, res_waiting) {

    userIds = [];
    userIds.push('Ubdb4477feb9079433b2ecb3012afe714');
    request.post(
        {
            url: MULTI_TARGET_URL,
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            },
            json: {
                "to": userIds,
                "messages":[
                    {
                        "type":"text",
                        "text": subject_info["subject_name"] + "의 출석인증이 시작되었습니다. 교강사님께 출석인증번호를 전달받고 출석번호를 입력해주시기 바랍니다."
                    },
                ]
            }
        },(error, response, body) => {
            console.log(body)
    });
    
    for(const i in userIds) {
        res_waiting[userIds[i]] = 1;
    }
}
  
exports.push_ifstartAttcheck = function (userId, res_waiting) {
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
                      "title": subject_info["subject_name"],
                      "text": "출석인증",
                      "actions": [
                        {
                          "type":"message",
                          "label":"대면",
                          "text":"contact"
                        },
                          {
                            "type":"message",
                            "label":"비대면",
                            "text":"uncontact"
                          },
                          {
                            "type":"message",
                            "label":"직접호명출석",
                            "text":"callname"
                          }
                          
                      ]
                  }
                }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
  
    res_waiting[userId] = 2;
}
  
  
  
function attendance_check(inputtime, key, att_code_info, userId, userinputcode) {
    if(att_code_info[0] == userinputcode) {
      var late_time = new Date(att_code_info[1]).setMinutes(att_code_info[1].getMinutes() + 10);
      if(inputtime < late_time) {
        return 1; // 정상출석
      }
      else {
        return 2; // 지각
      }
    }
    else {
      err_codenotmatch(key, userId);
    }
}
  
  
function find_inclass(userId) {
    // DB의 출석부를 이용, 체크. 듣고 있는 수업 코드 리스트 반환.
    var inclass = [];
    inclass.push("OSS");
    return inclass
}
