import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { platforms, type Platform } from '@/data/kodsidor';
import './Kodsidor.css';

const tabs = [
  { value: 'recommended', label: 'Rekommenderade', category: 'recommended' as const },
  { value: 'complementary', label: 'Kompletterande', category: 'complementary' as const },
  { value: 'challenges', label: 'Kodutmaningar', category: 'challenges' as const },
  { value: 'minigames', label: 'Minispel', category: 'minigames' as const },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function PlatformDetail({ platform, onBack }: { platform: Platform; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="kodsidor__detail"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 text-muted-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Tillbaka
      </Button>

      <div className="kodsidor__detail-header">
        <h2 className="kodsidor__detail-title">{platform.name}</h2>
        <a
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="kodsidor__detail-link"
        >
          Besök sidan <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <p className="kodsidor__detail-desc">{platform.description}</p>

      <div className="kodsidor__detail-lists">
        {platform.pros.length > 0 && (
          <div className="kodsidor__detail-section kodsidor__detail-section--pros">
            <div className="kodsidor__detail-section-header">
              <ThumbsUp className="h-4 w-4" />
              <h3>Fördelar</h3>
            </div>
            <ul>
              {platform.pros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>
        )}

        {platform.cons.length > 0 && (
          <div className="kodsidor__detail-section kodsidor__detail-section--cons">
            <div className="kodsidor__detail-section-header">
              <ThumbsDown className="h-4 w-4" />
              <h3>Nackdelar</h3>
            </div>
            <ul>
              {platform.cons.map((con, i) => (
                <li key={i}>{con}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const Kodsidor = () => {
  const [selected, setSelected] = useState<Platform | null>(null);
  const [activeTab, setActiveTab] = useState('recommended');

  if (selected) {
    return (
      <div className="kodsidor">
        <PlatformDetail platform={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="kodsidor">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="kodsidor__title">Kodsidor</h1>
        <p className="kodsidor__subtitle">
          Utforska plattformar och verktyg för att lära dig programmering och webbutveckling.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="kodsidor__tabs-list">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="kodsidor__grid"
              key={tab.value}
            >
              {platforms
                .filter((p) => p.category === tab.category)
                .map((platform) => (
                  <motion.div
                    key={platform.id}
                    variants={item}
                    className="kodsidor__card"
                    onClick={() => setSelected(platform)}
                  >
                    <div className="kodsidor__card-icon">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="kodsidor__card-name">{platform.name}</h3>
                      <p className="kodsidor__card-desc">{platform.description}</p>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Kodsidor;
