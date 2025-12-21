import { connection } from "./db.js";

const db = await connection();

//1. Find all students in IS department

const isStudents = await db.collection("students").find({
  "department.department_name": "IS"
}).toArray();

console.log("IS Students:", isStudents);


//2. Find students with GPA > X

const highGPAStudents = await db.collection("students").find({
  GPA: { $gt: 3.5 }
}).toArray();

console.log("Students with GPA > 3.5:", highGPAStudents);


//3. Update a student email

await db.collection("students").updateOne(
  { email: "mziyad154@gmail.com" },
  { $set: { email: "ziyad.updated@gmail.com" } }
);

console.log("Student email updated");


//4. Delete a dropped enrollment

const deleteResult = await db.collection("enrollments").deleteOne({
  grade: { $lt: 2.5 }
});

console.log("Deleted enrollments:", deleteResult.deletedCount);


//5. List courses taken by a student

const studentCourses = await db.collection("enrollments").aggregate([
  {
    $match: { student_id: { $exists: true } }
  },
  {
    $lookup: {
      from: "courses",
      localField: "course_id",
      foreignField: "_id",
      as: "course"
    }
  },
  {
    $project: {
      _id: 0,
      student_id: 1,
      "course.course_name": 1,
      grade: 1
    }
  }
]).toArray();

console.log("Courses taken by students:", studentCourses);

process.exit();
