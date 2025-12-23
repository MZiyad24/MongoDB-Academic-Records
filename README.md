# MongoDB Academic Records System

A MongoDB-based university database system demonstrating NoSQL design principles, including document modeling (embedding vs. referencing), complex aggregation pipelines, and indexing strategies.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema and Design Decisions](#database-schema-and-design-decisions)
3. [Embedding vs. Referencing](#embedding-vs-referencing)
4. [Aggregation Pipelines](#aggregation-pipelines)
5. [Installation and Setup](#installation-and-setup)
6. [Usage](#usage)
7. [Project Structure](#project-structure)

## Overview

This project manages academic records for a university system, including students, courses, semesters, and enrollments. It showcases MongoDB operations such as:

- Document insertion with transactions
- Query operations (find, update, delete)
- Complex aggregation pipelines with $lookup, $group, and $project
- Index creation for performance optimization
- Grade conversion from letter grades to numeric values

## Database Schema and Design Decisions

### Collections

#### 1. **students** Collection

```javascript
{
  _id: ObjectId,
  fname: String,
  lname: String,
  email: String (unique),
  level: Number,
  GPA: Number,
  department: {
    faculty: String,
    department_name: String
  }
}
```

**Design Decisions:**

- **Email uniqueness**: Enforced via unique index to prevent duplicate student records
- **Department embedding**: Department information is embedded within each student document
- **GPA storage**: Stored as a numeric value for easy querying and sorting
- **Level field**: Represents academic year (e.g., 3 = third year, 4 = fourth year)

#### 2. **courses** Collection

```javascript
{
  _id: ObjectId,
  course_name: String,
  corse_code: String,
  department_name: String
}
```

**Design Decisions:**

- **Separate collection**: Courses are stored separately as they are referenced by multiple enrollments
- **Department association**: Each course belongs to a department (IS or CS)
- **Course code**: Unique identifier for each course (e.g., "IS417", "CS235")

#### 3. **semesters** Collection

```javascript
{
  _id: ObjectId,
  semester_name: String
}
```

**Design Decisions:**

- **Simple structure**: Only stores semester name (e.g., "Fall 2025", "Summer 2025")
- **Referenced by enrollments**: Multiple enrollments reference the same semester
- **Minimal data**: No additional metadata needed for this use case

#### 4. **enrollments** Collection

```javascript
{
  _id: ObjectId,
  student_id: ObjectId (references students._id),
  course_id: ObjectId (references courses._id),
  semester_id: ObjectId (references semesters._id),
  grade: String (A+, A, B+, B, C+, C, D+, D, F)
}
```

**Design Decisions:**

- **Junction collection**: Acts as a many-to-many relationship between students, courses, and semesters
- **Compound unique index**: Prevents duplicate enrollments (same student, course, and semester)
- **Letter grades**: Uses letter grade system (A+, A, B+, B, C+, C, D+, D, F) instead of numeric grades
- **All relationships referenced**: Uses ObjectId references for all foreign keys

### Indexes

1. **students.email**: Unique index to ensure email uniqueness
2. **enrollments (student_id, course_id, semester_id)**: Compound unique index to prevent duplicate enrollments

## Embedding vs. Referencing

### Where Embedding Was Used

#### **Department Information in Students Collection**

The `department` object is **embedded** within each student document:

```javascript
{
  fname: "Ziyad",
  lname: "Mohammed",
  department: {
    faculty: "Computer Science",
    department_name: "IS"
  }
}
```

**Why Embedding?**

1. **Frequently accessed together**: Department information is almost always needed when querying student data
2. **Small, stable data**: Department information rarely changes and is small in size
3. **No independent existence**: Department data doesn't need to be queried independently in this system
4. **Performance**: Eliminates the need for a $lookup operation when retrieving student information with department
5. **Atomic updates**: Student and department information can be updated together atomically

**Trade-offs:**

- **Data duplication**: Department information is duplicated across multiple student documents
- **Update complexity**: If department names change, multiple documents need updating (though this is rare)

### Where Referencing Was Used

#### **1. Enrollments → Students, Courses, Semesters**

The `enrollments` collection uses **references** (ObjectIds) to link to other collections:

```javascript
{
  student_id: ObjectId("..."),
  course_id: ObjectId("..."),
  semester_id: ObjectId("..."),
  grade: "A"
}
```

**Why Referencing?**

1. **Many-to-many relationships**: A student can enroll in multiple courses, and a course can have multiple students
2. **Independent updates**: Course, student, or semester information can be updated without affecting enrollment records
3. **Query flexibility**: Can query enrollments independently or join with related collections using $lookup

## Aggregation Pipelines

The project includes four aggregation pipelines in `aggregations.js`, each demonstrating different MongoDB aggregation capabilities.

### 1. Student Transcript

**Purpose**: Generate a complete transcript showing all courses and grades for each student.`

**Pipeline Stages Explained:**

1. **$lookup (enrollments)**: Joins students with their enrollments using student_id
2. **$unwind (enrollments)**: Deconstructs the enrollments array, creating one document per enrollment
3. **$lookup (courses)**: Joins enrollments with courses using course_id
4. **$unwind (course)**: Deconstructs the course array (single course per enrollment)
5. **$project**: Selects and formats output fields (student name, course name, grade)

**Use Case**: Generate official student transcripts for academic records.

### 2. Semester Statistics (Semester GPA Report)

**Purpose**: Calculate GPA for each student per semester by converting letter grades to numeric values.

**Pipeline Stages Explained:**

1. **$match**: Filters enrollments that have grades
2. **$addFields with $switch**: Converts letter grades (A+, A, B+, etc.) to numeric values (4.3, 4.0, 3.3, etc.)
3. **$group**: Groups by student_id and semester_id, calculating average GPA per semester
4. **$lookup (students)**: Joins with students collection to get student names
5. **$unwind (student)**: Deconstructs student array
6. **$lookup (semesters)**: Joins with semesters collection to get semester names
7. **$unwind (semester)**: Deconstructs semester array
8. **$project**: Formats output with rounded GPA values

**Use Case**: Track student performance per semester, identify students who need academic support.

### 3. Course Statistics

**Purpose**: Calculate average grade and enrollment count for each course.

**Pipeline Stages Explained:**

1. **$addFields with $switch**: Converts letter grades to numeric values (same as Semester Statistics)
2. **$group**: Groups by course_id, counting enrollments and calculating average grade
3. **$lookup (courses)**: Joins with courses collection to get course names
4. **$unwind (course)**: Deconstructs course array
5. **$project**: Formats output with course name, rounded average grade, and student count

**Use Case**: Analyze course difficulty, identify courses with consistently low/high grades, plan course offerings.

### 4. Top Performing Students

**Purpose**: Identify the top 3 students by overall GPA.

**Pipeline Stages Explained:**

1. **$sort**: Sorts students by GPA in descending order (highest first)
2. **$limit**: Limits results to top 3 students
3. **$project**: Formats output by concatenating first and last name, and including GPA

**Use Case**: Identify honor roll students, award scholarships, recognize academic excellence.

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud instance like MongoDB Atlas)
- npm or yarn package manager

### Installation Steps

1. **Clone or download this repository**

2. **Install dependencies:**

```bash
npm install
```

3. **Create a `.env` file** in the root directory and add your MongoDB connection string:

```
MONGO_URI=your_mongodb_connection_string_here
```

## Usage

### 1. Create Indexes (Run first)

```bash
node create_indexes.js
```

Creates unique indexes on student emails and enrollment combinations.

### 2. Insert Sample Data

```bash
node insert_data.js
```

Inserts sample students, courses, semesters, and enrollments using MongoDB transactions for data consistency.

### 3. Run Queries

```bash
node queries.js
```

Executes example queries including:

- Finding students by department
- Filtering by GPA
- Updating student information
- Deleting enrollments
- Listing courses per student

### 4. Run Aggregations

```bash
node aggregations.js
```

Executes all four aggregation pipelines:

- Student Transcript
- Semester GPA Report
- Course Statistics
- Top Performing Students

## Project Structure

```
MongoDB-Academic-Records/
├── db.js                 # Database connection configuration
├── test.js               # Connection testing utility
├── insert_data.js        # Sample data insertion with transactions
├── queries.js            # Example query operations
├── create_indexes.js     # Index creation script
├── aggregations.js       # Aggregation pipeline examples
├── package.json          # Project dependencies
└── README.md            # This file
```

## Key Features

- **Transaction Support**: Data insertion uses MongoDB transactions to ensure atomicity
- **Letter Grade System**: Uses A+, A, B+, B, C+, C, D+, D, F grading system
- **Grade Conversion**: Aggregation pipelines convert letter grades to numeric values for calculations
- **Referential Integrity**: Unique indexes prevent duplicate enrollments
- **Complex Joins**: Demonstrates $lookup operations for joining collections
- **Data Aggregation**: Advanced grouping and statistical calculations
