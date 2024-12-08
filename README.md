# javis의  backend 입니다.
## 사용 스택
- node.js
- RDS(Mysql)
- DynamoDB(NoSQL)

## 다이어그램
### 백엔드 다이어그램
<img src="readmeImages/javis.png"/>



## dependencies 
- @aws-sdk/client-dynamodb:(3.699.0): AWS SDK의 DynamoDB 클라이언트 라이브러리
- bcrypt: (5.1.1): 비밀번호 해싱 및 비교를 위한 라이브러리
- cookie-parser(1.4.7)
- cors(2.8.5): CORS(Cross-Origin Resource Sharing)를 처리하는 미들웨어
- dotenv(16.4.5): .env 파일에서 환경 변수를 로드하는 데 사용
- express(4.21.1):Node.js에서 웹 서버를 구축
- jsonwebtoken(9.0.2): JSON Web Token을 생성하고 검증하는 라이브러리
- moment(2.30.1): 날짜와 시간을 쉽게 다루기 위한 라이브러리
- mysql2(3.11.4): MySQL 데이터베이스와의 연결을 위한 라이브러리
