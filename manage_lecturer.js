const request = require('request');
require('dotenv').config({path:"./env/.env"});
const com = require('./common');

exports.select_when = function (userId, subj_id, subject_info, res_waiting) {
    var conducted = com.find_by_value(subj_id, subject_info)["conducted_lecture"];
    var postbacks = [];
    for(var i = 1;i<=conducted;i++) {
        pst = {
            "type":"postback",
            "label":i.toString()+"차시",
            "data":"cal_sw_"+i.toString()
        }
        postbacks.push(pst)
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
                            "title": "출석 확인",
                            "text": "원하는 차시를 골라주십시오",
                            "actions": postbacks
                        }
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
        });
    res_waiting[userId][0] = 6;
}


exports.check_att_lecturer = function (userId, subj_id, subject_info, subject_attendance, user_info, data){
    // 지각, 결석자만 출력해보자.
    var lec_num = data.split("_")[2]
    var late_list = [];
    var absent_list = [];
    for (var i in subject_attendance[subj_id]) {
        var att = subject_attendance[subj_id][i]["class_"+lec_num];
        var std_id = subject_attendance[subj_id][i]["student_id"];
        if(att == 2) {
            late_list.push(std_id);
        } else if(att == 3) {
            absent_list.push(std_id);
        }
    }


    // 지각슈팅
    var postbacks = [];
    for(var i in late_list) {
        var user = com.find_by_value(late_list[i], user_info)
        pst = {
            "type":"postback",
            "label": user["uniqueId"].toString() + " " + user["Name"],
            "data":"ignore"
        }
        postbacks.push(pst)
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
                            "title": "출석 확인",
                            "text": "해당 차시의 지각자 명단입니다.",
                            "actions": postbacks
                        }
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
        });

        var postbacks2 = [];
        for(var i in absent_list) {
            var user = com.find_by_value(absent_list[i], user_info)
            pst = {
                "type":"postback",
                "label": user["uniqueId"].toString() + " " + user["Name"],
                "data":"ignore"
            }
            postbacks2.push(pst)
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
                                "title": "출석 확인",
                                "text": "해당 차시의 결석자 명단입니다.",
                                "actions": postbacks2
                            }
                        }
                    ]
                }
            },(error, response, body) => {
                console.log(body)
            });
}

exports.change_att = function (userId, user_info, select, subject_attendance, lec_num, res_waiting) {
    var target_id;
    try{
        target_id = subject_attendance[select[3]]["student_id"];
    } catch (error) {
        res_waiting[userId][0] = 0;
        return;
    }
    var target = subject_attendance[select[3]]["class_"+lec_num];
    var target_str;
    switch(target) {
        case 0:
            target_str = "미등록";
            break;
        case 1:
            target_str = "출석";
            break;
        case 2:
            target_str = "지각";
            break;
        case 3:
            target_str = "결석";
            break;
        case 4:
            target_str = "휴강";
            break;
    }
    var user = com.find_by_value(target_id, user_info);
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
                            "title": user["uniqueId"].toString() + " " + user["Name"],
                            "text": "기존 : " + target_str,
                            "actions": [
                                {
                                    "type":"postback",
                                    "label": "기존 유지",
                                    "data":"att_0"
                                },
                                {
                                    "type":"postback",
                                    "label": "변경 : 출석",
                                    "data":"att_1"
                                },
                                {
                                    "type":"postback",
                                    "label": "변경 : 지각",
                                    "data":"att_2"
                                },
                                {
                                    "type":"postback",
                                    "label": "변경 : 결석",
                                    "data":"att_3"
                                }
                            ]
                        }
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
        });
    res_waiting[userId][0] = 7;
}

exports.change_stu_att = function (attdata, select, subject_attendance) {
    if(attdata != '0') {
        subject_attendance[select[1]][select[3]]["class_"+select[4]] = parseInt(attdata);
    }
}

exports.push_writeannouncement = function (userId, res_waiting, subject_name) {
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
                        "text": subject_name + "에 대한 공지를 입력해주시기 바랍니다."
                    },
                    {
                        "type": "text",
                        "text": "공지는 최근에 입력한 3개만 유지됩니다."
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
        });
    res_waiting[userId][0] = 8;
}

exports.change_announcement = function (userId, subj_id, subject_info, news, subject_attendance, user_info) {
    var sbj_info = com.find_by_value(subj_id, subject_info);
    var announce = sbj_info["announcement"].split("///");
    announce.pop();
    announce.unshift(news);
    var announcement = "";
    for (var i in announce) {
        announcement = announcement + announce[i]
        if(i != 2) {
            announcement = announcement + "///";
        }
    }
    sbj_info["announcement"] = announcement;
    var userIds = [];
    for(var i in subject_attendance[subj_id]) {
        var std_id = subject_attendance[subj_id][i]["student_id"];
        var std_userId = com.find_by_value(std_id, user_info)["userId"];
        if(std_userId.slice(0,4) != "test") {
            userIds.push(std_userId);
        } 
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
                        "type": "text",
                        "text": "입력하신 공지가 등록되었니다."
                    },
                    {
                        "type": "text",
                        "text": news
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
    });
    request.post(
        {
          url: process.env.MULTI_TARGET_URL,
          headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`
          },
          json: {
            "to": userIds,
            "messages":[
              {
                "type":"text",
                "text": sbj_info["subject_name"] + "에 대한 공지입니다."
              },
              {
                "type":"text",
                "text": news
              }
            ]
          }
        },(error, response, body) => {
          console.log(body)
      });
}

exports.push_ifdecess = function (userId, res_waiting, subj_id, subject_info) {
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
                            "title": com.find_by_value(subj_id, subject_info)["subject_name"],
                            "text": "다음 차시를 휴강처리하시겠습니까?",
                            "actions": [
                                {
                                    "type":"postback",
                                    "label": "예",
                                    "data":"yes!"
                                },
                                {
                                    "type":"postback",
                                    "label": "아니오",
                                    "data":"no!"
                                }
                            ]
                        }
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
        });

    res_waiting[userId][0] = 9;
}

exports.decess = function (userId, subj_id, subject_attendance, subject_info, user_info) {
    var attendance = subject_attendance[subj_id];
    var sbj_info = com.find_by_value(subj_id, subject_info);
    var lec = sbj_info["conducted_lecture"].toString();
    for(var i in attendance) {
        attendance[i]["class_"+lec] = 4;
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
                        "type": "text",
                        "text": "휴강처리되었습니다."
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
    });

    var userIds = [];
    for(var i in attendance) {
        var std_id = attendance[i]["student_id"];
        var std_userId = com.find_by_value(std_id, user_info)["userId"];
        if(std_userId.slice(0,4) != "test") {
            userIds.push(std_userId);
        } 
    }
    request.post(
        {
          url: process.env.MULTI_TARGET_URL,
          headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`
          },
          json: {
            "to": userIds,
            "messages":[
              {
                "type":"text",
                "text": sbj_info["subject_name"] + "의 다음 차시 수업이 휴강처리되었습니다."
              }
            ]
          }
        },(error, response, body) => {
          console.log(body)
      });
}