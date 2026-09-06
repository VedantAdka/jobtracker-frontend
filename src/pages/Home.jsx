import { Link } from 'react-router-dom'

const FEATURES = [
  {
    title: 'Board that stays organized',
    description: 'Drag applications between stages as things move.',
    className: 'feature-blue',
  },
  {
    title: 'AI resume matching',
    description: "See what a job description wants that your resume doesn't say yet.",
    className: 'feature-purple',
  },
  {
    title: 'Interview prep',
    description: 'Get likely questions based on the gaps found.',
    className: 'feature-green',
  },
]

export default function Home() {
  return (
    <div className="home-page">
      <div className="topbar-brand home-brand">
        <div className="logo-badge">JT</div>
        <span className="home-brand-name">Job Tracker</span>
      </div>

      <div className="home-hero">
        <h1>Track every application. Land the job.</h1>
        <p>One board for every application, an AI check against each job description, and interview prep tailored to what you're missing.</p>
        <div className="home-cta-row">
          <Link to="/login" className="home-cta-secondary">Log in</Link>
          <Link to="/register" className="home-cta-primary">Register</Link>
        </div>
      </div>

      <div className="feature-grid">
        {FEATURES.map((feature) => (
          <div className={`feature-card ${feature.className}`} key={feature.title}>
            <p className="f-title">{feature.title}</p>
            <p className="f-desc">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
