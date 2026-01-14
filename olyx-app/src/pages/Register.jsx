import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { hashSHA256, isGmailAddress, isValidPassword } from '../utils/hash'

const COUNTRIES = [
  'United States',
  'Japan',
  'Russia',
  'India',
  'Australia',
  'Indonesia',
  'Thailand',
  'United Kingdom',
  'Europe',
  'Canada',
]

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    gender: '',
    country: '',
    secretQuestion: '',
    secretAnswer: '',
    acceptTerms: false,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword ||
        !formData.fullName || !formData.gender || !formData.country ||
        !formData.secretQuestion || !formData.secretAnswer) {
      return 'All fields are required'
    }

    if (!isGmailAddress(formData.email)) {
      return 'Only Gmail addresses are allowed'
    }

    if (!isValidPassword(formData.password)) {
      return 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }

    if (formData.secretAnswer.toLowerCase() === formData.password.toLowerCase()) {
      return 'Secret answer cannot be the same as password'
    }

    if (!formData.acceptTerms) {
      return 'You must accept the Terms & Privacy Policy'
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // Hash the secret answer
      const secretAnswerHash = await hashSHA256(formData.secretAnswer)

      // Sign up with Supabase Auth
      const { data, error: signUpError } = await signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (data.user) {
        // Insert profile data
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          gender: formData.gender,
          country: formData.country,
          secret_question: formData.secretQuestion,
          secret_answer_hash: secretAnswerHash,
          plan: 'free',
        })

        if (profileError) {
          throw new Error(profileError.message)
        }

        navigate('/home')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Your Olyx Account</h1>
        <p className="auth-subtitle">All fields are mandatory</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email (Gmail only)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@gmail.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="secretQuestion">Secret Question</label>
            <input
              type="text"
              id="secretQuestion"
              name="secretQuestion"
              value={formData.secretQuestion}
              onChange={handleChange}
              placeholder="e.g., What is your pet's name?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="secretAnswer">Secret Answer</label>
            <input
              type="text"
              id="secretAnswer"
              name="secretAnswer"
              value={formData.secretAnswer}
              onChange={handleChange}
              placeholder="Your answer (for password recovery)"
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
            />
            <label htmlFor="acceptTerms">
              I accept the <Link to="/terms">Terms</Link> &{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
