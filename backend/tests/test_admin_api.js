// Comprehensive Automated Backend Test Suite for Admin Control Panel & RBAC
import assert from 'assert';

const BASE_URL = 'http://localhost:5001';

async function runTests() {
  console.log('==================================================');
  console.log('🧪 BIS Sahayak V2 — Admin RBAC & API Test Pipeline');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  };

  // 1. Unauthenticated request to admin endpoint
  await test('1. Unauthenticated request to /api/admin/dashboard/stats returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard/stats`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.message.includes('Authentication required'));
  });

  // 2. Regular user request to admin endpoint
  await test('2. Regular user token to /api/admin/dashboard/stats returns 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, {
      headers: { 'Authorization': 'Bearer demo-token-12345' }
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.message.includes('Access Denied'));
  });

  // 3. Admin session via /api/auth/demo-admin
  let adminToken = '';
  await test('3. Administrator session via POST /api/auth/demo-admin yields valid JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.access_token);
    assert.strictEqual(data.user.role, 'admin');
    assert.strictEqual(data.user.is_admin, true);
    adminToken = data.access_token;
  });

  const adminHeaders = () => ({
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  });

  // 4. Admin dashboard metrics
  await test('4. GET /api/admin/dashboard/stats returns real aggregated metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, { headers: adminHeaders() });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(typeof json.total_users === 'number');
    assert(typeof json.pending_verification === 'number');
    assert(typeof json.verified === 'number');
    assert(typeof json.rejected === 'number');
    assert(typeof json.reports === 'number');
    assert(Array.isArray(json.recent_activities));
  });

  // 5. Get verifications list
  let targetSubmissionId = '';
  await test('5. GET /api/admin/verifications returns submissions list', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/verifications`, { headers: adminHeaders() });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.submissions));
    assert(json.submissions.length > 0);
    targetSubmissionId = json.submissions[0]._id || json.submissions[0].id;
  });

  // 6. Approve submission
  await test('6. POST /api/admin/verifications/:id/approve issues authentic CML licence', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/verifications/${targetSubmissionId}/approve`, {
      method: 'POST',
      headers: adminHeaders()
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.submission.status, 'verified');
    assert(json.submission.cml_license.startsWith('CM/L-'));
    assert(json.submission.verified_by);
    assert(json.submission.verified_at);
  });

  // 7. Reject submission without reason (fails)
  await test('7. POST /api/admin/verifications/:id/reject without reason returns 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/verifications/${targetSubmissionId}/reject`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ rejection_reason: '' })
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.message.includes('rejection reason is strictly required'));
  });

  // 8. Reject submission with reason (succeeds)
  await test('8. POST /api/admin/verifications/:id/reject with reason updates status & audit trail', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/verifications/${targetSubmissionId}/reject`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ rejection_reason: 'Automated test: Hydrostatic burst test failed Clause 6.1.' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.submission.status, 'rejected');
    assert(json.submission.rejection_reason.includes('Hydrostatic burst test failed'));
    assert(json.submission.rejected_by);
    assert(json.submission.rejected_at);
  });

  // 9. User management: list users
  let testUserId = '';
  await test('9. GET /api/admin/users returns user directory', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: adminHeaders() });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.users));
    assert(json.users.length > 0);
    const regularUser = json.users.find(u => u.role !== 'admin');
    if (regularUser) testUserId = regularUser._id || regularUser.id;
  });

  // 10. User status toggle (suspend)
  if (testUserId) {
    await test('10. PATCH /api/admin/users/:id/status updates status to suspended', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/users/${testUserId}/status`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status: 'suspended' })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.user.status, 'suspended');
    });

    await test('11. PATCH /api/admin/users/:id/status restores status to active', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/users/${testUserId}/status`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status: 'active' })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.user.status, 'active');
    });
  }

  // 12. Report management
  let targetReportId = '';
  await test('12. GET /api/admin/reports returns reports queue', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/reports`, { headers: adminHeaders() });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.reports));
    assert(json.reports.length > 0);
    targetReportId = json.reports[0]._id || json.reports[0].id;
  });

  // 13. Resolve report
  if (targetReportId) {
    await test('13. PATCH /api/admin/reports/:id/resolve marks report resolved with notes', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/reports/${targetReportId}/resolve`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({
          resolution_notes: 'Automated test investigation completed.',
          action_taken: 'Statutory warning letter dispatched.'
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.report.status, 'resolved');
    });
  }

  // 14. Activity logs
  await test('14. GET /api/admin/activity returns administrative audit trail', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/activity`, { headers: adminHeaders() });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.activities));
    assert(json.activities.length > 0);
  });

  // 15. Content & Settings
  await test('15. GET /api/admin/content & /api/admin/settings return metadata', async () => {
    const [cRes, sRes] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/content`, { headers: adminHeaders() }),
      fetch(`${BASE_URL}/api/admin/settings`, { headers: adminHeaders() })
    ]);
    assert.strictEqual(cRes.status, 200);
    assert.strictEqual(sRes.status, 200);
  });

  console.log('\n==================================================');
  console.log(`🏁 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test suite runner error:", err);
  process.exit(1);
});
