// .env 파일 로드 확인
const dotenvResult = require("dotenv").config();
if (dotenvResult.error) {
  console.error('dotenv 로드 에러:', dotenvResult.error);
} else {
  console.log('dotenv 로드 성공');
}

console.log('환경변수 확인:', {
  DYNAMO_REGION: process.env.VITE_DYNAMO_REGION,
  NODE_ENV: process.env.NODE_ENV,
  // 실제 키 값은 보안을 위해 출력하지 않고 존재 여부만 확인
  HAS_AWS_ACCESS_KEY: !!process.env.AWS_ACCESS_KEY_ID,
  HAS_AWS_SECRET_KEY: !!process.env.AWS_SECRET_ACCESS_KEY
});

const { 
  DynamoDBClient, 
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ScanCommand,
  QueryCommand,
  ListTablesCommand
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.VITE_DYNAMO_REGION || 'ap-northeast-2',
});

// 연결 설정 로깅
console.log('DynamoDB 설정:', {
  region: process.env.VITE_DYNAMO_REGION || 'ap-northeast-2',
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = {
  client,
  PutItemCommand,    // Create
  GetItemCommand,    // Read (단일 항목)
  QueryCommand,      // Read (조건 기반 검색)
  ScanCommand,       // Read (전체 테이블 스캔)
  UpdateItemCommand, // Update
  DeleteItemCommand, // Delete
  ListTablesCommand  // List Tables
};
