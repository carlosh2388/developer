const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeScope, assertUserCapacity } = require("../services/userAccessService");

test("normaliza y valida la clasificación de usuario", () => {
  assert.equal(normalizeScope("platform"), "PLATFORM");
  assert.equal(normalizeScope("CLIENT"), "CLIENT");
  assert.throws(() => normalizeScope("otro"), error => error.code === "INVALID_USER_SCOPE");
});

function quotaClient(maxUsers, activeUsers) {
  return {
    async query(sql) {
      if (sql.includes("FOR UPDATE")) return { rows: [{ id: "organization" }] };
      return { rows: [{ max_users: maxUsers, active_users: activeUsers }] };
    },
  };
}

test("rechaza crear usuarios sin licencia vigente", async () => {
  await assert.rejects(
    assertUserCapacity(quotaClient(0, 0), "organization"),
    error => error.code === "LICENSE_REQUIRED_FOR_USERS",
  );
});

test("rechaza crear usuarios cuando se alcanza el cupo", async () => {
  await assert.rejects(
    assertUserCapacity(quotaClient(3, 3), "organization"),
    error => error.code === "USER_LIMIT_REACHED",
  );
});

test("permite crear usuarios cuando existe cupo", async () => {
  const quota = await assertUserCapacity(quotaClient(3, 2), "organization");
  assert.deepEqual(quota, { max_users: 3, active_users: 2 });
});
