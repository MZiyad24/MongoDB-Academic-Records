import { connection } from "./db.js";

async function aggregations() {
  try {
    const db = await connection();

    //Student Transcript
    const transcript = await db.collection("students").aggregate([
      { $lookup: { from: "enrollments", localField: "_id", foreignField: "student_id", as: "enrollments" } },
      { $unwind: "$enrollments" },
      { $lookup: { from: "courses", localField: "enrollments.course_id", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $project: { _id: 0, student: "$name", course: "$course.name", grade: "$enrollments.grade" } }
    ]).toArray();
    console.log("Student Transcript:", transcript);

    //Semester Statistics
    const semesterGPA = await db.collection("enrollments").aggregate([
    { $match: { grade: { $exists: true } } },
    {
      $addFields: {
        gradeValue: {
          $switch: {
            branches:[
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
            default: 0
          }
        }
      }
    },
    { 
      $group: { 
        _id: { student_id: "$student_id", semester_id: "$semester_id" }, 
        gpa: { $avg: "$gradeValue" } 
      } 
    },
    { 
      $lookup: { from: "students", localField: "_id.student_id", foreignField: "_id", as: "student" } 
    },
    { $unwind: "$student" },
    { 
      $lookup: { from: "semesters", localField: "_id.semester_id", foreignField: "_id", as: "semester" } 
    },
    { $unwind: "$semester" },
    { 
      $project: { 
        _id: 0, 
        student: "$student.name", 
        semester: "$semester.name", 
        gpa: { $round: ["$gpa", 2] } 
      } 
    }
    ]).toArray();
    console.log("Semester GPA Report:", semesterGPA);

    //Course Statistics
    const courseStats = await db.collection("enrollments").aggregate([
    {
      $addFields: {
        gradeValue: {
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
        }
      }
    },
    { 
      $group: { 
        _id: "$course_id", 
        student_count: { $sum: 1 }, 
        avg_grade: { $avg: "$gradeValue" } 
      } 
    },
    { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { 
      $project: { 
        _id: 0, 
        course: "$course.course_name",
        avg_grade: { $round: ["$avg_grade", 2] },
        student_count:1
      } 
    }
    ]).toArray();
    console.log("Course Statistics:", courseStats);

    //Top Students
    const topStudents = await db.collection("students").aggregate([
    { 
      $sort: { GPA: -1 } 
    },
    { 
      $limit: 3 
    },
    { 
      $project: { 
        _id: 0, 
        name: { $concat: ["$fname", " ", "$lname"] },
        GPA: 1 
      } 
    }
    ]).toArray();
    console.log("Top Performing Students:", topStudents);

  } finally {
    process.exit();
  }
}

aggregations().catch(console.error);

