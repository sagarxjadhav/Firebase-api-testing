import React, { useState, useEffect } from 'react';
import { 
  getAllSubjects, 
  getYearsForSubject, 
  getQuestionsForSubjectYear,
  bulkAddSubjectData,
  addQuestionsForSubjectYear,
  getSubjectByCode
} from '../firebase/dataService';
import { addAllDataNewStructure } from '../scripts/addDataNewStructure';

const DataManager = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // New exam form state
  const [newExam, setNewExam] = useState({
    name: '',
    code: '',
    description: '',
    category: 'general'
  });

  // Mapping between display names and Firebase codes
  const examMapping = {
    'JEE Mains': 'jee-mains',
    'JEE Advanced': 'jee-advanced', 
    'NEET': 'neet',
    'UPSC Prelims': 'upsc-prelims',
    'GATE': 'gate',
    'CAT': 'cat',
    'SSC CGL': 'ssc-cgl',
    'Banking': 'banking',
    'Railway': 'railway',
    'Other': 'other'
  };

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    questionImage: '',
    explanation: ''
  });

  useEffect(() => {
    loadExams();
    // Auto-add data if no subjects exist
    const autoAddData = async () => {
      try {
        const subjectsData = await getAllSubjects();
        if (subjectsData.length === 0) {
          console.log('No subjects found, auto-adding initial data...');
          setMessage('No data found. Adding initial data automatically...');
          await addAllDataNewStructure();
          await loadExams(); // Reload after adding
        }
      } catch (error) {
        console.error('Error checking for existing data:', error);
      }
    };
    
    // Run after a short delay to ensure Firebase is initialized
    setTimeout(autoAddData, 2000);
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const subjectsData = await getAllSubjects();
      setExams(subjectsData);
    } catch (error) {
      setMessage(`Error loading subjects: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadYears = async (subjectCode) => {
    try {
      const years = await getYearsForSubject(subjectCode);
      return years;
    } catch (error) {
      setMessage(`Error loading years: ${error.message}`);
      return [];
    }
  };

  const loadQuestions = async (subjectCode, year) => {
    try {
      setLoading(true);
      const questionsData = await getQuestionsForSubjectYear(subjectCode, year);
      setQuestions(questionsData);
    } catch (error) {
      setMessage(`Error loading questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExamChange = async (e) => {
    const subjectCode = e.target.value;
    setSelectedExam(subjectCode);
    setSelectedYear('');
    setQuestions([]);
    
    if (subjectCode) {
      const years = await loadYears(subjectCode);
      // You might want to set years in state for a dropdown
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    
    if (selectedExam && year) {
      loadQuestions(selectedExam, year);
    }
  };

  const handleAddDataNewStructure = async () => {
    try {
      setLoading(true);
      setMessage('Adding data using new structure: data -> subjects -> years -> questions...');
      const results = await addAllDataNewStructure();
      
      const failedAdditions = results.filter(result => !result.success);
      if (failedAdditions.length === 0) {
        setMessage('✅ All data added successfully using new structure! Your app is now ready to use.');
      } else {
        setMessage(`Data addition completed with ${failedAdditions.length} failures. Check console for details.`);
      }
      
      await loadExams(); // Refresh subjects list
    } catch (error) {
      setMessage(`Error adding data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const subjectData = {
        ...newExam,
        questions: {} // Start with empty questions
      };
      const result = await bulkAddSubjectData(subjectData);
      setMessage(`Subject added successfully! ID: ${result.subjectId}`);
      setNewExam({ name: '', code: '', description: '', category: 'general' });
      await loadExams();
    } catch (error) {
      setMessage(`Error adding subject: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedExam || !selectedYear) {
      setMessage('Please select a subject and year first');
      return;
    }

    try {
      setLoading(true);
      const questionData = {
        q: newQuestion.question,
        options: newQuestion.options,
        ans: newQuestion.correctAnswer,
        questionImage: newQuestion.questionImage || null,
        explanation: newQuestion.explanation || null
      };

      await addQuestionsForSubjectYear(selectedExam, selectedYear, [questionData]);
      setMessage('Question added successfully!');
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        questionImage: '',
        explanation: ''
      });
      
      // Reload questions
      await loadQuestions(selectedExam, selectedYear);
    } catch (error) {
      setMessage(`Error adding question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Exam Data Manager</h1>
        
        {message && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {message}
          </div>
        )}

        {/* Data Setup Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Setup - New Structure</h2>
          <div className="space-x-4 mb-4">
            <button
              onClick={handleAddDataNewStructure}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Adding...' : '🚀 ADD DATA (New Structure)'}
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800 font-medium">
              📊 <strong>New Structure:</strong> data → subjects → years → questions
            </p>
            <p className="text-xs text-blue-700 mt-1">
              This will create: data/upsc-prelims/2025/questions and data/ssc-cgl/2024/questions
            </p>
          </div>
        </div>

         {/* Add New Subject Section */}
         <div className="bg-white rounded-lg shadow p-6 mb-8">
           <h2 className="text-xl font-semibold mb-4">Add New Subject</h2>
           <form onSubmit={handleAddSubject} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Subject Type</label>
                 <select
                   value={newExam.code}
                   onChange={(e) => {
                     const selectedType = e.target.value;
                     const displayName = Object.keys(examMapping).find(key => examMapping[key] === selectedType);
                     setNewExam({
                       ...newExam, 
                       code: selectedType,
                       name: displayName || ''
                     });
                   }}
                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                   required
                 >
                   <option value="">Choose subject type...</option>
                   {Object.keys(examMapping).map(displayName => (
                     <option key={displayName} value={examMapping[displayName]}>
                       {displayName}
                     </option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Subject Name (Auto-filled)</label>
                 <input
                   type="text"
                   value={newExam.name}
                   readOnly
                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                 />
               </div>
             </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newExam.description}
                onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newExam.category}
                onChange={(e) => setNewExam({...newExam, category: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="general">General</option>
                <option value="civil-services">Civil Services</option>
                <option value="ssc">SSC</option>
                <option value="banking">Banking</option>
                <option value="defense">Defense</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Subject'}
            </button>
          </form>
        </div>

        {/* View/Manage Questions Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">View Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Subject</label>
              <select
                value={selectedExam}
                onChange={handleExamChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Choose a subject...</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.code}>{exam.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Year</label>
              <input
                type="text"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder="Enter year (e.g., 2025)"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={() => selectedExam && selectedYear && loadQuestions(selectedExam, selectedYear)}
            disabled={!selectedExam || !selectedYear || loading}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 mb-4"
          >
            {loading ? 'Loading...' : 'Load Questions'}
          </button>

          {questions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Questions ({questions.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((q, index) => (
                  <div key={q.id} className="border border-gray-200 rounded p-4">
                    <p className="font-medium">Q{index + 1}: {q.question}</p>
                    <div className="mt-2 space-y-1">
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className={`flex items-center ${
                          optIndex === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'
                        }`}>
                          <span className="w-6">{String.fromCharCode(65 + optIndex)}.</span>
                          <span>{option}</span>
                          {optIndex === q.correctAnswer && <span className="ml-2">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add New Question Section */}
        {selectedExam && selectedYear && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question</label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center mt-2">
                    <span className="w-6">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({...newQuestion, options: newOptions});
                      }}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={newQuestion.correctAnswer === index}
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                      className="ml-2"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Question Image URL (optional)</label>
                <input
                  type="url"
                  value={newQuestion.questionImage}
                  onChange={(e) => setNewQuestion({...newQuestion, questionImage: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Explanation (optional)</label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="2"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Question'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataManager;
