import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiLink, FiFileText, FiVideo, FiHelpCircle } from 'react-icons/fi';
import { courseAPI, uploadAPI } from '../../../api/index';
import useMyTeacher from '../../../hooks/useMyTeacher';
import TeacherSetupBanner from './TeacherSetupBanner';
import { validateVideoUrl } from '../../../utils/videoUrl';

const MAX_FILE_MB = 100;

const getUploadErrorMessage = (err, type) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (!err.response) {
    return 'Cannot reach the server. Make sure the backend is running.';
  }
  return `${type} upload failed. Please try again.`;
};

const isPdfFile = (file) =>
  file.type === 'application/pdf' ||
  file.type === 'application/x-pdf' ||
  file.name.toLowerCase().endsWith('.pdf');

const TeacherContent = () => {
  const { t } = useTranslation();
  const { teacher, loading, refresh } = useMyTeacher();
  const location = useLocation();
  const [courseId, setCourseId] = useState('');
  const [course, setCourse] = useState(null);
  const [contentType, setContentType] = useState('video');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [meta, setMeta] = useState({ title: '', description: '' });
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfDriveUrl, setPdfDriveUrl] = useState('');
  const [pdfMode, setPdfMode] = useState('drive');
  const [quizForm, setQuizForm] = useState({
    title: '', description: '', timeLimit: 30, passingScore: 60,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
  });
  const [storageMode, setStorageMode] = useState('local');

  useEffect(() => {
    uploadAPI.status().then(({ data }) => setStorageMode(data.storage)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.courseId) setCourseId(location.state.courseId);
  }, [location.state]);

  useEffect(() => {
    if (courseId) {
      courseAPI.getOne(courseId).then(({ data }) => setCourse(data.data)).catch(() => setCourse(null));
    } else {
      setCourse(null);
    }
  }, [courseId]);

  const handleAddVideoLesson = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setMessage('Please select a course first.');
      return;
    }
    if (!meta.title.trim()) {
      setMessage('Please enter a lesson title.');
      return;
    }

    const check = validateVideoUrl(videoUrl);
    if (!check.valid) {
      setMessage(check.message);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await uploadAPI.addVideoLesson({
        courseId,
        title: meta.title.trim(),
        description: meta.description.trim(),
        url: check.url,
      });
      setMessage('Video lesson added successfully');
      setMeta({ title: '', description: '' });
      setVideoUrl('');
      const { data } = await courseAPI.getOne(courseId);
      setCourse(data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add video lesson');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPdfLesson = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setMessage('Please select a course first.');
      return;
    }
    if (!meta.title.trim()) {
      setMessage('Please enter a title.');
      return;
    }

    const check = validateVideoUrl(pdfDriveUrl);
    if (!check.valid) {
      setMessage(check.message);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await uploadAPI.addPdfLesson({
        courseId,
        title: meta.title.trim(),
        description: meta.description.trim(),
        url: check.url,
      });
      setMessage('PDF lesson added successfully');
      setMeta({ title: '', description: '' });
      setPdfDriveUrl('');
      const { data } = await courseAPI.getOne(courseId);
      setCourse(data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add PDF lesson');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!courseId) {
      setMessage('Please select a course first.');
      return;
    }
    if (!meta.title.trim()) {
      setMessage('Please enter a title before uploading.');
      return;
    }
    if (!file) {
      setMessage('Please choose a file to upload.');
      return;
    }

    if (!isPdfFile(file)) {
      setMessage('Invalid file. Please upload a PDF document (.pdf only).');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setMessage(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('title', meta.title.trim());
    formData.append('description', meta.description.trim());

    try {
      await uploadAPI.pdf(formData);
      setMessage('PDF uploaded successfully');
      setMeta({ title: '', description: '' });
      e.target.value = '';
      const { data } = await courseAPI.getOne(courseId);
      setCourse(data.data);
    } catch (err) {
      setMessage(getUploadErrorMessage(err, 'PDF'));
    } finally {
      setUploading(false);
    }
  };

  const handleQuizCreate = async (e) => {
    e.preventDefault();
    if (!courseId) return;
    setUploading(true);
    try {
      await uploadAPI.quiz({
        ...quizForm,
        course: courseId,
        questions: quizForm.questions.filter((q) => q.question.trim()),
      });
      setMessage('Quiz created successfully');
      const { data } = await courseAPI.getOne(courseId);
      setCourse(data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  const needsSetup = !teacher;
  const courses = teacher?.courses || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard.teacher.nav.content')}</h1>
      <p className="text-muted-foreground mb-6">Add Google Drive links for videos and PDFs, or upload PDF files, and create quizzes</p>

      {needsSetup && <TeacherSetupBanner onComplete={refresh} />}

      {message && !needsSetup && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.toLowerCase().includes('success')
            ? 'bg-accent text-accent-foreground border border-border'
            : 'bg-destructive-muted text-destructive-muted-foreground border border-destructive-muted'
        }`}>
          {message}
        </div>
      )}

      {!needsSetup && (
      <>
      <div className="bg-accent border border-border text-accent-foreground text-sm p-4 rounded-lg mb-6">
        <p>
          <strong>Video lessons:</strong> Paste a Google Drive share link (students open it in a new tab).
        </p>
        <p className="mt-2">
          <strong>PDFs:</strong> Paste a Google Drive link (recommended) or upload a file
          {storageMode === 'cloudinary' ? ' to Cloudinary' : ' locally'}.
        </p>
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Select Course</label>
          <select className="input-field" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Choose a course...</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>

        {course && (
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-accent rounded-lg p-3">
              <FiVideo className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-semibold">{course.videos?.length || 0}</p>
              <p className="text-muted-foreground">Video lessons</p>
            </div>
            <div className="bg-accent rounded-lg p-3">
              <FiFileText className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-semibold">{course.pdfs?.length || 0}</p>
              <p className="text-muted-foreground">PDFs</p>
            </div>
            <div className="bg-accent rounded-lg p-3">
              <FiHelpCircle className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-semibold">{course.quizzes?.length || 0}</p>
              <p className="text-muted-foreground">Quizzes</p>
            </div>
          </div>
        )}
      </div>

      {courseId && (
        <>
          <div className="flex gap-2 mb-4">
            {[
              { id: 'video', label: 'Video link', icon: FiVideo },
              { id: 'pdf', label: 'PDF', icon: FiFileText },
              { id: 'quiz', label: 'Quiz', icon: FiHelpCircle },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setContentType(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  contentType === id ? 'bg-accent text-accent-foreground' : 'bg-card border border-border text-muted-foreground'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {contentType === 'video' && (
            <form onSubmit={handleAddVideoLesson} className="card p-6 space-y-4">
              <h2 className="font-semibold">Add video lesson (Google Drive)</h2>
              <input
                required
                className="input-field"
                placeholder="Lesson title *"
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              />
              <textarea
                className="input-field"
                rows={2}
                placeholder="Description (optional)"
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Video URL (Google Drive) *
                </label>
                <div className="relative">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    required
                    type="url"
                    className="input-field pl-10"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share the file in Google Drive, copy the link, and paste it here. Students will open it in a new tab.
                </p>
              </div>
              <button type="submit" disabled={uploading || !meta.title.trim() || !videoUrl.trim()} className="btn-primary">
                {uploading ? 'Saving...' : 'Add video lesson'}
              </button>
            </form>
          )}

          {contentType === 'pdf' && (
            <div className="card p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPdfMode('drive')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pdfMode === 'drive'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card border border-border text-muted-foreground'
                  }`}
                >
                  <FiLink className="w-4 h-4" />
                  Lien Google Drive
                </button>
                <button
                  type="button"
                  onClick={() => setPdfMode('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pdfMode === 'upload'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card border border-border text-muted-foreground'
                  }`}
                >
                  <FiFileText className="w-4 h-4" />
                  Upload fichier
                </button>
              </div>

              <input
                required
                className="input-field"
                placeholder="Titre *"
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              />
              <textarea
                className="input-field"
                rows={2}
                placeholder="Description (optionnel)"
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              />

              {pdfMode === 'drive' ? (
                <form onSubmit={handleAddPdfLesson} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Lien Google Drive (PDF) *
                    </label>
                    <div className="relative">
                      <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <input
                        required
                        type="url"
                        className="input-field pl-10"
                        placeholder="https://drive.google.com/file/d/.../view"
                        value={pdfDriveUrl}
                        onChange={(e) => setPdfDriveUrl(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Partagez le PDF sur Google Drive, copiez le lien et collez-le ici. Les étudiants l&apos;ouvriront dans un nouvel onglet.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={uploading || !meta.title.trim() || !pdfDriveUrl.trim()}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FiLink className="w-4 h-4" />
                    {uploading ? 'Enregistrement...' : 'Ajouter le PDF (Drive)'}
                  </button>
                </form>
              ) : (
                <>
                  <label
                    className={`btn-primary inline-flex items-center gap-2 cursor-pointer ${
                      !courseId || !meta.title.trim() || uploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <FiFileText className="w-4 h-4" />
                    Choisir un fichier PDF
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf,.pdf"
                      onChange={handleFileUpload}
                      disabled={uploading || !courseId || !meta.title.trim()}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">PDF uniquement • Max 100 MB</p>
                </>
              )}
            </div>
          )}

          {contentType === 'quiz' && (
            <form onSubmit={handleQuizCreate} className="card p-6 space-y-4">
              <h2 className="font-semibold">Create Quiz</h2>
              <input required className="input-field" placeholder="Quiz Title" value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} />
              <textarea className="input-field" rows={2} placeholder="Description"
                value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" min="1" className="input-field" placeholder="Time limit (min)"
                  value={quizForm.timeLimit} onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })} />
                <input type="number" min="0" max="100" className="input-field" placeholder="Passing score %"
                  value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })} />
              </div>
              {quizForm.questions.map((q, qi) => (
                <div key={qi} className="border rounded-lg p-4 space-y-2">
                  <input className="input-field" placeholder={`Question ${qi + 1}`} value={q.question}
                    onChange={(e) => {
                      const questions = [...quizForm.questions];
                      questions[qi] = { ...questions[qi], question: e.target.value };
                      setQuizForm({ ...quizForm, questions });
                    }} />
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi}
                        onChange={() => {
                          const questions = [...quizForm.questions];
                          questions[qi] = { ...questions[qi], correctAnswer: oi };
                          setQuizForm({ ...quizForm, questions });
                        }} />
                      <input className="input-field flex-1" placeholder={`Option ${oi + 1}`} value={opt}
                        onChange={(e) => {
                          const questions = [...quizForm.questions];
                          questions[qi].options[oi] = e.target.value;
                          setQuizForm({ ...quizForm, questions });
                        }} />
                    </div>
                  ))}
                </div>
              ))}
              <button type="button" className="btn-secondary text-sm"
                onClick={() => setQuizForm({
                  ...quizForm,
                  questions: [...quizForm.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }],
                })}>
                Add Question
              </button>
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? 'Creating...' : 'Create Quiz'}
              </button>
            </form>
          )}
        </>
      )}
      </>
      )}

      {needsSetup && (
        <div className="card p-8 text-center text-muted-foreground">
          <p>Complete your teacher profile above to add videos, PDFs, and quizzes.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherContent;
