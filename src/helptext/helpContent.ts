export type HelpEntry = {
  title: string;
  content: string[];
};

export const helpContent: Record<string, HelpEntry> = {
  // ── Admin Panel ──────────────────────────────────────────────────────────────
  "admin.menu": {
    title: "Administration",
    content: [
      "Administrationsfunktionerna finns direkt i sidomenyn:",
      "• Hantera användare – lägg till, redigera eller inaktivera konton för alla roller",
      "• Närvaro – registrera och se närvaro för deltagare",
      "• Buggar & Idéer – se inskickade buggrapporter och idéer från användare",
      "• Deltagare – lista med alla deltagare, coach-filter och frånvarovarningar",
      "• Kalender – hantera tillgänglighet, bokningar och upptagen tid",
    ],
  },
  "admin.users": {
    title: "Hantera deltagare",
    content: [
      "Här ser du alla registrerade deltagare. Du kan söka, filtrera och klicka på en deltagare för att redigera deras uppgifter.",
      "Du kan skapa nya deltagarkonton, tilldela coach och kurs, samt aktivera eller inaktivera konton.",
    ],
  },
  "admin.exercises": {
    title: "Hantera övningar",
    content: [
      "Här skapar och redigerar du övningsuppgifter som tilldelas deltagare.",
      "Du kan ange titel, beskrivning, svårighetsgrad och kategori. Övningar som skapas här blir tillgängliga för deltagare under fliken Sparade i Övningar.",
    ],
  },
  "admin.projects": {
    title: "Hantera projekt",
    content: [
      "Här skapar och redigerar du projektuppgifter.",
      "Du kan ange titel, beskrivning, svårighetsgrad och projekttyp. Projekt som skapas här blir tillgängliga för deltagare under fliken Sparade i Projekt.",
    ],
  },
  "admin.posts": {
    title: "Nyheter & Event",
    content: [
      "Här publicerar du nyheter och evenemang som visas på startsidan för alla användare.",
      "Skriv en rubrik och ett innehåll, välj om det är en nyhet eller ett event, och publicera. Du kan även redigera och ta bort befintliga inlägg.",
    ],
  },
  "admin.attendance": {
    title: "Närvarohantering",
    content: [
      "Här registrerar du närvaro för deltagare. Välj datum och markera vilka deltagare som var närvarande.",
      "Historisk närvaro visas i en översikt per deltagare.",
    ],
  },
  "admin.coach-attendance": {
    title: "Deltagarprofiler",
    content: [
      "Här kan du se detaljerade profiler för enskilda deltagare, inklusive närvarodata och tilldelad coach.",
      "Klicka på en deltagare för att se deras fullständiga profil.",
    ],
  },

  // ── Admin Schedule ────────────────────────────────────────────────────────────
  "admin-schedule": {
    title: "Kalender & Bokning",
    content: [
      "Här hanterar du din tillgänglighet och ser bokade möten med coacher.",
      "• Alla nya bokningar är förfrågningar – motparten måste godkänna innan mötet är bekräftat. Det gäller både möten du föreslår och möten coacher föreslår till dig.",
      "• Klicka på en tom tid i kalendern för att välja mellan \"Tillgänglighet\" och \"Upptagen\".",
      "• Tillgänglighet (blå) – en visuell markering av när du helst vill ta möten. Coacher kan föreslå möten när som helst, men blå tider signalerar att du föredrar dessa.",
      "• Upptagen (mörkgrå) – tider du markerat som upptagna. Coacher får en varning om de försöker föreslå möte då, men kan ändå skicka förfrågan. Befintliga bokningar påverkas inte när du lägger till eller ändrar en upptagen tid — du avgör själv om något ska avbokas.",
      "• Bokade möten visas i kalendern med status (Förfrågan, Godkänd, Nekad). Klicka för att godkänna, neka, avboka eller boka om.",
      "• Ombokning – om du eller coachen bokar om går förfrågan tillbaka till \"Förfrågan\" och kräver nytt godkännande.",
      "• Överför bokning – en godkänd bokning kan överföras till en annan lärare. Coachen får ett mejl om bytet.",
      "• Föreslå möte – använd knappen för att skicka en förfrågan till en coach. Välj \"Uppföljning\" för att koppla mötet till en specifik elev, eller \"Annat\" för övriga möten.",
      "• Återkommande event – skapa schemalagda event (t.ex. coachträff) som upprepas varje vecka eller varannan vecka. Välj ansvarig lärare och klassrum.",
      "• Visa kalendrar – toggla på flera lärares namn för att jämföra deras bokningar.",
      "• Röda dagar markerar dagar utan undervisning (NoClass).",
      "• Kalendern visar tiderna 08:00–16:00, måndag till torsdag.",
    ],
  },

  // ── Övningar ──────────────────────────────────────────────────────────────────
  "ovningar.ai": {
    title: "Övningar – AI-generera",
    content: [
      "Här kan du generera övningsuppgifter med hjälp av AI. Beskriv vad du vill öva på så skapar AI en skräddarsydd uppgift åt dig.",
      "Du kan välja ämne, svårighetsgrad och typ av uppgift. Genererade övningar kan sparas för att komma åt dem senare.",
    ],
  },
  "ovningar.saved.student": {
    title: "Övningar – Sparade",
    content: [
      "Här ser du övningar som din coach eller lärare har tilldelat dig.",
      "Klicka på en övning för att se instruktionerna och arbeta med uppgiften.",
    ],
  },
  "ovningar.saved.admin": {
    title: "Övningar – Sparade",
    content: [
      "Här ser du alla övningar som finns i systemet.",
      "Du kan redigera befintliga övningar och skapa nya direkt härifrån. Övningarna är tillgängliga för deltagare under deras sparade flik.",
    ],
  },

  // ── Projekt ───────────────────────────────────────────────────────────────────
  "projekt.ai": {
    title: "Projekt – AI-generera",
    content: [
      "Här kan du generera projektidéer med hjälp av AI. Beskriv vad du vill bygga eller vilket ämne du vill utforska, så föreslår AI ett projekt.",
      "Du kan anpassa förslaget efter din nivå och dina intressen. Genererade projekt kan sparas för att komma åt dem senare.",
    ],
  },
  "projekt.saved": {
    title: "Projekt – Sparade",
    content: [
      "Här ser du projekt som din coach eller lärare har tilldelat dig, samt projekt du har sparat från AI-generatorn.",
      "Klicka på ett projekt för att se beskrivningen och börja arbeta.",
    ],
  },

  // ── Portfolio ─────────────────────────────────────────────────────────────────
  "portfolio": {
    title: "Min portfolio",
    content: [
      "Här ser du en sammanställning av alla övningar och projekt som har tilldelats dig.",
      "Portfolion ger dig en snabb överblick över hur mycket material du har tillgång till och inom vilka teknikområden.",
    ],
  },

  // ── Terminal ──────────────────────────────────────────────────────────────────
  "terminal": {
    title: "Terminal",
    content: [
      "Här kan du öva på grundläggande terminalkommandon i en säker miljö. Terminalen simulerar ett riktigt filsystem utan att påverka din dator.",
      "Följ lektionerna i panelen till vänster för guidad träning, eller utforska fritt med kommandon som ls, cd, mkdir, touch och pwd.",
      "Skriv help i terminalen för att se alla tillgängliga kommandon.",
    ],
  },

  // ── Meddelanden ─────────────────────────────────────────────────────────────
  "meddelanden": {
    title: "Meddelanden",
    content: [
      "Här ser du alla dina konversationer med andra användare.",
      "Klicka på en konversation i listan för att öppna chatten. Du kan skicka meddelanden, visa äldre meddelanden med 'Visa fler' och se vem som skrivit vad.",
      "Olästa konversationer markeras med en röd prick. Antalet olästa visas även i sidomenyn.",
    ],
  },

  // ── Deltagare ─────────────────────────────────────────────────────────────────
  "deltagare": {
    title: "Deltagare",
    content: [
      "Här ser du en lista över alla aktiva och inaktiva deltagare i systemet.",
      "• Coach-filter – använd rullgardinsmenyn för att filtrera deltagare efter coach.",
      "• Frånvarovarning – deltagare som inte varit närvarande de senaste 2 veckorna markeras med en varningstriangel.",
      "• Skicka varning – klicka på kuvertikonen bredvid varningstriangeln för att skicka ett e-postmeddelande till deltagarens coach. Välj mellan ett förgenerat meddelande eller skriv ett eget.",
      "Klicka på en deltagare för att se deras profil med närvaro, schema, kontaktinfo och meddelanden.",
    ],
  },

  // ── Mina deltagare ────────────────────────────────────────────────────────────
  "mina-deltagare": {
    title: "Mina deltagare",
    content: [
      "Här ser du de deltagare som är tilldelade dig som coach.",
      "• Deltagare som har varit närvarande de senaste 4 veckorna visas i huvudlistan.",
      "• Deltagare som inte varit närvarande de senaste 4 veckorna visas i en separat sektion längst ner.",
      "Klicka på en deltagare för att se deras närvaro och profil.",
    ],
  },

  // ── Kontakt ───────────────────────────────────────────────────────────────────
  "kontakt": {
    title: "Kontakt",
    content: [
      "Här hittar du kontaktuppgifter till administratörer och lärare.",
      "Använd e-post eller telefon för att nå dem direkt. Du kan också skicka meddelanden via Meddelanden-sidan.",
    ],
  },

  // ── Klassrum ─────────────────────────────────────────────────────────────────
  "klassrum": {
    title: "Klassrum",
    content: [
      "Här planerar du bordsplaceringen för Spår 1 och Spår 2.",
      "• Översiktsfliken visar antal lediga bord och schemalagda elever per dag och block för båda klassrummen.",
      "• Varje bord har två väljare (förmiddag/eftermiddag) där du tilldelar elever till platser.",
      "• Väljarna visar bara elever som är schemalagda den dagen och inte redan placerade.",
      "• Bordstilldelningar sparas per dag (måndag–torsdag) och bevaras mellan sessioner.",
    ],
  },

  // ── Deltagarschema ──────────────────────────────────────────────────────────
  "deltagarschema": {
    title: "Deltagarschema",
    content: [
      "Här ser du en översikt över hur många deltagare som är schemalagda per dag och block (förmiddag/eftermiddag).",
      "• Under varje dag (måndag–torsdag) visas en lista med schemalagda deltagare, sorterade efter heldags-, förmiddags- och eftermiddagsdeltagare.",
      "• Deltagare utan schema visas som \"Ej schemalagda\" i översikten.",
    ],
  },

  // ── Coach Bokning ─────────────────────────────────────────────────────────────
  "coach-booking": {
    title: "Boka möte",
    content: [
      "Här föreslår du möten med en lärare.",
      "• Välj en lärare åt gången via knapparna ovanför kalendern – det är den lärarens kalender du ser och klickar i.",
      "• Klicka var som helst i kalendern för att föreslå ett möte på den tiden. Läraren får en förfrågan och måste godkänna innan mötet är bekräftat.",
      "• Blå block (\"Tillgänglig\") är tider läraren föredrar att ta möten på.",
      "• Klicka på \"Upptagen\" (mörkgrå) eller ett återkommande event – du får en varning men kan ändå skicka förfrågan.",
      "• En tid som redan är godkänd av en annan coach är helt blockerad – du kan inte föreslå möte där.",
      "• Andra coachers väntande förfrågningar syns inte för dig.",
      "• Mötestyp: välj \"Intromöte\", \"Uppföljning\" (kräver elev) eller \"Annat\".",
      "• Dina bokningar visas i kalendern med status (Förfrågan, Godkänd, Nekad). Klicka för att avboka, boka om eller godkänna en ombokning från läraren.",
      "• Ombokning – om du eller läraren bokar om går förfrågan tillbaka till \"Förfrågan\" och kräver nytt godkännande.",
      "• Röda dagar markerar dagar utan undervisning.",
      "• Kalendern visar tiderna 08:00–16:00, måndag till torsdag.",
    ],
  },

  // ── Student Calendar (DISABLED — students cannot log in) ─────────────────────
  "student-calendar": {
    title: "Min kalender",
    content: [
      "Här ser du dina bokade möten och återkommande event.",
      "• Boka handledning – klicka på knappen för att boka ett möte med en lärare.",
      "• Dina bokningar visas med status (förfrågan, godkänd, ombokning, nekad).",
      "• Klicka på en bokning för att se detaljer, godkänna/neka ombokning eller avboka.",
      "• Återkommande event (t.ex. coachträffar) visas som lila block – klicka för att se detaljer.",
      "• Röda dagar i kalendern markerar dagar utan undervisning.",
    ],
  },

  // ── Coach Projekt ─────────────────────────────────────────────────────────────
  "coach-projekt": {
    title: "Projekt",
    content: [
      "Här ser du alla tillgängliga projekt i systemet.",
      "Projekten visar titel, beskrivning, projekttyp och svårighetsgrad. Använd den här sidan som referens när du handleder dina deltagare.",
    ],
  },

  // ── Inställningar (Student/Admin) ─────────────────────────────────────────────
  "preferenser": {
    title: "Inställningar",
    content: [
      "Här kan du hantera din profil och dina inställningar.",
      "• Profil – uppdatera din e-postadress och ditt telefonnummer.",
      "• Tema – byt mellan ljust och mörkt läge.",
      "• Notifikationer – styr om du vill ta emot e-postnotiser.",
      "• Feedback – skicka in en buggrapport eller idé.",
    ],
  },

  // ── AdminUsers tabs ───────────────────────────────────────────────────────────
  "admin.users.admin": {
    title: "Hantera deltagare – Admin",
    content: [
      "Här ser du alla administratörer i systemet.",
      "Du kan skapa nya admin-konton, redigera befintliga och inaktivera konton som inte längre ska ha tillgång.",
    ],
  },
  "admin.users.larare": {
    title: "Hantera deltagare – Lärare",
    content: [
      "Här ser du alla lärare i systemet.",
      "Du kan skapa nya lärarkonton, redigera uppgifter och inaktivera konton.",
    ],
  },
  "admin.users.coach": {
    title: "Hantera deltagare – Coach",
    content: [
      "Här ser du alla coacher i systemet.",
      "Du kan skapa nya coachkonton, redigera uppgifter och tilldela coacher till deltagare via deltagarfliken.",
    ],
  },
  "admin.users.deltagare": {
    title: "Hantera deltagare – Deltagare",
    content: [
      "Här ser du alla deltagare i systemet.",
      "Du kan skapa nya deltagarkonton, redigera uppgifter som kurs och coach, samt aktivera eller inaktivera konton.",
    ],
  },

  // ── CoachAttendance tabs ──────────────────────────────────────────────────────
  "attendance.narvaro": {
    title: "Deltagarprofil – Närvaro",
    content: [
      "Här registrerar du närvaro för den valda deltagaren vecka för vecka.",
      "Markera de dagar deltagaren var närvarande. Ändringarna sparas direkt.",
    ],
  },
  "attendance.narvaro.coach": {
    title: "Deltagarprofil – Närvaro",
    content: [
      "Här ser du närvaron för den valda deltagaren två veckor i taget.",
    ],
  },
  "attendance.schema": {
    title: "Deltagarprofil – Schemalagda dagar",
    content: [
      "Här ser och redigerar du vilka veckodagar deltagaren är schemalagd att närvara.",
      "Justera schemat om deltagarens närvarodagar förändras.",
    ],
  },
  "attendance.kontaktinfo": {
    title: "Deltagarprofil – Kontaktinfo",
    content: [
      "Här ser du kontaktuppgifter för den valda deltagaren, inklusive e-post och telefonnummer.",
      "Uppgifterna kan redigeras av administratören.",
    ],
  },
  "attendance.larare": {
    title: "Deltagarprofil – Lärare på kursen",
    content: [
      "Här ser du vilken lärare som är ansvarig för deltagarens kurs.",
    ],
  },
  "attendance.progression": {
    title: "Deltagarprofil – Progression",
    content: [
      "Här ser du en översikt av deltagarens framsteg, inklusive tilldelade övningar och projekt.",
    ],
  },
  "attendance.statistik": {
    title: "Deltagarprofil – Statistik",
    content: [
      "Här ser du sammanställd närvaro­statistik för den valda deltagaren.",
      "Statistiken visar antal närvarodagar och frånvaro över tid.",
    ],
  },

  "attendance.meddelanden": {
    title: "Deltagarprofil – Meddelanden",
    content: [
      "Här kan du skicka meddelanden till den valda deltagaren.",
      "Konversationen visas i en chattvy. Skriv ett meddelande och klicka på skicka.",
    ],
  },

  // ── Coach Inställningar ───────────────────────────────────────────────────────
  "coach-installningar": {
    title: "Inställningar",
    content: [
      "Här kan du hantera din profil och dina inställningar.",
      "• Profil – uppdatera ditt telefonnummer (e-post och namn hanteras av administratören).",
      "• Tema – byt mellan ljust och mörkt läge.",
      "• Feedback – skicka in en buggrapport eller idé.",
    ],
  },

  // ── Admin Bug Reports ───────────────────────────────────────────────────────
  "admin.bug-reports": {
    title: "Buggar & Idéer",
    content: [
      "Här ser du alla inskickade buggrapporter och idéer från användare.",
      "Växla mellan flikarna Buggar och Idéer för att filtrera. Rapporterna visas med avsändarens namn, innehåll och datum.",
    ],
  },
};
