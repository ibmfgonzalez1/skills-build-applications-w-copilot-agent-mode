import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
import { API_BASE_URL } from './api.js'
import './App.css'

const navigation = [
  { to: '/activities', label: 'Activities', number: '01' },
  { to: '/leaderboard', label: 'Leaderboard', number: '02' },
  { to: '/teams', label: 'Teams', number: '03' },
  { to: '/users', label: 'Users', number: '04' },
  { to: '/workouts', label: 'Workouts', number: '05' },
]

function App() {
  const location = useLocation()
  const isLocalApi = API_BASE_URL.startsWith('http://localhost')
  const currentPage = navigation.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Activities'

  return (
    <div className="tracker-shell">
      <aside className="sidebar">
        <NavLink to="/activities" className="brand-lockup" aria-label="OctoFit Tracker home">
          <span className="brand-mark">O</span>
          <span className="brand-name">octofit<span>tracker</span></span>
        </NavLink>

        <p className="side-caption">MERGINGTON HIGH / PE</p>
        <nav className="primary-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `navigation-link${isActive ? ' is-active' : ''}`}
            >
              <span className="navigation-number">{item.number}</span>
              <span>{item.label}</span>
              <span className="navigation-arrow" aria-hidden="true">&gt;</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-stamp">MOVE<br />TOGETHER</span>
          <span className="sidebar-year">EST. 2026</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>OCTOFIT</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{currentPage}</strong>
          </div>
          <div className="connection-status">
            <span className="connection-dot" />
            <span>{isLocalApi ? 'LOCAL API' : 'CODESPACES API'}</span>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/activities" replace />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/users" element={<Users />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="*" element={<Navigate to="/activities" replace />} />
          </Routes>
        </main>
        <footer className="main-footer">
          <span>OCTOFIT TRACKER</span>
          <span>MERGINGTON HIGH SCHOOL</span>
        </footer>
      </div>
    </div>
  )
}

export default App
