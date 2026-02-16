import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import facilitiesImg from "@/assets/facilities.jpg";
import "./CardDialog.css";

interface Post {
  id: number;
  html: string;
  author: string;
  publishedAt: string;
}

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/fetch-posts", { credentials: "include" });
        if (res.ok) {
          const data: Post[] = await res.json();
          data.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          );
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="cd-section">
      <p className="cd-intro">
        Håll dig uppdaterad om kommande evenemang, aktiviteter och viktiga
        datum!
      </p>

      {loading ? (
        <p className="cd-loading">Laddar...</p>
      ) : posts.length > 0 ? (
        <div className="cd-posts">
          {posts.map((post) => (
            <div key={post.id} className="cd-post-card">
              <h4>{post.author}</h4>
              <p className="cd-post-date">
                {new Date(post.publishedAt).toLocaleDateString("sv-SE")}
              </p>
              <div dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="cd-empty">
          <span className="cd-empty-icon">📅</span>
          <h4>Inga kommande händelser</h4>
          <p>
            Det finns inga planerade evenemang just nu. Kom tillbaka snart för
            uppdateringar!
          </p>
        </div>
      )}

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
        <div className="cd-activity cd-activity--wednesday">
          <div className="cd-activity-head">
            <span className="cd-activity-day">Onsdag</span>
            <span className="cd-activity-time">11:00 - 12:00</span>
          </div>
          <h4>JavaScript-föreläsning</h4>
          <p>Veckovis föreläsningar om JavaScript-koncept.</p>
          <div className="cd-activity-leader"><strong>Ledare:</strong> Victoria &amp; Adam</div>
          <div className="cd-tags">
            <span className="cd-tag">JavaScript</span>
            <span className="cd-tag">Föreläsning</span>
          </div>
        </div>
        <div className="cd-activity cd-activity--thursday">
          <div className="cd-activity-head">
            <span className="cd-activity-day">Torsdag</span>
            <span className="cd-activity-time">13:00 - 14:30</span>
          </div>
          <h4>Code Along - Praktisk Programmering</h4>
          <p>Vi kodar tillsammans och bygger projekt.</p>
          <div className="cd-activity-leader"><strong>Plattform:</strong> Microsoft Teams</div>
          <div className="cd-tags">
            <span className="cd-tag">Praktisk</span>
            <span className="cd-tag">Code Along</span>
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
          { title: "Spår 2 - Klassrum", desc: "Ett lugnt klassrum för att utforska programmering." },
          { title: "Spel & Häng - Socialt Rum", desc: "Mysigt rum för onsdagshäng med spel." },
          { title: "Spår 1 - Avancerat Arbetsrum", desc: "Professionellt arbetsrum med kraftfulla datorer." },
        ].map((loc) => (
          <div key={loc.title} className="cd-locale">
            <img src={facilitiesImg} alt={loc.title} className="cd-locale-img" />
            <div className="cd-locale-info">
              <h4>{loc.title}</h4>
              <p>{loc.desc}</p>
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

const dialogContent: Record<
  string,
  { title: string; component: () => React.ReactElement }
> = {
  "Om kursen": { title: "Om Kursen", component: OmKursenContent },
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
