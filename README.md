# LoaHelper
로스트아크 페이지 스크래핑을 통해 가져온 데이터들을 기반으로 아래의 기능을 구현하였습니다.
1. 캐릭터 정보 조회
2. 거래소 최저가 조회 및 시세 조회
3. 레이드 헬퍼
## 동작 방식
- exchange-server에서 주기적으로 DB에 거래소 정보 업데이트
- client는 필요한 정보를 server에 요청
- server는 DB에서 정보를 로드하여 client로 전송

## client
React로 구현하였습니다.<br>
아래 주소로 접속이 가능하며 호스팅을 위한 github page는 https://github.com/Wseop/LoaHelper 입니다.<br>
https://Wseop.github.io/LoaHelper/<br>
`알고 있는 캐릭터명이 없다면 '쿠키바닐라쉐이크'를 검색해보세요.`
## server
Nodejs로 구현하였으며 DB는 MongoDB(NoSQL)을 사용하였습니다.<br>
Heroku로 Hosting되고 있습니다 (https://seop-node-loahelper.herokuapp.com)
## exchange-server
사용 기술은 server와 동일합니다.
(heroku가 해외서버라서 로스트아크 페이지 로그인이 불가하여 해당 부분만 분리)
