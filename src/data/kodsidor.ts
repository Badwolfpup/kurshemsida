export type Platform = {
  id: string;
  name: string;
  url: string;
  description: string;
  pros: string[];
  cons: string[];
  category: 'recommended' | 'complementary' | 'challenges' | 'minigames';
};

export const platforms: Platform[] = [
  // ── Rekommenderade ──
  {
    id: 'freecodecamp',
    name: 'FreeCodeCamp',
    url: 'https://www.freecodecamp.org/learn',
    description:
      'En av de största gratisplattformarna för att lära sig webbutveckling. Omfattande kursplan som täcker HTML, CSS, JavaScript, React, Node.js och mer genom interaktiva övningar i webbläsaren.',
    pros: [
      'Helt gratis — inga dolda kostnader eller betalmurrar',
      'Du bygger faktiska projekt som du kan lägga i portfolion',
      'Stor och aktiv community — det finns alltid någon som svarar om du fastnar',
      'Allt körs i webbläsaren, du behöver inte sätta upp någon miljö själv',
    ],
    cons: [
      'Det är väldigt mycket text att läsa',
    ],
    category: 'recommended',
  },
  {
    id: 'scrimba',
    name: 'Scrimba',
    url: 'https://www.scrimba.com',
    description:
      'Videobaserad plattform där du kan pausa och redigera kod direkt i lektionen. Förklarar tydligt och lär ut hur man bygger riktiga projekt med verktyg som GitHub och Netlify.',
    pros: [
      'Du kan pausa videon och skriva kod direkt i samma fönster — inte bara passiv tittning',
      'Hjälper dig ta dig ur "tutorial hell" — projekten tvingar dig att tänka själv',
      'Community där du kan få feedback på dina projekt från andra studenter',
      'Bra för frontend och React — många hittar jobb efter karriärvägen',
    ],
    cons: [
      'Kräver prenumeration för projektuppgifter',
    ],
    category: 'recommended',
  },
  {
    id: 'sololearn',
    name: 'SoloLearn',
    url: 'https://www.sololearn.com',
    description:
      'Gamifierad plattform som börjar med enkla flervalsfrågor och gradvis övergår till att skriva kod. Fungerar bäst i mobilappen och är perfekt för att komma igång med kodning.',
    pros: [
      'Perfekt att starta med — korta lektioner, lätt att plocka upp telefonen och lära sig 10 min',
      'Gamifierat med XP och badges — håller motivationen uppe',
      'Täcker många språk på ett och samma ställe',
      'Gratis basinnehåll utan irriterande reklam',
    ],
    cons: [
      'För ytligt för att bli jobbredo — bra start men inte tillräckligt ensam',
    ],
    category: 'recommended',
  },

  // ── Kompletterande ──
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org/computing',
    description:
      'Gratis utbildningsplattform med videolektioner och interaktiva övningar. Finns på svenska och täcker grunderna i HTML, CSS och JavaScript.',
    pros: [
      'Helt gratis och tillgänglig direkt i webbläsaren — inga betalmurrar',
      'Bra för nybörjare — förklarar grunderna med korta videor och interaktiva kodexempel',
      'Kan lära i eget tempo, hoppa tillbaka och om utan press',
    ],
    cons: [
      'Ingen community att ställa frågor till — du sitter ensam med videon',
    ],
    category: 'complementary',
  },
  {
    id: 'frontend-mentor',
    name: 'Frontend Mentor',
    url: 'https://www.frontendmentor.io/',
    description:
      'Plattform med designutmaningar där du bygger verkliga projekt från designfiler. Perfekt för att träna på att omsätta en design till kod.',
    pros: [
      'Du bygger riktiga projekt från proffsiga designfiler — inte leksaksexempel',
      'Bra för att träna på att "läsa en design och koda den", precis som på ett riktigt jobb',
      'Gratis-nivån räcker långt för att komma igång',
      'Perfekt för portfolioprojekt — ser bättre ut än ett todo-list-tutorial',
      'Tydliga svårighetsnivåer så du vet vad du ger dig in på',
    ],
    cons: [
      'Du får ingen feedback på dina lösningar',
    ],
    category: 'complementary',
  },
  {
    id: 'odin-project',
    name: 'The Odin Project',
    url: 'https://www.theodinproject.com/',
    description:
      'Djup och rigorös kursplan som lär ut webbutveckling i VS Code med riktiga verktyg — Git, terminalen och lokala utvecklingsmiljöer. Community-driven och helt gratis.',
    pros: [
      'Komplett gratis-kurs från noll till junior webbutvecklare',
      'Tvingar dig att tänka själv — du googlar och bygger som på jobbet',
      'Stark Discord-community där folk faktiskt hjälper varandra',
      'Lär ut Git, terminalen och riktiga arbetsflöden redan från start',
      'Massor av framgångssagor — folk har fått jobb efter att ha kört igenom materialet',
    ],
    cons: [
      'Ingen som håller handen — kan kännas överväldigande om du fastnar länge',
      'Tar extremt mycket tid, räkna med hundratals timmar',
    ],
    category: 'complementary',
  },
  {
    id: 'exercism',
    name: 'Exercism',
    url: 'https://exercism.org',
    description:
      'Plattform med kodövningar i 82 språk, inklusive JavaScript och TypeScript. Fokuserar på att skriva idiomatisk kod med frivillig mentorhjälp och automatisk analys.',
    pros: [
      'Gratis kodgranskning av riktiga, erfarna programmerare — unikt bland gratisplattformar',
      'Kan se andras lösningar efter att du lämnat in — ger enorma "aha"-ögonblick',
      'Stöd för väldigt många språk — bra om du vill prova något nytt',
      'Community-forumet är vänligt och välkomnande',
    ],
    cons: [
      'Inte bra som enda lärresurs — förutsätter att du redan kan grunderna i ett språk',
    ],
    category: 'complementary',
  },

  // ── Kodutmaningar ──
  {
    id: 'codewars',
    name: 'Codewars',
    url: 'https://www.codewars.com/',
    description:
      'Kodutmaningar (kata) med rangsystem inspirerat av kampsport. Efter varje löst uppgift kan man se andras lösningar och lära sig nya tekniker.',
    pros: [
      'Gratis och kör direkt i webbläsaren — inget att installera, bara köra igång',
      'Ser andras lösningar efter varje kata — ofta det bästa sättet att lära sig skriva snyggare kod',
      'Lätt att bli beroende (på ett bra sätt) — många kör en kata om dagen som en vana',
      'Stödjer 55+ programmeringsspråk',
    ],
    cons: [
      'Inte nybörjarvänligt',
    ],
    category: 'challenges',
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    url: 'https://leetcode.com/',
    description:
      'Populär plattform för kodutmaningar, främst känd för intervjuförberedelser. Ren design och övningar i många språk, men riktar sig mot de som redan kan programmera.',
    pros: [
      'Bästa plattformen om du siktar på jobbintervjuer inom tech',
      'Enorm mängd uppgifter — du börjar se mönster som dyker upp gång på gång',
      'Stort community med diskussionstrådar och lösningar till nästan allt',
    ],
    cons: [
      'Inte bra som nybörjarplattform — du behöver redan kunna grunderna',
    ],
    category: 'challenges',
  },

  // ── Minispel ──
  {
    id: 'flexbox-froggy',
    name: 'Flexbox Froggy',
    url: 'https://flexboxfroggy.com/',
    description:
      'Hjälp grodorna att nå sina näckrosor genom att skriva CSS Flexbox-kod. Ett populärt spel för att lära sig flexbox på ett visuellt och interaktivt sätt.',
    pros: [
      'Superkort och lätt att komma igång med — du spelar färdigt på under en timme',
      'Visualiseringen är riktigt bra, du ser direkt vad din kod gör',
      'Perfekt för nybörjare — ingen förkunskap krävs',
    ],
    cons: [
      'Täcker inte allt inom flexbox — du lär dig grunderna men inte hela bilden',
    ],
    category: 'minigames',
  },
  {
    id: 'grid-garden',
    name: 'Grid Garden',
    url: 'https://cssgridgarden.com/',
    description:
      'Vattna din trädgård genom att skriva CSS Grid-kod. Samma upplägg som Flexbox Froggy, fast för CSS Grid.',
    pros: [
      'Gör CSS Grid begripligt på ett sätt som är svårt att uppnå genom att bara läsa dokumentation',
      'Bra för visuella lärare — du ser direkt hur vattnet rör sig när koden stämmer',
      '28 nivåer ger lite mer substans än Flexbox Froggy',
    ],
    cons: [
      'Ganska kort och ytlig — du lär dig grunderna men behöver öva mer på riktiga projekt',
    ],
    category: 'minigames',
  },
  {
    id: 'anchoreum',
    name: 'Anchoreum',
    url: 'https://anchoreum.com/',
    description:
      'Lär dig CSS Anchor Positioning genom ett interaktivt spel. En nyare CSS-teknik som blir allt vanligare.',
    pros: [
      'Enda interaktiva resursen för CSS anchor positioning — ett ämne som nästan ingen annan täcker',
      'Lär dig avancerade koncept, inte bara grunderna',
      'Gratis, ingen registrering — du är igång direkt',
    ],
    cons: [],
    category: 'minigames',
  },
  {
    id: 'tailwind-trainer',
    name: 'Tailwind Trainer',
    url: 'https://codepip.com/games/tailwind-trainer/',
    description:
      'Öva på Tailwind CSS-klasser genom ett interaktivt spel. I beta — kräver ett Codepip-konto.',
    pros: [
      'Bygger på spaced repetition — du möter samma klasser flera gånger tills de sitter',
      'Täcker brett: färger, spacing, typografi, flexbox, grid och mer',
      'Varje session är lite annorlunda, så det känns inte repetitivt',
    ],
    cons: [
      'Mer som ett quiz än ett spel',
      'Kräver konto',
    ],
    category: 'minigames',
  },
  {
    id: 'flexbox-zombies',
    name: 'Flexbox Zombies',
    url: 'https://flexboxzombies.com/',
    description:
      'Lär dig Flexbox genom att bekämpa zombier med CSS-kod. Pedagogiskt och visuellt imponerande med 12 kapitel.',
    pros: [
      'Går mycket djupare än Flexbox Froggy — du lär dig faktiskt hela flexbox',
      'Berättelsen och karaktärerna gör att du faktiskt vill fortsätta spela',
      'Spaced repetition inbyggt — du repeterar gamla koncept medan du lär dig nya',
    ],
    cons: [],
    category: 'minigames',
  },
  {
    id: 'service-workies',
    name: 'Service Workies',
    url: 'https://serviceworkies.com/',
    description:
      'Lär dig om Service Workers genom ett berättelsedrivet spel. Utvecklat i samarbete med Google.',
    pros: [
      'Riktigt spel med grafik, musik och story — inte bara en interaktiv tutorial',
      'Service workers är notoriskt förvirrande — spelet gör livscykeln faktiskt begriplig',
      'Gjort i samarbete med Google Developers, så innehållet är pålitligt',
    ],
    cons: [
      'Ämnet är ganska nischat — du behöver förstå grunderna i webbutveckling först',
      'Service workers används mest i PWA-projekt, vilket inte alla jobbar med',
    ],
    category: 'minigames',
  },
  {
    id: 'css-diner',
    name: 'CSS Diner',
    url: 'https://flukeout.github.io/',
    description:
      'Lär dig CSS-selektorer genom att välja rätt element på en matbricka. Visar visuellt vilket element som HTML-koden syftar på.',
    pros: [
      'Täcker CSS-selektorer bättre än nästan vad som helst annat — från enkla till avancerade',
      'Middagsbordsmetaforen är rolig och gör abstrakta selektorer konkreta',
      'Gratis, direkt i webbläsaren, ingen inloggning',
    ],
    cons: [],
    category: 'minigames',
  },
  {
    id: 'flexbox-adventure',
    name: 'Flexbox Adventure',
    url: 'https://codingfantasy.com/',
    description:
      'Ett gamifierat äventyr där du lär dig Flexbox genom att styra riddare, magiker och skurkar med CSS-kod.',
    pros: [
      'Fantasy-berättelsen håller motivationen uppe på ett sätt som enkla layoutspel inte gör',
      '24 nivåer med tydlig progression — bra för dig som gillar att se framsteg',
      'Ger dig omedelbar visuell feedback när hjältarna hamnar rätt',
    ],
    cons: [
      'Kräver konto',
    ],
    category: 'minigames',
  },
  {
    id: 'grid-attack',
    name: 'Grid Attack',
    url: 'https://codingfantasy.com/',
    description:
      'Samma upplägg som Flexbox Adventure, fast för CSS Grid. Lär dig Grid genom att försvara din borg.',
    pros: [
      '80 nivåer — du hinner verkligen befästa CSS Grid, inte bara skumma ytan',
      'Tre svårighetsnivåer gör att du kan utmana dig själv när grunderna sitter',
      'Berättelsen om att rädda din bror håller dig engagerad',
    ],
    cons: [
      'Kräver konto',
    ],
    category: 'minigames',
  },
  {
    id: 'mcp-panic',
    name: 'MCP Panic',
    url: 'https://codingfantasy.com/',
    description:
      'Lär dig bygga MCP (Model Context Protocol) som AI-agenter använder för att kommunicera med externa tjänster som Gmail.',
    pros: [
      'Enda spelet som lär ut Model Context Protocol — extremt aktuellt ämne inom AI',
      'Silicon Valley-satiren och berättelsen är genuint rolig',
      'Du implementerar faktiska MCP-komponenter — inte bara teori',
    ],
    cons: [
      'Kräver att du redan kan programmera — inte för nybörjare',
    ],
    category: 'minigames',
  },
];
