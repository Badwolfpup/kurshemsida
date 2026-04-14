import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import facilitiesImg from "@/assets/facilities.jpg";
import "./CardDialog.css";

const teachers = [
  {
    id: 1,
    name: "Alexandra",
    title: "Cybersäkerhetsinstruktör",
    description:
      "Alexandra är vår specialist inom cybersäkerhet och leder våra TryHackMe-sessioner varje måndag.",
  },
  {
    id: 2,
    name: "Victoria",
    title: "JavaScript-utvecklare & Föreläsare",
    description:
      "Victoria är en erfaren webbutvecklare som brinner för att dela med sig av sina kunskaper om JavaScript och modern webbutveckling.",
  },
  {
    id: 3,
    name: "Adam",
    title: "Full-Stack Utvecklare & Mentor",
    description:
      "Adam är en mångsidig utvecklare med erfarenhet av både frontend och backend-utveckling.",
  },
];

function OmKursenContent() {
  return (
    <div className="cd-section">
      <p className="cd-intro">
        Hos oss erbjuder vi en unik och inkluderande programmeringsmiljö där du
        kan utvecklas i din egen takt, på dina egna villkor. Vi tror på att alla
        kan lära sig programmera – det handlar bara om att hitta rätt stöd och
        miljö.
      </p>

      <div className="cd-block">
        <h3>Spår 1: Upptäck Programmering</h3>
        <p className="cd-intro">För dig som vill utforska kodningens värld</p>
        <p>
          Är du nyfiken på programmering men osäker på om det är något för dig?
          Vårt upptäcksspår ger dig möjlighet att prova på kodning i en trygg
          och stödjande miljö – helt utan förkunskaper.
        </p>
        <h4>Detta erbjuder vi dig:</h4>
        <ul className="cd-list">
          <li><strong>Ingen press:</strong> Lär dig i din egen takt, utan krav på daglig närvaro</li>
          <li><strong>Lugn miljö:</strong> En stödjande atmosfär där misstag är en del av lärandet</li>
          <li><strong>Individuell anpassning:</strong> Vi gör alla möjliga anpassningar för dina specifika behov</li>
          <li><strong>Inga förkunskaper krävs:</strong> Du börjar från grunden, oavsett bakgrund</li>
          <li><strong>Utrustning ingår:</strong> Vi har datorer du kan låna under hela kursen</li>
          <li><strong>Flexibel närvaro:</strong> Kom när det passar dig, utan stress eller förväntningar</li>
        </ul>
        <h4>Vår målgrupp</h4>
        <p>
          Vi vänder oss särskilt till dig som har upplevt att den traditionella
          skolvägen inte fungerat för dig. Kanske har du diagnostiserats med
          något som gjort det svårt att lyckas i konventionella utbildningar,
          eller så känner du helt enkelt att du behöver en annan typ av
          lärmiljö.
        </p>
        <p>
          Här får du chansen att upptäcka programmering i en miljö som är byggd
          för just dig – där din individuella situation respekteras och där vi
          arbetar tillsammans för att hitta rätt sätt för dig att lära.
        </p>
        <p>
          <strong>Målet:</strong> Att ge dig möjlighet att upptäcka om
          programmering är något du vill fortsätta med, utan press eller
          förväntningar.
        </p>
      </div>

      <div className="cd-block">
        <h3>Spår 2: Avancerad Utveckling</h3>
        <p className="cd-intro">För dig som vill ta nästa steg i karriären</p>
        <p>
          Har du redan lärt dig grunderna i programmering och känner att du är
          redo att ta nästa steg? Vårt avancerade spår är utformat för dig som
          vill förbereda dig för professionell utveckling.
        </p>
        <h4>Vad du får:</h4>
        <ul className="cd-list">
          <li>Mentorskap från erfarna utvecklare</li>
          <li>Praktiska projekt som speglar verkliga arbetsuppgifter</li>
          <li>Vägledning mot mentorskap eller praktikplats hos etablerade företag</li>
          <li>Möjlighet att bygga en professionell portfolio</li>
          <li>Nätverk med branschkontakter</li>
        </ul>
        <p>
          <strong>Målet:</strong> Att förbereda dig för en karriär inom
          mjukvaruutveckling genom praktisk erfarenhet och professionella
          kontakter.
        </p>
      </div>

      <div className="cd-block">
        <h3>Varför välja CUL Programmering?</h3>
        <ul className="cd-list">
          <li><strong>Flexibilitet:</strong> Anpassa dina studier efter ditt liv, inte tvärtom</li>
          <li><strong>Stöd:</strong> Erfarna mentorer som bryr sig om din utveckling</li>
          <li><strong>Inkludering:</strong> Alla är välkomna, oavsett bakgrund eller förutsättningar</li>
          <li><strong>Praktiskt:</strong> Verkliga projekt och hands-on erfarenhet</li>
        </ul>
        <p>
          Redo att ta första steget? Oavsett om du vill bygga en karriär inom
          utveckling eller bara är nyfiken på vad kodning innebär, har vi en
          plats för dig!
        </p>
      </div>
    </div>
  );
}

function AktiviteterContent() {
  return (
    <div className="cd-section">
      <p className="cd-intro">
        Vi erbjuder en mängd olika aktiviteter varje vecka för att hjälpa dig
        utvecklas som programmerare.
      </p>
      <div className="cd-activities">
        <div className="cd-activity cd-activity--monday">
          <div className="cd-activity-head">
            <span className="cd-activity-day">Måndag</span>
            <span className="cd-activity-time">13:00 - 14:30</span>
          </div>
          <h4>TryHackMe - Cybersäkerhet</h4>
          <p>Lär dig grunderna i cybersäkerhet genom praktiska övningar.</p>
          <div className="cd-activity-leader"><strong>Ledare:</strong> Alexandra</div>
          <div className="cd-tags">
            <span className="cd-tag">Cybersäkerhet</span>
            <span className="cd-tag">Praktisk</span>
          </div>
        </div>
        <div className="cd-activity cd-activity--tuesday">
          <div className="cd-activity-head">
            <span className="cd-activity-day">Tisdag</span>
            <span className="cd-activity-time">13:00 - 14:00</span>
          </div>
          <h4>Föreläsning/Workshop</h4>
          <p>Veckovisa föreläsningar/workshops om programmering.</p>
          <div className="cd-tags">
            <span className="cd-tag">Programmering</span>
            <span className="cd-tag">Workshop</span>
          </div>
        </div>
        <div className="cd-activity cd-activity--social">
          <div className="cd-activity-head">
            <span className="cd-activity-day">Onsdag</span>
            <span className="cd-activity-time">13:00 - 15:00</span>
          </div>
          <h4>Spel &amp; Häng</h4>
          <p>Avslappnad aktivitet med konsolspel, brädspel och kortspel.</p>
          <div className="cd-activity-leader"><strong>Öppet för:</strong> Alla deltagare</div>
          <div className="cd-tags">
            <span className="cd-tag">Socialt</span>
            <span className="cd-tag">Spel</span>
          </div>
        </div>
      </div>
      <div className="cd-note">
        <h4>Viktigt att veta</h4>
        <p>Alla aktiviteter är frivilliga och anpassas efter deltagarnas behov.</p>
      </div>

      <div className="cd-block">
        <h3>Tidigare Företagsbesök &amp; Gästföreläsningar</h3>
        <p className="cd-intro">
          Vi bjuder regelbundet in mjukvaruföretag för att ge dig insikt i hur
          det är att arbeta som professionell programmerare.
        </p>
        <div className="cd-companies">
          {["AppTech", "Hiab", "Xlent"].map((c) => (
            <div key={c} className="cd-company">
              <span className="cd-company-icon">🏢</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
        <h4>Vad ger företagsbesöken?</h4>
        <ul className="cd-list">
          <li>Insikt i verkliga arbetsuppgifter för programmerare</li>
          <li>Förståelse för företagskultur och arbetsmetoder</li>
          <li>Möjlighet att ställa frågor direkt till yrkesverksamma</li>
          <li>Nätverkande och möjliga framtida jobbkontakter</li>
          <li>Inspiration för din egen karriärväg</li>
        </ul>
      </div>
    </div>
  );
}

function LokalerContent() {
  return (
    <div className="cd-section">
      <p className="cd-intro">
        Vi har dedicerade rum för olika aktiviteter, alla utrustade med nödvändig utrustning.
      </p>
      <div className="cd-locales">
        {[
          { title: "Spår 1" },
          { title: "Spår 2" },
          { title: "Spel & Häng - Socialt Rum" },
        ].map((loc) => (
          <div key={loc.title} className="cd-locale">
            <img src={facilitiesImg} alt={loc.title} className="cd-locale-img" />
            <div className="cd-locale-info">
              <h4>{loc.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HandledarnaContent() {
  return (
    <div className="cd-section">
      <p className="cd-intro">
        Möt vårt dedikerade team av lärare och mentorer.
      </p>
      <div className="cd-teachers">
        {teachers.map((t) => (
          <div key={t.id} className="cd-teacher">
            <div className="cd-teacher-avatar">{t.name.charAt(0)}</div>
            <div className="cd-teacher-info">
              <h4>{t.name}</h4>
              <p className="cd-teacher-title">{t.title}</p>
              <p>{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const kodsidorCategories = [
  {
    title: "Rekommenderade",
    platforms: [
      {
        name: "FreeCodeCamp",
        url: "https://www.freecodecamp.org/learn",
        description: "En av de största gratisplattformarna för att lära sig webbutveckling.",
        highlights: [
          "Helt gratis — inga dolda kostnader eller betalmurrar",
          "Du bygger faktiska projekt som du kan lägga i portfolion",
          "Stor och aktiv community",
          "Allt körs i webbläsaren",
        ],
      },
      {
        name: "Scrimba",
        url: "https://www.scrimba.com",
        description: "Videobaserad plattform där du kan pausa och redigera kod direkt i lektionen.",
        highlights: [
          "Videobaserade kurser",
          "Pausa videon och skriv kod direkt i samma fönster",
        ],
      },
      {
        name: "SoloLearn",
        url: "https://www.sololearn.com",
        description: "Gamifierad plattform, perfekt för att komma igång med kodning.",
        highlights: [
          "Korta lektioner - cirka 10 minuter",
          "Passar också bra på mobilen på bussen på vägen till skolan",
          "Gamifierat med XP och badges",
        ],
      },
    ],
  },
  {
    title: "Kompletterande",
    platforms: [
      {
        name: "Khan Academy",
        url: "https://www.khanacademy.org/computing",
        description: "Gratis videolektioner och interaktiva övningar. Finns på svenska.",
        highlights: [
          "Helt gratis och tillgänglig direkt i webbläsaren",
          "Bra för nybörjare med korta videor och interaktiva kodexempel",
          "Lär i eget tempo utan press",
        ],
      },
      {
        name: "Frontend Mentor",
        url: "https://www.frontendmentor.io/",
        description: "Designutmaningar där du bygger verkliga projekt från designfiler.",
        highlights: [
          "Riktiga projekt från proffsiga designfiler",
          "Träna på att läsa en design och koda den",
          "Perfekt för portfolioprojekt",
          "Tydliga svårighetsnivåer",
        ],
      },
      {
        name: "The Odin Project",
        url: "https://www.theodinproject.com/",
        description: "Djup kursplan som lär ut webbutveckling med riktiga verktyg.",
        highlights: [
          "Komplett gratis-kurs från noll till junior webbutvecklare",
          "Lär ut Git, terminalen och riktiga arbetsflöden",
          "Kräver eget driv — du söker svar och löser problem själv, precis som på ett riktigt jobb",
        ],
      },
      {
        name: "Exercism",
        url: "https://exercism.org",
        description: "Kodövningar i 82 språk med frivillig mentorhjälp.",
        highlights: [
          "Gratis kodgranskning av erfarna programmerare",
          "Se andras lösningar efter att du lämnat in",
          "Brant svårighetskurva — utmanande övningar som verkligen testar din förståelse",
        ],
      },
    ],
  },
  {
    title: "Kodutmaningar",
    platforms: [
      {
        name: "Codewars",
        url: "https://www.codewars.com/",
        description: "Kodutmaningar med rangsystem inspirerat av kampsport.",
        highlights: [
          "Kör direkt i webbläsaren — bara köra igång",
          "Se andras lösningar efter varje övning",
          "Stödjer 55+ programmeringsspråk",
        ],
      },
      {
        name: "LeetCode",
        url: "https://leetcode.com/",
        description: "Populär plattform för kodutmaningar och intervjuförberedelser.",
        highlights: [
          "Bästa plattformen för jobbintervjuer inom tech",
          "Enorm mängd uppgifter — du börjar se mönster",
          "Stort community med diskussionstrådar",
          "Inte lämplig för nybörjare",
        ],
      },
    ],
  },
  {
    title: "Minispel",
    platforms: [
      {
        name: "Flexbox Froggy",
        url: "https://flexboxfroggy.com/",
        description: "Lär dig CSS Flexbox genom att hjälpa grodor nå sina näckrosor.",
        highlights: [],
      },
      {
        name: "Grid Garden",
        url: "https://cssgridgarden.com/",
        description: "Lär dig CSS Grid genom att vattna din trädgård.",
        highlights: [],
      },
      {
        name: "CSS Diner",
        url: "https://flukeout.github.io/",
        description: "Lär dig CSS-selektorer genom att välja rätt element på en matbricka.",
        highlights: [],
      },
      {
        name: "Flexbox Zombies",
        url: "https://flexboxzombies.com/",
        description: "Lär dig Flexbox genom att bekämpa zombier med CSS-kod.",
        highlights: [],
      },
      {
        name: "Flexbox Adventure",
        url: "https://codingfantasy.com/",
        description: "Gamifierat äventyr där du styr riddare med Flexbox-kod.",
        highlights: [],
      },
      {
        name: "Grid Attack",
        url: "https://codingfantasy.com/",
        description: "Lär dig CSS Grid genom att försvara din borg.",
        highlights: [],
      },
      {
        name: "Anchoreum",
        url: "https://anchoreum.com/",
        description: "Lär dig CSS Anchor Positioning genom ett interaktivt spel.",
        highlights: [],
      },
      {
        name: "Tailwind Trainer",
        url: "https://codepip.com/games/tailwind-trainer/",
        description: "Öva Tailwind CSS-klasser genom ett interaktivt spel.",
        highlights: [],
      },
      {
        name: "Service Workies",
        url: "https://serviceworkies.com/",
        description: "Lär dig Service Workers genom ett berättelsedrivet spel.",
        highlights: [],
      },
      {
        name: "MCP Panic",
        url: "https://codingfantasy.com/",
        description: "Lär dig bygga MCP som AI-agenter använder.",
        highlights: [],
      },
    ],
  },
];

function KodsidorContent() {
  return (
    <div className="cd-section cd-kodsidor">
      <p className="cd-intro">
        Plattformar och verktyg för att lära dig programmering och webbutveckling.
      </p>
      {kodsidorCategories.map((cat) => (
        <div key={cat.title} className="cd-block">
          <h3>{cat.title}</h3>
          <div className="cd-platforms">
            {cat.platforms.map((p) => (
              <div key={p.name} className="cd-platform">
                <div className="cd-platform-header">
                  <h4>{p.name}</h4>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="cd-platform-link">
                    Besök
                  </a>
                </div>
                <p>{p.description}</p>
                <ul className="cd-list">
                  {p.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const dialogContent: Record<
  string,
  { title: string; component: () => React.ReactElement }
> = {
  "Kodsidor": { title: "Kodsidor", component: KodsidorContent },
  "Våra aktiviteter": { title: "Kursaktiviteter", component: AktiviteterContent },
  "Våra lokaler": { title: "Våra Lokaler", component: LokalerContent },
  Handledarna: { title: "Våra Lärare", component: HandledarnaContent },
};

interface CardDialogProps {
  cardTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CardDialog({ cardTitle, open, onOpenChange }: CardDialogProps) {
  const entry = dialogContent[cardTitle];
  if (!entry) return null;
  const Content = entry.component;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cd-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {entry.title}
          </DialogTitle>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
}
