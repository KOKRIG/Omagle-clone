import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return children
}
