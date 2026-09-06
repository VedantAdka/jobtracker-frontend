import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../api/applicationsApi'
import { getResumeStatus } from '../api/resumeApi'
import KanbanBoard from '../components/KanbanBoard'
import ApplicationModal from '../components/ApplicationModal'
import ResumeCard from '../components/ResumeCard'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null) // null = "new application" mode

  useEffect(() => {
    Promise.all([getApplications(), getResumeStatus()])
      .then(([apps, resumeStatus]) => {
        setApplications(apps)
        setResume(resumeStatus)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openNewModal = () => {
    setSelectedApp(null)
    setModalOpen(true)
  }

  const openEditModal = (app) => {
    setSelectedApp(app)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedApp(null)
  }

  const handleSave = async (formData) => {
    if (selectedApp) {
      const updated = await updateApplication(selectedApp.id, formData)
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    } else {
      const created = await createApplication(formData)
      setApplications((prev) => [...prev, created])
    }
    closeModal()
  }

  const handleDelete = async (id) => {
    await deleteApplication(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
    closeModal()
  }

  // Keeps the board's copy of this application in sync after an analysis
  // runs, so re-opening it later shows the saved results without a refetch.
  const handleAnalyzed = (updated) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId
    const app = applications.find((a) => String(a.id) === draggableId)
    if (!app) return

    const previous = applications
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
    )

    try {
      await updateApplication(app.id, {
        company: app.company,
        jobTitle: app.jobTitle,
        appliedDate: app.appliedDate,
        notes: app.notes,
        status: newStatus,
      })
    } catch (err) {
      setApplications(previous)
    }
  }

  const countOf = (status) => applications.filter((a) => a.status === status).length

  return (
    <div>
      <div className="topbar">
        <div className="topbar-brand">
          <div className="logo-badge">JT</div>
          <h1>Job Tracker</h1>
        </div>
        <div className="user-info">
          <Link to="/analytics" className="analytics-link">View analytics</Link>
          <span>{user?.fullName}</span>
          <button className="btn-secondary" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="board-page">
        {!loading && <ResumeCard resume={resume} onUploaded={setResume} />}

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label"><span className="stat-dot" style={{ background: '#3B82F6' }} />Total</div>
            <p className="stat-value">{applications.length}</p>
          </div>
          <div className="stat-card">
            <div className="stat-label"><span className="stat-dot" style={{ background: '#F59E0B' }} />Interview</div>
            <p className="stat-value">{countOf('INTERVIEW')}</p>
          </div>
          <div className="stat-card">
            <div className="stat-label"><span className="stat-dot" style={{ background: '#10B981' }} />Offer</div>
            <p className="stat-value">{countOf('OFFER')}</p>
          </div>
          <div className="stat-card">
            <div className="stat-label"><span className="stat-dot" style={{ background: '#F43F5E' }} />Rejected</div>
            <p className="stat-value">{countOf('REJECTED')}</p>
          </div>
        </div>

        <div className="board-page-header">
          <h2>Your applications</h2>
          <button className="btn-gradient" onClick={openNewModal}>+ New application</button>
        </div>

        {loading ? (
          <p className="board-loading">Loading...</p>
        ) : (
          <KanbanBoard
            applications={applications}
            onDragEnd={handleDragEnd}
            onCardClick={openEditModal}
          />
        )}
      </div>

      {modalOpen && (
        <ApplicationModal
          application={selectedApp}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          onAnalyzed={handleAnalyzed}
        />
      )}
    </div>
  )
}
