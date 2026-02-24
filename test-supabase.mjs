import postgres from 'postgres';

// 원본 비밀번호
const password = '1!andnstkwn';
console.log('=== 비밀번호 진단 ===');
console.log('원본:', password);
console.log('URL 인코딩 필요:', /[^a-zA-Z0-9_-]/.test(password));

// URL 인코딩
const encodedPassword = encodeURIComponent(password);
console.log('URL 인코딩됨:', encodedPassword);

// 연결 문자열 구성
const connectionString = `postgresql://postgres:${encodedPassword}@db.vuifbmsdggnwygvgcrkj.supabase.co:5432/postgres?sslmode=require`;
console.log('\n=== 연결 문자열 ===');
console.log('URL:', connectionString);

// 연결 시도
console.log('\n=== 연결 시도 ===');
try {
  const sql = postgres(connectionString);
  
  // 연결 테스트
  const result = await sql`SELECT version()`;
  console.log('✅ 연결 성공!');
  console.log('PostgreSQL 버전:', result[0].version);
  
  await sql.end();
} catch (error) {
  console.error('❌ 연결 실패:');
  console.error('에러 타입:', error.constructor.name);
  console.error('에러 메시지:', error.message);
  console.error('에러 코드:', error.code);
  if (error.cause) {
    console.error('원인:', error.cause.message);
  }
}
