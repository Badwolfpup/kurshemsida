import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Calendar, Building, Users } from 'lucide-react';
import heroImg from '@/assets/hero-classroom.jpg';
import activitiesImg from '@/assets/activities.jpg';
import facilitiesImg from '@/assets/facilities.jpg';
import instructorsImg from '@/assets/instructors.jpg';
import CardDialog from '@/components/CardDialog';
import './Index.css';

const cards = [
  { title: 'Kodsidor', icon: Code, image: heroImg },
  { title: 'Våra aktiviteter', icon: Calendar, image: activitiesImg },
  { title: 'Våra lokaler', icon: Building, image: facilitiesImg },
  { title: 'Handledarna', icon: Users, image: instructorsImg },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const Index = () => {
  const [openCard, setOpenCard] = useState<string | null>(null);

  return (
    <div className="index">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="index__hero"
      >
        <div className="index__hero-content">
          <h1 className="index__hero-title">
            Välkommen till CUL Programmering
          </h1>
          <p className="index__hero-text">
            Din väg in i tech börjar här. Lär dig koda, bygg projekt och forma
            din framtid – med stöd hela vägen.
          </p>
        </div>
        <div className="index__hero-bg" />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="index__minicards"
      >
        {cards.map((card) => (
          <motion.div
            key={card.title}
            variants={item}
            className="index__minicard"
            onClick={() => setOpenCard(card.title)}
            style={{ backgroundImage: `url(${card.image})` }}
          >
            <div className="index__minicard-icon">
              <card.icon />
            </div>
            <span className="index__minicard-title">{card.title}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="index__about"
      >
        <p className="index__about-intro">
          Hos oss erbjuder vi en unik och inkluderande programmeringsmiljö där du
          kan utvecklas i din egen takt, på dina egna villkor. Vi tror på att alla
          kan lära sig programmera – det handlar bara om att hitta rätt stöd och
          miljö.
        </p>

        <div className="index__about-tracks">
          <div className="index__about-track">
            <h3>Spår 1: Upptäck Programmering</h3>
            <p className="index__about-track-sub">
              För dig som vill utforska kodningens värld
            </p>
            <p>
              Är du nyfiken på programmering men osäker på om det är något för
              dig? Vårt upptäcksspår ger dig möjlighet att prova på kodning i en
              trygg och stödjande miljö – helt utan förkunskaper.
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
          </div>

          <div className="index__about-track">
            <h3>Spår 2: Avancerad Utveckling</h3>
            <p className="index__about-track-sub">
              För dig som vill lära dig bygga riktiga websidor eller program
            </p>
            <p>
              Har du redan lärt dig grunderna i programmering och vill ta nästa steg?
              Spår 2 riktar sig till dig som är intresserad av att jobba som
              utvecklare och vill lära dig bygga verkliga websidor eller program –
              inte bara små övningar.
            </p>
            <h4>Vad du får hjälp med:</h4>
            <ul>
              <li>Sätta upp projekt som liknar verkliga applikationer, med till exempel databas och inloggning</li>
              <li>Grundläggande säkerhetstänk i dina projekt</li>
              <li>Bygga en portfolio med projekt du kan visa upp</li>
              <li>Skriva ett CV som speglar vad du faktiskt kan</li>
              <li>Vi hoppas också kunna erbjuda mentorskap eller praktikplats hos etablerade företag</li>
            </ul>
            <p>
              <strong>Målet:</strong> Att du lämnar kursen med praktiska kunskaper
              och projekt du är stolt över – och en tydligare bild av om
              utvecklararbete är rätt väg för dig.
            </p>
          </div>
        </div>

        <div className="index__about-target">
          <h3>Vår målgrupp</h3>
          <p>
            Vi vänder oss särskilt till dig som har upplevt att den traditionella
            skolvägen inte fungerat för dig. Här får du chansen att upptäcka
            programmering i en miljö som är byggd för just dig.
          </p>
          <p>
            <strong>Målet:</strong> Att ge dig möjlighet att upptäcka om
            programmering är något du vill fortsätta med, utan press eller
            förväntningar.
          </p>
        </div>

        <div className="index__about-why">
          <h3>Varför välja CUL Programmering?</h3>
          <ul>
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
      </motion.section>

      <CardDialog
        cardTitle={openCard ?? ''}
        open={!!openCard}
        onOpenChange={(open) => {
          if (!open) setOpenCard(null);
        }}
      />
    </div>
  );
};

export default Index;
