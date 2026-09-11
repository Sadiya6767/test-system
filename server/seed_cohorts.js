const API = 'http://localhost:5000/api';

async function req(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function addCandidate(name, email, college, answers) {
  const start = await req(`${API}/test/start`, { candidateName: name, email, college });
  const attemptId = start.attempt.id;
  const questions = start.questions;

  for (let i = 0; i < questions.length; i++) {
    const ans = answers[i];
    await req(`${API}/test/answer`, {
      attemptId,
      questionId: questions[i].id,
      selectedAnswer: ans.selected,
      timeTaken: ans.time
    });
  }

  await req(`${API}/test/submit`, { attemptId });
  console.log(`Added candidate: ${name}`);
}

async function seedCohorts() {
  // Correct answers: [A, C, A, B, A, A, C, A, B, A]
  
  // Alex: 10/10
  await addCandidate('Alex Rivera', 'alex.rivera@techu.edu', 'MIT', [
    { selected: 'A', time: 1.2 },
    { selected: 'C', time: 1.5 },
    { selected: 'A', time: 2.1 },
    { selected: 'B', time: 1.8 },
    { selected: 'A', time: 1.4 },
    { selected: 'A', time: 1.9 },
    { selected: 'C', time: 2.0 },
    { selected: 'A', time: 1.6 },
    { selected: 'B', time: 2.2 },
    { selected: 'A', time: 1.7 }
  ]);

  // Maya: 6/10
  await addCandidate('Maya Patel', 'maya.patel@state.edu', 'State Tech', [
    { selected: 'A', time: 3.1 },
    { selected: 'C', time: 2.8 },
    { selected: 'B', time: 3.5 }, // wrong
    { selected: 'B', time: 2.0 },
    { selected: 'A', time: 2.5 },
    { selected: 'C', time: 3.0 }, // wrong
    { selected: 'C', time: 2.2 },
    { selected: 'A', time: 1.9 },
    { selected: 'A', time: 4.1 }, // wrong
    { selected: null, time: 5.0 } // unanswered
  ]);

  // John: 3/10
  await addCandidate('John Doe', 'john.doe@demo.com', 'Community College', [
    { selected: 'A', time: 4.2 },
    { selected: 'A', time: 3.9 }, // wrong
    { selected: 'B', time: 4.5 }, // wrong
    { selected: 'B', time: 3.0 },
    { selected: 'C', time: 4.1 }, // wrong
    { selected: null, time: 5.0 }, // unanswered
    { selected: null, time: 5.0 }, // unanswered
    { selected: 'A', time: 3.8 },
    { selected: 'D', time: 4.2 }, // wrong
    { selected: 'C', time: 4.0 }  // wrong
  ]);

  console.log('Finished seeding diverse cohorts.');
}

seedCohorts().catch(console.error);