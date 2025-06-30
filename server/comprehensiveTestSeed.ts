import { db } from './db';
import { testScores } from '../shared/test-scores-schema';
import { schools as schoolsTable } from '@shared/schema';

export async function seedComprehensiveTestScores(forceReseed = false) {
  try {
    console.log('🎯 Starting comprehensive test scores seeding...');
    
    // PRODUCTION COMPATIBILITY: Get actual school IDs by code
    console.log('🏫 Detecting production school IDs by code...');
    const existingSchools = await db.select().from(schoolsTable);
    console.log(`📚 Found schools:`, existingSchools.map(s => `${s.name} (${s.code}: ${s.id})`));
    
    // Map school codes to their actual IDs in the database
    const schoolIdMap = new Map();
    for (const school of existingSchools) {
      if (school.code === 'KFNA') schoolIdMap.set('KFNA', school.id);
      else if (school.code === 'NFS_EAST') schoolIdMap.set('NFS_EAST', school.id);
      else if (school.code === 'NFS_WEST') schoolIdMap.set('NFS_WEST', school.id);
    }
    
    // Verify all required schools exist
    if (!schoolIdMap.has('KFNA') || !schoolIdMap.has('NFS_EAST') || !schoolIdMap.has('NFS_WEST')) {
      const errorMsg = `❌ CRITICAL: Missing required schools. Found: ${Array.from(schoolIdMap.keys()).join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('✅ All required schools verified, proceeding with test score seeding');
    console.log(`📋 School ID mapping: KFNA=${schoolIdMap.get('KFNA')}, NFS_EAST=${schoolIdMap.get('NFS_EAST')}, NFS_WEST=${schoolIdMap.get('NFS_WEST')}`);
    
    // Check if test scores already exist with full count verification
    const existingScores = await db.select().from(testScores);
    console.log(`📊 Current test scores in database: ${existingScores.length}`);
    
    if (existingScores.length >= 7000 && !forceReseed) {
      console.log('✅ Test scores already exist with sufficient data, skipping seed');
      return;
    }
    
    if (forceReseed || existingScores.length < 7000) {
      console.log(`🔄 ${forceReseed ? 'Force reseed requested' : 'Insufficient test data found'}, proceeding with comprehensive seed...`);
      if (existingScores.length > 0) {
        console.log(`🗑️ Clearing ${existingScores.length} existing test scores for fresh seed...`);
        await db.delete(testScores);
      }
    }
    
    if (forceReseed && existingScores.length > 0) {
      console.log('🔄 Force reseeding - clearing existing test scores...');
      await db.delete(testScores);
    }

    // Use actual production school IDs from database
    const schools = [
      { id: schoolIdMap.get('KFNA'), name: 'KFNA', studentCount: 253 },
      { id: schoolIdMap.get('NFS_EAST'), name: 'NFS East', studentCount: 57 },
      { id: schoolIdMap.get('NFS_WEST'), name: 'NFS West', studentCount: 121 }
    ];

    const testTypes = [
      { type: 'ALCPT', course: 'ALCPT Assessment', level: 'Intermediate', maxScore: 100 },
      { type: 'ECL', course: 'ECL Evaluation', level: 'Advanced', maxScore: 100 },
      { type: 'OPI', course: 'OPI Speaking Test', level: 'Conversational', maxScore: 100 },
      { type: 'Book', course: 'Book Quiz Assessment', level: 'Foundation', maxScore: 100 }
    ];

    const instructors = ['Dr. Smith', 'Prof. Johnson', 'Ms. Wilson', 'Mr. Brown', 'Dr. Davis'];
    const months = ['January', 'February', 'March', 'April', 'May'];
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
    const cycles = [1, 2, 3, 4];

    const allTestScores = [];
    let studentCounter = 1;

    for (const year of years) {
      for (const school of schools) {
        for (const testType of testTypes) {
          if (testType.type === 'Book') {
            // Book tests are quarterly (cycles)
            for (const cycle of cycles) {
              const testsPerCycle = Math.floor(school.studentCount * 0.6);
              
              for (let i = 0; i < testsPerCycle; i++) {
                const cycleStartMonth = (cycle - 1) * 3;
                const testMonth = cycleStartMonth + Math.floor(Math.random() * 3);
                const testDate = new Date(year, testMonth, Math.floor(Math.random() * 28) + 1);
                
                const baseScore = 65 + Math.random() * 30;
                const score = Math.round(baseScore);
                const percentage = Math.round((score / testType.maxScore) * 100);

                allTestScores.push({
                  studentName: `Student ${studentCounter++}`,
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
              }
            }
          } else {
            // ALCPT, ECL, OPI tests are monthly
            for (const month of months) {
              const testsPerMonth = Math.floor(school.studentCount * 0.4);
              
              for (let i = 0; i < testsPerMonth; i++) {
                const monthIndex = months.indexOf(month);
                const testDate = new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1);
                
                let baseScore = 70;
                if (testType.type === 'ALCPT') baseScore = 75 + Math.random() * 20;
                else if (testType.type === 'ECL') baseScore = 80 + Math.random() * 15;
                else if (testType.type === 'OPI') baseScore = 70 + Math.random() * 25;
                
                const score = Math.round(baseScore);
                const percentage = Math.round((score / testType.maxScore) * 100);

                allTestScores.push({
                  studentName: `Student ${studentCounter++}`,
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
              }
            }
          }
        }
      }
    }

    console.log(`📊 Generated ${allTestScores.length} test score records`);

    // Insert test scores in batches
    const batchSize = 100;
    for (let i = 0; i < allTestScores.length; i += batchSize) {
      const batch = allTestScores.slice(i, i + batchSize);
      await db.insert(testScores).values(batch);
      console.log(`📝 Inserted test scores batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allTestScores.length / batchSize)}`);
    }

    console.log('✅ Comprehensive test scores seeding completed successfully');
    
    // Log summary by test type and school
    const summary = allTestScores.reduce((acc, score) => {
      const key = `${score.testType}-${score.schoolId}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Test scores summary:', summary);
    
  } catch (error) {
    console.error('❌ Error seeding comprehensive test scores:', error);
    throw error;
  }
}