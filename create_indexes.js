import { connection } from "./db.js"

const db = await connection()

await db.collection("students").createIndex(
    { email: 1 },
    { unique: true }
);


await db.collection("enrollments").createIndex(
    { student_id: 1, course_id: 1, semester_id: 1 },
    { unique: true }
);

console.log("indexes created")
process.exit()

