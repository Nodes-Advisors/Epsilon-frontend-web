import React, { FormEventHandler, useEffect, useState } from 'react'
import axios from 'axios'
import CancelButton from '../assets/images/cancel.png'
import styles from '../styles/auth-component.module.less'
import toast from 'react-hot-toast'
import { useTokenStore, useUserStore } from '../store/store'

const AuthComponent = ({ setOpenAuthPanel } : {setOpenAuthPanel: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const setToken = useTokenStore((state) => state.setToken)
  const setUser = useUserStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [mode, setMode] = useState('login') // can be "signup", "login", or "reset"
  const [isSending, setIsSending] = useState(false)
  const handleSubmit = async (event: FormEventHandler<HTMLFormElement>) => {
    event.preventDefault()

    try {
      let response
      if (mode === 'signup') {
        response = await axios.post('http://localhost:5001/signup', { email, username, verificationCode }, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else if (mode === 'login') {
        response = await axios.post('http://localhost:5001/login', { email, verificationCode }, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } 
      //   console.log(response.data) -> token
      if (response?.status === 200) {
        setToken(response.data.token)
        setUser({
          email: email,
          status: 'online',
        })
        toast.success(mode === 'login' ? 'Logged in successfully!' : 'Signed up successfully!')
        setOpenAuthPanel(false)
        window.location.reload()
      }
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  const sendCode = async () => {
    // check if email is valid
    if (!email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }
    try {
      setIsSending(true)
      await axios.post('http://localhost:5001/sendVerificationCode',
        { email: email }, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
    } catch (error) {
      toast.error(error?.response?.data)
    } 
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSending(false)
    }, 15000)
    return () => clearTimeout(timer)
  }, [isSending])

  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <div style={{ position: 'relative', padding: '4rem', background: '#fff', borderRadius: '1rem', color: '#333' }}>
        <img src={CancelButton} className={styles['cancel-button']} onClick={() => setOpenAuthPanel(false)} style={{ width: '1rem', position: 'absolute', right: '1rem', top: '1rem' }} alt="" />
        <h2>{mode === 'login' ? 'Log In' : 'Sign Up'}</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '25rem' }} onSubmit={handleSubmit}>
          {
            mode === 'signup' && 
            <input style={{ padding: '0.5rem', fontSize: '1.1rem', border: '#555 1px solid', borderRadius: '0.3rem' }} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          }
          <input style={{ padding: '0.5rem', fontSize: '1.1rem', border: '#555 1px solid', borderRadius: '0.3rem' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <input style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'none', padding: '0.5rem', fontSize: '1.1rem', border: '#555 1px solid', borderRadius: '0.3rem' }} type="number" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Verification Code" required={mode !== 'signup'} />
            <button 
              onClick={sendCode}
              className={styles['send-code-button']} type="button" disabled={isSending}>Send Code</button>
          </div>
          <button type="submit">{mode === 'signup' ? 'Sign Up' : 'Log In'}</button>
          
        </form>
        <p 
          className={styles['login-signup-conversion']}
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ margin: 0, padding: 0, textAlign: 'start', marginTop: '0.5rem' }}>{mode === 'login' ? `Don't have any account?` : 'Already have account?'} <span style={{ color: 'purple', fontWeight: 700 }}>{mode === 'login' ? 'Register one!' : 'Log in?' }</span></p>
      </div>
    </div>
  )
}

export default AuthComponent