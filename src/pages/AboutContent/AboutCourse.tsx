import React, { useState } from "react";
import './AboutCourse.css';
import Events from './Events';
import Presentation from './Presentation';
import Activities from './Activities';
import Locale from './Locale';
import Teachers from './Teachers';
import GetStarted from './GetStarted';
import omkursen from '../../assets/images/Omkursen.png';
import handledare from '../../assets/images/handledare.png';
import aktiviteter from '../../assets/images/aktiviteter.png';
import lokaler from '../../assets/images/lokaler.png';

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
            {selectedCard === 'presentation' && <Presentation />}
            {selectedCard !== 'presentation' && (
              <>
                <img className="height-auto" src={omkursen}/>
              </>
            )}
          </div>
          <div
            className={`course-card course-activities ${selectedCard === 'activities' ? 'expanded' : ''}`}
            onClick={() => handleCardClick('activities')}
          >
            {selectedCard === 'activities' && backButton()}
            {selectedCard === 'activities' && <Activities />}
            {selectedCard !== 'activities' && (
              <>
                <img className="height-auto" src={aktiviteter}/>

              </>
            )}
          </div>
          <div
            className={`course-card course-locale ${selectedCard === 'locale' ? 'expanded' : ''}`}
            onClick={() => handleCardClick('locale')}
          >
            {selectedCard === 'locale' && backButton()}
            {selectedCard === 'locale' && <Locale />}
            {selectedCard !== 'locale' && (
              <>
                <img className="height-auto" src={lokaler}/>
              </>
            )}
          </div>
          <div
            className={`course-card course-instructor ${selectedCard === 'instructor' ? 'expanded' : ''}`}
            onClick={() => handleCardClick('instructor')}
          >
            {selectedCard === 'instructor' && backButton()}
            {selectedCard === 'instructor' && <Teachers />}
            {selectedCard !== 'instructor' && (
              <>
                <img className="height-auto" src={handledare}/>

              </>
            )}
          </div>
            <div 
            className={`course-card course-events ${selectedCard === 'events' ? 'expanded' : ''}`} 
            onClick={() => handleCardClick('events')}
          >
            {selectedCard === 'events' && backButton()}
            {selectedCard === 'events' && <Events />}
            {selectedCard !== 'events' && (
              <>
                <h2>På gång</h2>
              </>
            )}
          </div>
                    <div
            className={`course-card course-get-started ${selectedCard === 'get-started' ? 'expanded' : ''}`}
            onClick={() => handleCardClick('get-started')}
          >
            {selectedCard === 'get-started' && backButton()}
            {selectedCard === 'get-started' && <GetStarted />}
            {selectedCard !== 'get-started' && (
              <>
                <h2>Kom igång</h2>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCourse;