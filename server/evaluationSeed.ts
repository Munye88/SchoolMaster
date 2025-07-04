import { db } from "./db";
import { evaluations, instructors } from "../shared/schema";
import { eq } from "drizzle-orm";

// Sample evaluation data for testing
const sampleEvaluations = [
  {
    instructorId: 1,
    evaluatorId: 1,
    evaluationDate: "2025-01-15",
    overallRating: 4,
    teachingEffectiveness: 4,
    classroomManagement: 4,
    professionalDevelopment: 3,
    communication: 5,
    strengths: "Excellent communication skills and student engagement. Creates a positive learning environment.",
    areasForImprovement: "Could benefit from additional professional development in assessment techniques.",
    comments: "Overall strong performance with consistent improvement shown over the evaluation period.",
    status: "completed",
    followUpDate: null,
    completionDate: "2025-01-15",
    evaluationType: "quarterly"
  },
  {
    instructorId: 2,
    evaluatorId: 1,
    evaluationDate: "2025-01-10",
    overallRating: 5,
    teachingEffectiveness: 5,
    classroomManagement: 5,
    professionalDevelopment: 4,
    communication: 5,
    strengths: "Outstanding instructor with innovative teaching methods. Excellent rapport with students and colleagues.",
    areasForImprovement: "Continue pursuing advanced certifications to maintain cutting-edge expertise.",
    comments: "Exemplary performance across all evaluation criteria. A model instructor for the program.",
    status: "completed",
    followUpDate: null,
    completionDate: "2025-01-10",
    evaluationType: "annual"
  },
  {
    instructorId: 3,
    evaluatorId: 1,
    evaluationDate: "2025-02-01",
    overallRating: 3,
    teachingEffectiveness: 3,
    classroomManagement: 3,
    professionalDevelopment: 3,
    communication: 4,
    strengths: "Good communication skills and punctuality. Shows dedication to student success.",
    areasForImprovement: "Needs improvement in lesson planning and classroom management techniques.",
    comments: "Satisfactory performance with specific areas identified for development.",
    status: "pending",
    followUpDate: "2025-03-01",
    completionDate: null,
    evaluationType: "probationary"
  },
  {
    instructorId: 4,
    evaluatorId: 1,
    evaluationDate: "2025-01-20",
    overallRating: 4,
    teachingEffectiveness: 4,
    classroomManagement: 4,
    professionalDevelopment: 4,
    communication: 4,
    strengths: "Consistent performance across all areas. Well-prepared lessons and good student relationships.",
    areasForImprovement: "Could explore more interactive teaching methodologies.",
    comments: "Solid instructor meeting all performance standards.",
    status: "completed",
    followUpDate: null,
    completionDate: "2025-01-20",
    evaluationType: "quarterly"
  },
  {
    instructorId: 5,
    evaluatorId: 1,
    evaluationDate: "2025-02-05",
    overallRating: 2,
    teachingEffectiveness: 2,
    classroomManagement: 2,
    professionalDevelopment: 3,
    communication: 3,
    strengths: "Shows willingness to learn and accept feedback.",
    areasForImprovement: "Significant improvement needed in lesson delivery, classroom management, and student engagement.",
    comments: "Performance below standards. Comprehensive improvement plan required with close monitoring.",
    status: "overdue",
    followUpDate: "2025-02-15",
    completionDate: null,
    evaluationType: "follow-up"
  }
];

export async function seedEvaluations() {
  try {
    console.log("🎯 Starting evaluation seeding...");

    // Check if evaluations already exist
    const existingEvaluations = await db.select().from(evaluations);
    if (existingEvaluations.length > 0) {
      console.log(`✅ Evaluations already exist (${existingEvaluations.length} found), skipping seed`);
      return;
    }

    // Get available instructors to ensure we have valid instructor IDs
    const availableInstructors = await db.select().from(instructors);
    if (availableInstructors.length === 0) {
      console.log("❌ No instructors found, cannot seed evaluations");
      return;
    }

    console.log(`📋 Found ${availableInstructors.length} instructors, creating evaluations...`);

    // Create evaluations for available instructors
    const evaluationsToInsert = sampleEvaluations
      .filter(evaluation => evaluation.instructorId <= availableInstructors.length)
      .map(evaluation => ({
        ...evaluation,
        // Ensure instructor ID exists in the database
        instructorId: availableInstructors[evaluation.instructorId - 1]?.id || availableInstructors[0].id
      }));

    if (evaluationsToInsert.length === 0) {
      console.log("❌ No valid evaluations to insert");
      return;
    }

    // Insert evaluations
    await db.insert(evaluations).values(evaluationsToInsert);

    console.log(`✅ Successfully seeded ${evaluationsToInsert.length} evaluations`);

    // Log the evaluations by status
    const completed = evaluationsToInsert.filter(e => e.status === 'completed').length;
    const pending = evaluationsToInsert.filter(e => e.status === 'pending').length;
    const overdue = evaluationsToInsert.filter(e => e.status === 'overdue').length;

    console.log(`📊 Evaluation summary: ${completed} completed, ${pending} pending, ${overdue} overdue`);

  } catch (error) {
    console.error("❌ Error seeding evaluations:", error);
    throw error;
  }
}

// Function to create additional evaluations for testing
export async function createAdditionalEvaluations() {
  try {
    const availableInstructors = await db.select().from(instructors).limit(20);
    
    const additionalEvaluations = availableInstructors.slice(5).map((instructor, index) => ({
      instructorId: instructor.id,
      evaluatorId: 1,
      evaluationDate: new Date(2025, 0, 15 + index).toISOString().split('T')[0],
      overallRating: Math.floor(Math.random() * 3) + 3, // Rating between 3-5
      teachingEffectiveness: Math.floor(Math.random() * 3) + 3,
      classroomManagement: Math.floor(Math.random() * 3) + 3,
      professionalDevelopment: Math.floor(Math.random() * 3) + 3,
      communication: Math.floor(Math.random() * 3) + 3,
      strengths: "Good performance in key areas with consistent results.",
      areasForImprovement: "Continue professional development and skill enhancement.",
      comments: "Regular evaluation showing satisfactory performance.",
      status: Math.random() > 0.8 ? 'pending' : 'completed',
      followUpDate: Math.random() > 0.7 ? new Date(2025, 2, 1).toISOString().split('T')[0] : null,
      completionDate: Math.random() > 0.2 ? new Date(2025, 0, 15 + index).toISOString().split('T')[0] : null,
      evaluationType: ['quarterly', 'annual', 'probationary'][Math.floor(Math.random() * 3)]
    }));

    if (additionalEvaluations.length > 0) {
      await db.insert(evaluations).values(additionalEvaluations);
      console.log(`✅ Added ${additionalEvaluations.length} additional evaluations for testing`);
    }

  } catch (error) {
    console.error("❌ Error creating additional evaluations:", error);
  }
}