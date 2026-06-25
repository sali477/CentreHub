import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { quizAPI } from '../api/index';

const QuizTake = () => {
  const { courseId, quizId } = useParams();
  const { t } = useTranslation();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [results, setResults] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const handleSubmit = useCallback(async (finalAnswers) => {
    if (phase === 'results' || !quizId) return;
    setPhase('submitting');
    try {
      const { data } = await quizAPI.submit(quizId, finalAnswers ?? answers);
      setResults(data.data);
      setPhase('results');
    } catch (err) {
      setPhase('taking');
      alert(err.response?.data?.message || t('quizTake.submissionFailed'));
    }
  }, [quizId, answers, phase]);

  useEffect(() => {
    if (!quizId) {
      setLoadError(t('quizTake.invalidLink'));
      setPhase('error');
      return;
    }

    setPhase('loading');
    setLoadError(null);

    quizAPI
      .getOne(quizId)
      .then(({ data }) => {
        const quizData = data.data;
        if (!quizData?.questions?.length) {
          setLoadError(t('quizTake.noQuestions'));
          setPhase('error');
          return;
        }
        setQuiz(quizData);
        setAnswers(new Array(quizData.questions.length).fill(null));
        setTimeLeft((quizData.timeLimit || 30) * 60);
        setPhase('taking');
      })
      .catch((err) => {
        setLoadError(err.response?.data?.message || t('quizTake.loadFailed'));
        setPhase('error');
      });
  }, [quizId]);

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

  const backToCourse = `/courses/${courseId}`;

  if (phase === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (phase === 'error' || !quiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FiAlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-foreground mb-6">{loadError || t('quizTake.notAvailable')}</p>
        <Link to={backToCourse} className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft /> {t('quizTake.backToCourse')}
        </Link>
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
            {results.passed ? t('quizTake.passed') : t('quizTake.notPassed')}
          </h1>
          <p className="text-4xl font-bold text-primary my-4">{results.score}%</p>
          <p className="text-muted-foreground mb-6">
            {t('quizTake.correctCount', { correct: results.correct, total: results.total, passingScore: results.passingScore })}
          </p>

          <div className="text-left space-y-4 mb-6">
            {results.results?.map((r, i) => (
              <div key={i} className={`p-4 rounded-lg ${r.isCorrect ? 'bg-accent' : 'bg-destructive-muted'}`}>
                <p className="font-medium text-sm">{r.question}</p>
                <p className="text-sm mt-1">
                  {t('quizTake.yourAnswer', { answer: r.options?.[r.yourAnswer] ?? r.yourAnswer })}
                  {!r.isCorrect && (
                    <span className="text-accent-foreground ml-2">
                      {t('quizTake.correctAnswer', { answer: r.options?.[r.correctAnswer] ?? r.correctAnswer })}
                    </span>
                  )}
                </p>
                {r.explanation && <p className="text-xs text-muted-foreground mt-1">{r.explanation}</p>}
              </div>
            ))}
          </div>

          <Link to={backToCourse} className="btn-primary inline-flex items-center gap-2">
            <FiArrowLeft /> {t('quizTake.backToCourse')}
          </Link>
        </motion.div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  if (!question) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{t('quizTake.unableLoadQuestion')}</p>
        <Link to={backToCourse} className="btn-primary">{t('quizTake.backToCourse')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to={backToCourse} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <FiArrowLeft /> {t('quizTake.back')}
        </Link>
        <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 60 ? 'text-destructive-muted-foreground' : 'text-foreground'}`}>
          <FiClock />
          {formatTime(timeLeft ?? 0)}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <span className="text-sm text-muted-foreground">
            {t('quizTake.questionOf', { current: currentQ + 1, total: quiz.questions.length })}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-6">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-lg font-medium mb-4">{question.question}</h2>
          <div className="space-y-2">
            {question.options?.map((option, i) => (
              <button
                key={i}
                type="button"
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
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {option}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="btn-secondary disabled:opacity-50"
          >
            {t('quizTake.previous')}
          </button>

          {currentQ < quiz.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQ((q) => q + 1)}
              disabled={answers[currentQ] === null}
              className="btn-primary disabled:opacity-50"
            >
              {t('quizTake.next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={answers.some((a) => a === null) || phase === 'submitting'}
              className="btn-primary disabled:opacity-50"
            >
              {phase === 'submitting' ? t('quizTake.submitting') : t('quizTake.submitQuiz')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
