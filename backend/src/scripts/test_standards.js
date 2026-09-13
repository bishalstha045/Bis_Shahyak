import assert from 'assert';

const BASE_URL = 'http://127.0.0.1:5001';

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('       BIS Sahayak Standards & HS Code Tests        ');
  console.log('----------------------------------------------------\n');

  let passed = 0;
  let failed = 0;

  async function testCase(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Test 0101.29.10 -> Horses for polo
  await testCase('HS Code 0101.29.10 -> Horses for polo', async () => {
    const res = await fetch(`${BASE_URL}/api/standards/0101.29.10`);
    const json = await res.json();
    assert.strictEqual(json.success, true, 'success should be true');
    assert.strictEqual(json.data.hs_code, '0101.29.10');
    assert.strictEqual(json.data.description, 'Horses for polo');
  });

  // 2. Test 0201.30.00 -> Boneless
  await testCase('HS Code 0201.30.00 -> Boneless', async () => {
    const res = await fetch(`${BASE_URL}/api/standards/0201.30.00`);
    const json = await res.json();
    assert.strictEqual(json.success, true, 'success should be true');
    assert.strictEqual(json.data.hs_code, '0201.30.00');
    assert.strictEqual(json.data.description, 'Boneless');
  });

  // 3. Test 0304.49.40 -> Tuna
  await testCase('HS Code 0304.49.40 -> Tuna', async () => {
    const res = await fetch(`${BASE_URL}/api/standards/0304.49.40`);
    const json = await res.json();
    assert.strictEqual(json.success, true, 'success should be true');
    assert.strictEqual(json.data.hs_code, '0304.49.40');
    assert.strictEqual(json.data.description, 'Tuna');
  });

  // 4. Test format with spaces: "0101 29 10"
  await testCase('HS Code with spaces "0101 29 10" normalizes and matches', async () => {
    const res = await fetch(`${BASE_URL}/api/standards/0101%2029%2010`);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.hs_code, '0101.29.10');
    assert.strictEqual(json.data.description, 'Horses for polo');
  });

  // 5. Test format without dots: "01012910"
  await testCase('HS Code without dots "01012910" normalizes and matches', async () => {
    const res = await fetch(`${BASE_URL}/api/standards/01012910`);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.hs_code, '0101.29.10');
    assert.strictEqual(json.data.description, 'Horses for polo');
  });

  // 6. Test non-existent HS code: "9999.99.99"
  await testCase('Non-existent HS Code returns not found message', async () => {
    const res = await fetch(`${BASE_URL}/api/standards/9999.99.99`);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.message, 'HS Code not found');
  });

  // 7. Test invalid format
  await testCase('Invalid format returns not found message', async () => {
    const res = await fetch(`${BASE_URL}/api/standards/invalid_code_abc`);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.message, 'HS Code not found');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
