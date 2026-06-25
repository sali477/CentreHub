import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { examAPI } from '../api/index';

const ExamTake = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase] = useState('intro');
  const [results, setResults] = useState(null);
  const startedAtRef = useRef(null);

  const handleSubmit = useCallback(async (finalAnswers) => {
    if (phase === 'results') return;
    setPhase('submitting');
    try {
      const { data } = await examAPI.submit(examId, {
        answers: finalAnswers ?? answers,
        startedAt: startedAtRef.current,
      });
      setResults(data.data);
      setPhase('results');
    } catch (err) {
      setPhase('taking');
      alert(err.response?.data?.message || t('examTake.submissionFailed'));
    }
  }, [examId, answers, phase]);

  const startExam = async () => {
    const { data } = await examAPI.start(examId);
    startedAtRef.current = data.data.startedAt;
    setTimeLeft(data.data.duration * 60);
    setPhase('taking');
  };

  useEffect(() => {
    examAPI.getOne(examId).then(({ data }) => {
      setExam(data.data);
      setAnswers(new Array(data.data.questions.length).fill(''));
    });
  }, [examId]);

  useEffect(() => {
    if (phase !== 'taking' || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit(answers);
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft, handleSubmit, answers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse"><div className="h-64 bg-muted rounded-xl" /></div>;
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
          <p className="text-muted-foreground mb-6">{exam.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-2xl font-bold">{exam.questions.length}</p>
              <p className="text-sm text-muted-foreground">{t('examTake.questionsLabel')}</p>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-2xl font-bold">{exam.duration}</p>
              <p className="text-sm text-muted-foreground">{t('examTake.minutesLabel')}</p>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-2xl font-bold">{exam.passingScore}%</p>
              <p className="text-sm text-muted-foreground">{t('examTake.toPass')}</p>
            </div>
          </div>
          <div className="bg-accent text-accent-foreground p-4 rounded-lg text-sm mb-6 flex items-start gap-2">
            <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
            {t('examTake.timerWarning')}
          </div>
          <button onClick={startExam} className="btn-primary px-8">{t('examTake.startExam')}</button>
        </div>
      </div>
    );
  }

  if (phase === 'results' && results) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
          {results.passed ? (
            <FiCheckCircle className="w-16 h-16 text-highlight mx-auto mb-4" />
          ) : (
            <FiXCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {results.passed ? t('examTake.passed') : t('examTake.notPassed')}
          </h1>
          <p className="text-4xl font-bold text-primary my-4">{results.score}%</p>
          <p className="text-muted-foreground mb-6">
            {t('examTake.pointsCount', { earned: results.earnedPoints, total: results.totalPoints, passingScore: results.passingScore })}
          </p>
          <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-primary">
            {t('examTake.backToCourse')}
          </button>
        </motion.div>
      </div>
    );
  }

  const question = exam.questions[currentQ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="sticky top-0 bg-muted/95 backdrop-blur py-3 mb-4 flex items-center justify-between z-10">
        <span className="font-medium">{exam.title}</span>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 120 ? 'text-destructive-muted-foreground animate-pulse' : ''}`}>
          <FiClock />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between mb-4">
          <span className="text-sm text-muted-foreground">{t('examTake.questionOf', { current: currentQ + 1, total: exam.questions.length })}</span>
          <span className="badge bg-muted capitalize">{question.type?.replace('_', ' ')}</span>
        </div>

        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-lg font-medium mb-4">{question.question}</h2>

          {(question.type === 'multiple_choice' || question.type === 'true_false') && (
            <div className="space-y-2">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...answers];
                    next[currentQ] = i;
                    setAnswers(next);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    answers[currentQ] === i
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-border'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.type === 'short_answer' && (
            <input
              type="text"
              value={answers[currentQ] || ''}
              onChange={(e) => {
                const next = [...answers];
                next[currentQ] = e.target.value;
                setAnswers(next);
              }}
              className="input-field"
              placeholder={t('examTake.typeAnswer')}
            />
          )}
        </motion.div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="btn-secondary disabled:opacity-50"
          >
            {t('examTake.previous')}
          </button>

          {currentQ < exam.questions.length - 1 ? (
            <button onClick={() => setCurrentQ((q) => q + 1)} className="btn-primary">{t('examTake.next')}</button>
          ) : (
            <button
              onClick={() => {
                if (confirm(t('examTake.submitConfirm'))) handleSubmit();
              }}
              disabled={phase === 'submitting'}
              className="btn-primary"
            >
              {phase === 'submitting' ? t('examTake.submitting') : t('examTake.submitExam')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamTake;
