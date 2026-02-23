import { describe, it, expect, beforeAll } from "vitest";
import { verifyAdminPassword, createAdmin, getAdminByEmail } from "./db";

describe("Admin Authentication", () => {
  const testEmail = `test-admin-${Date.now()}@muunsaju.com`;
  const testPassword = "testPassword123";
  const testName = "Test Admin";

  beforeAll(async () => {
    // 테스트 전에 계정 생성
    try {
      await createAdmin({
        email: testEmail,
        password: testPassword,
        name: testName,
      });
    } catch (err) {
      // 이미 존재하면 무시
    }
  });

  it("should verify correct password", async () => {
    const admin = await verifyAdminPassword(testEmail, testPassword);

    expect(admin).toBeDefined();
    expect(admin?.email).toBe(testEmail);
  });

  it("should reject incorrect password", async () => {
    const admin = await verifyAdminPassword(testEmail, "wrongPassword");

    expect(admin).toBeNull();
  });

  it("should reject non-existent email", async () => {
    const admin = await verifyAdminPassword("nonexistent@example.com", testPassword);

    expect(admin).toBeNull();
  });

  it("should retrieve admin by email", async () => {
    const admin = await getAdminByEmail(testEmail);

    expect(admin).toBeDefined();
    expect(admin?.email).toBe(testEmail);
    expect(admin?.name).toBe(testName);
  });

  it("should have isActive set to true", async () => {
    const admin = await getAdminByEmail(testEmail);

    expect(admin?.isActive).toBe(true);
  });
});
