const API = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const error = new Error(`Request to ${url} failed with ${res.status}: ${JSON.stringify(data)}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTest() {
  console.log('--- STARTING COMPLETE E2E TEST ---');

  // 1. Health check
  const health = await request(`${API}/health`);
  console.log('1. Health check passed:', health.status);

  // 2. Candidate starts test
  const startRes = await request(`${API}/test/start`, {
    method: 'POST',
    body: JSON.stringify({
      candidateName: 'Sadiya Khan',
      email: 'sadiya@example.com',
      college: 'ABC College of Engineering',
      phone: '+1 555-0144'
    })
  });
  console.log('2. Test started successfully for candidate:', startRes.attempt.candidateName);
  const attemptId = startRes.attempt.id;
  const questions = startRes.questions;
  console.log(`   Attempt ID: ${attemptId}, Questions count: ${questions.length}`);

  // 3. Candidate answers questions
  // Q1: Correct (A)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[0].id, selectedAnswer: 'A', timeTaken: 2.1 }) });
  // Q2: Correct (C)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[1].id, selectedAnswer: 'C', timeTaken: 1.8 }) });
  // Q3: Correct (A)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[2].id, selectedAnswer: 'A', timeTaken: 2.5 }) });
  // Q4: Correct (B)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[3].id, selectedAnswer: 'B', timeTaken: 2.0 }) });
  // Q5: Correct (A)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[4].id, selectedAnswer: 'A', timeTaken: 1.5 }) });
  // Q6: Correct (A)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[5].id, selectedAnswer: 'A', timeTaken: 2.2 }) });
  // Q7: Wrong (A instead of C)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[6].id, selectedAnswer: 'A', timeTaken: 3.4 }) });
  // Q8: Correct (A)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[7].id, selectedAnswer: 'A', timeTaken: 1.9 }) });
  // Q9: Unanswered (null, 5s timeout)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[8].id, selectedAnswer: null, timeTaken: 5.0 }) });
  // Q10: Correct (A)
  await request(`${API}/test/answer`, { method: 'POST', body: JSON.stringify({ attemptId, questionId: questions[9].id, selectedAnswer: 'A', timeTaken: 2.4 }) });
  console.log('3. All 10 questions answered / processed.');

  // 4. Submit test
  const submitRes = await request(`${API}/test/submit`, { method: 'POST', body: JSON.stringify({ attemptId }) });
  const result = submitRes.result;
  console.log('4. Test finalized:');
  console.log(`   Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)`);
  console.log(`   Correct: ${result.correctAnswers}, Wrong: ${result.wrongAnswers}, Unanswered: ${result.unanswered}`);

  if (result.score !== 8 || result.correctAnswers !== 8 || result.wrongAnswers !== 1 || result.unanswered !== 1) {
    throw new Error('Result calculation mismatch!');
  }
  console.log('   Calculation validation PASSED!');

  // 5. Admin Login
  const loginRes = await request(`${API}/admin/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'AdminPassword123!'
    })
  });
  const token = loginRes.token;
  console.log('5. Admin Login successful, JWT obtained.');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // 6. Admin Stats
  const statsRes = await request(`${API}/admin/stats`, authHeaders);
  console.log('6. Admin stats fetched:');
  console.log(`   Total: ${statsRes.stats.totalCandidates}, Completed: ${statsRes.stats.completedTests}, Avg: ${statsRes.stats.averageScore}%`);

  // 7. Admin Results list
  const resultsRes = await request(`${API}/admin/results`, authHeaders);
  console.log(`7. Admin results list fetched: ${resultsRes.count} records found.`);

  // 8. Admin Candidate Details
  const detailRes = await request(`${API}/admin/results/${attemptId}`, authHeaders);
  console.log(`8. Detailed report for candidate fetched: ${detailRes.attempt.candidateName}`);
  console.log(`   Questions in audit report: ${detailRes.questions.length}`);
  console.log(`   Q1 status: ${detailRes.questions[0].isCorrect ? 'Correct' : 'Incorrect'}, time: ${detailRes.questions[0].timeTaken}s`);
  console.log(`   Q7 status: ${detailRes.questions[6].isCorrect ? 'Correct' : 'Incorrect'} (selected ${detailRes.questions[6].selectedOption}, correct ${detailRes.questions[6].correctOption})`);
  console.log(`   Q9 status: ${detailRes.questions[8].answered ? 'Answered' : 'Unanswered'}`);

  // 9. CSV Export
  const exportRes = await request(`${API}/admin/export`, authHeaders);
  console.log('9. CSV Export retrieved, length:', exportRes.length, 'bytes');

  console.log('--- ALL E2E TESTS PASSED SUCCESSFULLY! ---');
}

runTest().catch(err => {
  console.error('E2E Test Failed:', err.message);
  process.exit(1);
});