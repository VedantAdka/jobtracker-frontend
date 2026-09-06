import { useState, useEffect } from 'react'
import { analyzeApplication } from '../api/applicationsApi'
import { generateQuestions, getQuestions, updateQuestion } from '../api/questionsApi'

const STATUS_OPTIONS = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']

// One modal handles both create and edit - if `application` is null,
// it's a blank "new application" form; if it's an object, every field
// is pre-filled and a Delete button appears. The AI analysis section
// only makes sense in edit mode, since you need a saved application to
// attach a job description and its results to.
export default function ApplicationModal({ application, onClose, onSave, onDelete, onAnalyzed }) {
  const isEditMode = Boolean(application)

  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [status, setStatus] = useState('APPLIED')
  const [appliedDate, setAppliedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)

  const [questions, setQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState('')

  useEffect(() => {
    if (application) {
      setCompany(application.company || '')
      setJobTitle(application.jobTitle || '')
      setStatus(application.status || 'APPLIED')
      setAppliedDate(application.appliedDate || '')
      setNotes(application.notes || '')
      setJobDescription(application.jobDescription || '')
      setAnalysisResult(
        application.matchScore != null
          ? {
              matchScore: application.matchScore,
              missingSkills: application.missingSkills || [],
              resumeSuggestions: application.resumeSuggestions,
            }
          : null
      )
    }
  }, [application])

  // Loads any previously-generated questions when opening a card that's
  // already been analyzed - a freshly-analyzed one just starts with none
  // until "Generate questions" is clicked.
  useEffect(() => {
    if (application?.matchScore != null) {
      setLoadingQuestions(true)
      getQuestions(application.id)
        .then(setQuestions)
        .finally(() => setLoadingQuestions(false))
    } else {
      setQuestions([])
    }
  }, [application])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company.trim() || !jobTitle.trim()) {
      setError('Company and job title are required.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await onSave({ company, jobTitle, status, appliedDate: appliedDate || null, notes })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return
    setAnalysisError('')
    setAnalyzing(true)
    try {
      const updated = await analyzeApplication(application.id, jobDescription)
      setAnalysisResult({
        matchScore: updated.matchScore,
        missingSkills: updated.missingSkills,
        resumeSuggestions: updated.resumeSuggestions,
      })
      onAnalyzed(updated) // keeps Dashboard's list in sync too
    } catch (err) {
      setAnalysisError(err.response?.data?.error || 'Analysis failed. Try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateQuestions = async () => {
    setQuestionsError('')
    setGeneratingQuestions(true)
    try {
      const generated = await generateQuestions(application.id)
      setQuestions(generated)
    } catch (err) {
      setQuestionsError(err.response?.data?.error || 'Could not generate questions. Try again.')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const handleToggleQuestion = async (questionId, practiced) => {
    // Optimistic, same pattern as the drag-and-drop in step 5 - update the
    // screen immediately, roll back only if the request actually fails.
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, practiced } : q)))
    try {
      await updateQuestion(application.id, questionId, practiced)
    } catch (err) {
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, practiced: !practiced } : q)))
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditMode ? 'Application details' : 'New application'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="company">Company</label>
            <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>

          <div className="form-field">
            <label htmlFor="jobTitle">Job title</label>
            <input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
          </div>

          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="appliedDate">Applied date</label>
            <input
              id="appliedDate"
              type="date"
              value={appliedDate || ''}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            {isEditMode ? (
              <button type="button" className="btn-danger" onClick={() => onDelete(application.id)}>
                Delete
              </button>
            ) : <span />}
            <div className="modal-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEditMode ? 'Save changes' : 'Add application'}
              </button>
            </div>
          </div>
        </form>

        {isEditMode && (
          <div className="analysis-section">
            <div className="form-field">
              <label htmlFor="jobDescription">Job description</label>
              <textarea
                id="jobDescription"
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to check your resume match"
              />
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleAnalyze}
              disabled={analyzing || !jobDescription.trim()}
            >
              {analyzing ? 'Analyzing...' : 'Analyze match'}
            </button>

            {analysisError && <p className="error-text" style={{ marginTop: '0.6rem' }}>{analysisError}</p>}

            {analysisResult && (
              <div className="analysis-results">
                <div className="match-score-row">
                  <span>Match score</span>
                  <span className="match-score-value">{analysisResult.matchScore}%</span>
                </div>
                {analysisResult.missingSkills?.length > 0 && (
                  <div className="missing-skills">
                    {analysisResult.missingSkills.map((skill) => (
                      <span className="skill-pill" key={skill}>{skill}</span>
                    ))}
                  </div>
                )}
                {analysisResult.resumeSuggestions && (
                  <p className="suggestions-text">{analysisResult.resumeSuggestions}</p>
                )}
              </div>
            )}

            {analysisResult && (
              <div className="questions-section">
                <div className="questions-header">
                  <span>Interview prep</span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleGenerateQuestions}
                    disabled={generatingQuestions}
                  >
                    {generatingQuestions
                      ? 'Generating...'
                      : questions.length > 0
                      ? 'Regenerate'
                      : 'Generate questions'}
                  </button>
                </div>

                {questionsError && <p className="error-text" style={{ marginTop: '0.5rem' }}>{questionsError}</p>}

                {loadingQuestions ? (
                  <p className="board-loading">Loading...</p>
                ) : (
                  questions.length > 0 && (
                    <ul className="question-list">
                      {questions.map((q) => (
                        <li key={q.id} className="question-item">
                          <label>
                            <input
                              type="checkbox"
                              checked={q.practiced}
                              onChange={(e) => handleToggleQuestion(q.id, e.target.checked)}
                            />
                            <span className={q.practiced ? 'practiced' : ''}>{q.question}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
