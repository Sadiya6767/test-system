const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const initialQuestions = [
  {
    order: 1,
    questionText: 'What does HTML stand for?',
    optionA: 'Hyper Text Markup Language',
    optionB: 'High Tech Modern Language',
    optionC: 'Hyperlink Text Management Language',
    optionD: 'Home Tool Markup Language',
    correctAnswer: 'A'
  },
  {
    order: 2,
    questionText: 'Which language is primarily used to style web pages?',
    optionA: 'JavaScript',
    optionB: 'Python',
    optionC: 'CSS',
    optionD: 'SQL',
    correctAnswer: 'C'
  },
  {
    order: 3,
    questionText: 'Which of the following is used to manage data in relational databases?',
    optionA: 'SQL',
    optionB: 'HTML',
    optionC: 'CSS',
    optionD: 'React',
    correctAnswer: 'A'
  },
  {
    order: 4,
    questionText: 'Which keyword is used to declare a variable in JavaScript?',
    optionA: 'variable',
    optionB: 'let',
    optionC: 'define',
    optionD: 'int',
    correctAnswer: 'B'
  },
  {
    order: 5,
    questionText: 'Which technology is used to build user interfaces in this project?',
    optionA: 'React',
    optionB: 'MySQL',
    optionC: 'Express',
    optionD: 'Prisma',
    correctAnswer: 'A'
  },
  {
    order: 6,
    questionText: 'What does API stand for?',
    optionA: 'Application Programming Interface',
    optionB: 'Advanced Program Integration',
    optionC: 'Application Process Information',
    optionD: 'Automated Programming Interface',
    correctAnswer: 'A'
  },
  {
    order: 7,
    questionText: 'Which HTTP method is commonly used to retrieve data?',
    optionA: 'POST',
    optionB: 'DELETE',
    optionC: 'GET',
    optionD: 'PATCH',
    correctAnswer: 'C'
  },
  {
    order: 8,
    questionText: 'Which of these is a JavaScript runtime?',
    optionA: 'Node.js',
    optionB: 'HTML',
    optionC: 'CSS',
    optionD: 'MySQL',
    correctAnswer: 'A'
  },
  {
    order: 9,
    questionText: 'What is the purpose of a primary key in a database?',
    optionA: 'To style a table',
    optionB: 'To uniquely identify a record',
    optionC: 'To delete records',
    optionD: 'To create a webpage',
    correctAnswer: 'B'
  },
  {
    order: 10,
    questionText: 'What does SQL stand for?',
    optionA: 'Structured Query Language',
    optionB: 'Simple Question Language',
    optionC: 'System Query Logic',
    optionD: 'Structured Question Logic',
    correctAnswer: 'A'
  }
];

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const rawPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin'
      }
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists.`);
  }

  const count = await prisma.question.count();
  if (count === 0) {
    for (const q of initialQuestions) {
      await prisma.question.create({
        data: q
      });
    }
    console.log(`Seeded ${initialQuestions.length} test questions.`);
  } else {
    console.log(`Database already has ${count} questions. Skipping question seed.`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });