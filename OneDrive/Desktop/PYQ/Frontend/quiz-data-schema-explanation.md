# Quiz Data Storage Schema & Flow

## 📊 Complete Data Flow

### 1. **User Takes Quiz** → **Quiz Component**
- User answers questions
- Quiz component collects answers in `answers` state
- On completion, calls `saveQuizResultToFirebase()`

### 2. **Data Preparation** → **Quiz.jsx**
```javascript
const resultData = {
  userId: userId,                    // Firebase user ID
  userEmail: user.email,            // User's email
  userName: user.name,              // User's display name
  subjectCode: examId,              // e.g., 'ssc-cgl'
  subjectName: subject?.name,       // e.g., 'SSC CGL'
  year: year,                       // e.g., '2024'
  score: score,                     // Number correct
  totalQuestions: questions.length, // Total questions
  percentage: percentage,           // Calculated percentage
  timeSpent: timeSpent,            // Time in seconds
  answers: [...],                  // Detailed answer array
  correctAnswers: [...],           // All correct answers
  difficulty: 'Medium'             // Difficulty level
}
```

### 3. **Firebase Storage** → **quizResults Collection**

## 🗄️ Firebase Schema Structure

### **Collection: `quizResults`**
Each document represents **ONE quiz attempt** by a user.

```javascript
// Document ID: Auto-generated (e.g., "abc123def456")
{
  // User Information
  userId: "firebase_user_id_123",
  userEmail: "user@example.com", 
  userName: "John Doe",
  
  // Quiz Information
  subjectCode: "ssc-cgl",
  subjectName: "SSC CGL",
  year: "2024",
  
  // Performance Metrics
  score: 8,                    // Correct answers
  totalQuestions: 10,          // Total questions
  percentage: 80,              // Calculated percentage
  timeSpent: 300,             // Time in seconds
  
  // Detailed Answer Data
  answers: [
    {
      questionIndex: 0,
      question: "What is the capital of India?",
      options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
      userAnswer: 1,           // User selected option index
      selectedAnswer: 1,       // Same as userAnswer
      correctAnswer: 1,        // Correct option index
      isCorrect: true
    },
    {
      questionIndex: 1,
      question: "Which is the largest state?",
      options: ["Rajasthan", "Maharashtra", "Uttar Pradesh", "Madhya Pradesh"],
      userAnswer: 0,
      selectedAnswer: 0,
      correctAnswer: 2,
      isCorrect: false
    }
    // ... more questions
  ],
  
  // Metadata
  correctAnswers: [1, 2, 0, 3, 1, 2, 0, 1, 3, 2], // All correct answers
  difficulty: "Medium",
  timestamp: FirestoreTimestamp,  // When quiz was completed
  createdAt: FirestoreTimestamp,  // When record was created
  updatedAt: FirestoreTimestamp  // When record was last updated
}
```

## 📱 Local Storage (Backup)

### **localStorage: `quiz_history`**
Array of quiz attempts for immediate access:

```javascript
[
  {
    id: 1694567890123,        // Unique timestamp ID
    year: "2024",
    correct: 8,
    wrong: 2,
    accuracy: 80,
    totalQuestions: 10,
    date: "9/13/2025",        // Formatted date
    timestamp: "2025-09-13T10:30:00.000Z",
    results: [                // Same as Firebase answers array
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        selectedAnswer: 1,
        correctAnswer: 1,
        isCorrect: true
      }
      // ... more questions
    ]
  }
  // ... more quiz attempts
]
```

## 🔄 Data Flow Summary

### **When User Completes Quiz:**

1. **Quiz.jsx** → Collects answers
2. **saveQuizResultToFirebase()** → Prepares data
3. **Firebase** → Stores in `quizResults` collection
4. **localStorage** → Stores in `quiz_history` array
5. **Profile.jsx** → Displays results from both sources

### **Multiple Test Results Storage:**

- **Each quiz attempt** = **One document** in Firebase
- **User can have unlimited** quiz attempts
- **All attempts linked** by `userId` field
- **Profile page shows** all user's quiz history
- **Data persists** across sessions and devices

## 🎯 Key Benefits

✅ **Scalable**: Each quiz is a separate document
✅ **Queryable**: Can filter by user, subject, year, date
✅ **Detailed**: Stores complete question/answer data
✅ **Backup**: localStorage provides offline access
✅ **Analytics**: Can generate statistics and reports

## 📊 Example Queries

```javascript
// Get all quiz results for a user
getUserQuizResults(userId)

// Get quiz results for specific subject
getQuizResultsForSubjectYear(userId, 'ssc-cgl', '2024')

// Get user statistics
getUserStatistics(userId)
```

This schema allows storing unlimited quiz attempts per user with complete question-level detail for analysis and reporting.
