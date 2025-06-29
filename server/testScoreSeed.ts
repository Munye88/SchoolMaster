import { db } from './db';
import { testScores } from '../shared/test-scores-schema';

interface TestScoreData {
  studentName: string;
  schoolId: number;
  testType: string;
  score: number;
  maxScore: number;
  percentage: number;
  testDate: Date;
  instructor: string;
  course: string;
  level: string;
}

const generateTestScores = (): TestScoreData[] => {
  const scores: TestScoreData[] = [];
  const schools = [
    { id: 349, name: 'KFNA', studentCount: 253 },
    { id: 350, name: 'NFS East', studentCount: 57 },
    { id: 351, name: 'NFS West', studentCount: 121 }
  ];

  const testTypes = [
    { type: 'ALCPT', course: 'ALCPT Assessment', level: 'Intermediate', maxScore: 100, months: ['January', 'February', 'March', 'April', 'May'] },
    { type: 'ECL', course: 'ECL Evaluation', level: 'Advanced', maxScore: 100, months: ['January', 'February', 'March', 'April', 'May'] },
    { type: 'OPI', course: 'OPI Speaking Test', level: 'Conversational', maxScore: 100, months: ['January', 'February', 'March', 'April', 'May'] },
    { type: 'Book', course: 'Book Quiz Assessment', level: 'Foundation', maxScore: 100, cycles: [1, 2, 3, 4] }
  ];

  const instructors = ['Dr. Smith', 'Prof. Johnson', 'Ms. Wilson', 'Mr. Brown', 'Dr. Davis'];
  const years = [2024, 2025];
  let scoreId = 1;

  years.forEach(year => {
    testTypes.forEach(testType => {
      schools.forEach(school => {
        if (testType.type === 'Book') {
          // Book tests are quarterly (cycles)
          testType.cycles?.forEach(cycle => {
            // Generate tests for each cycle
            const testsPerCycle = Math.floor(school.studentCount * 0.6); // 60% of students take book tests per cycle
            
            for (let i = 0; i < testsPerCycle; i++) {
              const cycleStartMonth = (cycle - 1) * 3; // Cycle 1: Jan-Mar, Cycle 2: Apr-Jun, etc.
              const testMonth = cycleStartMonth + Math.floor(Math.random() * 3);
              const testDate = new Date(year, testMonth, Math.floor(Math.random() * 28) + 1);
              
              const baseScore = 65 + Math.random() * 30; // Base score between 65-95
              const score = Math.round(baseScore);
              const percentage = Math.round((score / testType.maxScore) * 100);

              scores.push({
                studentName: `Student ${scoreId}`,
                schoolId: school.id,
                testType: testType.type,
                score,
                maxScore: testType.maxScore,
                percentage,
                testDate,
                instructor: instructors[Math.floor(Math.random() * instructors.length)],
                course: testType.course,
                level: testType.level
              });
              
              scoreId++;
            }
          });
        } else {
          // ALCPT, ECL, OPI tests are monthly
          testType.months?.forEach(month => {
            const testsPerMonth = Math.floor(school.studentCount * 0.4); // 40% of students take these tests per month
            
            for (let i = 0; i < testsPerMonth; i++) {
              const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 
                                'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month);
              const testDate = new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1);
              
              // Different base scores for different test types
              let baseScore = 70;
              if (testType.type === 'ALCPT') baseScore = 75 + Math.random() * 20; // 75-95
              else if (testType.type === 'ECL') baseScore = 80 + Math.random() * 15; // 80-95
              else if (testType.type === 'OPI') baseScore = 70 + Math.random() * 25; // 70-95
              
              const score = Math.round(baseScore);
              const percentage = Math.round((score / testType.maxScore) * 100);

              scores.push({
                studentName: `Student ${scoreId}`,
                schoolId: school.id,
                testType: testType.type,
                score,
                maxScore: testType.maxScore,
                percentage,
                testDate,
                instructor: instructors[Math.floor(Math.random() * instructors.length)],
                course: testType.course,
                level: testType.level
              });
              
              scoreId++;
            }
          });
        }
      });
    });
  });

  return scores;
};

export async function seedTestScores() {
  try {
    console.log('🎯 Starting comprehensive test scores seeding...');
    
    // Check if test scores already exist
    const existingScores = await db.select().from(testScores).limit(1);
    if (existingScores.length > 0) {
      console.log('✅ Test scores already exist, skipping seed');
      return;
    }

    const testScoreData = generateTestScores();
    console.log(`📊 Generated ${testScoreData.length} test score records`);

    // Insert test scores in batches
    const batchSize = 100;
    for (let i = 0; i < testScoreData.length; i += batchSize) {
      const batch = testScoreData.slice(i, i + batchSize);
      await db.insert(testScores).values(batch);
      console.log(`📝 Inserted test scores batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testScoreData.length / batchSize)}`);
    }

    console.log('✅ Test scores seeding completed successfully');
    
    // Log summary by test type and school
    const summary = testScoreData.reduce((acc, score) => {
      const key = `${score.type}-${score.schoolId}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Test scores summary:', summary);
    
  } catch (error) {
    console.error('❌ Error seeding test scores:', error);
    throw error;
  }
}