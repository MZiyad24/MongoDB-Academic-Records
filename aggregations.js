import { connection } from "./db.js";

// Helper function to convert grade to numeric value
function getGradeValue(grade) {
  const gradeMap = {
    "A+": 4.3,
    "A": 4.0,
    "B+": 3.3,
    "B": 3.0,
    "C+": 2.3,
    "C": 2.0,
    "D+": 1.3,
    "D": 1.0,
    "F": 0.0
  };
  return gradeMap[grade] ?? null;
}

// Helper function for grade value conversion in aggregation
const gradeValueSwitch = {
  $switch: {
    branches: [
      { case: { $eq: ["$grade", "A+"] }, then: 4.3 },
      { case: { $eq: ["$grade", "A"] }, then: 4.0 },
      { case: { $eq: ["$grade", "B+"] }, then: 3.3 },
      { case: { $eq: ["$grade", "B"] }, then: 3.0 },
      { case: { $eq: ["$grade", "C+"] }, then: 2.3 },
      { case: { $eq: ["$grade", "C"] }, then: 2.0 },
      { case: { $eq: ["$grade", "D+"] }, then: 1.3 },
      { case: { $eq: ["$grade", "D"] }, then: 1.0 },
      { case: { $eq: ["$grade", "F"] }, then: 0.0 }
    ],
    default: null
  }
};

async function aggregations() {
  let db;
  try {
    db = await connection();

    // Student Transcript - Enhanced with proper grouping and sorting
    const transcript = await db.collection("students").aggregate([
      { $lookup: { from: "enrollments", localField: "_id", foreignField: "student_id", as: "enrollments" } },
      { $unwind: { path: "$enrollments", preserveNullAndEmptyArrays: false } },
      { $lookup: { from: "courses", localField: "enrollments.course_id", foreignField: "_id", as: "course" } },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: false } },
      { 
        $project: { 
          _id: 0, 
          student_id: "$_id",
          student_name: { $concat: ["$fname", " ", "$lname"] },
          student_email: "$email",
          course_name: "$course.course_name",
          course_code: "$course.course_code",
          grade: "$enrollments.grade",
          semester_id: "$enrollments.semester_id"
        } 
      },
      { $sort: { student_name: 1, course_name: 1 } }
    ]).toArray();

    // Group transcript by student for better structure
    const transcriptByStudent = transcript.reduce((acc, record) => {
      const key = record.student_id.toString();
      if (!acc[key]) {
        acc[key] = {
          student_id: record.student_id,
          student_name: record.student_name,
          student_email: record.student_email,
          courses: []
        };
      }
      acc[key].courses.push({
        course_name: record.course_name,
        course_code: record.course_code,
        grade: record.grade
      });
      return acc;
    }, {});

    console.log("\n Student Transcript");
    console.log(JSON.stringify(Object.values(transcriptByStudent), null, 2));
    console.log(`Total students: ${Object.keys(transcriptByStudent).length}`);

    // Semester Statistics - Enhanced with better error handling
    const semesterGPA = await db.collection("enrollments").aggregate([
      { $match: { grade: { $exists: true, $ne: null } } },
      {
        $addFields: {
          gradeValue: gradeValueSwitch
        }
      },
      { $match: { gradeValue: { $ne: null } } },
      { 
        $group: { 
          _id: { student_id: "$student_id", semester_id: "$semester_id" }, 
          gpa: { $avg: "$gradeValue" },
          course_count: { $sum: 1 }
        } 
      },
      { 
        $lookup: { from: "students", localField: "_id.student_id", foreignField: "_id", as: "student" } 
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: false } },
      { 
        $lookup: { from: "semesters", localField: "_id.semester_id", foreignField: "_id", as: "semester" } 
      },
      { $unwind: { path: "$semester", preserveNullAndEmptyArrays: false } },
      { 
        $project: { 
          _id: 0, 
          student_id: "$_id.student_id",
          student_name: { $concat: ["$student.fname", " ", "$student.lname"] },
          semester_name: "$semester.semester_name",
          gpa: { $round: ["$gpa", 2] },
          course_count: 1
        } 
      },
      { $sort: { gpa: -1, student_name: 1 } }
    ]).toArray();

    console.log("\n Semester GPA Report");
    console.log(JSON.stringify(semesterGPA, null, 2));
    console.log(`Total semester records: ${semesterGPA.length}`);

    // Course Statistics - Enhanced with grade distribution
    const courseStats = await db.collection("enrollments").aggregate([
      { $match: { grade: { $exists: true, $ne: null } } },
      {
        $addFields: {
          gradeValue: gradeValueSwitch
        }
      },
      { $match: { gradeValue: { $ne: null } } },
      { 
        $group: { 
          _id: "$course_id", 
          student_count: { $sum: 1 },
          avg_grade: { $avg: "$gradeValue" },
          grades: { $push: "$grade" }
        } 
      },
      { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: false } },
      {
        $addFields: {
          grade_distribution: {
            A_plus: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "A+"] } } } },
            A: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "A"] } } } },
            B_plus: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "B+"] } } } },
            B: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "B"] } } } },
            C_plus: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "C+"] } } } },
            C: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "C"] } } } },
            D_plus: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "D+"] } } } },
            D: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "D"] } } } },
            F: { $size: { $filter: { input: "$grades", as: "g", cond: { $eq: ["$$g", "F"] } } } }
          }
        }
      },
      { 
        $project: { 
          _id: 0, 
          course_name: "$course.course_name",
          course_code: "$course.course_code",
          department: "$course.department_name",
          avg_grade: { $round: ["$avg_grade", 2] },
          student_count: 1,
          grade_distribution: 1
        } 
      },
      { $sort: { avg_grade: -1 } }
    ]).toArray();

    console.log("\n Course Statistics ");
    console.log(JSON.stringify(courseStats, null, 2));
    console.log(`Total courses: ${courseStats.length}`);

    // Top Students - Enhanced with more details
    const topStudents = await db.collection("students").aggregate([
      { $match: { GPA: { $exists: true, $ne: null } } },
      { 
        $sort: { GPA: -1 } 
      },
      { 
        $limit: 3 
      },
      { 
        $project: { 
          _id: 0,
          student_id: "$_id",
          name: { $concat: ["$fname", " ", "$lname"] },
          email: "$email",
          GPA: { $round: ["$GPA", 2] },
          level: 1,
          department: "$department.department_name"
        } 
      }
    ]).toArray();

    console.log("\n=== Top Performing Students ===");
    console.log(JSON.stringify(topStudents, null, 2));

    // Return structured results
    return {
      success: true,
      data: {
        transcript: Object.values(transcriptByStudent),
        semesterGPA,
        courseStats,
        topStudents
      },
      summary: {
        totalStudents: Object.keys(transcriptByStudent).length,
        totalSemesterRecords: semesterGPA.length,
        totalCourses: courseStats.length,
        topStudentsCount: topStudents.length
      }
    };

  } catch (error) {
    console.error("\n=== Error in Aggregations ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    return {
      success: false,
      error: error.message,
      data: null
    };
  } finally {
    if (db) {
      await db.client.close();
    }
    process.exit();
  }
}

aggregations().catch(console.error);
