import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import './Settings.css';

const SwedenFlag = () => (
  <svg className="flag-icon" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#006AA7"/>
    <rect width="640" height="120" y="180" fill="#FECC00"/>
    <rect width="120" height="480" x="160" fill="#FECC00"/>
  </svg>
);

const UKFlag = () => (
  <svg className="flag-icon" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#012169"/>
    <path d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="80"/>
    <path d="M0 0l640 480M640 0L0 480" stroke="#C8102E" strokeWidth="53" clipPath="url(#uk-clip)"/>
    <clipPath id="uk-clip"><path d="M320 0v240H0v60h320v180h60V300h260v-60H380V0z"/></clipPath>
    <path d="M380 0v200h260V0zM0 280v200h260V280zM380 280v200h260V280zM0 0v200h260V0z" fill="none"/>
    <rect width="640" height="60" y="210" fill="#fff"/>
    <rect width="60" height="480" x="290" fill="#fff"/>
    <rect width="640" height="36" y="222" fill="#C8102E"/>
    <rect width="36" height="480" x="302" fill="#C8102E"/>
  </svg>
);

const Settings: React.FC = () => {
  const { skin, mode, setSkin, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Preferenser</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Utseende (Skin)</h2>
          <p className="settings-description">
            Valj mellan olika teman som ger din upplevelse en unik personlighet.
          </p>
          <div className="skin-selector">
            <button
              className={`skin-option ${skin === 'classic' ? 'active' : ''}`}
              onClick={() => setSkin('classic')}
            >
              <div className="skin-preview classic-preview">
                <div className="preview-sidebar"></div>
                <div className="preview-content">
                  <div className="preview-header"></div>
                  <div className="preview-card"></div>
                </div>
              </div>
              <span className="skin-label">Klassisk</span>
              <span className="skin-subtitle">Gradient-baserat design med bla toningar</span>
            </button>

            <button
              className={`skin-option ${skin === 'modern' ? 'active' : ''}`}
              onClick={() => setSkin('modern')}
            >
              <div className="skin-preview modern-preview">
                <div className="preview-sidebar"></div>
                <div className="preview-content">
                  <div className="preview-header"></div>
                  <div className="preview-card"></div>
                </div>
              </div>
              <span className="skin-label">Modern</span>
              <span className="skin-subtitle">Platt design med cyan/teal farger</span>
            </button>

            <button
              className={`skin-option ${skin === 'ocean' ? 'active' : ''}`}
              onClick={() => setSkin('ocean')}
            >
              <div className="skin-preview ocean-preview">
                <div className="preview-sidebar"></div>
                <div className="preview-content">
                  <div className="preview-header"></div>
                  <div className="preview-card"></div>
                </div>
              </div>
              <span className="skin-label">Ocean</span>
              <span className="skin-subtitle">Lugnande havsbla och turkosa toner</span>
            </button>

            <button
              className={`skin-option ${skin === 'sunset' ? 'active' : ''}`}
              onClick={() => setSkin('sunset')}
            >
              <div className="skin-preview sunset-preview">
                <div className="preview-sidebar"></div>
                <div className="preview-content">
                  <div className="preview-header"></div>
                  <div className="preview-card"></div>
                </div>
              </div>
              <span className="skin-label">Solnedgang</span>
              <span className="skin-subtitle">Varma orange och rosa gradienter</span>
            </button>

            <button
              className={`skin-option ${skin === 'forest' ? 'active' : ''}`}
              onClick={() => setSkin('forest')}
            >
              <div className="skin-preview forest-preview">
                <div className="preview-sidebar"></div>
                <div className="preview-content">
                  <div className="preview-header"></div>
                  <div className="preview-card"></div>
                </div>
              </div>
              <span className="skin-label">Skog</span>
              <span className="skin-subtitle">Naturliga grona och bruna toner</span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Fargschema</h2>
          <p className="settings-description">
            Valj mellan ljust och morkt lage.
          </p>
          <div className="mode-selector">
            <button
              className={`mode-option ${mode === 'light' ? 'active' : ''}`}
              onClick={() => setMode('light')}
            >
              <span className="mode-icon">&#9728;</span>
              <span className="mode-label">Ljust</span>
            </button>

            <button
              className={`mode-option ${mode === 'dark' ? 'active' : ''}`}
              onClick={() => setMode('dark')}
            >
              <span className="mode-icon">&#9790;</span>
              <span className="mode-label">Morkt</span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Sprak</h2>
          <p className="settings-description">
            Valj sprak for hemsidan.
          </p>
          <div className="language-selector">
            <button
              className={`language-option ${language === 'sv' ? 'active' : ''}`}
              onClick={() => setLanguage('sv')}
            >
              <SwedenFlag />
              <span className="language-label">Svenska</span>
            </button>

            <button
              className={`language-option ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              <UKFlag />
              <span className="language-label">English</span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="current-theme-indicator">
            <span>Aktivt tema: </span>
            <strong>
              {skin === 'classic' && 'Klassisk'}
              {skin === 'modern' && 'Modern'}
              {skin === 'ocean' && 'Ocean'}
              {skin === 'sunset' && 'Solnedgang'}
              {skin === 'forest' && 'Skog'}
              {' - '}
              {mode === 'light' ? 'Ljust' : 'Morkt'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
