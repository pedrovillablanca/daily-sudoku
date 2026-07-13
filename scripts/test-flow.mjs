const BASE = "http://localhost:3000";
const ts = Date.now();

const FP1 = `flowtest_${ts}_1`;
const FP2 = `flowtest_${ts}_2`;
const ALIAS = `Player_${ts}`;

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

const results = [];

async function test1() {
  console.log("TEST 1: Submit score with new fingerprint → should succeed");
  const r = await api("POST", "/api/score", {
    alias: ALIAS,
    fingerprint: FP1,
    score: 500,
    timeSeconds: 120,
    errors: 3,
    difficulty: "medium",
  });
  console.log(`  Status: ${r.status} |`, r.data);
  const pass = r.status === 200 && r.data.rank > 0 && r.data.score === 500;
  console.log(`  ${pass ? "✅ PASS" : "❌ FAIL"}\n`);
  results.push(pass);
}

async function test2() {
  console.log("TEST 2: Same fingerprint again → should 409 (fingerprint dup)");
  const r = await api("POST", "/api/score", {
    alias: ALIAS,
    fingerprint: FP1,
    score: 600,
    timeSeconds: 100,
    errors: 1,
    difficulty: "medium",
  });
  console.log(`  Status: ${r.status} |`, r.data);
  const pass = r.status === 409;
  console.log(`  ${pass ? "✅ PASS" : "❌ FAIL"}\n`);
  results.push(pass);
}

async function test3() {
  console.log("TEST 3: Different fingerprint, same IP → should 409 (IP dedup)");
  const r = await api("POST", "/api/score", {
    alias: `Player2_${ts}`,
    fingerprint: FP2,
    score: 450,
    timeSeconds: 150,
    errors: 5,
    difficulty: "medium",
  });
  console.log(`  Status: ${r.status} |`, r.data);
  const pass = r.status === 409;
  console.log(`  ${pass ? "✅ PASS" : "❌ FAIL"}\n`);
  results.push(pass);
}

async function test4() {
  console.log("TEST 4: Leaderboard shows our score with errors=3");
  const r = await api("GET", `/api/leaderboard?date=${new Date().toISOString().split("T")[0]}`);
  const entry = r.data.find((e) => e.alias === ALIAS);
  console.log(`  All entries:`, r.data.map(e => `${e.alias}(err=${e.errors},score=${e.score})`));
  const pass = entry !== undefined && entry.errors === 3 && entry.score === 500;
  console.log(`  ${pass ? "✅ PASS" : "❌ FAIL"}\n`);
  results.push(pass);
}

async function test5() {
  console.log("TEST 5: check-played → FP1=true, FP2=false");
  const r1 = await api("GET", `/api/check-played?fp=${FP1}`);
  const r2 = await api("GET", `/api/check-played?fp=${FP2}`);
  console.log(`  FP1:`, r1.data);
  console.log(`  FP2:`, r2.data);
  const pass = r1.data.played === true && r2.data.played === false;
  console.log(`  ${pass ? "✅ PASS" : "❌ FAIL"}\n`);
  results.push(pass);
}

async function main() {
  console.log(`🧪 Flow tests (ts=${ts})`);
  console.log(`  FP1=${FP1}  FP2=${FP2}  ALIAS=${ALIAS}\n`);

  await test1();
  await test2();
  await test3();
  await test4();
  await test5();

  const passed = results.filter(Boolean).length;
  console.log(`=============================`);
  console.log(`RESULTS: ${passed}/${results.length} tests passed`);
  console.log(`=============================`);
}

main().catch(console.error);
