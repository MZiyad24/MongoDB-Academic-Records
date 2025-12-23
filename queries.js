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
  grade: "F"
});

console.log("Deleted enrollments:", deleteResult.deletedCount);


//5. List courses taken by a student

const allStudentsCourses = await db.collection("enrollments").aggregate([
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
    $unwind : "$course"
  },
  {
    $group: {
      _id: "$student_id",
      courses: { $push: "$course.course_name" } // Collect all names into an array
    }
  },
  {
    $project: {
      _id: 0,
      student_id: "$_id",
      courses: 1
    }
  }
]).toArray();

console.log("Courses taken by students:", JSON.stringify(allStudentsCourses, null, 2));

const get_id = await db.collection("students").findOne(
  {
    level: 3
  },
  {
    projection: { _id: 1 }
  }
);
const studentID = get_id._id;  // change with the desired id
const specificStudentCourses = await db.collection("enrollments").aggregate([
  {
    $match: { student_id: studentID }
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
    $unwind : "$course"
  },
  {
    $group:{
      _id:"$student_id",
      courses : {$push:"$course.course_name"}
    }
  },
  {
    $project: {
      _id: 0,
      student_id: "$_id",
      courses: 1
    }
  }
]).toArray();

console.log("Courses taken by ", get_id, ": ", JSON.stringify(specificStudentCourses, null, 2));
process.exit();
