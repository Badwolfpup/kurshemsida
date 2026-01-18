import React, { useState } from "react";
import './AboutCourse.css';
import Events from './Events';

interface AboutCourseProps {
  setShowAboutPage: (value: boolean) => void;
}

const AboutCourse: React.FC<AboutCourseProps> = ({ setShowAboutPage }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (card: string) => {
    if (selectedCard === null) setSelectedCard(card);
  };

  const backButton = () => {
    return (
      <button className="back-button" onClick={() => setSelectedCard(null)}></button>
    );
  }

  return (
    <div className="main-area">
      <div className="content-wrapper">
        <div className="about-course-header">
          <h1>CUL Programmering</h1>
          <button onClick={() => setShowAboutPage(false)}>Logga in</button>
        </div>
        <div className="about-course-container">
          <div 
            className={`course-card course-presentation ${selectedCard === 'presentation' ? 'expanded' : ''}`} 
            onClick={() => handleCardClick('presentation')}
          >
            {selectedCard === 'presentation' && backButton()}
            <h2>Kurs Presentation</h2>
            <p>Lär dig grunderna i programmering med fokus på praktiska projekt...</p>
          </div>
          <div 
            className={`course-card course-activities ${selectedCard === 'activities' ? 'expanded' : ''}`} 
            onClick={() => handleCardClick('activities')}
          >
            {selectedCard === 'activities' && backButton()}
            <h2>Kurs Aktiviteter</h2>
            <p>Utforska interaktiva övningar och utmaningar...</p>
          </div>
          <div 
            className={`course-card course-locale ${selectedCard === 'locale' ? 'expanded' : ''}`} 
            onClick={() => handleCardClick('locale')}
          >
            {selectedCard === 'locale' && backButton()}
            <h2>Kurs Plats</h2>
            <p>Online eller på campus – flexibla alternativ...</p>
          </div>
          <div 
            className={`course-card course-instructor ${selectedCard === 'instructor' ? 'expanded' : ''}`} 
            onClick={() => handleCardClick('instructor')}
          >
            {selectedCard === 'instructor' && backButton()}
            <h2>Kurs Instruktör</h2>
            <p>Möt våra erfarna lärare som guidar dig...</p>
          </div>
            <div 
            className={`course-card course-events ${selectedCard === 'events' ? 'expanded' : ''}`} 
            onClick={() => handleCardClick('events')}
          >
            {selectedCard === 'events' && backButton()}
            {selectedCard === 'events' && <Events />}
            {selectedCard !== 'events' && (
              <>
                <h2>Kurs Aktuella Händelser</h2>
                <p>Delta i spännande evenemang och workshops...</p>
              </>
            )}
          </div>
                    <div 
            className={`course-card course-get-started ${selectedCard === 'get-started' ? 'expanded' : ''}`} 
            onClick={() => handleCardClick('get-started')}
          >
            {selectedCard === 'get-started' && backButton()}
            <h2>Kurs Kom igång</h2>
            <p>Kom igång att koda med våra enkla guider och resurser...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCourse;