/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, onSnapshot, serverTimestamp, orderBy, deleteDoc, writeBatch, getDocFromServer } from 'firebase/firestore';
import { GeminiService, Question, ExamType, EvaluationResult } from './services/geminiService';
import { 
  BookOpen, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Upload, 
  Link as LinkIcon, 
  LogOut, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  Play,
  Eye,
  Trophy,
  Copy,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

// --- Types ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (error instanceof Error && error.message.includes('insufficient permissions')) {
    toast.error('Database access denied. Please check security rules.');
  }
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

type View = 'landing' | 'teacher-login' | 'teacher-dashboard' | 'create-exam' | 'student-join' | 'student-instructions' | 'student-exam' | 'exam-result';

interface Exam {
  id: string;
  title: string;
  type: ExamType;
  durationMinutes: number;
  questions: Question[];
  sessionCode: string;
  cameraRequired: boolean;
}

interface Submission {
  id: string;
  examId: string;
  studentName: string;
  answers: Record<string, any>;
  violations: number;
  status: 'in-progress' | 'submitted';
  score: number;
  essayEvaluations?: Record<string, EvaluationResult>;
  submittedAt?: any;
}

interface Violation {
  id: string;
  examId: string;
  submissionId: string;
  studentName: string;
  reason: string;
  screenshot?: string;
  timestamp: any;
}

// --- Views ---

interface CreateExamViewProps {
  onBack: () => void;
  onCreate: (examData: Omit<Exam, 'id' | 'sessionCode'>) => void;
  isLoading: boolean;
}

const CreateExamView: React.FC<CreateExamViewProps> = ({ onBack, onCreate, isLoading }) => {
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<ExamType>('mcq');
  const [duration, setDuration] = useState(60);
  const [cameraRequired, setCameraRequired] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInputModal, setAiInputModal] = useState<{ type: 'text' | 'url', isOpen: boolean }>({ type: 'text', isOpen: false });
  const [aiInputValue, setAiInputValue] = useState('');

  const handleManualAdd = () => {
    const newQ: Question = {
      id: Math.random().toString(36).substring(7),
      text: '',
      type: examType,
      options: examType === 'mcq' ? ['', '', '', ''] : undefined,
      correctOptionIndex: examType === 'mcq' ? 0 : undefined,
      idealAnswer: examType === 'essay' ? '' : undefined
    };
    setQuestions([...questions, newQ]);
  };

  const handleAiGenerate = async () => {
    if (!aiInputValue) return;
    
    setIsGenerating(true);
    setAiInputModal({ ...aiInputModal, isOpen: false });
    try {
      let generated: Question[] = [];
      if (aiInputModal.type === 'text') {
        generated = await GeminiService.generateQuestionsFromText(aiInputValue, examType);
      } else {
        generated = await GeminiService.generateQuestionsFromUrl(aiInputValue, examType);
      }
      setQuestions([...questions, ...generated]);
      toast.success(`Generated ${generated.length} questions!`);
      setAiInputValue('');
    } catch (err) {
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast.error('Word documents (.docx) are not directly supported. Please convert to PDF or TXT.');
      return;
    }

    setIsGenerating(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = (event.target?.result as string).split(',')[1];
          const generated = await GeminiService.generateQuestionsFromFile(base64, file.type, examType);
          setQuestions([...questions, ...generated]);
          toast.success(`Generated ${generated.length} questions from document!`);
        } catch (err) {
          console.error("Generation Error:", err);
          toast.error('Failed to generate from document. Try a PDF or TXT file.');
        } finally {
          setIsGenerating(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Failed to process document');
      setIsGenerating(false);
    }
  };

  const isFormValid = title && questions.length > 0 && questions.every(q => {
    if (q.type === 'mcq') {
      return q.text && q.options && q.options.every(opt => opt);
    }
    return q.text && q.idealAnswer;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-500" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button 
                onClick={() => {
                  setExamType('mcq');
                  setQuestions([]);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${examType === 'mcq' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                MCQ
              </button>
              <button 
                onClick={() => {
                  setExamType('essay');
                  setQuestions([]);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${examType === 'essay' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Essay
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final Mathematics 101"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Duration (Minutes)</label>
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Camera Required</label>
            <button 
              onClick={() => setCameraRequired(!cameraRequired)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                cameraRequired 
                  ? 'bg-blue-50 border-blue-200 text-brand-blue' 
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className={`w-4 h-4 ${cameraRequired ? 'text-brand-blue' : 'text-gray-400'}`} />
                <span className="font-bold text-sm">{cameraRequired ? 'Required' : 'Optional'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${cameraRequired ? 'bg-brand-blue' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${cameraRequired ? 'right-1' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-gray-900">Questions ({questions.length})</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setAiInputModal({ type: 'text', isOpen: true })}
                disabled={isGenerating}
                className="flex items-center gap-2 text-brand-blue bg-blue-50 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> RMI & Mifotra Text
              </button>
              <label className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition-all cursor-pointer">
                <Upload className="w-4 h-4" /> RMI & Mifotra Doc
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
              </label>
              <button 
                onClick={() => setAiInputModal({ type: 'url', isOpen: true })}
                disabled={isGenerating}
                className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-all disabled:opacity-50"
              >
                <LinkIcon className="w-4 h-4" /> RMI & Mifotra Link
              </button>
              <button 
                onClick={handleManualAdd}
                className="flex items-center gap-2 text-brand-gold bg-amber-50 px-4 py-2 rounded-lg font-semibold hover:bg-amber-100 transition-all"
              >
                <Plus className="w-4 h-4" /> Manual
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 bg-gray-50 rounded-2xl space-y-4 relative group">
                <div className="flex gap-4">
                  <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-brand-blue shadow-sm">{idx + 1}</span>
                  <input 
                    type="text" 
                    value={q.text}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[idx].text = e.target.value;
                      setQuestions(newQs);
                    }}
                    placeholder="Enter question text..."
                    className="flex-1 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none py-1"
                  />
                </div>
                {q.type === 'mcq' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                    {q.options?.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => {
                            const newQs = [...questions];
                            newQs[idx].correctOptionIndex = optIdx;
                            setQuestions(newQs);
                          }}
                          className="w-4 h-4 text-brand-blue"
                        />
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => {
                            const newQs = [...questions];
                            if (newQs[idx].options) {
                              newQs[idx].options![optIdx] = e.target.value;
                              setQuestions(newQs);
                            }
                          }}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 bg-white px-3 py-2 rounded-lg border border-gray-100 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-12 space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Ideal Answer / Rubric</label>
                    <textarea 
                      value={q.idealAnswer}
                      onChange={(e) => {
                        const newQs = [...questions];
                        newQs[idx].idealAnswer = e.target.value;
                        setQuestions(newQs);
                      }}
                      placeholder="Enter the ideal answer or key points for evaluation..."
                      className="w-full bg-white p-3 rounded-xl border border-gray-100 text-sm outline-none focus:ring-1 focus:ring-brand-blue h-24 resize-none"
                    />
                  </div>
                )}
                <button 
                  onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onCreate({ title, type: examType, durationMinutes: duration, questions, cameraRequired })}
          disabled={!isFormValid || isGenerating || isLoading}
          className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
        >
          {isGenerating ? 'Generating Questions...' : isLoading ? 'Creating Exam...' : 'Finalize and Generate Session Code'}
        </button>
      </div>

      <AnimatePresence>
        {aiInputModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl max-w-lg w-full space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {aiInputModal.type === 'text' ? 'Generate from Text' : 'Generate from URL'}
                </h3>
                <p className="text-gray-500">
                  {aiInputModal.type === 'text' 
                    ? 'Paste the content you want to create questions from.' 
                    : 'Enter the URL of the article or document.'}
                </p>
              </div>
              
              <textarea 
                value={aiInputValue}
                onChange={(e) => setAiInputValue(e.target.value)}
                placeholder={aiInputModal.type === 'text' ? 'Paste text here...' : 'https://example.com/article'}
                className="w-full h-40 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setAiInputModal({ ...aiInputModal, isOpen: false })}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAiGenerate}
                  disabled={!aiInputValue}
                  className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-all disabled:opacity-50"
                >
                  Generate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [teacherAuth, setTeacherAuth] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [studentName, setStudentName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [newExamCode, setNewExamCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Teacher View State
  const [exams, setExams] = useState<Exam[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [allViolations, setAllViolations] = useState<Violation[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Student Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [isClearingDb, setIsClearingDb] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // --- Effects ---

  useEffect(() => {
    if (teacherAuth) {
      fetchExams();
      
      // Listen for all submissions
      const subQuery = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
      const unsubscribeSubs = onSnapshot(subQuery, (snapshot) => {
        const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
        setAllSubmissions(subs);
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'submissions'));

      // Listen for violations
      const violationQuery = query(collection(db, 'violations'), where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))); // Last 24 hours
      const unsubscribeViolations = onSnapshot(violationQuery, (snapshot) => {
        const vils = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Violation));
        // Sort by timestamp descending
        vils.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setAllViolations(vils);
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'violations'));

      return () => {
        unsubscribeSubs();
        unsubscribeViolations();
      };
    }
  }, [teacherAuth]);

  useEffect(() => {
    if (view === 'student-exam' && currentExam) {
      const totalSeconds = (currentExam.durationMinutes * 60) / currentExam.questions.length;
      setTimeLeft(Math.floor(totalSeconds));
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion();
            return Math.floor(totalSeconds);
          }
          return prev - 1;
        });
      }, 1000);

      if (currentExam.cameraRequired) {
        startProctoring();
      }

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (currentExam.cameraRequired) {
          stopProctoring();
        }
      };
    }
  }, [view, currentQuestionIndex]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && view === 'student-exam') {
        handleViolation('Tab switch detected!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [view, violations]);

  // Disable Copy, Paste, and Context Menu during exam
  useEffect(() => {
    if (view === 'student-exam') {
      const preventDefault = (e: Event) => {
        e.preventDefault();
        toast.error('Copy/Paste is disabled during the exam!');
      };

      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      window.addEventListener('copy', preventDefault);
      window.addEventListener('paste', preventDefault);
      window.addEventListener('cut', preventDefault);
      window.addEventListener('contextmenu', preventContextMenu);

      return () => {
        window.removeEventListener('copy', preventDefault);
        window.removeEventListener('paste', preventDefault);
        window.removeEventListener('cut', preventDefault);
        window.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [view]);

  // --- Functions ---

  const handleClearDatabase = async () => {
    if (!window.confirm('WARNING: This will permanently delete ALL exams, submissions, and violations. This action cannot be undone. Are you sure?')) {
      return;
    }

    setIsClearingDb(true);
    const toastId = toast.loading('Clearing all database records...');
    
    try {
      const collections = ['exams', 'submissions', 'violations'];
      for (const collName of collections) {
        const q = query(collection(db, collName));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      
      setExams([]);
      setAllSubmissions([]);
      setAllViolations([]);
      toast.success('Database cleared successfully!', { id: toastId });
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error('Failed to clear database.', { id: toastId });
    } finally {
      setIsClearingDb(false);
    }
  };

  const fetchExams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'exams'));
      const fetchedExams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
      setExams(fetchedExams);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'exams');
    }
  };

  const downloadExamResults = async (exam: Exam) => {
    try {
      const q = query(collection(db, 'submissions'), where('examId', '==', exam.id));
      const querySnapshot = await getDocs(q);
      const subs = querySnapshot.docs.map(doc => doc.data() as Submission);

      if (subs.length === 0) {
        toast.info('No submissions yet for this exam.');
        return;
      }

      // Generate CSV
      const headers = ['Student Name', 'Score', 'Total Questions', 'Violations', 'Status', 'Submitted At'];
      const rows = subs.map(s => [
        s.studentName,
        s.score,
        exam.questions.length,
        s.violations,
        s.status,
        s.submittedAt ? new Date(s.submittedAt.seconds * 1000).toLocaleString() : 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `results_${exam.title.replace(/\s+/g, '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Results downloaded successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    }
  };

  const handleTeacherLogin = (password: string) => {
    if (password === 'EXAM@123') {
      setTeacherAuth(true);
      setView('teacher-dashboard');
      toast.success('Welcome back, Teacher!');
    } else {
      toast.error('Invalid password');
    }
  };

  const handleCreateExam = async (examData: Omit<Exam, 'id' | 'sessionCode'>) => {
    setIsGenerating(true); // Reuse isGenerating for creation loading state
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await addDoc(collection(db, 'exams'), {
        ...examData,
        sessionCode: code,
        createdAt: serverTimestamp()
      });
      setNewExamCode(code);
      toast.success(`Exam created successfully!`);
      fetchExams();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'exams');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinExam = async () => {
    if (!studentName || !sessionCode) {
      toast.error('Please enter your name and session code');
      return;
    }

    try {
      const q = query(collection(db, 'exams'), where('sessionCode', '==', sessionCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Invalid session code');
        return;
      }

      const exam = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Exam;
      setCurrentExam(exam);
      
      // Reset student state
      setViolations(0);
      setCurrentQuestionIndex(0);
      setAnswers({});
      
      // Create submission
      const subRef = await addDoc(collection(db, 'submissions'), {
        examId: exam.id,
        studentName,
        answers: {},
        violations: 0,
        status: 'in-progress',
        score: 0,
        createdAt: serverTimestamp()
      });
      
      setCurrentSubmission({
        id: subRef.id,
        examId: exam.id,
        studentName,
        answers: {},
        violations: 0,
        status: 'in-progress',
        score: 0
      });

      setView('student-instructions');
      toast.success('Session joined! Please read the instructions.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  };

  const handleNextQuestion = () => {
    if (!currentExam) return;
    
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  const submitExam = async () => {
    if (!currentSubmission || !currentExam) return;

    stopProctoring();
    let score = 0;
    let essayEvaluations: Record<string, EvaluationResult> = {};

    if (currentExam.type === 'mcq') {
      currentExam.questions.forEach((q) => {
        if (answers[q.id] === q.correctOptionIndex) {
          score++;
        }
      });
    } else {
      // For Essay, we evaluate each answer using RMI & Mifotra
      const loadingToast = toast.loading('System is evaluating your answers...', { duration: Infinity });
      try {
        for (const q of currentExam.questions) {
          const studentAnswer = answers[q.id] || '';
          const evaluation = await GeminiService.evaluateEssayAnswer(q.text, q.idealAnswer || '', studentAnswer);
          essayEvaluations[q.id] = evaluation;
          score += evaluation.score;
        }
      } catch (err) {
        console.error("Evaluation error:", err);
        toast.error('System evaluation failed for some questions.');
      } finally {
        toast.dismiss(loadingToast);
      }
    }

    try {
      await updateDoc(doc(db, 'submissions', currentSubmission.id), {
        answers,
        status: 'submitted',
        score,
        essayEvaluations: currentExam.type === 'essay' ? essayEvaluations : null,
        submittedAt: serverTimestamp()
      });

      setCurrentSubmission(prev => prev ? { ...prev, score, status: 'submitted', essayEvaluations } : null);
      setView('exam-result');
      toast.success('Exam submitted successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${currentSubmission.id}`);
    }
  };

  const handleViolation = async (reason: string, screenshot?: string) => {
    const newViolations = violations + 1;
    setViolations(newViolations);
    toast.warning(`Violation detected: ${reason} (${newViolations}/3)`);

    let finalScreenshot = screenshot;
    
    // If no screenshot provided, try to capture one now
    if (!finalScreenshot && videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 320, 240);
        finalScreenshot = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
      }
    }

    if (currentSubmission && currentExam) {
      try {
        // Update submission count
        await updateDoc(doc(db, 'submissions', currentSubmission.id), {
          violations: newViolations
        });

        // Create violation alert
        await addDoc(collection(db, 'violations'), {
          examId: currentExam.id,
          submissionId: currentSubmission.id,
          studentName: currentSubmission.studentName,
          reason,
          screenshot: finalScreenshot || null,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error logging violation:", error);
      }
    }

    if (newViolations >= 3) {
      toast.error('Too many violations! Exam submitted immediately.');
      submitExam();
    }
  };

  const startProctoring = async () => {
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.warn('Full proctoring stream failed, trying video only...', err);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          toast.warning('Microphone access denied. Audio proctoring disabled.');
        } catch (videoErr) {
          console.error('Video stream failed', videoErr);
          toast.error('Camera access is required for proctoring');
          return;
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsProctoringActive(true);
      }

      // Audio Proctoring Setup (only if audio tracks are available)
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          microphone.connect(analyser);
          analyser.fftSize = 256;
          
          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          microphoneRef.current = microphone;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkAudio = () => {
            if (view !== 'student-exam' || !audioContextRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            
            // Threshold for "talking" or "noise"
            if (average > 40) { 
              handleViolation('Noise or talking detected!');
            }
            
            requestAnimationFrame(checkAudio);
          };
          checkAudio();
        } catch (audioErr) {
          console.error('Audio proctoring failed to start', audioErr);
        }
      }

      // Periodically analyze frames
      const interval = setInterval(async () => {
        if (view !== 'student-exam') {
          clearInterval(interval);
          return;
        }
        captureAndAnalyze();
      }, 10000); // Every 10 seconds
    } catch (err) {
      toast.error('Camera access is required for proctoring');
    }
  };

  const stopProctoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsProctoringActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, 320, 240);
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    try {
      const result = await GeminiService.analyzeProctoringFrame(base64Image);
      if (result.lookingAway) {
        handleViolation(result.reason || 'Looking away from screen', base64Image);
      }
    } catch (err) {
      console.error('Proctoring analysis failed', err);
    }
  };

  // --- Render Helpers ---

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="bg-brand-blue p-4 rounded-2xl inline-block mb-4 shadow-xl shadow-blue-200">
          <Shield className="w-12 h-12 text-brand-gold" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">RMI & Mifotra</h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Secure digital examination platform for modern education.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('student-join')}
          className="flex flex-col items-center p-8 bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:border-brand-blue hover:shadow-md transition-all group"
        >
          <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
            <User className="w-8 h-8 text-brand-blue" />
          </div>
          <span className="text-xl font-semibold text-gray-900">I'm a Student</span>
          <p className="text-sm text-gray-500 mt-2">Join an exam with a session code</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('teacher-login')}
          className="flex flex-col items-center p-8 bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:border-brand-gold hover:shadow-md transition-all group"
        >
          <div className="bg-amber-50 p-4 rounded-full mb-4 group-hover:bg-amber-100 transition-colors">
            <BookOpen className="w-8 h-8 text-brand-gold" />
          </div>
          <span className="text-xl font-semibold text-gray-900">I'm a Teacher</span>
          <p className="text-sm text-gray-500 mt-2">Create exams and manage results</p>
        </motion.button>
      </div>
    </div>
  );

  const renderTeacherLogin = () => (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Teacher Login</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTeacherLogin(e.currentTarget.value);
              }}
            />
          </div>
          <button 
            onClick={() => handleTeacherLogin((document.querySelector('input[type="password"]') as HTMLInputElement).value)}
            className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-100"
          >
            Login
          </button>
          <button 
            onClick={() => setView('landing')}
            className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-500">Manage your exams and student performance</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClearDatabase}
            disabled={isClearingDb}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
          >
            <AlertTriangle className="w-5 h-5" />
            Clear All Data
          </button>
          <button 
            onClick={() => setView('create-exam')}
            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-5 h-5" />
            Create New Exam
          </button>
          <button 
            onClick={() => { setTeacherAuth(false); setView('landing'); }}
            className="p-3 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{exams.length}</div>
          <div className="text-sm text-gray-500">Total Exams</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{allSubmissions.filter(s => s.status === 'in-progress').length}</div>
          <div className="text-sm text-gray-500">Active Students</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{allViolations.length}</div>
          <div className="text-sm text-gray-500">Violations Flagged</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Exams</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {exams.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No exams created yet.</div>
            ) : (
              exams.map(exam => (
                <div key={exam.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-brand-blue">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{exam.title}</div>
                      <div className="text-sm text-gray-500">{exam.questions.length} Questions • {exam.durationMinutes} Minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadExamResults(exam);
                      }}
                      className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"
                      title="Download Results"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Session Code</div>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 group/code">
                        <span className="font-mono text-brand-blue font-black tracking-wider">{exam.sessionCode}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(exam.sessionCode);
                            toast.success('Code copied!');
                          }}
                          className="p-1 text-blue-300 hover:text-brand-blue transition-colors"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-red-50/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">Live Proctoring Alerts</h3>
            </div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Live Feed</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {allSubmissions.filter(s => allViolations.some(v => v.submissionId === s.id)).length === 0 ? (
              <div className="p-12 text-center text-gray-400">No violations detected yet.</div>
            ) : (
              allSubmissions
                .filter(s => allViolations.some(v => v.submissionId === s.id))
                .map(sub => {
                  const studentViolations = allViolations.filter(v => v.submissionId === sub.id);
                  const exam = exams.find(e => e.id === sub.examId);
                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => setSelectedSubmission(sub)}
                      className="p-6 flex items-center justify-between hover:bg-red-50/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="bg-red-100 p-3 rounded-lg text-red-600">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                            {studentViolations.length}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">{sub.studentName}</div>
                          <div className="text-xs text-gray-500">Exam: {exam?.title || 'Unknown'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* All Submissions Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">All Student Submissions</h3>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {allSubmissions.length} Total
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exam</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Violations</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No submissions yet.</td>
                </tr>
              ) : (
                allSubmissions.map(sub => {
                  const exam = exams.find(e => e.id === sub.examId);
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{sub.studentName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{sub.id.substring(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exam?.title || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          sub.status === 'submitted' ? 'bg-blue-100 text-brand-blue' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-brand-blue">
                          {sub.score} / {exam?.type === 'mcq' ? (exam?.questions.length || 0) : (exam?.questions.length || 0) * 10}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold ${sub.violations > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                          {sub.violations}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedSubmission(sub)}
                          className="text-brand-blue hover:text-blue-800 font-bold text-xs uppercase tracking-widest"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Violation Details Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-brand-blue text-white">
                <div>
                  <h3 className="text-2xl font-black">{selectedSubmission.studentName}</h3>
                  <p className="text-blue-100 text-sm font-medium">
                    Exam: {exams.find(e => e.id === selectedSubmission.examId)?.title || 'Unknown'}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <LogOut className="w-6 h-6 rotate-180" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <div className="text-2xl font-black text-brand-blue">
                      {selectedSubmission.score} / {exams.find(e => e.id === selectedSubmission.examId)?.type === 'mcq' 
                        ? (exams.find(e => e.id === selectedSubmission.examId)?.questions.length || 0)
                        : (exams.find(e => e.id === selectedSubmission.examId)?.questions.length || 0) * 10
                      }
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Score</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <div className={`text-2xl font-black ${selectedSubmission.violations > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {selectedSubmission.violations}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Violations</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <div className="text-sm font-bold text-gray-900 uppercase tracking-widest mt-1">{selectedSubmission.status}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
                  </div>
                </div>

                {/* Essay Evaluations if available */}
                {selectedSubmission.essayEvaluations && (
                  <div className="space-y-4">
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">System Essay Evaluations</h4>
                    <div className="space-y-4">
                      {Object.entries(selectedSubmission.essayEvaluations).map(([qId, evalResult]) => {
                        const question = exams.find(e => e.id === selectedSubmission.examId)?.questions.find(q => q.id === qId);
                        const evaluation = evalResult as EvaluationResult;
                        return (
                          <div key={qId} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                            <div className="font-bold text-gray-900 text-sm">{question?.text}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-brand-blue bg-white px-2 py-1 rounded-lg shadow-sm">Score: {evaluation.score}/10</span>
                            </div>
                            <div className="text-xs text-blue-700 italic">"{evaluation.feedback}"</div>
                            <div className="mt-2 text-xs text-gray-600 bg-white/50 p-2 rounded-lg">
                              <span className="font-bold">Student Answer:</span> {selectedSubmission.answers[qId]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Violation History</h4>
                  <div className="space-y-4">
                    {allViolations.filter(v => v.submissionId === selectedSubmission.id).length === 0 ? (
                      <div className="text-center py-8 text-gray-400 italic">No specific violations recorded.</div>
                    ) : (
                      allViolations
                        .filter(v => v.submissionId === selectedSubmission.id)
                        .map((v, idx) => (
                          <div key={v.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                            <div className="p-4 flex justify-between items-start">
                              <div>
                                <div className="font-bold text-red-600 text-sm">#{idx + 1}: {v.reason}</div>
                                <div className="text-[10px] text-gray-400 font-medium">
                                  {v.timestamp?.toDate ? v.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                                </div>
                              </div>
                            </div>
                            {v.screenshot && (
                              <div className="px-4 pb-4">
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                  <img 
                                    src={`data:image/jpeg;base64,${v.screenshot}`} 
                                    alt="Violation Screenshot" 
                                    className="w-full aspect-video object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-xl shadow-blue-100"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderStudentJoin = () => (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100"
      >
        <div className="bg-brand-blue w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Play className="w-8 h-8 text-brand-gold" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Join Exam Session</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
            <input 
              type="text" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Code</label>
            <input 
              type="text" 
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="6-character code"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none font-mono text-center tracking-widest"
            />
          </div>
          <button 
            onClick={handleJoinExam}
            className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100"
          >
            Join Session
          </button>
          <button 
            onClick={() => setView('landing')}
            className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderStudentInstructions = () => (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-2xl border border-gray-100 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="bg-brand-blue w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Exam Instructions</h2>
          <p className="text-gray-500 font-medium">Please read carefully before starting</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Eye, title: "Stay Focused", desc: "Keep your eyes on the screen at all times." },
            { icon: AlertTriangle, title: "No Talking", desc: "Speaking or lip movement is strictly prohibited." },
            { icon: Shield, title: "No Tab Switching", desc: "Do not leave the exam window or switch tabs." },
            { icon: Camera, title: "Face Visible", desc: "Ensure your face is clearly visible in the camera." },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl flex gap-4 items-start">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <item.icon className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900">Strict Enforcement</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                The system will automatically submit your exam if more than <strong>3 violations</strong> are detected. All violations are recorded with screenshots.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setView('student-exam')}
          className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group"
        >
          I Understand, Start Exam
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );

  const renderStudentExam = () => {
    if (!currentExam) return null;
    const question = currentExam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;

    return (
      <div className={`max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 ${currentExam.cameraRequired ? 'lg:grid-cols-3' : 'max-w-3xl'} gap-8`}>
        <div className={`${currentExam.cameraRequired ? 'lg:col-span-2' : ''} space-y-6`}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Question {currentQuestionIndex + 1} of {currentExam.questions.length}</h2>
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-brand-blue"
                  />
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${timeLeft < 10 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-700'}`}>
                <Clock className="w-4 h-4" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-semibold text-gray-900 leading-tight">{question.text}</h3>
                
                {question.type === 'mcq' ? (
                  <div className="space-y-3">
                    {question.options?.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAnswers({ ...answers, [question.id]: idx })}
                        className={`w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                          answers[question.id] === idx 
                          ? 'border-brand-blue bg-blue-50 text-blue-900' 
                          : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{opt}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[question.id] === idx ? 'border-brand-blue bg-brand-blue' : 'border-gray-200'
                        }`}>
                          {answers[question.id] === idx && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 italic">Write your answer below. The system will evaluate your response based on completeness and accuracy.</p>
                    <textarea 
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      placeholder="Type your answer here..."
                      className="w-full h-64 p-6 rounded-2xl border-2 border-gray-100 focus:border-brand-blue outline-none resize-none text-lg leading-relaxed"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-10">
              <button 
                onClick={submitExam}
                className="px-6 py-3 text-gray-400 font-semibold hover:text-red-500 transition-colors"
              >
                Submit Early
              </button>
              <button 
                onClick={handleNextQuestion}
                disabled={answers[question.id] === undefined || (question.type === 'essay' && !answers[question.id])}
                className="flex items-center gap-2 bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {currentQuestionIndex === currentExam.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {currentExam.cameraRequired ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-gray-900">RMI & Mifotra Proctoring</h3>
              </div>
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" width={320} height={240} />
              <p className="text-xs text-gray-500 mt-3 italic">
                The system is monitoring your eye movement and environment. Please stay focused on the screen.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900">Violations</h3>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                      violations >= i ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-gray-100'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {violations === 0 ? 'No violations detected.' : `${violations} of 3 chances used.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-gray-900">Exam Security</h3>
              </div>
              <p className="text-sm text-gray-500">
                Camera proctoring is disabled for this exam. However, tab switching and copy-pasting are still monitored.
              </p>
              <div className="mt-4">
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                        violations >= i ? 'bg-red-500' : 'bg-gray-100'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
                  {violations} / 3 Violations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExamResult = () => {
    if (!currentSubmission || !currentExam) return null;
    const maxScore = currentExam.type === 'mcq' ? currentExam.questions.length : currentExam.questions.length * 10;

    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-lg border border-gray-100 text-center space-y-8"
        >
          <div className="relative inline-block">
            <div className="bg-brand-blue w-24 h-24 rounded-3xl flex items-center justify-center mx-auto rotate-12 shadow-2xl shadow-blue-200">
              <Trophy className="w-12 h-12 text-white -rotate-12" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-brand-gold text-white p-2 rounded-full shadow-lg"
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">Exam Completed!</h2>
            <p className="text-gray-500">Well done, {studentName}. Your results are ready.</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <div className="text-4xl font-black text-brand-blue">{currentSubmission.score}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score</div>
            </div>
            <div className="text-center space-y-1 border-l border-gray-200">
              <div className="text-4xl font-black text-gray-900">{maxScore}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Score</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm px-2">
              <span className="text-gray-500">Violations recorded:</span>
              <span className={`font-bold ${violations > 0 ? 'text-red-500' : 'text-blue-500'}`}>{violations}</span>
            </div>
            <button 
              onClick={() => setView('landing')}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="top-center" richColors />
      
      <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-brand-blue p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-brand-gold" />
          </div>
          <span className="text-xl font-black tracking-tight">RMI & Mifotra</span>
        </div>
        {teacherAuth && view !== 'landing' && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100">Teacher Mode</span>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto pb-20">
        {view === 'landing' && renderLanding()}
        {view === 'teacher-login' && renderTeacherLogin()}
        {view === 'teacher-dashboard' && renderTeacherDashboard()}
        {view === 'create-exam' && <CreateExamView onBack={() => setView('teacher-dashboard')} onCreate={handleCreateExam} isLoading={isGenerating} />}
        {view === 'student-join' && renderStudentJoin()}
        {view === 'student-instructions' && renderStudentInstructions()}
        {view === 'student-exam' && renderStudentExam()}
        {view === 'exam-result' && renderExamResult()}
      </main>

      <AnimatePresence>
        {newExamCode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-brand-blue" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Exam Published!</h3>
                <p className="text-gray-500">Share this code with your students to let them join the exam.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 relative group">
                <div className="text-4xl font-black font-mono tracking-widest text-brand-blue">
                  {newExamCode}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(newExamCode);
                    toast.success('Code copied to clipboard!');
                  }}
                  className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <button 
                onClick={() => {
                  setNewExamCode(null);
                  setView('teacher-dashboard');
                }}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
              >
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-[10px] text-gray-400 uppercase tracking-[0.2em] pointer-events-none z-0">
        Powered by RMI & Mifotra • Secure Examination Environment
      </footer>

      {/* Watermark Pattern */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.06] select-none overflow-hidden flex flex-wrap content-around justify-around p-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="text-[23px] font-black text-gray-900 rotate-[-20deg] whitespace-nowrap p-12">
            MADE BY BIG DATA FACTORY
          </div>
        ))}
      </div>
      <div className="fixed top-4 right-4 pointer-events-none z-50 opacity-30 select-none">
        <div className="text-[12px] font-bold text-brand-blue uppercase tracking-widest bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
          MADE BY BIG DATA FACTORY
        </div>
      </div>
    </div>
  );
}
