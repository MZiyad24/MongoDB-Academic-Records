# MongoDB Academic Records System

A simple MongoDB-based university database system that demonstrates NoSQL database operations, including document modeling, queries, aggregations, and indexing strategies.

## Overview

This project manages academic records including students, courses, semesters, and enrollments. It showcases MongoDB operations such as:
- Document insertion and data modeling
- Query operations (find, update, delete)
- Aggregation pipelines
- Index creation for performance optimization

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- npm or yarn package manager

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your MongoDB connection string:
```
MONGO_URI=your_mongodb_connection_string_here
```

## Project Structure

- `db.js` - Database connection configuration
- `insert_data.js` - Script to insert sample data (students, courses, semesters, enrollments)
- `queries.js` - Example query operations
- `create_indexes.js` - Script to create database indexes
- `aggregations.js` - Aggregation pipeline examples
- `test.js` - Database connection testing

## Usage

### 1. Create Indexes (Run first)
```bash
node create_indexes.js
```

### 2. Insert Sample Data
```bash
node insert_data.js
```

### 3. Run Queries
```bash
node queries.js
```

### 4. Run Aggregations
```bash
node aggregations.js
```

## Database Schema

- **students**: Student information (name, email, GPA, level, department)
- **courses**: Course details (name, code, department)
- **semesters**: Semester information
- **enrollments**: Student course enrollments with grades

## Features

- Student management with department information
- Course enrollment tracking
- GPA-based queries
- Department filtering
- Grade management

## Notes

- The database name is set to `schooldb` in `db.js`
- Make sure your MongoDB instance is running before executing any scripts
- The project uses ES6 modules (`type: "module"` in package.json)
