export type HelpEntry = {
  title: string;
  content: string[];
};

export const helpContent: Record<string, HelpEntry> = {
  // ── Admin Panel ──────────────────────────────────────────────────────────────
  "admin.menu": {
    title: "Admin Panel",
    content: [
      "Här administrerar du hela plattformen. Välj ett område i menyn för att komma igång.",
      "• Hantera deltagare – lägg till, redigera eller inaktivera deltagarkonton",
      "• Hantera övningar – skapa och redigera övningsuppgifter som tilldelas deltagare",
      "• Hantera projekt – skapa och redigera projektuppgifter",
      "• Nyheter & Event – publicera nyheter och evenemang som visas på startsidan",
      "• Närvarohantering – registrera och se närvaro för deltagare",
      "• Deltagarprofiler – se detaljerad information om enskilda deltagare",
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
      "Här hanterar du din tillgänglighet och ser bokade möten med coacher och deltagare.",
      "• Klicka på ett tomt tidsfält i kalendern för att lägga till en tillgänglig tid.",
      "• Tillgängliga tider visas i blått – coacher och elever kan boka dem för möten.",
      "• Bokade möten visas med information om vem som har bokat och status.",
      "• Du kan godkänna, neka eller avboka möten direkt från kalendern.",
      "• Återkommande event – skapa schemalagda event (t.ex. coachträff) som upprepas varje vecka eller varannan vecka. Välj ansvarig lärare i dropdown.",
      "• Visa bokningar – använd toggeln för att visa/dölja bokningar och tillgänglighet från andra admins/lärare.",
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

  // ── Ärenden (Tickets) ─────────────────────────────────────────────────────────
  "tickets.admin": {
    title: "Inkomna ärenden",
    content: [
      "Här ser du alla ärenden som deltagare och coacher har skickat in.",
      "Du kan öppna ett ärende för att läsa meddelandet, svara i tråden, ändra status (Öppen → Pågående → Stängd) och föreslå mötestider för handlednings- och förfrågningsärenden.",
      "Olästa ärenden markeras med ett utropstecken.",
    ],
  },
  "tickets.coach": {
    title: "Ärenden",
    content: [
      "Här kan du skicka ärenden till administratörer och lärare, till exempel förfrågningar, idéer eller buggrapporter.",
      "Klicka på Nytt ärende för att skapa ett ärende. Du kan följa svaren och statusen på dina ärenden i listan.",
    ],
  },
  "tickets.student": {
    title: "Ärenden",
    content: [
      "Här kan du kontakta din coach eller lärare med frågor och förfrågningar.",
      "• Handledning – begär en handledningssession; din coach kan föreslå en tid.",
      "• Förfrågan – skicka en allmän fråga.",
      "• Bugg – rapportera ett tekniskt problem.",
      "Klicka på ett ärende för att se svaren och följa statusen.",
    ],
  },

  // ── Deltagare ─────────────────────────────────────────────────────────────────
  "deltagare": {
    title: "Deltagare",
    content: [
      "Här ser du en lista över alla aktiva deltagare i systemet.",
      "Klicka på en deltagare för att se deras profil med information om kurs, coach, närvaro och framsteg.",
    ],
  },

  // ── Mina deltagare ────────────────────────────────────────────────────────────
  "mina-deltagare": {
    title: "Mina deltagare",
    content: [
      "Här ser du de deltagare som är tilldelade dig som coach.",
      "Klicka på en deltagare för att se deras närvaro och profil. Du kan registrera och följa deras utveckling härifrån.",
    ],
  },

  // ── Kontakt ───────────────────────────────────────────────────────────────────
  "kontakt": {
    title: "Kontakt",
    content: [
      "Här hittar du kontaktuppgifter till administratörer och lärare.",
      "Använd e-post eller telefon för att nå dem direkt. Om du vill skicka ett formellt ärende, använd Ärenden-sidan i stället.",
    ],
  },

  // ── Coach Bokning ─────────────────────────────────────────────────────────────
  "coach-booking": {
    title: "Boka möte",
    content: [
      "Här kan du boka ett möte med en administratör eller lärare.",
      "Välj en person i tabben ovanför kalendern och klicka på en grön tillgänglig tid för att boka. Du kan också lägga till en anteckning när du bokar.",
      "Dina bokningar visas i kalendern. Du kan avboka eller begära ombokning direkt från kalendern.",
      "• Återkommande event (t.ex. coachträffar) visas som lila block i kalendern.",
    ],
  },

  // ── Student Calendar ─────────────────────────────────────────────────────────
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
      "• Rapportera bugg – skicka in en buggrapport om något inte fungerar som det ska.",
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

  // ── Coach Inställningar ───────────────────────────────────────────────────────
  "coach-installningar": {
    title: "Inställningar",
    content: [
      "Här kan du hantera din profil och dina inställningar.",
      "• Profil – uppdatera ditt telefonnummer (e-post och namn hanteras av administratören).",
      "• Tema – byt mellan ljust och mörkt läge.",
      "• Rapportera bugg – skicka in en buggrapport om något inte fungerar som det ska.",
    ],
  },
};
