import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL이 설정되지 않았습니다.");
  process.exit(1);
}

async function initAdmin() {
  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(DATABASE_URL);
    console.log("✅ 데이터베이스 연결 성공");

    // 관리자 계정 정보
    const adminEmail = process.argv[2] || "admin@muunsaju.com";
    const adminPassword = process.argv[3] || "admin123456";
    const adminName = process.argv[4] || "MUUN Admin";

    console.log(`\n📝 관리자 계정 생성:`);
    console.log(`   이메일: ${adminEmail}`);
    console.log(`   이름: ${adminName}`);

    // 기존 관리자 확인
    const [existingAdmin] = await connection.query(
      "SELECT id FROM admins WHERE email = ?",
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      console.log(`\n⚠️  이미 존재하는 관리자 계정입니다. (ID: ${existingAdmin[0].id})`);
      
      // 스크립트 모드에서는 자동으로 업데이트
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await connection.query(
        "UPDATE admins SET passwordHash = ? WHERE email = ?",
        [passwordHash, adminEmail]
      );
      console.log(`✅ 비밀번호가 업데이트되었습니다.`);
    } else {
      // 새 관리자 생성
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await connection.query(
        "INSERT INTO admins (email, passwordHash, name, isActive) VALUES (?, ?, ?, ?)",
        [adminEmail, passwordHash, adminName, true]
      );
      
      console.log(`\n✅ 관리자 계정이 생성되었습니다!`);
    }

    console.log(`\n🔐 로그인 정보:`);
    console.log(`   이메일: ${adminEmail}`);
    console.log(`   비밀번호: ${adminPassword}`);
    console.log(`\n⚠️  처음 로그인 후 반드시 비밀번호를 변경하세요!`);

  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initAdmin();
