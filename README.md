# LoaHelper
로스트아크 페이지 스크래핑을 통해 가져온 데이터들을 기반으로 아래의 기능을 구현하였습니다.
1. 캐릭터 정보 조회<br>`알고 있는 캐릭터명이 없다면 '쿠키바닐라쉐이크'를 검색해보세요.`
2. 거래소 최저가 및 시세 조회
## 동작 방식
- exchange-server에서 주기적으로 DB에 거래소 정보 업데이트
- client는 필요한 정보를 server에 요청
- server는 DB에서 정보를 로드하여 client로 전송
## 페이지 스크래핑
### puppeteer
- 로스트아크 거래소 및 경매장의 경우 정보 조회를 위해서는 로그인이 필요함
- 로그인 및 쿠키값 사용을 위해 puppeteer 모듈 사용
- 거래소 조회 중 쿠키 만료 등으로 timeout error가 발생하여도 재조회가 가능하도록 **쿠키 refresh** 기능 구현
### cheerio
- 크롬 개발자도구의 Network Tab 확인 시 캐릭터, 거래소 정보를 json이 아닌 html형식으로 받아오는 것을 확인
- html parsing을 위해 cheerio 모듈 사용
## client
- React로 구현하였습니다.
- 우측의 주소로 접속이 가능합니다. https://Wseop.github.io/LoaHelper/
- 호스팅을 위한 github page는 https://github.com/Wseop/LoaHelper 입니다.
## server
- Nodejs로 구현하였으며 DB는 MongoDB(NoSQL)을 사용하였습니다.
- Heroku로 Hosting되고 있습니다. (https://seop-node-loahelper.herokuapp.com)
## exchange-server
- 사용 기술은 server와 동일합니다. (heroku가 해외서버라서 로스트아크 페이지 로그인이 불가하여 해당 부분만 분리)
- node-schedule 모듈을 사용하여 주기적으로 거래소 조회 결과를 DB에 업데이트합니다.
