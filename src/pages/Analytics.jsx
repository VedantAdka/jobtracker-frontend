import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { getApplications } from '../api/applicationsApi'

// Groups applications by calendar month. Uses "YYYY-MM" as the sort key
// (sorts correctly as a plain string, unlike "Jan 26" vs "Feb 26" would)
// and only converts to a display label AFTER sorting.
function getApplicationsByMonth(applications) {
  const counts = {}
  applications.forEach((app) => {
    const dateStr = app.appliedDate || app.createdAt
    if (!dateStr) return
    const date = new Date(dateStr)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    counts[key] = (counts[key] || 0) + 1
  })

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [year, month] = key.split('-')
      const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      })
      return { month: label, count }
    })
}

function getStatusCounts(applications) {
  const statuses = [
    { key: 'APPLIED', label: 'Applied', color: '#3B82F6' },
    { key: 'INTERVIEW', label: 'Interview', color: '#F59E0B' },
    { key: 'OFFER', label: 'Offer', color: '#10B981' },
    { key: 'REJECTED', label: 'Rejected', color: '#F43F5E' },
  ]
  return statuses.map((s) => ({
    status: s.label,
    count: applications.filter((a) => a.status === s.key).length,
    fill: s.color,
  }))
}

// Normalizes by lowercase/trimmed text so "TypeScript" and "typescript"
// from different AI responses count as the same skill, but keeps the
// first-seen casing for display.
function getTopMissingSkills(applications, limit = 8) {
  const counts = {}
  applications.forEach((app) => {
    ;(app.missingSkills || []).forEach((skill) => {
      const key = skill.trim().toLowerCase()
      if (!key) return
      if (!counts[key]) counts[key] = { skill: skill.trim(), count: 0 }
      counts[key].count += 1
    })
  })
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export default function Analytics() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const byMonth = getApplicationsByMonth(applications)
  const byStatus = getStatusCounts(applications)
  const topSkills = getTopMissingSkills(applications)
  const analyzedCount = applications.filter((a) => a.matchScore != null).length

  return (
    <div>
      <div className="topbar">
        <div className="topbar-brand">
          <div className="logo-badge">JT</div>
          <h1>Job Tracker</h1>
        </div>
        <div className="user-info">
          <Link to="/dashboard" className="analytics-link">Back to board</Link>
          <span>{user?.fullName}</span>
          <button className="btn-secondary" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="board-page">
        <h2 style={{ marginBottom: '1.25rem' }}>Analytics</h2>

        {loading ? (
          <p className="board-loading">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="board-loading">Add a few applications first to see analytics here.</p>
        ) : (
          <>
            <div className="chart-card">
              <h3>Applications over time</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E5EC" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4338CA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Applications by status</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E5EC" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Most common missing skills</h3>
              {analyzedCount === 0 ? (
                <p className="board-loading">Run an analysis on at least one application to see this.</p>
              ) : topSkills.length === 0 ? (
                <p className="board-loading">No skill gaps found yet - nice work.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, topSkills.length * 40)}>
                  <BarChart data={topSkills} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E5EC" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="skill" type="category" width={160} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#B91C1C" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
