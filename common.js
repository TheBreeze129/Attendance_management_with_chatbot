exports.is_student = function (userId, user_info) {
  // DB의 user_info를 이용, 체크
  if(find_by_value(userId, user_info)['is_lecturer'] == 0) {
    return true;
  }
  else {
    return false;
  }
}
  
exports.is_lecturer = function (userId, user_info) {
  if(find_by_value(userId, user_info)['is_lecturer'] == 1) {
    return true;
  }
  else {
    return false;
  }
}

exports.find_by_value = function (value, list) {
  for(var i in list) {
    for(var l in list[i]) {
      if(list[i][l] == value) {
        return list[i];
      }
    }
  }
  return false;
}

exports.str_toDate = function (date, str) {
  let adate = new Date(date);
  let bdate = new Date(adate.setHours(parseInt(str.slice(0,2))));
  return new Date(bdate.setMinutes(parseInt(str.slice(2,4))));
}

exports.date_tostr = function(date) {
  var month = date.getMonth() + 1;
  month = month.toString().padStart(2, '0');
  var timelist = date.toString().split(' ');
  var t = timelist[4].split(':')
  var time = timelist[3].slice(2,4)+month+timelist[2]+t[0]+t[1]+t[2];
  return time;
}

function find_by_value(value, list){
  for(var i in list) {
    for(var l in list[i]) {
      if(list[i][l] == value) {
        return list[i];
      }
    }
  }
  return false;
}