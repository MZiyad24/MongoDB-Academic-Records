import { connection } from "./db.js";

async function queries() {
  let db;
  try {
    db = await connection();

    // 1. Find all students in IS department - Enhanced with better projection
    const isStudents = await db.collection("students").find({
      "department.department_name": "IS"
    })
    .project({
      _id: 1,
      fname: 1,
      lname: 1,
      email: 1,
      level: 1,
      GPA: 1,
      department: 1
    })
    .sort({ GPA: -1 })
    .toArray();

    const formattedISStudents = isStudents.map(student => ({
      student_id: student._id,
      name: `${student.fname} ${student.lname}`,
      email: student.email,
      level: student.level,
      GPA: student.GPA,
      department: student.department.department_name,
      faculty: student.department.faculty
    }));

    console.log("\n IS Department Students");
    console.log(JSON.stringify(formattedISStudents, null, 2));
    console.log(`Total IS students: ${formattedISStudents.length}`);

    // 2. Find students with GPA > X - Enhanced with configurable threshold
    const gpaThreshold = 3.5;
    const highGPAStudents = await db.collection("students").find({
      GPA: { $gt: gpaThreshold }
    })
    .project({
      _id: 1,
      fname: 1,
      lname: 1,
      email: 1,
      level: 1,
      GPA: 1,
      department: 1
    })
    .sort({ GPA: -1 })
    .toArray();

    const formattedHighGPAStudents = highGPAStudents.map(student => ({
      student_id: student._id,
      name: `${student.fname} ${student.lname}`,
      email: student.email,
      level: student.level,
      GPA: student.GPA,
      department: student.department.department_name
    }));

    console.log(`\n=== Students with GPA > ${gpaThreshold} ===`);
    console.log(JSON.stringify(formattedHighGPAStudents, null, 2));
    console.log(`Total high GPA students: ${formattedHighGPAStudents.length}`);

    // 3. Update a student email - Enhanced with validation and result checking
    const oldEmail = "mziyad154@gmail.com";
    const newEmail = "ziyad.updated@gmail.com";
    
    const updateResult = await db.collection("students").updateOne(
      { email: oldEmail },
      { $set: { email: newEmail } }
    );

    if (updateResult.matchedCount === 0) {
      console.log(`\n No student found with email: ${oldEmail}`);
    } else {
      console.log(`\n Successfully updated email from ${oldEmail} to ${newEmail}`);
      console.log(`\n Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
    }

    // 4. Delete a dropped enrollment - Enhanced with better filtering
    // Note: Only delete one F grade enrollment, not all F grades
    const deleteResult = await db.collection("enrollments").deleteOne({
      grade: "F"
    });

    console.log(`Deleted enrollments with F grade: ${deleteResult.deletedCount}`);
    if (deleteResult.deletedCount > 0) {
      console.log("Note: Only one enrollment was deleted. Use deleteMany() to delete all F grades.");
    }

    // 5. List courses taken by all students - Enhanced with better structure
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
        $unwind: { path: "$course", preserveNullAndEmptyArrays: false }
      },
      {
        $lookup: {
          from: "students",
          localField: "student_id",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: { path: "$student", preserveNullAndEmptyArrays: false }
      },
      {
        $group: {
          _id: "$student_id",
          student_name: { $first: { $concat: ["$student.fname", " ", "$student.lname"] } },
          student_email: { $first: "$student.email" },
          courses: { 
            $push: {
              course_name: "$course.course_name",
              course_code: "$course.course_code",
              grade: "$grade"
            }
          },
          total_courses: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          student_id: "$_id",
          student_name: 1,
          student_email: 1,
          total_courses: 1,
          courses: 1
        }
      },
      {
        $sort: { student_name: 1 }
      }
    ]).toArray();

    console.log(JSON.stringify(allStudentsCourses, null, 2));
    console.log(`Total students with courses: ${allStudentsCourses.length}`);

    // 6. List courses for a specific student - Enhanced with better error handling
    const sampleStudent = await db.collection("students").findOne(
      { level: 3 },
      { projection: { _id: 1, fname: 1, lname: 1, email: 1 } }
    );

    if (!sampleStudent) {
      console.log("No student found with level 3");
    } else {
      const studentID = sampleStudent._id;
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
          $unwind: { path: "$course", preserveNullAndEmptyArrays: false }
        },
        {
          $lookup: {
            from: "semesters",
            localField: "semester_id",
            foreignField: "_id",
            as: "semester"
          }
        },
        {
          $unwind: { path: "$semester", preserveNullAndEmptyArrays: false }
        },
        {
          $project: {
            _id: 0,
            course_name: "$course.course_name",
            course_code: "$course.course_code",
            semester: "$semester.semester_name",
            grade: "$grade"
          }
        },
        {
          $sort: { semester: 1, course_name: 1 }
        }
      ]).toArray();

      console.log(`\n Courses taken by ${sampleStudent.fname} ${sampleStudent.lname} (${sampleStudent.email}) `);
      console.log(JSON.stringify(specificStudentCourses, null, 2));
      console.log(`Total courses: ${specificStudentCourses.length}`);
    }

    // Return structured results
    return {
      success: true,
      data: {
        isStudents: formattedISStudents,
        highGPAStudents: formattedHighGPAStudents,
        allStudentsCourses,
        emailUpdate: {
          matched: updateResult.matchedCount,
          modified: updateResult.modifiedCount
        },
        deletedEnrollments: deleteResult.deletedCount
      }
    };

  } catch (error) {
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

queries().catch(console.error);
