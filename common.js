const db = require('./sqlconnect');
const waitOn = require('wait-on');


exports.is_student = function (userId) {
    // DB의 user_info를 이용, 체크
    
    var is_std = true;
    return is_std;
  }
  
exports.is_lecturer = function (userId) {
    // DB의 user_info를 이용, 체크
    var is_lec = true;
    return is_lec;
}
