import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

async function aggregations() {
 const url = process.env.MONGO_URI; 
const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db("schooldb");

    // 1. Student Transcript
    const transcript = await db.collection("students").aggregate([
      { $lookup: { from: "enrollments", localField: "_id", foreignField: "student_id", as: "enrollments" } },
      { $unwind: "$enrollments" },
      { $lookup: { from: "courses", localField: "enrollments.course_id", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $project: { _id: 0, student: "$name", course: "$course.name", grade: "$enrollments.grade" } }
    ]).toArray();
    console.log("Student Transcript:", transcript);

    // 2. Semester GPA Report
    const semesterGPA = await db.collection("enrollments").aggregate([
      { $group: { _id: { student_id: "$student_id", semester_id: "$semester_id" }, gpa: { $avg: "$grade" } } },
      { $lookup: { from: "students", localField: "_id.student_id", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $lookup: { from: "semesters", localField: "_id.semester_id", foreignField: "_id", as: "semester" } },
      { $unwind: "$semester" },
      { $project: { _id: 0, student: "$student.name", semester: "$semester.name", gpa: 1 } }
    ]).toArray();
    console.log("Semester GPA Report:", semesterGPA);

    // 3. Course Statistics
    const courseStats = await db.collection("enrollments").aggregate([
      { $group: { _id: "$course_id", student_count: { $sum: 1 }, avg_grade: { $avg: "$grade" } } },
      { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $project: { _id: 0, course: "$course.name", student_count: 1, avg_grade: 1 } }
    ]).toArray();
    console.log("Course Statistics:", courseStats);

    // 4. Top Performing Students
    const topStudents = await db.collection("students").aggregate([
      { $lookup: { from: "enrollments", localField: "_id", foreignField: "student_id", as: "enrollments" } },
      { $addFields: { gpa: { $avg: "$enrollments.grade" } } },
      { $sort: { gpa: -1 } },
      { $limit: 3 },
      { $project: { _id: 0, name: 1, gpa: 1 } }
    ]).toArray();
    console.log("Top Performing Students:", topStudents);

  } finally {
    await client.close();
  }
}

aggregations().catch(console.error);
