import { useState, useRef } from 'react'
import { uploadResume } from '../api/resumeApi'

export default function ResumeCard({ resume, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError('')
    setUploading(true)
    try {
      const updated = await uploadResume(file)
      onUploaded(updated)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
      e.target.value = '' // lets the same file be re-selected later if needed
    }
  }

  return (
    <div className="resume-card">
      <div>
        {resume?.hasResume ? (
          <>
            <p className="resume-card-title">Resume uploaded</p>
            <p className="resume-card-sub">{resume.fileName} &middot; {resume.textLength} characters extracted</p>
          </>
        ) : (
          <>
            <p className="resume-card-title">No resume uploaded yet</p>
            <p className="resume-card-sub">Upload a PDF to unlock AI job-match analysis</p>
          </>
        )}
        {error && <p className="error-text" style={{ margin: '0.4rem 0 0' }}>{error}</p>}
      </div>

      <div>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button className="btn-secondary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : resume?.hasResume ? 'Replace resume' : 'Upload resume'}
        </button>
      </div>
    </div>
  )
}
