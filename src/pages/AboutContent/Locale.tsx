import React from 'react';
import placeholderImage from '../../assets/images/dummypic.png';

const Locale: React.FC = () => {
  return (
    <div className="locale-content">
      <h2>Våra Lokaler</h2>

      <div className="locale-intro">
        <p>
          Vi har dedicerade rum för olika aktiviteter, alla utrustade med det material och
          den utrustning som behövs. Våra lokaler är säkra och privata – alla dörrar har
          kodlås så att endast kursdeltagare och personal har tillträde. Det finns ingen
          risk för att främlingar kommer in.
        </p>
      </div>

      <div className="locale-sections">
        {/* Spår 2 Classroom */}
        <div className="locale-card">
          <div className="locale-image-container">
            <img
              src={placeholderImage}
              alt="Spår 2 Klassrum"
              className="locale-image"
            />
          </div>
          <div className="locale-info">
            <h3>Spår 2 - Klassrum</h3>
            <p className="locale-description">
              Ett lugnt och välkomnande klassrum där du kan utforska programmering i din egen
              takt. Här finns arbetsplatser med datorer, stora skärmar för genomgångar, och
              en avslappnad atmosfär där ingen fråga är för liten. Rummet är utformat för att
              skapa en trygg lärmiljö där du kan experimentera och göra misstag utan press.
            </p>
            <div className="locale-features">
              <h4>Utrustning:</h4>
              <ul>
                <li>Individuella arbetsplatser med datorer</li>
                <li>Stor skärm för presentationer</li>
                <li>Whiteboard för gemensamma genomgångar</li>
                <li>Bekväma sittplatser</li>
                <li>Kodlås för säker tillgång</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gaming/Social Room */}
        <div className="locale-card">
          <div className="locale-image-container">
            <img
              src={placeholderImage}
              alt="Spel & Häng Rum"
              className="locale-image"
            />
          </div>
          <div className="locale-info">
            <h3>Spel & Häng - Socialt Rum</h3>
            <p className="locale-description">
              Ett mysigt och avslappnat rum där vi samlas för våra onsdagshäng. Här finns
              konsolspel, brädspel, kortspel och gott om plats att umgås. Det här är platsen
              där vi bygger gemenskap utanför kodandet – ett ställe där alla är välkomna att
              bara vara sig själva. Vi bjuder alltid på snacks och godis!
            </p>
            <div className="locale-features">
              <h4>Vad finns här:</h4>
              <ul>
                <li>Spelkonsoler med olika spel</li>
                <li>Samling av brädspel och kortspel</li>
                <li>Bekväma sittgrupper</li>
                <li>Plats för både aktivitet och avkoppling</li>
                <li>Kodlås för säker tillgång</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Spår 1 Room */}
        <div className="locale-card">
          <div className="locale-image-container">
            <img
              src={placeholderImage}
              alt="Spår 1 Arbetsrum"
              className="locale-image"
            />
          </div>
          <div className="locale-info">
            <h3>Spår 1 - Avancerat Arbetsrum</h3>
            <p className="locale-description">
              Ett professionellt arbetsrum för dig som är redo att ta nästa steg mot en
              karriär inom mjukvaruutveckling. Här arbetar du med verkliga projekt tillsammans
              med mentorer och andra deltagare i Spår 1. Rummet är utrustat för seriös utveckling
              och samarbete, med alla verktyg du behöver för att bygga din portfolio.
            </p>
            <div className="locale-features">
              <h4>Utrustning:</h4>
              <ul>
                <li>Kraftfulla utvecklingsdatorer</li>
                <li>Flera skärmar per arbetsplats</li>
                <li>Dedikerat mötesutrymme för mentorskap</li>
                <li>Teknisk utrustning för projektutveckling</li>
                <li>Kodlås för säker tillgång</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="locale-footer">
        <div className="locale-security-note">
          <h4>🔒 Säkerhet & Trygghet</h4>
          <p>
            Alla våra lokaler är försedda med kodlås som endast kursdeltagare och personal
            har tillgång till. Detta skapar en trygg och privat miljö där du kan fokusera
            på ditt lärande utan oro för oönskade besökare.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Locale;
