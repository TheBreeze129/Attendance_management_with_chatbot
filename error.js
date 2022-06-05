exports.codenotmatch = function (key, userId) {
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
                      "text": "인증 실패 : " + key + "수업의 인증코드가 아닙니다."
                  },
                  {
                      "type":"text",
                      "text": "올바른 코드를 입력해주시기 바랍니다."
                  }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
    
    res_waiting[userId] = 1;
  }

exports.notstudent = function (userId) {
    // 학생 혹은 수강생이 아닙니다.
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
                      "text": "학생 또는 수강생이 아닙니다."
                  }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
}
  
exports.notlistenclass = function (userId) {
    // 교수자가 출석인증번호를 생성하지 않았거나, 해당되는 수업을 수강하고 있지 않습니다.
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
                      "text": "교수자가 출석인증번호를 생성하지 않았거나, 해당되는 수업을 수강하고있지 않습니다. 확인 후 재입력 바랍니다."
                  }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
  
      res_waiting[userId] = 1;
}
  
exports.gpsnotmatch = function (userId) {
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
                      "text": "인증 실패 : " + subject_info["subject_name"] + "수업과 너무 멀리 있습니다."
                  },
                  {
                      "type":"text",
                      "text": "위치정보를 다시 공유해주시기 바랍니다."
                  }
              ]
          }
      },(error, response, body) => {
          console.log(body)
      });
    
    res_waiting[userId] = 3;
}