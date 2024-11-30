require("dotenv").config(); // .env 파일 로드

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
  region: process.env.VITE_DYNAMO_REGION,
  credentials: {
    accessKeyId: process.env.VITE_DYNAMO_DB, // .env에서 가져온 AWS Access Key ID
    secretAccessKey: process.env.VITE_DYNAMO_SECRET, // .env에서 가져온 AWS Secret Access Key
  },
});

// 연결 설정 로깅
console.log('DynamoDB 설정:', {
  region: process.env.VITE_DYNAMO_REGION,
  accessKeyId: process.env.VITE_DYNAMO_DB ,
  secretAccessKey: process.env.VITE_DYNAMO_SECRET
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
