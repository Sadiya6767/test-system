const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// Section 1 — Web Developer cum Sales Engineer (15 Questions)
const salesEngineerQuestions = [
  // Web Development (10)
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 1,
    questionText: 'What does HTML stand for?',
    optionA: 'Hyper Text Markup Language',
    optionB: 'High Text Machine Language',
    optionC: 'Hyperlink Text Management Language',
    optionD: 'Home Tool Markup Language',
    correctAnswer: 'A'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 2,
    questionText: 'Which language is used to style web pages?',
    optionA: 'HTML',
    optionB: 'CSS',
    optionC: 'SQL',
    optionD: 'Python',
    correctAnswer: 'B'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 3,
    questionText: 'Which language is mainly used to add interactivity to a webpage?',
    optionA: 'CSS',
    optionB: 'HTML',
    optionC: 'JavaScript',
    optionD: 'SQL',
    correctAnswer: 'C'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 4,
    questionText: 'Which HTTP method is commonly used to retrieve data from a server?',
    optionA: 'POST',
    optionB: 'GET',
    optionC: 'DELETE',
    optionD: 'PATCH',
    correctAnswer: 'B'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 5,
    questionText: 'Which of the following is a JavaScript runtime?',
    optionA: 'Node.js',
    optionB: 'MySQL',
    optionC: 'HTML',
    optionD: 'CSS',
    correctAnswer: 'A'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 6,
    questionText: 'What is the main purpose of responsive web design?',
    optionA: 'To make websites work on different screen sizes',
    optionB: 'To increase database storage',
    optionC: 'To write backend code',
    optionD: 'To create advertisements',
    correctAnswer: 'A'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 7,
    questionText: 'Which technology is commonly used to build reusable UI components?',
    optionA: 'React',
    optionB: 'MySQL',
    optionC: 'Excel',
    optionD: 'Git',
    correctAnswer: 'A'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 8,
    questionText: 'What does API stand for?',
    optionA: 'Application Programming Interface',
    optionB: 'Application Process Integration',
    optionC: 'Advanced Programming Internet',
    optionD: 'Automated Program Interface',
    correctAnswer: 'A'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 9,
    questionText: 'Which one is a database management system?',
    optionA: 'React',
    optionB: 'MySQL',
    optionC: 'CSS',
    optionD: 'HTML',
    correctAnswer: 'B'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Web Development',
    order: 10,
    questionText: 'Which HTTP status code means "Not Found"?',
    optionA: '200',
    optionB: '301',
    optionC: '404',
    optionD: '500',
    correctAnswer: 'C'
  },
  // Sales Engineer (5)
  {
    track: 'SALES_ENGINEER',
    section: 'Sales Engineer',
    order: 11,
    questionText: 'What is the primary role of a Sales Engineer?',
    optionA: 'Only writing code',
    optionB: 'Explaining technical products to customers',
    optionC: 'Managing employee attendance',
    optionD: 'Creating social media posts',
    correctAnswer: 'B'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Sales Engineer',
    order: 12,
    questionText: 'A customer says the product is too expensive. What should a Sales Engineer do first?',
    optionA: 'End the conversation',
    optionB: 'Offer a random discount',
    optionC: 'Understand the customer\'s concern and explain the product value',
    optionD: 'Ignore the customer',
    correctAnswer: 'C'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Sales Engineer',
    order: 13,
    questionText: 'What is a product demo mainly used for?',
    optionA: 'To demonstrate how a product solves customer problems',
    optionB: 'To test employee attendance',
    optionC: 'To create source code',
    optionD: 'To manage databases',
    correctAnswer: 'A'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Sales Engineer',
    order: 14,
    questionText: 'A customer asks a technical question that you don\'t know. What is the best response?',
    optionA: 'Guess the answer',
    optionB: 'Ignore the question',
    optionC: 'Say you will verify the information and get back to them',
    optionD: 'Change the topic',
    correctAnswer: 'C'
  },
  {
    track: 'SALES_ENGINEER',
    section: 'Sales Engineer',
    order: 15,
    questionText: 'What is a lead in sales?',
    optionA: 'A potential customer',
    optionB: 'A software bug',
    optionC: 'A database table',
    optionD: 'A completed project',
    correctAnswer: 'A'
  }
];

// Section 2 — Web Developer cum HR Recruiter (15 Questions)
const hrRecruiterQuestions = [
  // Web Development (10)
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 1,
    questionText: 'Which tag is used to create a hyperlink in HTML?',
    optionA: '<link>',
    optionB: '<a>',
    optionC: '<href>',
    optionD: '<url>',
    correctAnswer: 'B'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 2,
    questionText: 'Which CSS property is used to change text color?',
    optionA: 'font-color',
    optionB: 'text-color',
    optionC: 'color',
    optionD: 'text-style',
    correctAnswer: 'C'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 3,
    questionText: 'Which symbol is used for an ID selector in CSS?',
    optionA: '.',
    optionB: '#',
    optionC: '@',
    optionD: '$',
    correctAnswer: 'B'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 4,
    questionText: 'Which symbol is used for a class selector in CSS?',
    optionA: '#',
    optionB: '@',
    optionC: '.',
    optionD: '&',
    correctAnswer: 'C'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 5,
    questionText: 'Which keyword declares a block-scoped variable in JavaScript?',
    optionA: 'var',
    optionB: 'let',
    optionC: 'define',
    optionD: 'variable',
    correctAnswer: 'B'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 6,
    questionText: 'Which method converts JSON text into a JavaScript object?',
    optionA: 'JSON.parse()',
    optionB: 'JSON.convert()',
    optionC: 'JSON.object()',
    optionD: 'JSON.read()',
    correctAnswer: 'A'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 7,
    questionText: 'Which command is commonly used to create a new Git repository?',
    optionA: 'git start',
    optionB: 'git create',
    optionC: 'git init',
    optionD: 'git new',
    correctAnswer: 'C'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 8,
    questionText: 'What is the purpose of Git?',
    optionA: 'Database management',
    optionB: 'Version control',
    optionC: 'Web hosting only',
    optionD: 'Image editing',
    correctAnswer: 'B'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 9,
    questionText: 'Which HTML element is used for the largest heading?',
    optionA: '<heading>',
    optionB: '<h6>',
    optionC: '<h1>',
    optionD: '<head>',
    correctAnswer: 'C'
  },
  {
    track: 'HR_RECRUITER',
    section: 'Web Development',
    order: 10,
    questionText: 'What does CSS stand for?',
    optionA: 'Computer Style Sheets',
    optionB: 'Cascading Style Sheets',
    optionC: 'Creative Style System',
    optionD: 'Colorful Style Sheets',
    correctAnswer: 'B'
  },
  // HR Recruiter (5)
  {
    track: 'HR_RECRUITER',
    section: 'HR Recruiter',
    order: 11,
    questionText: 'What is the first step in recruitment?',
    optionA: 'Salary negotiation',
    optionB: 'Identifying the job requirement',
    optionC: 'Joining formalities',
    optionD: 'Performance review',
    correctAnswer: 'B'
  },
  {
    track: 'HR_RECRUITER',
    section: 'HR Recruiter',
    order: 12,
    questionText: 'What is sourcing in recruitment?',
    optionA: 'Finding potential candidates',
    optionB: 'Creating websites',
    optionC: 'Preparing salary slips',
    optionD: 'Managing databases',
    correctAnswer: 'A'
  },
  {
    track: 'HR_RECRUITER',
    section: 'HR Recruiter',
    order: 13,
    questionText: 'What is an interview primarily used for?',
    optionA: 'To evaluate a candidate\'s suitability for a role',
    optionB: 'To train employees',
    optionC: 'To create advertisements',
    optionD: 'To manage company accounts',
    correctAnswer: 'A'
  },
  {
    track: 'HR_RECRUITER',
    section: 'HR Recruiter',
    order: 14,
    questionText: 'A candidate does not join the scheduled interview. What should an HR recruiter do?',
    optionA: 'Immediately reject without communication',
    optionB: 'Contact the candidate and ask if they need to reschedule',
    optionC: 'Delete the candidate\'s resume',
    optionD: 'Ignore the situation',
    correctAnswer: 'B'
  },
  {
    track: 'HR_RECRUITER',
    section: 'HR Recruiter',
    order: 15,
    questionText: 'What is an important quality for an HR recruiter?',
    optionA: 'Poor communication',
    optionB: 'Active listening',
    optionC: 'Avoiding candidates',
    optionD: 'Delaying responses',
    correctAnswer: 'B'
  }
];

// Section 3 — Web Developer cum Digital Marketing (15 Questions)
const digitalMarketingQuestions = [
  // Web Development (10)
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 1,
    questionText: 'Which HTML tag is used to display an image?',
    optionA: '<image>',
    optionB: '<img>',
    optionC: '<pic>',
    optionD: '<src>',
    correctAnswer: 'B'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 2,
    questionText: 'Which CSS property controls the space inside an element?',
    optionA: 'margin',
    optionB: 'padding',
    optionC: 'border',
    optionD: 'spacing',
    correctAnswer: 'B'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 3,
    questionText: 'Which CSS property controls the space outside an element?',
    optionA: 'padding',
    optionB: 'margin',
    optionC: 'border',
    optionD: 'width',
    correctAnswer: 'B'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 4,
    questionText: 'Which JavaScript function is commonly used to print information to the browser console?',
    optionA: 'print()',
    optionB: 'console.log()',
    optionC: 'browser.log()',
    optionD: 'display()',
    correctAnswer: 'B'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 5,
    questionText: 'Which operator is used for strict equality in JavaScript?',
    optionA: '=',
    optionB: '==',
    optionC: '===',
    optionD: '!=',
    correctAnswer: 'C'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 6,
    questionText: 'What is React primarily used for?',
    optionA: 'Building user interfaces',
    optionB: 'Managing databases',
    optionC: 'Sending emails',
    optionD: 'Editing images',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 7,
    questionText: 'Which HTTP status code indicates a successful request?',
    optionA: '200',
    optionB: '404',
    optionC: '500',
    optionD: '403',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 8,
    questionText: 'What is the purpose of a backend?',
    optionA: 'To handle server-side logic and data',
    optionB: 'Only to change font colors',
    optionC: 'Only to design buttons',
    optionD: 'To create images',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 9,
    questionText: 'Which of these is commonly used to send data from frontend to backend?',
    optionA: 'API request',
    optionB: 'CSS selector',
    optionC: 'HTML heading',
    optionD: 'Git branch',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Web Development',
    order: 10,
    questionText: 'What does URL stand for?',
    optionA: 'Uniform Resource Locator',
    optionB: 'Universal Response Link',
    optionC: 'User Resource Location',
    optionD: 'Uniform Reference Link',
    correctAnswer: 'A'
  },
  // Digital Marketing (5)
  {
    track: 'DIGITAL_MARKETING',
    section: 'Digital Marketing',
    order: 11,
    questionText: 'What does SEO stand for?',
    optionA: 'Search Engine Optimization',
    optionB: 'Social Engagement Optimization',
    optionC: 'Search Email Operation',
    optionD: 'Software Engine Optimization',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Digital Marketing',
    order: 12,
    questionText: 'What is the main goal of SEO?',
    optionA: 'Improve visibility in search engine results',
    optionB: 'Increase website coding speed only',
    optionC: 'Create databases',
    optionD: 'Recruit employees',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Digital Marketing',
    order: 13,
    questionText: 'What is a CTA in digital marketing?',
    optionA: 'Call To Action',
    optionB: 'Click Traffic Analysis',
    optionC: 'Customer Target Area',
    optionD: 'Content Tracking Application',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Digital Marketing',
    order: 14,
    questionText: 'Which metric measures how many people clicked an advertisement after seeing it?',
    optionA: 'CTR',
    optionB: 'CPC',
    optionC: 'ROI',
    optionD: 'Bounce Rate',
    correctAnswer: 'A'
  },
  {
    track: 'DIGITAL_MARKETING',
    section: 'Digital Marketing',
    order: 15,
    questionText: 'What is Google Analytics primarily used for?',
    optionA: 'Website and user behavior analysis',
    optionB: 'Writing HTML code',
    optionC: 'Recruiting candidates',
    optionD: 'Creating databases',
    correctAnswer: 'A'
  }
];

async function main() {
  console.log('Seeding database with multi-track questions...');

  // 1. Seed Admin
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

  // 2. Clean up & Seed 45 Questions (15 per track)
  console.log('Clearing older questions to seed all 3 tracks...');
  await prisma.answer.deleteMany({});
  await prisma.question.deleteMany({});

  const allQuestions = [
    ...salesEngineerQuestions,
    ...hrRecruiterQuestions,
    ...digitalMarketingQuestions
  ];

  for (const q of allQuestions) {
    await prisma.question.create({
      data: q
    });
  }

  console.log(`Successfully seeded ${allQuestions.length} questions across 3 tracks!`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });