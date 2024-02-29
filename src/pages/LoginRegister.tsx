import React, {CSSProperties, FormEventHandler, useEffect, useState} from 'react';
import axios from 'axios';
import CancelButton from '../assets/images/cancel.png';
import styles from '../styles/auth-component.module.less';
import toast from 'react-hot-toast';
import { useTokenStore, useUserStore } from '../store/store';
import {filter} from "lodash";
import NALogo from "../assets/images/NA-Full-logo-white.svg";
import meshBg from "../assets/images/cool-background.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope,faUser } from '@fortawesome/free-solid-svg-icons';


const LoginRegister = ({ setOpenAuthPanel }: { setOpenAuthPanel: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const setToken = useTokenStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login'); // can be "signup" or "login"
  const [isSending, setIsSending] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    try {
      let response;
      if (mode === 'signup') {
        response = await axios.post('http://localhost:5001/signup', { email, username, verificationCode }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else if (mode === 'login') {
        response = await axios.post('http://localhost:5001/login', { email, verificationCode }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      if (response?.status === 200) {
        setToken(response.data.token);
        setUser({
          email: email,
          status: 'online',
        });
        toast.success(mode === 'login' ? 'Logged in successfully!' : 'Signed up successfully!');
        setOpenAuthPanel(false);
        window.location.reload();
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };

  const stylesLogin: CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backdropFilter: 'blur(4px)',
    background: 'rgba(255, 255, 255,0.2)',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    padding: '0 4em',
  };

  const sendCode = async () => {
    // check if email is valid
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    try {
      setIsSending(true);
      await axios.post('http://localhost:5001/sendVerificationCode',
        { email: email }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSending(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isSending]);

  return (
    <div style={{ position: 'fixed', top: '0', left: '0', width: '100%',height: '100%', background: 'linear-gradient(to right, RGB(58, 58, 101), RGB(14, 19, 42))', }}>
      <img src={meshBg} style={{position: 'fixed', top: '0', left: '0', width: '100%',height: '100%',}}></img>
      <img src={NALogo} style={{position: "absolute", top: '2rem', left: '10rem' ,marginTop:"2rem",width:"10%"}}></img>
      <div style={{display:'flex',justifyContent: 'center',alignItems:'center',position: "absolute",height:'3rem', top: '8rem', left: '8.5rem' ,width:"12%",background: 'linear-gradient(to right, RGB(100, 110, 145), RGB(58, 58, 101) )',borderRadius:'0.5rem',backdropFilter:'10rem'}}>
        <h2 style={{fontSize:"1.5vh",color: 'white',fontWeight:'lighter'}}>E P S I L O N&nbsp;&nbsp;&nbsp;AI</h2>
      </div>
      <div style={stylesLogin}>
        <h2 style={{fontSize:"2.5rem",  color: 'rgba(0, 0, 0, 0.7)',}}>{mode === 'login' ? 'Log In' : 'Sign Up Now'}</h2>
        <div style={{ position: 'relative', padding: '0 0 4 4rem', border:'transparent',borderRadius: '1rem', color: 'rgba(0,0,0,0.7)' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem'}} onSubmit={handleSubmit}>
            {
              mode === 'signup' &&
                <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Username</span>
                    </div>
                  <input style={{ background: 'rgba(255, 255, 255, 0.5)',padding: '0.5rem', fontSize: '1.1rem', border: '#555 1px solid', borderRadius: '0.3rem', }} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username here" required />
                </>
                }
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Email</span>
            </div>
            <input style={{background: 'rgba(255, 255, 255, 0.5)', padding: '0.5rem', fontSize: '1.1rem', border: '#555 1px solid', borderRadius: '0.3rem' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <input style={{ background: 'rgba(255, 255, 255, 0.5)',WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'none', padding: '0.5rem',marginRight:"2rem", fontSize: '1.1rem', border: '#555 1px solid', borderRadius: '0.3rem' }} type="number" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Verification Code" required={mode !== 'signup'} />
              <button
                onClick={sendCode}
                style={{background:'rgba(14, 19, 42, 0.7)'}}
                className={styles['send-code-button']} type="button" disabled={isSending}>Send Code</button>
            </div>
            <button style={{background:'rgba(14, 19, 42, 0.7)'}} type="submit">{mode === 'signup' ? 'Sign Up' : 'Log In'}</button>

          </form>
          <div style={{marginBottom:'1rem'}}>
          <p
            className={styles['login-signup-conversion']}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ margin: 0, padding: 0, textAlign: 'start', marginTop: '0.5rem' }}>{mode === 'login' ? `Don't have any account?` : 'Already have account?'} <span style={{ color: 'rgba(14, 19, 42, 0.7)', fontWeight: 700 }}>{mode === 'login' ? 'Register one!' : 'Log in?'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
