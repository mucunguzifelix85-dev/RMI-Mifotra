/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * UPDATED: 
 * 1. AI gaze detection — 3 look-aways = auto-submit
 * 2. Camera always required & enforced
 * 3. Teacher accounts (register/login) stored in Firestore
 * 4. Student sees teacher name + exam title before exam
 * 5. AI answer hints for essay questions
 */

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import {
  collection, addDoc, getDocs, query, where, doc, getDoc,
  updateDoc, onSnapshot, serverTimestamp, orderBy, deleteDoc,
  writeBatch, getDocFromServer, setDoc
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { GeminiService, Question, ExamType, EvaluationResult } from './services/geminiService';
import {
  BookOpen, Shield, Clock, AlertTriangle, CheckCircle, Plus, Upload,
  Link as LinkIcon, LogOut, User, ChevronRight, ChevronLeft, Camera,
  Play, Eye, Trophy, Copy, Download, UserPlus, Lightbulb, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete',
  LIST = 'list', GET = 'get', WRITE = 'write',
}

function handleFirestoreError(error: unknown, op: OperationType, path: string | null) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('Firestore Error:', { msg, op, path, uid: auth.currentUser?.uid });
  if (msg.includes('insufficient permissions')) toast.error('Database access denied.');
  throw new Error(msg);
}

async function testConnection() {
  try { await getDocFromServer(doc(db, 'test', 'connection')); }
  catch (e: any) { if (e.message?.includes('offline')) console.error('Firebase offline'); }
}
testConnection();

type View =
  | 'landing' | 'teacher-register' | 'teacher-login' | 'teacher-dashboard' | 'create-exam'
  | 'student-join' | 'student-instructions' | 'student-exam' | 'exam-result';

interface TeacherProfile { id: string; name: string; email: string; }
interface Exam {
  id: string; title: string; type: ExamType; durationMinutes: number;
  questions: Question[]; sessionCode: string; cameraRequired: boolean;
  teacherId: string; teacherName: string;
}
interface Submission {
  id: string; examId: string; studentName: string; answers: Record<string, any>;
  violations: number; status: 'in-progress' | 'submitted'; score: number;
  essayEvaluations?: Record<string, EvaluationResult>; submittedAt?: any;
}
interface Violation {
  id: string; examId: string; submissionId: string; studentName: string;
  reason: string; screenshot?: string; timestamp: any;
}

// ─────────────────────────────────────────────
// CreateExamView (unchanged except teacherId/Name injection)
// ─────────────────────────────────────────────

interface CreateExamViewProps {
  onBack: () => void;
  onCreate: (examData: Omit<Exam, 'id' | 'sessionCode'>) => void;
  isLoading: boolean;
  teacherId: string;
  teacherName: string;
}

const CreateExamView: React.FC<CreateExamViewProps> = ({ onBack, onCreate, isLoading, teacherId, teacherName }) => {
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<ExamType>('mcq');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInputModal, setAiInputModal] = useState<{ type: 'text' | 'url'; isOpen: boolean }>({ type: 'text', isOpen: false });
  const [aiInputValue, setAiInputValue] = useState('');

  const handleManualAdd = () => {
    setQuestions([...questions, {
      id: Math.random().toString(36).substring(7), text: '', type: examType,
      options: examType === 'mcq' ? ['', '', '', ''] : undefined,
      correctOptionIndex: examType === 'mcq' ? 0 : undefined,
      idealAnswer: examType === 'essay' ? '' : undefined
    }]);
  };

  const handleAiGenerate = async () => {
    if (!aiInputValue) return;
    setIsGenerating(true);
    setAiInputModal({ ...aiInputModal, isOpen: false });
    try {
      const generated = aiInputModal.type === 'text'
        ? await GeminiService.generateQuestionsFromText(aiInputValue, examType)
        : await GeminiService.generateQuestionsFromUrl(aiInputValue, examType);
      setQuestions([...questions, ...generated]);
      toast.success(`Generated ${generated.length} questions!`);
      setAiInputValue('');
    } catch { toast.error('Failed to generate questions.'); }
    finally { setIsGenerating(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type.includes('wordprocessingml')) { toast.error('Use PDF or TXT instead of .docx'); return; }
    setIsGenerating(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = (ev.target?.result as string).split(',')[1];
        const generated = await GeminiService.generateQuestionsFromFile(base64, file.type, examType);
        setQuestions([...questions, ...generated]);
        toast.success(`Generated ${generated.length} questions!`);
      } catch { toast.error('Failed to generate from document.'); }
      finally { setIsGenerating(false); }
    };
    reader.readAsDataURL(file);
  };

  const isFormValid = title && questions.length > 0 && questions.every(q =>
    q.type === 'mcq' ? q.text && q.options?.every(o => o) : q.text && q.idealAnswer
  );

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
          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
              {(['mcq', 'essay'] as ExamType[]).map(t => (
                <button key={t} onClick={() => { setExamType(t); setQuestions([]); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${examType === t ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Final Mathematics 101"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
          </div>
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
            <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
          </div>
        </div>

        {/* Camera note — always required now */}
        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
          <Camera className="w-5 h-5 text-brand-blue shrink-0" />
          <p className="text-sm text-blue-700 font-medium">
            Camera proctoring is <strong>always enabled</strong>. Students must keep their camera on and face the screen.
            AI gaze detection will auto-submit after 3 look-away violations.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-gray-900">Questions ({questions.length})</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setAiInputModal({ type: 'text', isOpen: true })} disabled={isGenerating}
                className="flex items-center gap-2 text-brand-blue bg-blue-50 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-all disabled:opacity-50">
                <Play className="w-4 h-4" /> From Text
              </button>
              <label className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition-all cursor-pointer">
                <Upload className="w-4 h-4" /> From Doc
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt" />
              </label>
              <button onClick={() => setAiInputModal({ type: 'url', isOpen: true })} disabled={isGenerating}
                className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-all disabled:opacity-50">
                <LinkIcon className="w-4 h-4" /> From URL
              </button>
              <button onClick={handleManualAdd}
                className="flex items-center gap-2 text-brand-gold bg-amber-50 px-4 py-2 rounded-lg font-semibold hover:bg-amber-100 transition-all">
                <Plus className="w-4 h-4" /> Manual
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 bg-gray-50 rounded-2xl space-y-4 relative group">
                <div className="flex gap-4">
                  <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-brand-blue shadow-sm">{idx + 1}</span>
                  <input type="text" value={q.text} onChange={e => { const ns = [...questions]; ns[idx].text = e.target.value; setQuestions(ns); }}
                    placeholder="Question text..." className="flex-1 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none py-1" />
                </div>
                {q.type === 'mcq' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                    {q.options?.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" checked={q.correctOptionIndex === oi}
                          onChange={() => { const ns = [...questions]; ns[idx].correctOptionIndex = oi; setQuestions(ns); }}
                          className="w-4 h-4 text-brand-blue" />
                        <input type="text" value={opt}
                          onChange={e => { const ns = [...questions]; ns[idx].options![oi] = e.target.value; setQuestions(ns); }}
                          placeholder={`Option ${oi + 1}`}
                          className="flex-1 bg-white px-3 py-2 rounded-lg border border-gray-100 text-sm outline-none focus:ring-1 focus:ring-brand-blue" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-12 space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Ideal Answer / Rubric</label>
                    <textarea value={q.idealAnswer}
                      onChange={e => { const ns = [...questions]; ns[idx].idealAnswer = e.target.value; setQuestions(ns); }}
                      placeholder="Ideal answer or key points..."
                      className="w-full bg-white p-3 rounded-xl border border-gray-100 text-sm outline-none focus:ring-1 focus:ring-brand-blue h-24 resize-none" />
                  </div>
                )}
                <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => onCreate({ title, type: examType, durationMinutes: duration, questions, cameraRequired: true, teacherId, teacherName })}
          disabled={!isFormValid || isGenerating || isLoading}
          className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-100 disabled:opacity-50">
          {isLoading ? 'Creating Exam...' : isGenerating ? 'Generating Questions...' : 'Finalize and Generate Session Code'}
        </button>
      </div>

      <AnimatePresence>
        {aiInputModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl max-w-lg w-full space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {aiInputModal.type === 'text' ? 'Generate from Text' : 'Generate from URL'}
              </h3>
              <textarea value={aiInputValue} onChange={e => setAiInputValue(e.target.value)}
                placeholder={aiInputModal.type === 'text' ? 'Paste text here...' : 'https://example.com/article'}
                className="w-full h-40 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none resize-none" />
              <div className="flex gap-3">
                <button onClick={() => setAiInputModal({ ...aiInputModal, isOpen: false })}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={handleAiGenerate} disabled={!aiInputValue}
                  className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-all disabled:opacity-50">Generate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Teacher register/login form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Exam/session state
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [studentName, setStudentName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [newExamCode, setNewExamCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Teacher dashboard state
  const [exams, setExams] = useState<Exam[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [allViolations, setAllViolations] = useState<Violation[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isClearingDb, setIsClearingDb] = useState(false);

  // Student exam state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [gazeViolations, setGazeViolations] = useState(0); // NEW: track gaze-away count
  const [cameraBlocked, setCameraBlocked] = useState(false); // NEW: camera required gate
  const [aiHint, setAiHint] = useState<string | null>(null); // NEW: AI hint for essay
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gazeViolationsRef = useRef(0); // ref for up-to-date count inside async callbacks
  const streamRef = useRef<MediaStream | null>(null);
  const proctoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'teachers', user.uid));
          if (snap.exists()) {
            setTeacherProfile({ id: user.uid, ...snap.data() } as TeacherProfile);
            setView('teacher-dashboard');
          }
        } catch { /* ignore */ }
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Teacher data listeners
  useEffect(() => {
    if (!teacherProfile) return;
    fetchExams();

    const subQ = query(collection(db, 'submissions'), where('examTeacherId', '==', teacherProfile.id), orderBy('createdAt', 'desc'));
    const unsubSubs = onSnapshot(subQ, snap => {
      setAllSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
    }, e => handleFirestoreError(e, OperationType.LIST, 'submissions'));

    const violQ = query(collection(db, 'violations'), where('teacherId', '==', teacherProfile.id));
    const unsubViols = onSnapshot(violQ, snap => {
      const vs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Violation));
      vs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setAllViolations(vs);
    }, e => handleFirestoreError(e, OperationType.LIST, 'violations'));

    return () => { unsubSubs(); unsubViols(); };
  }, [teacherProfile]);

  // ── Exam timer & proctoring
  useEffect(() => {
    if (view === 'student-exam' && currentExam) {
      const totalSec = (currentExam.durationMinutes * 60) / currentExam.questions.length;
      setTimeLeft(Math.floor(totalSec));

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleNextQuestion(); return Math.floor(totalSec); }
          return prev - 1;
        });
      }, 1000);

      startProctoring();

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        stopProctoring();
      };
    }
  }, [view, currentQuestionIndex]);

  // ── Tab switch detection
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && view === 'student-exam') handleViolation('Tab switch detected!');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [view, violations]);

  // ── Disable copy/paste
  useEffect(() => {
    if (view !== 'student-exam') return;
    const prevent = (e: Event) => { e.preventDefault(); toast.error('Copy/Paste disabled during exam!'); };
    const preventCtx = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('copy', prevent);
    window.addEventListener('paste', prevent);
    window.addEventListener('cut', prevent);
    window.addEventListener('contextmenu', preventCtx);
    return () => {
      window.removeEventListener('copy', prevent);
      window.removeEventListener('paste', prevent);
      window.removeEventListener('cut', prevent);
      window.removeEventListener('contextmenu', preventCtx);
    };
  }, [view]);

  // ─────────────────────────────────────────────
  // Auth Functions
  // ─────────────────────────────────────────────

  const handleTeacherRegister = async () => {
    setAuthError('');
    if (!regName || !regEmail || !regPassword) { setAuthError('All fields required.'); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      await setDoc(doc(db, 'teachers', cred.user.uid), { name: regName, email: regEmail, createdAt: serverTimestamp() });
      setTeacherProfile({ id: cred.user.uid, name: regName, email: regEmail });
      setView('teacher-dashboard');
      toast.success(`Welcome, ${regName}!`);
    } catch (e: any) {
      setAuthError(e.message || 'Registration failed.');
    }
  };

  const handleTeacherLogin = async () => {
    setAuthError('');
    if (!loginEmail || !loginPassword) { setAuthError('Enter email and password.'); return; }
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const snap = await getDoc(doc(db, 'teachers', cred.user.uid));
      if (!snap.exists()) { setAuthError('No teacher account found.'); return; }
      const profile = { id: cred.user.uid, ...snap.data() } as TeacherProfile;
      setTeacherProfile(profile);
      setView('teacher-dashboard');
      toast.success(`Welcome back, ${profile.name}!`);
    } catch (e: any) {
      setAuthError(e.message || 'Login failed.');
    }
  };

  const handleTeacherLogout = async () => {
    await signOut(auth);
    setTeacherProfile(null);
    setFirebaseUser(null);
    setView('landing');
    toast.success('Logged out.');
  };

  // ─────────────────────────────────────────────
  // Exam Functions
  // ─────────────────────────────────────────────

  const fetchExams = async () => {
    if (!teacherProfile) return;
    try {
      const q = query(collection(db, 'exams'), where('teacherId', '==', teacherProfile.id));
      const snap = await getDocs(q);
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam)));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'exams'); }
  };

  const handleCreateExam = async (examData: Omit<Exam, 'id' | 'sessionCode'>) => {
    setIsGenerating(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await addDoc(collection(db, 'exams'), { ...examData, sessionCode: code, createdAt: serverTimestamp() });
      setNewExamCode(code);
      toast.success('Exam created!');
      fetchExams();
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'exams'); }
    finally { setIsGenerating(false); }
  };

  const handleJoinExam = async () => {
    if (!studentName || !sessionCode) { toast.error('Enter your name and session code'); return; }
    try {
      const q = query(collection(db, 'exams'), where('sessionCode', '==', sessionCode.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) { toast.error('Invalid session code'); return; }

      const exam = { id: snap.docs[0].id, ...snap.docs[0].data() } as Exam;
      setCurrentExam(exam);
      setViolations(0); setGazeViolations(0); gazeViolationsRef.current = 0;
      setCurrentQuestionIndex(0); setAnswers({});

      const subRef = await addDoc(collection(db, 'submissions'), {
        examId: exam.id, examTeacherId: exam.teacherId, studentName, answers: {},
        violations: 0, status: 'in-progress', score: 0, createdAt: serverTimestamp()
      });
      setCurrentSubmission({ id: subRef.id, examId: exam.id, studentName, answers: {}, violations: 0, status: 'in-progress', score: 0 });
      setView('student-instructions');
      toast.success('Session joined! Read the instructions.');
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'submissions'); }
  };

  const handleNextQuestion = () => {
    if (!currentExam) return;
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(p => p + 1);
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
      currentExam.questions.forEach(q => { if (answers[q.id] === q.correctOptionIndex) score++; });
    } else {
      const t = toast.loading('Evaluating your answers...', { duration: Infinity });
      try {
        for (const q of currentExam.questions) {
          const ev = await GeminiService.evaluateEssayAnswer(q.text, q.idealAnswer || '', answers[q.id] || '');
          essayEvaluations[q.id] = ev; score += ev.score;
        }
      } catch { toast.error('Evaluation failed for some questions.'); }
      finally { toast.dismiss(t); }
    }

    try {
      await updateDoc(doc(db, 'submissions', currentSubmission.id), {
        answers, status: 'submitted', score,
        essayEvaluations: currentExam.type === 'essay' ? essayEvaluations : null,
        submittedAt: serverTimestamp()
      });
      setCurrentSubmission(p => p ? { ...p, score, status: 'submitted', essayEvaluations } : null);
      setView('exam-result');
      toast.success('Exam submitted!');
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `submissions/${currentSubmission.id}`); }
  };

  // ─────────────────────────────────────────────
  // Violation & Proctoring
  // ─────────────────────────────────────────────

  const handleViolation = async (reason: string, screenshot?: string, isGaze = false) => {
    const newV = violations + 1;
    setViolations(newV);

    // NEW: gaze-specific counter — submit after 3 gaze look-aways
    if (isGaze) {
      const newG = gazeViolationsRef.current + 1;
      gazeViolationsRef.current = newG;
      setGazeViolations(newG);
      toast.warning(`👁 Look-away detected! (${newG}/3)`);
      if (newG >= 3) {
        toast.error('3 look-aways detected. Exam auto-submitted!');
        submitExam();
        return;
      }
    } else {
      toast.warning(`Violation: ${reason} (${newV}/3)`);
    }

    let finalScreenshot = screenshot;
    if (!finalScreenshot && videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        finalScreenshot = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
      }
    }

    if (currentSubmission && currentExam) {
      try {
        await updateDoc(doc(db, 'submissions', currentSubmission.id), { violations: newV });
        await addDoc(collection(db, 'violations'), {
          examId: currentExam.id, teacherId: currentExam.teacherId,
          submissionId: currentSubmission.id, studentName: currentSubmission.studentName,
          reason, screenshot: finalScreenshot || null, timestamp: serverTimestamp()
        });
      } catch (e) { console.error('Error logging violation:', e); }
    }

    if (!isGaze && newV >= 3) {
      toast.error('Too many violations! Exam auto-submitted.');
      submitExam();
    }
  };

  // ── NEW: startProctoring — enforces camera on, gaze detection
  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setCameraBlocked(false);

      // Periodic gaze analysis every 8 seconds
      proctoringIntervalRef.current = setInterval(() => {
        if (view === 'student-exam') captureAndAnalyze();
      }, 8000);

    } catch {
      setCameraBlocked(true);
      toast.error('Camera access is REQUIRED to start the exam.');
    }
  };

  const stopProctoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (proctoringIntervalRef.current) { clearInterval(proctoringIntervalRef.current); proctoringIntervalRef.current = null; }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    const b64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    try {
      const result = await GeminiService.analyzeProctoringFrame(b64);
      if (result.lookingAway) {
        handleViolation(result.reason || 'Looking away from screen', b64, true);
      }
    } catch (e) { console.error('Proctoring analysis failed', e); }
  };

  // ── NEW: AI hint for essay questions
  const handleGetAiHint = async () => {
    if (!currentExam) return;
    const q = currentExam.questions[currentQuestionIndex];
    setIsLoadingHint(true); setAiHint(null);
    try {
      // Ask AI for a hint based on the question (not the ideal answer, to avoid giving it away)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 300,
          messages: [{
            role: 'user',
            content: `A student is answering this exam question: "${q.text}"\n\nTheir current answer: "${answers[q.id] || '(no answer yet)'}".\n\nGive a SHORT helpful hint (2-3 sentences max) that guides them in the right direction WITHOUT giving away the full answer. Focus on what key concepts they should think about.`
          }]
        })
      });
      const data = await response.json();
      const hint = data.content?.map((c: any) => c.text || '').join('') || 'Could not generate hint.';
      setAiHint(hint);
    } catch { setAiHint('Could not load hint. Please try again.'); }
    finally { setIsLoadingHint(false); }
  };

  // ── Download results CSV
  const downloadExamResults = async (exam: Exam) => {
    try {
      const q = query(collection(db, 'submissions'), where('examId', '==', exam.id));
      const snap = await getDocs(q);
      const subs = snap.docs.map(d => d.data() as Submission);
      if (subs.length === 0) { toast.info('No submissions yet.'); return; }
      const headers = ['Student Name', 'Score', 'Total Questions', 'Violations', 'Status', 'Submitted At'];
      const rows = subs.map(s => [
        s.studentName, s.score, exam.questions.length, s.violations, s.status,
        s.submittedAt ? new Date(s.submittedAt.seconds * 1000).toLocaleString() : 'N/A'
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `results_${exam.title.replace(/\s+/g, '_')}.csv`;
      a.click();
      toast.success('Results downloaded!');
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'submissions'); }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Delete ALL data? This cannot be undone.')) return;
    setIsClearingDb(true);
    const t = toast.loading('Clearing...');
    try {
      for (const col of ['exams', 'submissions', 'violations']) {
        const snap = await getDocs(collection(db, col));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      setExams([]); setAllSubmissions([]); setAllViolations([]);
      toast.success('Cleared!', { id: t });
    } catch { toast.error('Failed.', { id: t }); }
    finally { setIsClearingDb(false); }
  };

  // ─────────────────────────────────────────────
  // Render: Landing
  // ─────────────────────────────────────────────

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="bg-brand-blue p-4 rounded-2xl inline-block mb-4 shadow-xl shadow-blue-200">
          <Shield className="w-12 h-12 text-brand-gold" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">RMI & Mifotra</h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">Secure digital examination platform for modern education.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setView('student-join')}
          className="flex flex-col items-center p-8 bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:border-brand-blue hover:shadow-md transition-all group">
          <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
            <User className="w-8 h-8 text-brand-blue" />
          </div>
          <span className="text-xl font-semibold text-gray-900">I'm a Student</span>
          <p className="text-sm text-gray-500 mt-2">Join an exam with a session code</p>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setView('teacher-login')}
          className="flex flex-col items-center p-8 bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:border-brand-gold hover:shadow-md transition-all group">
          <div className="bg-amber-50 p-4 rounded-full mb-4 group-hover:bg-amber-100 transition-colors">
            <BookOpen className="w-8 h-8 text-brand-gold" />
          </div>
          <span className="text-xl font-semibold text-gray-900">I'm a Teacher</span>
          <p className="text-sm text-gray-500 mt-2">Login or create a teacher account</p>
        </motion.button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Teacher Register
  // ─────────────────────────────────────────────

  const renderTeacherRegister = () => (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 space-y-4">
        <div className="text-center mb-2">
          <div className="bg-brand-blue w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Teacher Account</h2>
        </div>
        {authError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">{authError}</div>}
        <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Full Name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
        <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email Address"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
        <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Password (min 6 chars)"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
        <button onClick={handleTeacherRegister}
          className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-100">
          Create Account
        </button>
        <button onClick={() => setView('teacher-login')} className="w-full text-brand-blue text-sm font-medium hover:underline">
          Already have an account? Login
        </button>
        <button onClick={() => setView('landing')} className="w-full text-gray-400 text-sm hover:text-gray-600">Back to Home</button>
      </motion.div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Teacher Login
  // ─────────────────────────────────────────────

  const renderTeacherLogin = () => (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 space-y-4">
        <div className="text-center mb-2">
          <div className="bg-brand-gold w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Login</h2>
        </div>
        {authError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">{authError}</div>}
        <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email Address"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
        <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password"
          onKeyDown={e => e.key === 'Enter' && handleTeacherLogin()}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
        <button onClick={handleTeacherLogin}
          className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-100">
          Login
        </button>
        <button onClick={() => setView('teacher-register')} className="w-full text-brand-blue text-sm font-medium hover:underline">
          New teacher? Create an account
        </button>
        <button onClick={() => setView('landing')} className="w-full text-gray-400 text-sm hover:text-gray-600">Back to Home</button>
      </motion.div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Teacher Dashboard
  // ─────────────────────────────────────────────

  const renderTeacherDashboard = () => (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-500">Welcome, <span className="font-semibold text-brand-blue">{teacherProfile?.name}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleClearDatabase} disabled={isClearingDb}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50">
            <AlertTriangle className="w-5 h-5" /> Clear All Data
          </button>
          <button onClick={() => setView('create-exam')}
            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100">
            <Plus className="w-5 h-5" /> Create New Exam
          </button>
          <button onClick={handleTeacherLogout} className="p-3 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, color: 'blue', val: exams.length, label: 'Total Exams' },
          { icon: User, color: 'purple', val: allSubmissions.filter(s => s.status === 'in-progress').length, label: 'Active Students' },
          { icon: AlertTriangle, color: 'amber', val: allViolations.length, label: 'Violations Flagged' },
        ].map(({ icon: Icon, color, val, label }) => (
          <div key={label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`bg-${color}-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{val}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Exams list + Violations feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Exams */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50"><h3 className="font-bold text-gray-900">Your Exams</h3></div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {exams.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No exams created yet.</div>
            ) : exams.map(exam => (
              <div key={exam.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-brand-blue"><BookOpen className="w-5 h-5" /></div>
                  <div>
                    <div className="font-semibold text-gray-900">{exam.title}</div>
                    <div className="text-sm text-gray-500">{exam.questions.length} Q • {exam.durationMinutes} min</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => downloadExamResults(exam)} className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all" title="Download">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Code</div>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <span className="font-mono text-brand-blue font-black tracking-wider">{exam.sessionCode}</span>
                      <button onClick={() => { navigator.clipboard.writeText(exam.sessionCode); toast.success('Copied!'); }}
                        className="p-1 text-blue-300 hover:text-brand-blue transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live violations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-red-50/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">Live Proctoring Alerts</h3>
            </div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Live</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {allViolations.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No violations yet.</div>
            ) : allViolations.slice(0, 20).map(v => (
              <div key={v.id} className="p-4 hover:bg-red-50/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 text-sm">{v.studentName}</div>
                  <div className="text-[10px] text-gray-400">
                    {v.timestamp?.toDate ? v.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                  </div>
                </div>
                <div className="text-xs text-red-600 font-medium mt-0.5">{v.reason}</div>
                {v.screenshot && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 w-32 h-18">
                    <img src={`data:image/jpeg;base64,${v.screenshot}`} alt="screenshot" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Submissions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">All Student Submissions</h3>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{allSubmissions.length} Total</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                {['Student', 'Exam', 'Status', 'Score', 'Violations', 'Action'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allSubmissions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No submissions yet.</td></tr>
              ) : allSubmissions.map(sub => {
                const exam = exams.find(e => e.id === sub.examId);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{sub.studentName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{sub.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{exam?.title || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${sub.status === 'submitted' ? 'bg-blue-100 text-brand-blue' : 'bg-amber-100 text-amber-700'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-blue">{sub.score} / {exam ? (exam.type === 'mcq' ? exam.questions.length : exam.questions.length * 10) : '?'}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: sub.violations > 0 ? '#ef4444' : '#3b82f6' }}>{sub.violations}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedSubmission(sub)} className="text-brand-blue hover:text-blue-800 font-bold text-xs uppercase tracking-widest">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission detail modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-brand-blue text-white">
                <div>
                  <h3 className="text-2xl font-black">{selectedSubmission.studentName}</h3>
                  <p className="text-blue-100 text-sm">{exams.find(e => e.id === selectedSubmission.examId)?.title}</p>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: `${selectedSubmission.score}`, label: 'Score' },
                    { val: `${selectedSubmission.violations}`, label: 'Violations', danger: selectedSubmission.violations > 0 },
                    { val: selectedSubmission.status, label: 'Status' },
                  ].map(({ val, label, danger }) => (
                    <div key={label} className="bg-gray-50 p-4 rounded-2xl text-center">
                      <div className={`text-2xl font-black ${danger ? 'text-red-500' : 'text-brand-blue'}`}>{val}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
                    </div>
                  ))}
                </div>

                {selectedSubmission.essayEvaluations && (
                  <div className="space-y-4">
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">AI Essay Evaluations</h4>
                    {Object.entries(selectedSubmission.essayEvaluations).map(([qId, ev]) => {
                      const q = exams.find(e => e.id === selectedSubmission.examId)?.questions.find(q => q.id === qId);
                      return (
                        <div key={qId} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                          <div className="font-bold text-gray-900 text-sm">{q?.text}</div>
                          <span className="text-xs font-bold text-brand-blue bg-white px-2 py-1 rounded-lg shadow-sm">Score: {(ev as EvaluationResult).score}/10</span>
                          <div className="text-xs text-blue-700 italic">"{(ev as EvaluationResult).feedback}"</div>
                          <div className="text-xs text-gray-600 bg-white/50 p-2 rounded-lg">
                            <span className="font-bold">Answer:</span> {selectedSubmission.answers[qId]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Violation History</h4>
                  {allViolations.filter(v => v.submissionId === selectedSubmission.id).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 italic">No violations recorded.</div>
                  ) : allViolations.filter(v => v.submissionId === selectedSubmission.id).map((v, i) => (
                    <div key={v.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                      <div className="p-4 flex justify-between items-start">
                        <div>
                          <div className="font-bold text-red-600 text-sm">#{i + 1}: {v.reason}</div>
                          <div className="text-[10px] text-gray-400">{v.timestamp?.toDate?.().toLocaleTimeString()}</div>
                        </div>
                      </div>
                      {v.screenshot && (
                        <div className="px-4 pb-4">
                          <img src={`data:image/jpeg;base64,${v.screenshot}`} alt="Violation" className="w-full aspect-video object-cover rounded-xl border border-gray-200" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button onClick={() => setSelectedSubmission(null)}
                  className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Student Join
  // ─────────────────────────────────────────────

  const renderStudentJoin = () => (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="bg-brand-blue w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Play className="w-8 h-8 text-brand-gold" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Join Exam Session</h2>
        <div className="space-y-4">
          <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Your Full Name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none" />
          <input type="text" value={sessionCode} onChange={e => setSessionCode(e.target.value.toUpperCase())}
            placeholder="6-character session code" maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none font-mono text-center tracking-widest" />
          <button onClick={handleJoinExam}
            className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100">
            Join Session
          </button>
          <button onClick={() => setView('landing')} className="w-full text-gray-500 py-2 text-sm hover:text-gray-700">Back to Home</button>
        </div>
      </motion.div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Student Instructions — NEW: shows teacher name + exam name
  // ─────────────────────────────────────────────

  const renderStudentInstructions = () => (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-2xl border border-gray-100 space-y-8">

        {/* NEW: Exam + Teacher info banner */}
        <div className="bg-brand-blue text-white p-6 rounded-2xl text-center space-y-1">
          <div className="text-xs font-bold text-blue-200 uppercase tracking-widest">You are about to take</div>
          <div className="text-2xl font-black">{currentExam?.title}</div>
          <div className="text-blue-200 text-sm">Prepared by <span className="font-bold text-white">{currentExam?.teacherName}</span></div>
          <div className="flex justify-center gap-6 mt-3 text-sm text-blue-100">
            <span>{currentExam?.questions.length} Questions</span>
            <span>•</span>
            <span>{currentExam?.durationMinutes} Minutes</span>
            <span>•</span>
            <span className="capitalize">{currentExam?.type}</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-900">Exam Instructions</h2>
          <p className="text-gray-500">Please read carefully before starting</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Eye, title: 'Stay Focused', desc: 'Keep your eyes on the screen. 3 look-aways = instant submission.' },
            { icon: AlertTriangle, title: 'No Talking', desc: 'Speaking or noise is strictly prohibited.' },
            { icon: Shield, title: 'No Tab Switching', desc: 'Leaving the exam window counts as a violation.' },
            { icon: Camera, title: 'Camera Always On', desc: 'Your face must be clearly visible at all times.' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl flex gap-4 items-start">
              <div className="bg-white p-2 rounded-xl shadow-sm"><item.icon className="w-5 h-5 text-brand-blue" /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* NEW: gaze warning */}
        <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
          <div className="flex gap-3">
            <Eye className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900">AI Gaze Detection Active</h4>
              <p className="text-sm text-red-700 leading-relaxed mt-1">
                The AI system monitors where you are looking. If you look away from the screen <strong>3 times</strong>,
                your exam will be <strong>automatically submitted immediately</strong> — even if not finished.
              </p>
            </div>
          </div>
        </div>

        <button onClick={() => setView('student-exam')}
          className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group">
          I Understand, Start Exam <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Student Exam — NEW: camera gate, gaze counter, AI hint
  // ─────────────────────────────────────────────

  const renderStudentExam = () => {
    if (!currentExam) return null;
    const question = currentExam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;

    // Camera blocked gate
    if (cameraBlocked) {
      return (
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 border border-red-100">
            <div className="bg-red-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Camera Required</h2>
            <p className="text-gray-500">Camera access is required to take this exam. Please allow camera access and try again.</p>
            <button onClick={startProctoring} className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all">
              Grant Camera Access
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {currentExam.questions.length}
                </h2>
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-brand-blue" />
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${timeLeft < 10 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-700'}`}>
                <Clock className="w-4 h-4" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <h3 className="text-2xl font-semibold text-gray-900 leading-tight">{question.text}</h3>

                {question.type === 'mcq' ? (
                  <div className="space-y-3">
                    {question.options?.map((opt, idx) => (
                      <button key={idx} onClick={() => setAnswers({ ...answers, [question.id]: idx })}
                        className={`w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${answers[question.id] === idx ? 'border-brand-blue bg-blue-50 text-blue-900' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700'}`}>
                        <span className="font-medium">{opt}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[question.id] === idx ? 'border-brand-blue bg-brand-blue' : 'border-gray-200'}`}>
                          {answers[question.id] === idx && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 italic">Write your answer below. AI will evaluate based on completeness and accuracy.</p>
                    <textarea value={answers[question.id] || ''} onChange={e => setAnswers({ ...answers, [question.id]: e.target.value })}
                      placeholder="Type your answer here..."
                      className="w-full h-52 p-6 rounded-2xl border-2 border-gray-100 focus:border-brand-blue outline-none resize-none text-lg leading-relaxed" />

                    {/* NEW: AI hint button */}
                    <button onClick={handleGetAiHint} disabled={isLoadingHint}
                      className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg font-semibold hover:bg-amber-100 transition-all disabled:opacity-50 text-sm">
                      <Lightbulb className="w-4 h-4" />
                      {isLoadingHint ? 'Getting hint...' : 'Get AI Hint'}
                    </button>

                    {/* Hint display */}
                    <AnimatePresence>
                      {aiHint && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-amber-50 p-4 rounded-2xl border border-amber-100 relative">
                          <button onClick={() => setAiHint(null)} className="absolute top-3 right-3 text-amber-300 hover:text-amber-600"><X className="w-4 h-4" /></button>
                          <div className="flex gap-2 items-start">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 leading-relaxed">{aiHint}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-10">
              <button onClick={submitExam} className="px-6 py-3 text-gray-400 font-semibold hover:text-red-500 transition-colors">Submit Early</button>
              <button onClick={handleNextQuestion}
                disabled={answers[question.id] === undefined || (question.type === 'essay' && !answers[question.id])}
                className="flex items-center gap-2 bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100 disabled:opacity-50">
                {currentQuestionIndex === currentExam.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Proctoring panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-brand-blue" />
              <h3 className="font-bold text-gray-900">Live Proctoring</h3>
            </div>
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" width={320} height={240} />
            <p className="text-xs text-gray-500 mt-3 italic">AI is monitoring your gaze direction and environment.</p>
          </div>

          {/* NEW: Gaze violation counter */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-brand-blue" />
              <h3 className="font-bold text-gray-900">Gaze Monitor</h3>
            </div>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-3 rounded-full transition-all duration-500 ${gazeViolations >= i ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-gray-100'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {gazeViolations === 0
                ? 'No look-aways detected.'
                : gazeViolations >= 3
                  ? 'Max look-aways reached!'
                  : `${gazeViolations}/3 look-aways. ${3 - gazeViolations} remaining before auto-submit.`
              }
            </p>
          </div>

          {/* General violations */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-900">Other Violations</h3>
            </div>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-3 rounded-full transition-all duration-500 ${violations >= i ? 'bg-amber-500' : 'bg-gray-100'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500">{violations === 0 ? 'No violations.' : `${violations}/3 — tab switches, copy/paste.`}</p>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Render: Exam Result
  // ─────────────────────────────────────────────

  const renderExamResult = () => {
    if (!currentSubmission || !currentExam) return null;
    const maxScore = currentExam.type === 'mcq' ? currentExam.questions.length : currentExam.questions.length * 10;
    const pct = Math.round((currentSubmission.score / maxScore) * 100);

    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-lg border border-gray-100 text-center space-y-8">
          <div className="relative inline-block">
            <div className="bg-brand-blue w-24 h-24 rounded-3xl flex items-center justify-center mx-auto rotate-12 shadow-2xl shadow-blue-200">
              <Trophy className="w-12 h-12 text-white -rotate-12" />
            </div>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-brand-gold text-white p-2 rounded-full shadow-lg">
              <CheckCircle className="w-6 h-6" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">Exam Completed!</h2>
            <p className="text-gray-500">Well done, {studentName}.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-3xl grid grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <div className="text-4xl font-black text-brand-blue">{currentSubmission.score}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score</div>
            </div>
            <div className="text-center space-y-1 border-x border-gray-200">
              <div className="text-4xl font-black text-gray-900">{maxScore}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-4xl font-black" style={{ color: pct >= 60 ? '#2563eb' : '#ef4444' }}>{pct}%</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grade</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm px-2">
              <span className="text-gray-500">Gaze violations:</span>
              <span className={`font-bold ${gazeViolations > 0 ? 'text-red-500' : 'text-blue-500'}`}>{gazeViolations}</span>
            </div>
            <div className="flex items-center justify-between text-sm px-2">
              <span className="text-gray-500">Other violations:</span>
              <span className={`font-bold ${violations > 0 ? 'text-red-500' : 'text-blue-500'}`}>{violations}</span>
            </div>
            <button onClick={() => setView('landing')}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200">
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-brand-blue p-4 rounded-2xl inline-block animate-pulse">
            <Shield className="w-10 h-10 text-brand-gold" />
          </div>
          <p className="text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Root render
  // ─────────────────────────────────────────────

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
        {teacherProfile && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100">
              {teacherProfile.name}
            </span>
            <button onClick={handleTeacherLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto pb-20">
        {view === 'landing' && renderLanding()}
        {view === 'teacher-register' && renderTeacherRegister()}
        {view === 'teacher-login' && renderTeacherLogin()}
        {view === 'teacher-dashboard' && renderTeacherDashboard()}
        {view === 'create-exam' && teacherProfile && (
          <CreateExamView onBack={() => setView('teacher-dashboard')} onCreate={handleCreateExam}
            isLoading={isGenerating} teacherId={teacherProfile.id} teacherName={teacherProfile.name} />
        )}
        {view === 'student-join' && renderStudentJoin()}
        {view === 'student-instructions' && renderStudentInstructions()}
        {view === 'student-exam' && renderStudentExam()}
        {view === 'exam-result' && renderExamResult()}
      </main>

      {/* New exam code modal */}
      <AnimatePresence>
        {newExamCode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center space-y-6">
              <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-brand-blue" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Exam Published!</h3>
                <p className="text-gray-500">Share this code with your students.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 relative">
                <div className="text-4xl font-black font-mono tracking-widest text-brand-blue">{newExamCode}</div>
                <button onClick={() => { navigator.clipboard.writeText(newExamCode); toast.success('Copied!'); }}
                  className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors">
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <button onClick={() => { setNewExamCode(null); setView('teacher-dashboard'); }}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-[10px] text-gray-400 uppercase tracking-[0.2em] pointer-events-none z-0">
        Powered by RMI & Mifotra • Secure Examination Environment
      </footer>

      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.06] select-none overflow-hidden flex flex-wrap content-around justify-around p-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="text-[23px] font-black text-gray-900 rotate-[-20deg] whitespace-nowrap p-12">MADE BY BIG DATA FACTORY</div>
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
