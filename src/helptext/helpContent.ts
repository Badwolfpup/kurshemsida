export type HelpEntry = {
  title: string;
  content: string[];
};

export const helpContent: Record<string, HelpEntry> = {
  "admin.users": {
    title: "Hantera deltagare",
    content: [
      "Här ser du alla registrerade deltagare. Du kan söka, filtrera och klicka på en deltagare för att redigera deras uppgifter.",
      "Du kan skapa nya deltagarkonton, tilldela coach och kurs, samt aktivera eller inaktivera konton.",
    ],
  },
  "admin.attendance": {
    title: "Närvarohantering",
    content: [
      "Här registrerar du närvaro för deltagare. Välj datum och markera vilka deltagare som var närvarande.",
      "Historisk närvaro visas i en översikt per deltagare.",
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
