import { connection } from "./db.js";

const db = await connection();

const session = db.client.startSession();

try{
  session.startTransaction();
  const students = await db.collection("students").insertMany([
    {
        fname:"Ziyad",
        lname:"Mohammed",
        email:"mziyad154@gmail.com",
        level:4,
        GPA:3.2,
        department:{faculty:"Computer Science", department_name:"IS"}
    },
    {
        fname:"Abdulrahman",
        lname:"Mohsen",
        email:"abdo.mohsen12@gmail.com",
        level:4,
        GPA:3.3,
        department:{faculty:"Computer Science", department_name:"IS"}
    },
    {
        fname: "Ahmed",
        lname: "Hassan",
        email: "ahmed.hassan21@gmail.com",
        level:3,
        GPA: 3.6,
        department: { faculty: "Computer Science", department_name: "CS" }
    },
    {
        fname: "Mohamed",
        lname: "Ali",
        email: "mohamed.ali98@gmail.com",
        level:3,
        GPA: 2.9,
        department: { faculty: "Computer Science", department_name: "CS" }
    },
    {
        fname: "Omar",
        lname: "Youssef",
        email: "omar.youssef07@gmail.com",
        level:3,
        GPA: 3.8,
        department: { faculty: "Computer Science", department_name: "CS" }
    },
    {
        fname: "Youssef",
        lname: "Kamal",
        email: "youssef.kamal14@gmail.com",
        level:4,
        GPA: 3.1,
        department: { faculty: "Computer Science", department_name: "IS" }
    },
    {
        fname: "Mahmoud",
        lname: "Sayed",
        email: "mahmoud.sayed33@gmail.com",
        level:3,
        GPA: 2.7,
        department: { faculty: "Computer Science", department_name: "CS" }
    },
    {
        fname: "Mostafa",
        lname: "Ibrahim",
        email: "mostafa.ibrahim90@gmail.com",
        level:3,
        GPA: 3.4,
        department: { faculty: "Computer Science", department_name: "CS" }
    },
    {
        fname: "Kareem",
        lname: "Adel",
        email: "kareem.adel11@gmail.com",
        level:4,
        GPA: 3.0,
        department: { faculty: "Computer Science", department_name: "IS" }
    },
    {
        fname: "Hassan",
        lname: "Fathy",
        email: "hassan.fathy55@gmail.com",
        level:3,
        GPA: 2.8,
        department: { faculty: "Computer Science", department_name: "CS" }
    }],{session}
  )
  const courses = await db.collection("courses").insertMany([
      {
          course_name:"Selected topics",
          corse_code:"IS417",
          department_name:"IS"
      },
      {
          course_name:"SOA",
          corse_code:"IS434",
          department_name:"IS"
      },
      {
          course_name:"Algorithms",
          corse_code:"CS235",
          department_name:"CS"
      },
      {
          course_name:"Compilers",
          corse_code:"CS408",
          department_name:"CS"
      },
      {
          course_name:"Information Retrieval",
          corse_code:"IS396",
          department_name:"IS"
      }],{session}
  )
  const semesters = await db.collection("semesters").insertMany([
      {
          semester_name:"Fall 2025"
      },
      {
          semester_name:"Summer 2025"
      }],{session}
  )
  const enrollments = await db.collection("enrollments").insertMany([
    {
      student_id: students.insertedIds[0],
      course_id: courses.insertedIds[0], // IS417
      semester_id: semesters.insertedIds[0],
      grade: "A"
    },
    {
      student_id: students.insertedIds[0],
      course_id: courses.insertedIds[1], // IS434
      semester_id: semesters.insertedIds[0],
      grade: "B"
    },
    {
      student_id: students.insertedIds[1],
      course_id: courses.insertedIds[0],
      semester_id: semesters.insertedIds[0],
      grade: "D"
    },
    {
      student_id: students.insertedIds[1],
      course_id: courses.insertedIds[4], // IS396
      semester_id: semesters.insertedIds[0],
      grade: "C+"
    },
    {
      student_id: students.insertedIds[2],
      course_id: courses.insertedIds[2], // CS235
      semester_id: semesters.insertedIds[0],
      grade: "A+"
    },
    {
      student_id: students.insertedIds[2],
      course_id: courses.insertedIds[3], // CS408
      semester_id: semesters.insertedIds[0],
      grade: "B+"
    },
    {
      student_id: students.insertedIds[3],
      course_id: courses.insertedIds[2],
      semester_id: semesters.insertedIds[0],
      grade: "C"
    },
    {
      student_id: students.insertedIds[3],
      course_id: courses.insertedIds[3],
      semester_id: semesters.insertedIds[0],
      grade: "F"
    },
    {
      student_id: students.insertedIds[4],
      course_id: courses.insertedIds[2],
      semester_id: semesters.insertedIds[0],
      grade: "B"
    },
    {
      student_id: students.insertedIds[4],
      course_id: courses.insertedIds[3],
      semester_id: semesters.insertedIds[0],
      grade: "D"
    },
    {
      student_id: students.insertedIds[5],
      course_id: courses.insertedIds[0],
      semester_id: semesters.insertedIds[1],
      grade: "D"
    },
    {
      student_id: students.insertedIds[5],
      course_id: courses.insertedIds[1],
      semester_id: semesters.insertedIds[1],
      grade: "B"
    },
    {
      student_id: students.insertedIds[6],
      course_id: courses.insertedIds[2],
      semester_id: semesters.insertedIds[1],
      grade: "B+"
    },
    {
      student_id: students.insertedIds[6],
      course_id: courses.insertedIds[3],
      semester_id: semesters.insertedIds[1],
      grade: "A"
    },
    {
      student_id: students.insertedIds[7],
      course_id: courses.insertedIds[2],
      semester_id: semesters.insertedIds[1],
      grade: "A"
    },
    {
      student_id: students.insertedIds[7],
      course_id: courses.insertedIds[3],
      semester_id: semesters.insertedIds[1],
      grade: "D"
    },
    {
      student_id: students.insertedIds[8],
      course_id: courses.insertedIds[0],
      semester_id: semesters.insertedIds[1],
      grade: "F"
    },
    {
      student_id: students.insertedIds[8],
      course_id: courses.insertedIds[4],
      semester_id: semesters.insertedIds[1],
      grade: "A"
    },
    {
      student_id: students.insertedIds[9],
      course_id: courses.insertedIds[2],
      semester_id: semesters.insertedIds[1],
      grade: "B"
    },
    {
      student_id: students.insertedIds[9],
      course_id: courses.insertedIds[3],
      semester_id: semesters.insertedIds[1],
      grade: "C+"
    }
  ],{session});
  await session.commitTransaction();
  console.log("Data inserted successfully");
}
catch(error){
  await session.abortTransaction();
  console.log("Failed to insert data");
}
finally{
  session.endSession();
}



// export {students,courses,semesters,enrollments}

process.exit()