import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { hashSHA256, isValidPassword } from '../utils/hash'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: email, 2: answer question, 3: new password
  const [email, setEmail] = useState('')
  const [secretQuestion, setSecretQuestion] = useState('')
  const [secretAnswer, setSecretAnswer] = useState('')
  const [storedAnswerHash, setStoredAnswerHash] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userId, setUserId] = useState(null)
  const [resetToken, setResetToken] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)

    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, secret_question, secret_answer_hash')
        .eq('email', email.toLowerCase())
        .single()

      if (queryError || !data) {
        throw new Error('Email not found')
      }

      setUserId(data.id)
      setSecretQuestion(data.secret_question)
      setStoredAnswerHash(data.secret_answer_hash)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Email not found')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!secretAnswer) {
      setError('Please enter your answer')
      return
    }

    setLoading(true)

    try {
      const answerHash = await hashSHA256(secretAnswer)

      if (answerHash !== storedAnswerHash) {
        throw new Error('Incorrect answer')
      }

      // Create a reset token
      const { data: token, error: tokenError } = await supabase.rpc(
        'create_reset_token',
        { p_user_id: userId }
      )

      if (tokenError || !token) {
        throw new Error('Failed to create reset token')
      }

      setResetToken(token)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Incorrect answer')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields')
      return
    }

    if (!isValidPassword(newPassword)) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Call the Edge Function to reset password
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const apiUrl = `${supabaseUrl}/functions/v1/reset-password`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to reset password')
      }

      navigate('/login')
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          {step === 1 && 'Enter your email to begin'}
          {step === 2 && 'Answer your security question'}
          {step === 3 && 'Set your new password'}
        </p>

        {error && <div className="error-message">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                autoComplete="email"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAnswerSubmit} className="auth-form">
            <div className="form-group">
              <label>Your Security Question</label>
              <p className="security-question">{secretQuestion}</p>
            </div>

            <div className="form-group">
              <label htmlFor="secretAnswer">Your Answer</label>
              <input
                type="text"
                id="secretAnswer"
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                placeholder="Enter your answer"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Answer'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(2)}
            >
              Back
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
