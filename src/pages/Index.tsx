import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Building, Users } from "lucide-react";
import heroImg from "@/assets/hero-classroom.jpg";
import activitiesImg from "@/assets/activities.jpg";
import facilitiesImg from "@/assets/facilities.jpg";
import instructorsImg from "@/assets/instructors.jpg";
import CardDialog from "@/components/CardDialog";
import "./Index.css";

const cards = [
  {
    title: "Om kursen",
    description:
      "Lär dig programmering från grunden med modern pedagogik, praktiska projekt och stöd hela vägen till anställning.",
    icon: BookOpen,
    image: heroImg,
  },
  {
    title: "Våra aktiviteter",
    description:
      "Workshops, hackathons, gästföreläsningar och branschevent som ger dig verkliga kontakter och erfarenheter.",
    icon: Calendar,
    image: activitiesImg,
  },
  {
    title: "Våra lokaler",
    description:
      "Moderna, ljusa lokaler med allt du behöver – höghastighetsinternet, dual monitors och samarbetsytor.",
    icon: Building,
    image: facilitiesImg,
  },
  {
    title: "Handledarna",
    description:
      "Erfarna utvecklare och pedagoger som brinner för att hjälpa dig nå dina mål inom programmering.",
    icon: Users,
    image: instructorsImg,
  },
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
    transition: { duration: 0.5, ease: "easeOut" as const },
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
            Din resa mot en karriär inom tech börjar här. Lär dig koda, bygg
            projekt och skapa din framtid – med stöd varje steg på vägen.
          </p>
        </div>
        <div className="index__hero-bg" />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="index__grid"
      >
        {cards.map((card) => (
          <motion.div
            key={card.title}
            variants={item}
            className="index__card"
            onClick={() => setOpenCard(card.title)}
            style={{ cursor: "pointer" }}
          >
            <div className="index__card-image-wrap">
              <img
                src={card.image}
                alt={card.title}
                className="index__card-image"
                loading="lazy"
              />
            </div>
            <div className="index__card-body">
              <div className="index__card-header">
                <div className="index__card-icon">
                  <card.icon />
                </div>
                <h3 className="index__card-title">{card.title}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <CardDialog
        cardTitle={openCard ?? ""}
        open={!!openCard}
        onOpenChange={(open) => {
          if (!open) setOpenCard(null);
        }}
      />
    </div>
  );
};

export default Index;
