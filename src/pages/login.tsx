import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import './Login.css';

interface LoginProps {
  setShowAboutPage: (value: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setShowAboutPage }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPassword) 
    {
      const response = await fetch('/api/email-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputValue })
      });
      if (!response.ok) {
        const mailinput = document.getElementById("email-instructions")
        if (mailinput) mailinput.innerText = "Ogiltig email. Försök igen."
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data > 0) {
        setEmail(inputValue);
        setPassword(data);
        setShowPassword(true);
      } else if (data === "Passcode sent to your email.") {
        setEmail(inputValue);
        setShowPassword(true);
      }
      else if (data ==="guest") {
        setEmail(inputValue);
        setPassword("");
        setShowPassword(true);
      }
      else  {
        alert("Ogiltig e-postadress. Försök igen.");
      }
    }
    else {
      const response = await fetch('/api/passcode-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, passcode: password, rememberMe: rememberMe })
      });
      if (!response.ok) {
        const passcodeInput = document.getElementById("passcode-instructions");
        if (passcodeInput) 
        {
          const text = await response.text();
          try {
              const errorData = JSON.parse(text);
              passcodeInput.innerText = errorData.detail || errorData.title || "Ett oväntat fel uppstod";
          } catch (e) {
              passcodeInput.innerText = text;
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      else login();

      // const data = await response.json();

      // if (data.token) login(data.token);
      // else alert("Ogiltig lösenkod. Försök igen.");
    }
  }

  const showEmail = () => {
    return (
      <div className="login-input-container">
      <h3 id="email-instructions" className="login-instructions">Ange din e-post för att logga in</h3>
        <input
          type="email"
          className="login-input"
          id="email"
          autoComplete='email'
          placeholder="Skriv din e-post här för att logga in"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          required
        />
        <div className='checkbox-container'>
          <span>Kom ihåg mig</span><input type="checkbox" id="rememberMe" name="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
        </div>
      </div>
      )
  }

  const showPasswordInput = () => {
    return (
      <div className="login-input-container">
         <h3 id="passcode-instructions" className="login-instructions">Ange det engångslösenord som skickades till din e-post</h3>
          <input
          type="password"
          className="login-input"
          placeholder="Ange lösenkod här"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className='checkbox-container'>
          <span>Kom ihåg mig</span><input type="checkbox" name="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <h1 className="login-banner">Välkommen till CUL programmeringskurs</h1>
      <form className="login-form" autoComplete='on' onSubmit={handleSubmit}>
        <button type="button" className="back-to-main standard-btn" onClick={() =>setShowAboutPage(true)}></button>
        {showPassword ? showPasswordInput() : showEmail()}
        <button className="login-button" type="submit">Logga in</button>
      </form>
    </div>
  );
};

export default Login;