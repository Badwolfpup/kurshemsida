import React from 'react';
import './Presentation.css';

const Presentation: React.FC = () => {
  return (
    <div className="about-content">
      <h2>Välkommen till CUL Programmering!</h2>

      <div className="about-intro">
        <p>
          Hos oss erbjuder vi en unik och inkluderande programmeringsmiljö där du kan utvecklas
          i din egen takt, på dina egna villkor. Vi tror på att alla kan lära sig programmera
          – det handlar bara om att hitta rätt stöd och miljö.
        </p>
      </div>

      <div className="presentation-tracks">
        <div className="track-card track-1">
          <h3>Spår 1: Avancerad Utveckling</h3>
          <p className="track-subtitle">För dig som vill ta nästa steg i karriären</p>
          <div className="track-description">
            <p>
              Har du redan lärt dig grunderna i programmering och känner att du är redo att
              ta nästa steg? Vårt avancerade spår är utformat för dig som vill förbereda dig
              för professionell utveckling.
            </p>
            <h4>Vad du får:</h4>
            <ul>
              <li>Mentorskap från erfarna utvecklare</li>
              <li>Praktiska projekt som speglar verkliga arbetsuppgifter</li>
              <li>Vägledning mot mentorskap eller praktikplats hos etablerade företag</li>
              <li>Möjlighet att bygga en professionell portfolio</li>
              <li>Nätverk med branschkontakter</li>
            </ul>
            <p className="track-focus">
              <strong>Målet:</strong> Att förbereda dig för en karriär inom mjukvaruutveckling
              genom praktisk erfarenhet och professionella kontakter.
            </p>
          </div>
        </div>

        <div className="track-card track-2">
          <h3>Spår 2: Upptäck Programmering</h3>
          <p className="track-subtitle">För dig som vill utforska kodningens värld</p>
          <div className="track-description">
            <p>
              Är du nyfiken på programmering men osäker på om det är något för dig?
              Vårt upptäcksspår ger dig möjlighet att prova på kodning i en trygg och
              stödjande miljö – helt utan förkunskaper.
            </p>
            <h4>Detta erbjuder vi dig:</h4>
            <ul>
              <li><strong>Ingen press:</strong> Lär dig i din egen takt, utan krav på daglig närvaro</li>
              <li><strong>Lugn miljö:</strong> En stödjande atmosfär där misstag är en del av lärandet</li>
              <li><strong>Individuell anpassning:</strong> Vi gör alla möjliga anpassningar för dina specifika behov</li>
              <li><strong>Inga förkunskaper krävs:</strong> Du börjar från grunden, oavsett bakgrund</li>
              <li><strong>Utrustning ingår:</strong> Vi har datorer du kan låna under hela kursen</li>
              <li><strong>Flexibel närvaro:</strong> Kom när det passar dig, utan stress eller förväntningar</li>
            </ul>
            <div className="track-highlight">
              <h4>Vår målgrupp</h4>
              <p>
                Vi vänder oss särskilt till dig som har upplevt att den traditionella
                skolvägen inte fungerat för dig. Kanske har du diagnostiserats med något
                som gjort det svårt att lyckas i konventionella utbildningar, eller så
                känner du helt enkelt att du behöver en annan typ av lärmiljö.
              </p>
              <p>
                Här får du chansen att upptäcka programmering i en miljö som är byggd
                för just dig – där din individuella situation respekteras och där vi
                arbetar tillsammans för att hitta rätt sätt för dig att lära.
              </p>
            </div>
            <p className="track-focus">
              <strong>Målet:</strong> Att ge dig möjlighet att upptäcka om programmering
              är något du vill fortsätta med, utan press eller förväntningar.
            </p>
          </div>
        </div>
      </div>

      <div className="presentation-footer">
        <h3>Varför välja CUL Programmering?</h3>
        <div className="footer-grid">
          <div className="footer-point">
            <h4>🎯 Flexibilitet</h4>
            <p>Anpassa dina studier efter ditt liv, inte tvärtom</p>
          </div>
          <div className="footer-point">
            <h4>🤝 Stöd</h4>
            <p>Erfarna mentorer som bryr sig om din utveckling</p>
          </div>
          <div className="footer-point">
            <h4>🌟 Inkludering</h4>
            <p>Alla är välkomna, oavsett bakgrund eller förutsättningar</p>
          </div>
          <div className="footer-point">
            <h4>💻 Praktiskt</h4>
            <p>Verkliga projekt och hands-on erfarenhet</p>
          </div>
        </div>
        <p className="cta-text">
          Redo att ta första steget? Oavsett om du vill bygga en karriär inom utveckling
          eller bara är nyfiken på vad kodning innebär, har vi en plats för dig!
        </p>
      </div>
    </div>
  );
};

export default Presentation;
