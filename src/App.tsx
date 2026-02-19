import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { IntroScreen } from "./components/IntroScreen";
import { TutorialScreen } from "./components/TutorialScreen";
import { MapSelection } from "./components/MapSelection";
import { HowItWorksScreen } from "./components/HowItWorksScreen";
import { GameScreen } from "./components/GameScreen";

import { MapLevel, Screen } from "./types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [selectedMap, setSelectedMap] = useState<MapLevel | null>(null);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-['VT323']"
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#020617', // slate-950
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'VT323', monospace"
      }}
    >
      <AnimatePresence mode="wait">
        {screen === "intro" && (
          <motion.div
            key="intro"
            className="absolute inset-0 z-50"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <IntroScreen 
              onStart={() => {
                setScreen("tutorial");
              }} 
              onHowItWorks={() => setScreen("how-it-works")}
            />
          </motion.div>
        )}

        {screen === "tutorial" && (
          <motion.div
            key="tutorial"
            className="absolute inset-0 z-50"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TutorialScreen 
                onComplete={() => {
                    setScreen("map");
                }}
            />
          </motion.div>
        )}

        {screen === "how-it-works" && (
          <motion.div
            key="how-it-works"
            className="absolute inset-0 z-50"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <HowItWorksScreen 
              onBack={() => setScreen("intro")}
              onStart={() => setScreen("map")}
            />
          </motion.div>
        )}

        {screen === "map" && (
          <motion.div
            key="map"
            className="absolute inset-0 z-30"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30 }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <MapSelection
              onSelect={(mapId) => {
                // Mock map data - in real app, fetch from config
                const mapData: MapLevel = {
                  id: mapId,
                  name: `SCENARIO ${mapId.toString().replace("zone-", "").toUpperCase()}`,
                  difficulty: 2,
                };
                setSelectedMap(mapData);
                setScreen("game");
              }}
            />
          </motion.div>
        )}

        {screen === "game" && (
            <motion.div
                key="game"
                className="absolute inset-0 z-40"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <GameScreen 
                    mapData={selectedMap || { id: 'default', name: 'TEST ZONE', difficulty: 1 }}
                    onExit={() => setScreen("map")}
                />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
