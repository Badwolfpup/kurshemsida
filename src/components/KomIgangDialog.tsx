import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const platforms = [
  {
    emoji: "\u{1F4DA}",
    name: "FreeCodeCamp",
    url: "https://www.freecodecamp.org",
    desc: "En omfattande och helt gratis plattform med strukturerade kurser i webbutveckling. Börja med HTML och CSS, gå vidare till JavaScript, och bygg riktiga projekt längs vägen. Perfekt för nybörjare som vill ha en tydlig väg att följa.",
    tags: [],
  },
  {
    emoji: "\u{1F4D6}",
    name: "W3Schools",
    url: "https://www.w3schools.com",
    desc: "En snabb och lättillgänglig referens för webbutveckling. Perfekt när du behöver slå upp syntax eller testa koncept snabbt. Innehåller interaktiva exempel du kan redigera direkt i webbläsaren. Bra komplement till mer djupgående kurser.",
    tags: ["Hög omfattning", "Snabb", "Informativt"],
  },
  {
    emoji: "\u{1F3A8}",
    name: "Frontend Mentor",
    url: "https://www.frontendmentor.io",
    desc: "Bygg riktiga frontend-projekt med professionella designer. Du får design-filer och specifikationer, och bygger sedan projektet själv. Perfekt för att öva på HTML, CSS och JavaScript medan du bygger din portfolio. Möjlighet att få feedback från community.",
    tags: ["Frontend", "Design", "Learning"],
  },
];

const tips = [
  "Kolla vilka språk det finns som man kan koda i, vilket språk passar dig utöver dina önskemål att kunna bygga?",
  "Kolla på youtube videos nån gång varje dag om det språk du vill lära dig mer om. Sen när du är bekväm att testa det... KÖR HÅRT!",
  "Koda varje dag: Även 20-30 minuter om dagen gör stor skillnad över tid. Konsistens är viktigare än långa sessioner.",
  "Bygg egna projekt: När du lärt dig grunderna, börja bygga något eget. Det är där du verkligen lär dig.",
  "Var inte rädd för att fastna: Det är en normal del av lärandet. Sök efter lösningar, fråga i forum, och använd AI för att få svar på dina kodfrågor!",
  "Ha tålamod: Programmering tar tid att lära sig. Alla börjar från början.",
];

export function KomIgangDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 text-sm">
          <Sparkles className="h-4 w-4" />
          Kom igång
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Kom Igång med Kodning</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm leading-relaxed">
          Vill du börja lära dig programmering redan innan du ansluter dig till kursen? Här är våra rekommenderade resurser som hjälper dig att komma igång på egen hand. Alla dessa är gratis och passar olika lärstilar och nivåer.
        </p>

        <div className="space-y-4 mt-4">
          <h3 className="font-display font-semibold text-foreground">Lärplattformar</h3>
          {platforms.map((p) => (
            <div key={p.name} className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  {p.name} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
              {p.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {p.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 bg-muted/50 rounded-xl p-4 space-y-2">
          <h3 className="font-display font-semibold text-foreground">Såhär kommer det se ut när du börjar hos oss:</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Du kommer få börja med att starta upp ett konto på freecodecamp.org där du i din takt får lära dig att koda grunderna i HTML, CSS och JavaScript. Efter det får du välja det ramverk och språk som mest är intressant för dig.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="font-display font-semibold text-foreground">Verktyg vi använder</h3>
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-foreground">Visual Studio Code</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Den mest populära code-editor för webbutveckling. Gratis, kraftfull och med massor av tillägg (extensions) som gör kodning enklare. Vi använder VS Code i kursen, så om du vill bekanta dig med den redan nu så får du mer än gärna göra det! Fungerar på Windows, Mac och Linux.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">Gratis</Badge>
              <Badge variant="secondary" className="text-xs">Kraftfull</Badge>
              <Badge variant="secondary" className="text-xs">Måste-ha</Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="font-display font-semibold text-foreground">Tips för att komma igång</h3>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="text-muted-foreground text-sm leading-relaxed flex gap-2">
                <span className="text-primary font-bold shrink-0">&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 bg-muted/30 rounded-xl p-5 text-center space-y-3 border border-border">
          <h3 className="font-display font-semibold text-foreground text-lg">Redo att börja?</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
            Det finns ingen "perfekt" tid att börja – det bästa är att börja nu! Välj en resurs ovan, öppna VS Code, och skriv din första rad kod. Varje expert var en gång nybörjare.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
            Men vill du ha en plats att komma till och lära dig tillsammans med oss på CUL så välkomnar vi dig utan några krav alls!
          </p>
          <p className="text-primary font-semibold text-sm">Vi ser fram emot att ha just DIG till kursen när du är redo!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
