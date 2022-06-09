<div id="top"></div>


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="http://khuhub.khu.ac.kr/2019102217/Attendance_management_with_chatbot">
    <img src="Pics/logo.jpg" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">출석노트<br></h3>
  <br>
  <p align="center">
    대면을 위한 편리한 인증출석부터, 휴강, 출석부 관리까지
 
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

![그림01](Pics/그림01.jpg)

GPS 등을 활용한 인증출석, 출석 확인 및 변경, 휴강처리, 공지 등의 기능을 제공해주는 출석관리 챗봇입니다.

주요 기능:
* 비대면에 하던 인증출석을 챗봇으로 좀 더 간편하게, 대면을 대비한 GPS 위치정보 기반 출석기능까지.
* 언제나 확인할 수 있는 자신의 출석 기록 및 과목별 공지
* 손쉬운 휴강 처리, 공지, 학생 출석 변경 및 출석부 확인.
* 현재 10분 이내 인증번호 입력 시 출석, 이후 지각, DB상 강의 종료 시간 이후 입력시 결석으로 처리됩니다.

<p align="right">(<a href="#top">back to top</a>)</p>

## Project Architecture
![설계](Pics/%EC%84%A4%EA%B3%84.png)
<br><br>Node.js를 활용한 서버와 DBMS는 Amazon EC2 상에서 가동됩니다.

### Built With

* [Node.js](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [mysql](https://www.mysql.com/)
* [Line](https://developers.line.biz/en/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started : Developers

챗봇 서버에 대한 과정을 설명합니다.

### Prerequisites

* npm
  ```bash
  npm install npm@latest -g
  ```
node.js가 없다면, 위의 전에 설치해주시기 바랍니다. [관련 Github](https://github.com/nodejs/node#download)

* mysql
  ```bash
  sudo yum localinstall https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
  sudo yum install mysql-community-server
  sudo systemctl start mysqld
  vim /etc/my.cnf
  ```

  이후 다음과 같게 내용 변경.

  ```bash
  \\\
  character-set-server=utf8mb4
  collation-server=utf8mb4_unicode_ci
  skip-character-set-client-handshake
  \\\
  ```

  이후 다음 명령 실행
  ```bash
  sudo systemctl restart mysqld
  ```

### Installation


1. Clone the repo
   ```bash
   git clone http://khuhub.khu.ac.kr/2019102217/Attendance_management_with_chatbot.git
   ```
3. Install NPM packages
   ```bash
   npm install
   ```
4. login mysql server
   ```bash
   cat /var/log/mysqld.log | grep 'temporary password'
   => this will be temporary password.
   mysql -u root -p
   Enter password : <temporary password>
   ```
   ```sql
   alter user 'root'@'localhost' identified with mysql_native_password by '<MYSQL_PASSWORD>';
   ```
5. Set databases
해당 프로젝트는 사용자정보, 과목 정보, 과목별 출석부로 이루어져 있으며, 해당 상황에 맞게 데이터베이스 스키마를 조정한 후 실행하여야 합니다. 프로젝트에서 사용하는 스키마의 요약은 /Database/schema.txt에 있습니다.
또한, 사용자 인증과 보안을 위해 사용자별로 토큰이 필요로 됩니다. 토큰정보는 user_info table에 저장됩니다.

6. Write your Mysql account and database name in env/.env

7. Write your Line Token and domain in env/.env

7. Run with app.js!

<p align="right">(<a href="#top">back to top</a>)</p>


## Getting Started - Users

유저의 사용 과정을 설명합니다.

### Prerequisites

* Line
라인 앱 설치가 선행되어야 합니다.

### Start Guide

1. Add '출석노트'
add '출석노트' with https://liff.line.me/1645278921-kWRPP32q/?accountId=897saexi or<br><br>
![QR코드](Pics/QR.png)<br><br>

2. Write your Token
사전에 서버 관리자에 의해 토큰이 발급되어 있습니다. 해당 토큰을 입력해주시기 바랍니다.
체험을 위한 토큰은 다음과 같습니다.
```sh
Student : rudgmlzjarhddlguddn1 (이형우)
Lecturer : rudgmlzjdrhddlwhddnr (이종욱)
```

3. Use!
아무 거나 입력하면, 주 메뉴창이 뜨게 됩니다.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

1. 대면 - 비대면 인증출석<br><br>
![그림02](Pics/그림02.jpg)<br><br>
출석노트는 대면 - 비대면용 인증출석 시스템을 가지고 있습니다. 기본적으로 기존과 같은 4자리 인증번호로 인증출석을 하고, 대면의 경우 추가적으로 현위치 GPS 정보를 받아 강의실 위치정보와 비교, 1Km 이내일 시 출석처리합니다.

2. 교수자를 위한 기능<br><br>
![그림03](Pics/그림03.jpg)<br><br>
출석을 수동으로 변경할 수 있습니다. 원하는 강의의 차시를 선택하면 한명씩 수동으로 출석을 체크할 수 있습니다.
출석 확인 기능도 제공되며, 원하는 강의의 차시를 선택하면 지각자와 결석자 명단이 나오게 됩니다.
수강생들에게 실시간 공지를 할 수 있습니다. 또한 최근 3개의 실시간 공지는 수강생들이 언제나 확인 가능합니다.
간단히 다음 차시의 수업을 휴강처리할 수 있습니다. 출석부에도 자동으로 휴강으로 기록되고, 휴강 공지가 수강생들에게 가게 됩니다.

3. 수강생을 위한 기능<br><br>
![그림04](Pics/그림04.jpg)<br><br>
출석을 확인할 수 있습니다. 원하는 강의를 선택하면 자신의 출석을 띄워줍니다.
교수자가 공지한 최근 3개의 공지를 확인할 수 있습니다.


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] 데이터베이스 스키마 작성 및 구현
- [x] 대면 - 비대면 출석체크 기능 구현
- [x] 토큰을 활용한 사용자 인증기능 구현
- [x] 교수자, 수강생 메인 기능 구현
- [x] 플래그를 활용한 기능별 시나리오 전체 구현


See the [open issues](http://khuhub.khu.ac.kr/2019102217/Attendance_management_with_chatbot/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

더 나은 것을 위한 기여에 감사드리며, 몇몇 사항을 안내드립니다.

1. 프로젝트 Fork.
2. 사용할 브랜치를 추가로 만드시길 바랍니다. (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
6. [Email](lijiongyu@khu.ac.kr) to me

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. **(Not for MySQL DBMS, Just Code for Express server.)** See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

이형우 (Hyeong-woo, Lee) - [Gmail](liiongyu@khu.ac.kr) - lijiongyu@khu.ac.kr

Project Link: [http://khuhub.khu.ac.kr/2019102217/Attendance_management_with_chatbot](http://khuhub.khu.ac.kr/2019102217/Attendance_management_with_chatbot)

<p align="right">(<a href="#top">back to top</a>)</p>

