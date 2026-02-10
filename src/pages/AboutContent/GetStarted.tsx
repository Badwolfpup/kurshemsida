import React from 'react';
import './GetStarted.css';

const GetStarted: React.FC = () => {
  return (
    <div className="about-content">
      <h2>Kom Igång med Kodning</h2>

      <div className="about-intro">
        <p>
          Vill du börja lära dig programmering redan innan du ansluter dig till kursen?
          Här är våra rekommenderade resurser som hjälper dig att komma igång på egen hand.
          Alla dessa är gratis och passar olika lärstilar och nivåer.
        </p>
      </div>

      {/* Learning Platforms Section */}
      <div className="about-section">
        <h3>Lärplattformar</h3>
        <div className="resources-grid">
          <div className="resource-card">
            <div className="resource-icon">📚</div>
            <h4>
              <a href="https://www.freecodecamp.org" target="_blank" rel="noopener noreferrer">
                FreeCodeCamp
              </a>
            </h4>
            <p className="resource-description">
              En omfattande och helt gratis plattform med strukturerade kurser i webbutveckling.
              Börja med HTML och CSS, gå vidare till JavaScript, och bygg riktiga projekt längs vägen.
              Perfekt för nybörjare som vill ha en tydlig väg att följa.
            </p>
            <div className="resource-tags">
              <span className="tag">Nybörjarvänlig</span>
              <span className="tag">Strukturerad</span>
              <span className="tag">Projekt</span>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-icon">🎓</div>
            <h4>
              <a href="https://www.theodinproject.com" target="_blank" rel="noopener noreferrer">
                The Odin Project
              </a>
            </h4>
            <p className="resource-description">
              En komplett full-stack curriculum som tar dig från grunderna till avancerad utveckling.
              Fokuserar på att lära dig tänka som en utvecklare genom praktiska projekt och problemlösning.
              Gratis och community-driven med stöd från andra elever.
            </p>
            <div className="resource-tags">
              <span className="tag">Full-Stack</span>
              <span className="tag">Djupgående</span>
              <span className="tag">Community</span>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-icon">📖</div>
            <h4>
              <a href="https://www.w3schools.com" target="_blank" rel="noopener noreferrer">
                W3Schools
              </a>
            </h4>
            <p className="resource-description">
              En snabb och lättillgänglig referens för webbutveckling. Perfekt när du behöver
              slå upp syntax eller testa koncept snabbt. Innehåller interaktiva exempel du kan
              redigera direkt i webbläsaren. Bra komplement till mer djupgående kurser.
            </p>
            <div className="resource-tags">
              <span className="tag">Referens</span>
              <span className="tag">Snabb</span>
              <span className="tag">Interaktiv</span>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-icon">✨</div>
            <h4>
              <a href="https://javascript.info" target="_blank" rel="noopener noreferrer">
                JavaScript.info
              </a>
            </h4>
            <p className="resource-description">
              En modern och omfattande guide till JavaScript. Täcker allt från grunderna till
              avancerade koncept med tydliga förklaringar och exempel. Uppdateras regelbundet
              med de senaste JavaScript-funktionerna. Perfekt för den som vill fördjupa sig i JavaScript.
            </p>
            <div className="resource-tags">
              <span className="tag">JavaScript</span>
              <span className="tag">Modern</span>
              <span className="tag">Detaljerad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Platforms Section */}
      <div className="about-section">
        <h3>Träningsplattformar</h3>
        <div className="resources-grid">
          <div className="resource-card">
            <div className="resource-icon">⚔️</div>
            <h4>
              <a href="https://www.codewars.com" target="_blank" rel="noopener noreferrer">
                Codewars
              </a>
            </h4>
            <p className="resource-description">
              Öva på algoritmisk tänkande genom kodutmaningar (kallas "kata"). Börja med
              enkla problem och arbeta dig upp till svårare. Du kan se andras lösningar
              efter att du klarat en utmaning, vilket är ett utmärkt sätt att lära sig
              olika sätt att tänka. Stödjer många programmeringsspråk.
            </p>
            <div className="resource-tags">
              <span className="tag">Algoritmer</span>
              <span className="tag">Utmaningar</span>
              <span className="tag">Community</span>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-icon">💡</div>
            <h4>
              <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer">
                LeetCode
              </a>
            </h4>
            <p className="resource-description">
              En av de mest populära plattformarna för att öva på algoritmer och datastrukturer.
              Särskilt värdefullt om du förbereder dig för tekniska intervjuer. Erbjuder
              tusentals problem med varierande svårighetsgrad, och du kan se hur din lösning
              presterar jämfört med andra. Gratis version räcker långt.
            </p>
            <div className="resource-tags">
              <span className="tag">Algoritmer</span>
              <span className="tag">Intervjuförberedelse</span>
              <span className="tag">Problemlösning</span>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-icon">🎨</div>
            <h4>
              <a href="https://www.frontendmentor.io" target="_blank" rel="noopener noreferrer">
                Frontend Mentor
              </a>
            </h4>
            <p className="resource-description">
              Bygg riktiga frontend-projekt med professionella designer. Du får design-filer
              och specifikationer, och bygger sedan projektet själv. Perfekt för att öva på
              HTML, CSS och JavaScript medan du bygger din portfolio. Möjlighet att få feedback
              från community.
            </p>
            <div className="resource-tags">
              <span className="tag">Frontend</span>
              <span className="tag">Design</span>
              <span className="tag">Portfolio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="about-section">
        <h3>Verktyg du behöver</h3>
        <div className="resources-grid">
          <div className="resource-card highlight-card">
            <div className="resource-icon">💻</div>
            <h4>
              <a href="https://code.visualstudio.com" target="_blank" rel="noopener noreferrer">
                Visual Studio Code
              </a>
            </h4>
            <p className="resource-description">
              Den mest populära kodredigeraren för webbutveckling. Gratis, kraftfull och
              med massor av tillägg (extensions) som gör kodning enklare. Vi använder VS Code
              i kursen, så det är bra att bekanta dig med den redan nu. Fungerar på Windows,
              Mac och Linux.
            </p>
            <div className="resource-tags">
              <span className="tag">Gratis</span>
              <span className="tag">Kraftfull</span>
              <span className="tag">Måste-ha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="getstarted-footer">
        <div className="footer-tips">
          <h4>💡 Tips för att komma igång</h4>
          <ul>
            <li>
              <strong>Börja smått:</strong> Välj en plattform och håll dig till den de första
              veckorna. Det är bättre att fördjupa sig än att hoppa mellan olika resurser.
            </li>
            <li>
              <strong>Koda varje dag:</strong> Även 20-30 minuter om dagen gör stor skillnad
              över tid. Konsistens är viktigare än långa sessioner.
            </li>
            <li>
              <strong>Bygg egna projekt:</strong> När du lärt dig grunderna, börja bygga något
              eget. Det är där du verkligen lär dig.
            </li>
            <li>
              <strong>Var inte rädd för att fastna:</strong> Det är en normal del av lärandet.
              Sök efter lösningar, fråga i forum, och fortsätt försöka.
            </li>
            <li>
              <strong>Ha tålamod:</strong> Programmering tar tid att lära sig. Alla börjar
              från början, och alla har kämpat med samma saker som du kommer att möta.
            </li>
          </ul>
        </div>

        <div className="footer-encouragement">
          <h4>🚀 Redo att börja?</h4>
          <p>
            Det finns ingen "perfekt" tid att börja - det bästa är att börja nu! Välj en
            resurs ovan, öppna VS Code, och skriv din första rad kod. Varje expert var en
            gång nybörjare, och med dessa resurser har du allt du behöver för att komma igång.
          </p>
          <p>
            Vi ser fram emot att välkomna dig till kursen när du är redo att ta nästa steg
            tillsammans med oss!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
