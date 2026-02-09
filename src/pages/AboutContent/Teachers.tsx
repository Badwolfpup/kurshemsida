import React from 'react';
import placeholderImage from '../../assets/images/dummypic.png';

const Teachers: React.FC = () => {
  const teachers = [
    {
      id: 1,
      name: 'Alexandra',
      title: 'Cybersäkerhetsinstruktör',
      description: 'Alexandra är vår specialist inom cybersäkerhet och leder våra TryHackMe-sessioner varje måndag. Med en passion för säkerhet och etisk hacking, hjälper hon deltagare att utveckla praktiska färdigheter inom penetrationstestning och säkerhetsanalys. Hon har en förmåga att göra komplexa säkerhetskoncept begripliga och engagerande för alla nivåer.',
      image: placeholderImage,
    },
    {
      id: 2,
      name: 'Victoria',
      title: 'JavaScript-utvecklare & Föreläsare',
      description: 'Victoria är en erfaren webbutvecklare som brinner för att dela med sig av sina kunskaper om JavaScript och modern webbutveckling. Hon leder våra JavaScript-föreläsningar varannan onsdag och har en förmåga att förklara tekniska koncept på ett sätt som är både engagerande och lätt att förstå. Hon tror starkt på att alla kan lära sig programmera med rätt stöd och vägledning.',
      image: placeholderImage,
    },
    {
      id: 3,
      name: 'Adam',
      title: 'Full-Stack Utvecklare & Mentor',
      description: 'Adam är en mångsidig utvecklare med erfarenhet av både frontend och backend-utveckling. Han leder JavaScript-föreläsningar varannan onsdag och fungerar som mentor för deltagare i båda spåren. Med sin lugna och tålmodiga undervisningsstil skapar han en trygg miljö där deltagare känner sig bekväma att ställa frågor och utforska nya koncept.',
      image: placeholderImage,
    },
  ];

  return (
    <div className="teachers-content">
      <h2>Våra Lärare</h2>

      <div className="teachers-intro">
        <p>
          Möt vårt dedikerade team av lärare och mentorer som alla brinner för att hjälpa dig
          utvecklas som programmerare. Vi kommer från olika bakgrunder och har olika
          specialiteter, men vi delar alla en passion för undervisning och att skapa en
          inkluderande lärmiljö där alla kan lyckas.
        </p>
      </div>

      <div className="teachers-grid">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="teacher-card">
            <div className="teacher-image-container">
              <img
                src={teacher.image}
                alt={`${teacher.name} - ${teacher.title}`}
                className="teacher-image"
              />
            </div>
            <div className="teacher-info">
              <h3>{teacher.name}</h3>
              <p className="teacher-title">{teacher.title}</p>
              <p className="teacher-description">{teacher.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="teachers-footer">
        <div className="teachers-note">
          <h4>💬 Kontakta Oss</h4>
          <p>
            Har du frågor eller vill veta mer om kursen? Våra lärare finns alltid tillgängliga
            för att svara på dina frågor och ge vägledning. Vi uppmuntrar öppen kommunikation
            och är här för att stötta dig på din resa mot att bli programmerare.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
