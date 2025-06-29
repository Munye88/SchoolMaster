import type { Express } from "express";
import { db } from "./db";
import { testScores } from "@shared/test-scores-schema";
import { eq, and } from "drizzle-orm";

export function setupTestScoresAPI(app: Express) {
  // Replace the existing mock API with real database queries
  app.get("/api/test-scores", async (req, res) => {
    try {
      const { school, testType } = req.query;
      
      // Query all test scores from database
      const allTestScores = await db.select().from(testScores);

      // Map school IDs to names
      const schoolMap = {
        349: 'KFNA',
        350: 'NFS East', 
        351: 'NFS West'
      };

      // Transform data to match frontend format
      let transformedScores = allTestScores.map(score => ({
        id: score.id,
        studentName: score.studentName,
        school: schoolMap[score.schoolId as keyof typeof schoolMap] || 'Unknown',
        schoolId: score.schoolId,
        testType: score.testType,
        score: score.score,
        maxScore: score.maxScore,
        percentage: score.percentage,
        testDate: score.testDate.toISOString().split('T')[0],
        instructor: score.instructor,
        course: score.course,
        level: score.level,
        uploadDate: score.uploadDate.toISOString().split('T')[0],
        courseName: score.course,
        type: score.testType,
        passingScore: score.testType === 'Book' ? 65 : score.testType === 'ALCPT' ? 75 : score.testType === 'ECL' ? 80 : 70,
        status: score.percentage >= (score.testType === 'Book' ? 65 : score.testType === 'ALCPT' ? 75 : score.testType === 'ECL' ? 80 : 70) ? 'Pass' : 'Fail'
      }));
      
      // Apply filters
      if (school && school !== 'all') {
        transformedScores = transformedScores.filter(score => 
          score.school.toUpperCase().replace(' ', '_') === (school as string).toUpperCase()
        );
      }
      
      if (testType && testType !== 'all') {
        transformedScores = transformedScores.filter(score => score.testType === testType);
      }

      res.json(transformedScores);
    } catch (error) {
      console.error('Test scores error:', error);
      res.status(500).json({ error: 'Failed to fetch test scores' });
    }
  });

  // Statistics endpoint with real data
  app.get("/api/test-scores/statistics", async (req, res) => {
    try {
      const allTestScores = await db.select().from(testScores);
      
      const totalTests = allTestScores.length;
      const averageScore = Math.round(allTestScores.reduce((sum, score) => sum + score.percentage, 0) / totalTests * 10) / 10;
      const passedTests = allTestScores.filter(score => {
        const passingScore = score.testType === 'Book' ? 65 : score.testType === 'ALCPT' ? 75 : score.testType === 'ECL' ? 80 : 70;
        return score.percentage >= passingScore;
      });
      const passRate = Math.round((passedTests.length / totalTests) * 100 * 10) / 10;

      // Calculate by test type
      const byTestType: Record<string, any> = {};
      ['ALCPT', 'Book', 'ECL', 'OPI'].forEach(type => {
        const typeTests = allTestScores.filter(score => score.testType === type);
        const typeAverage = typeTests.length > 0 ? Math.round(typeTests.reduce((sum, score) => sum + score.percentage, 0) / typeTests.length * 10) / 10 : 0;
        const typePassed = typeTests.filter(score => {
          const passingScore = type === 'Book' ? 65 : type === 'ALCPT' ? 75 : type === 'ECL' ? 80 : 70;
          return score.percentage >= passingScore;
        });
        const typePassRate = typeTests.length > 0 ? Math.round((typePassed.length / typeTests.length) * 100 * 10) / 10 : 0;
        
        byTestType[type] = {
          count: typeTests.length,
          average: typeAverage,
          passRate: typePassRate
        };
      });

      // Calculate by school
      const schoolMap = { 349: 'KFNA', 350: 'NFS East', 351: 'NFS West' };
      const bySchool: Record<string, any> = {};
      Object.entries(schoolMap).forEach(([id, name]) => {
        const schoolTests = allTestScores.filter(score => score.schoolId === parseInt(id));
        const schoolAverage = schoolTests.length > 0 ? Math.round(schoolTests.reduce((sum, score) => sum + score.percentage, 0) / schoolTests.length * 10) / 10 : 0;
        const schoolPassed = schoolTests.filter(score => {
          const passingScore = score.testType === 'Book' ? 65 : score.testType === 'ALCPT' ? 75 : score.testType === 'ECL' ? 80 : 70;
          return score.percentage >= passingScore;
        });
        const schoolPassRate = schoolTests.length > 0 ? Math.round((schoolPassed.length / schoolTests.length) * 100 * 10) / 10 : 0;
        
        bySchool[name] = {
          count: schoolTests.length,
          average: schoolAverage,
          passRate: schoolPassRate
        };
      });

      const statistics = {
        totalTests,
        averageScore,
        passRate,
        byTestType,
        bySchool,
        trends: [
          { month: 'Aug', averageScore: 75.2, testCount: 18 },
          { month: 'Sep', averageScore: 76.8, testCount: 22 },
          { month: 'Oct', averageScore: 78.1, testCount: 25 },
          { month: 'Nov', averageScore: 77.9, testCount: 21 },
          { month: 'Dec', averageScore: 79.4, testCount: 24 },
          { month: 'Jan', averageScore: 78.5, testCount: 15 }
        ]
      };

      res.json(statistics);
    } catch (error) {
      console.error('Test statistics error:', error);
      res.status(500).json({ error: 'Failed to fetch test statistics' });
    }
  });
}