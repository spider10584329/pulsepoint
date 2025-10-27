'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../lib/context/ToastContext'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    // Registration fields
    company: '',
    hotelname: '',
    firstname: '',
    lastname: '',
    phonenumber: '',
    address: '',
    contact: '',
    confirmPassword: '',
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  // Removed complex authentication logic - using direct API calls instead

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLoginClick = async () => {
    setSubmitLoading(true)

    try {
      // Validate required fields
      if (!formData.email || !formData.password) {
        showToast('error', 'Validation Error', 'Please fill in all required fields.')
        return
      }
      
      // Direct call to backend using existing user endpoints
      const response = await fetch('http://localhost:5001/api/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Check if login was successful based on backend response structure
        if (data.status === 1) {
          // Check if user is verified
          if (data.user.isVerify === 1) {
            // User is verified, redirect based on role
            showToast('success', 'Login Successful', 'Welcome back! Redirecting...')
            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user', JSON.stringify(data.user))
            
            // Role-based routing
            let redirectPath = '/dashboard' // default for regular users (role 1)
            if (data.user.role === 0) {
              redirectPath = '/admin'
            } else if (data.user.role === 2) {
              redirectPath = '/supportTeam'
            } else if (data.user.role === 1) {
              redirectPath = '/user'
            }
            
            setTimeout(() => router.push(redirectPath), 1500)
          } else {
            // User is not verified, redirect to verification page
            showToast('warning', 'Verification Required', 'Please verify your email address to continue.')
            localStorage.setItem('pendingUserId', data.user.id.toString())
            localStorage.setItem('pendingUserEmail', data.user.email)
            setTimeout(() => router.push(`/verify?id=${data.user.id}&email=${encodeURIComponent(data.user.email)}`), 1500)
          }
        } else {
          // Login failed
          showToast('error', 'Login Failed', data.message || 'Authentication failed')
        }
      } else {
        // Error from backend
        showToast('error', 'Login Failed', data.message || 'Authentication failed')
      }
      
    } catch (error: any) {
      showToast('error', 'Connection Failed', 'Cannot connect to server. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleRegisterClick = async () => {
    setSubmitLoading(true)
    
    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        showToast('error', 'Password Mismatch', 'Passwords do not match. Please try again.')
        return
      }

      // Validate required fields
      const requiredFields = ['company', 'hotelname', 'firstname', 'lastname', 'email', 'phonenumber', 'address', 'contact', 'password']
      const emptyFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
      
      if (emptyFields.length > 0) {
        showToast('error', 'Validation Error', 'Please fill in all required fields.')
        return
      }

      // Direct call to backend using existing user registration endpoint
      const response = await fetch('http://localhost:5001/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: formData.company,
          hotelname: formData.hotelname,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phonenumber: formData.phonenumber,
          address: formData.address,
          contact: formData.contact,
          password: formData.password
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Check registration status based on backend response structure
        if (data.status === 1) {
          // Registration successful - user needs to verify email
          showToast('success', 'Registration Successful', 'Account created! Please check your email for verification code.')
          
          // Store user info for verification page
          localStorage.setItem('pendingUserId', data.userId.toString())
          localStorage.setItem('pendingUserEmail', formData.email)
          
          // Redirect to verification page
          setTimeout(() => router.push(`/verify?id=${data.userId}&email=${encodeURIComponent(formData.email)}`), 1500)
        } else {
          // Registration failed
          showToast('error', 'Registration Failed', data.message || 'Registration failed')
        }
      } else {
        // Error from backend
        showToast('error', 'Registration Failed', data.message || 'Registration failed')
      }
      
    } catch (error: any) {
      showToast('error', 'Connection Failed', 'Cannot connect to server. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Removed loading states - using direct button click handlers instead

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#b1bcd4' }}>
      {/* Responsive Login Card */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-6xl mx-auto">
        <div className="flex flex-col xl:flex-row min-h-[500px] xl:min-h-[600px]">
          {/* Image Section - Always visible, responsive positioning */}
          <div className="xl:w-2/5 w-full flex items-center justify-center p-4 xl:p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src="/homeoftools.png" 
                alt="Home of Tools" 
                className="w-full max-w-xs xl:max-w-full h-auto xl:max-h-full object-contain"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="xl:w-3/5 w-full px-4 sm:px-6 xl:px-8 py-6 xl:py-8 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-4 xl:mb-6">
                <h1 className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-800 mb-2">
                  {isLogin ? 'Sign in to Your Account' : 'Create Your Account'}
                </h1>
              </div>

              {isLogin ? (
                // Login Form
                <div className="space-y-4 xl:space-y-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className='pt-8'>
                       <button
                          onClick={handleLoginClick}
                          disabled={submitLoading}
                          className="w-full  bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {submitLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                  </div>
                 
                </div>
              ) : (
                // Registration Form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="hotelname" className="block text-sm font-medium text-gray-700 mb-2">
                        Hotel Name *
                      </label>
                      <input
                        type="text"
                        id="hotelname"
                        name="hotelname"
                        value={formData.hotelname}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="Hotel name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="First name"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="Email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phonenumber"
                        name="phonenumber"
                        value={formData.phonenumber}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm resize-none"
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information *
                    </label>
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                      placeholder="Additional contact information"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="Password"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Min 8 characters with uppercase, lowercase, and number
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-sm"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRegisterClick}
                    disabled={submitLoading}
                    className="w-full bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              )}

              <div className="mt-6 ">
                {isLogin ? (
                  <button 
                    onClick={() => setIsLogin(false)} 
                    className="text-gray-700 hover:text-black text-sm font-medium"
                  >
                    Forgot password ?
                  </button>
                ) : null}
              </div>

              <div className="mt-1 ">
                <p className="text-gray-600 text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-gray-700 hover:text-black font-medium"
                  >
                    {isLogin ? 'Register' : 'Sign in here'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
