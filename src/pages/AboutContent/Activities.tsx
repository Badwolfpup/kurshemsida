import React from 'react';

const Activities: React.FC = () => {
  return (
    <div className="activities-content">
      <h2>Kursaktiviteter</h2>

      <div className="activities-intro">
        <p>
          Vi erbjuder en mängd olika aktiviteter varje vecka för att hjälpa dig utvecklas
          som programmerare. Här är vår fasta veckorutin samt specialevenemang som vi
          arrangerar regelbundet.
        </p>
      </div>

      <div className="activities-section">
        <h3>Veckans Schema</h3>
        <div className="weekly-activities">
          <div className="activity-card monday">
            <div className="activity-header">
              <div className="activity-day">Måndag</div>
              <div className="activity-time">13:00 - 14:30</div>
            </div>
            <h4>TryHackMe - Cybersäkerhet</h4>
            <p className="activity-description">
              Lär dig grunderna i cybersäkerhet genom praktiska övningar och utmaningar.
              Vi följer ett curriculum baserat på innehåll från TryHackMe, där du får
              utforska allt från grundläggande säkerhetskoncept till mer avancerade
              penetrationstestningstekniker.
            </p>
            <div className="activity-leader">
              <strong>Ledare:</strong> Alexandra
            </div>
            <div className="activity-tags">
              <span className="tag">Cybersäkerhet</span>
              <span className="tag">Praktisk</span>
              <span className="tag">TryHackMe</span>
            </div>
          </div>

          <div className="activity-card wednesday">
            <div className="activity-header">
              <div className="activity-day">Onsdag</div>
              <div className="activity-time">11:00 - 12:00</div>
            </div>
            <h4>JavaScript-föreläsning</h4>
            <p className="activity-description">
              Veckovis föreläsningar där vi går igenom JavaScript-koncept, från grundläggande
              syntax till avancerade tekniker. Perfekt för både nybörjare och de som vill
              fördjupa sina kunskaper. Föreläsningarna varierar i innehåll och svårighetsgrad
              för att möta alla deltagares behov.
            </p>
            <div className="activity-leader">
              <strong>Ledare:</strong> Victoria & Adam (alternerande veckor)
            </div>
            <div className="activity-tags">
              <span className="tag">JavaScript</span>
              <span className="tag">Föreläsning</span>
              <span className="tag">Teori</span>
            </div>
          </div>

          <div className="activity-card thursday">
            <div className="activity-header">
              <div className="activity-day">Torsdag</div>
              <div className="activity-time">13:00 - 14:30</div>
            </div>
            <h4>Code Along - Praktisk Programmering</h4>
            <p className="activity-description">
              Här omsätter vi onsdagens teori i praktik! Vi kodar tillsammans på Teams och
              bygger projekt som använder de koncept vi gick igenom på föreläsningen.
              Du får möjlighet att ställa frågor, lösa problem tillsammans med andra och
              få direkt feedback på din kod.
            </p>
            <div className="activity-leader">
              <strong>Plattform:</strong> Microsoft Teams
            </div>
            <div className="activity-tags">
              <span className="tag">Praktisk</span>
              <span className="tag">Code Along</span>
              <span className="tag">Teams</span>
            </div>
          </div>

          <div className="activity-card wednesday-social">
            <div className="activity-header">
              <div className="activity-day">Onsdag</div>
              <div className="activity-time">13:00 - 15:00</div>
            </div>
            <h4>Spel & Häng - Social Samvaro</h4>
            <p className="activity-description">
              En avslappnad och trivsam aktivitet där vi spelar konsolspel, brädspel och
              kortspel tillsammans. Detta är en öppen aktivitet för alla som vill komma
              och umgås i en trygg och rolig miljö. Vi bjuder på snacks och godis!
            </p>
            <p className="activity-description">
              Det viktigaste är att skapa en plats där alla känner sig välkomna. Du behöver
              inte delta i spelen om du inte vill – du är lika välkommen att bara komma
              och vara med i gemenskapen.
            </p>
            <div className="activity-leader">
              <strong>Öppet för:</strong> Alla deltagare
            </div>
            <div className="activity-tags">
              <span className="tag">Socialt</span>
              <span className="tag">Spel</span>
              <span className="tag">Avslappnat</span>
              <span className="tag">Fika</span>
            </div>
          </div>
        </div>
      </div>

      <div className="activities-section special-section">
        <h3>Företagsbesök & Gästföreläsningar</h3>
        <div className="special-activities">
          <p className="special-intro">
            Vi bjuder regelbundet in mjukvaruföretag för att ge dig insikt i hur det är
            att arbeta som professionell programmerare. Våra gäster delar med sig av sina
            erfarenheter, pratar om sina projekt och svarar på frågor om karriärvägar
            inom IT-branschen.
          </p>

          <div className="companies-visited">
            <h4>Tidigare företagsbesök:</h4>
            <div className="companies-grid">
              <div className="company-card">
                <div className="company-icon">🏢</div>
                <div className="company-name">AppTech</div>
              </div>
              <div className="company-card">
                <div className="company-icon">🏢</div>
                <div className="company-name">Hiab</div>
              </div>
              <div className="company-card">
                <div className="company-icon">🏢</div>
                <div className="company-name">Xlent</div>
              </div>
            </div>
          </div>

          <div className="special-benefits">
            <h4>Vad ger företagsbesöken?</h4>
            <ul>
              <li>Insikt i verkliga arbetsuppgifter för programmerare</li>
              <li>Förståelse för företagskultur och arbetsmetoder</li>
              <li>Möjlighet att ställa frågor direkt till yrkesverksamma</li>
              <li>Nätverkande och möjliga framtida jobbkontakter</li>
              <li>Inspiration för din egen karriärväg</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="activities-footer">
        <div className="footer-note">
          <h4>💡 Viktigt att veta</h4>
          <p>
            Alla aktiviteter är frivilliga och anpassas efter deltagarnas behov och önskemål.
            Du deltar när det passar dig, utan krav på närvaro. Vi uppmuntrar dock alla att
            prova olika aktiviteter för att hitta det som passar bäst för din inlärning!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Activities;
