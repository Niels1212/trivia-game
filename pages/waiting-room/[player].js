import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { database } from "../../firebaseConfig";
import { ref, onValue, set, update, onDisconnect } from "firebase/database";
import Container from "../../components/Container";
import Button from "../../components/Button";
import { motion } from "framer-motion";

export default function WaitingRoom() {
  const router = useRouter();
  const { player } = router.query; // Get player name from URL
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!player) return;

    const playerRef = ref(database, `waitingRoom/${player}`);
    set(playerRef, { name: player, ready: false });
    onDisconnect(playerRef).remove();

    const waitingRoomRef = ref(database, "waitingRoom");
    const unsubscribe = onValue(waitingRoomRef, () => {
      // No additional UI changes needed here
    });

    const gameStateRef = ref(database, "gameState");
    const unsubscribeGame = onValue(gameStateRef, (snapshot) => {
      if (snapshot.val()?.started) {
        router.push(`/quiz/${player}`);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeGame();
    };
  }, [player, router]);

  const markReady = () => {
    if (!player) return;
    const playerRef = ref(database, `waitingRoom/${player}`);
    update(playerRef, { ready: true });
    setIsReady(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-extrabold text-indigo-700 mb-4"
          >
            ⏳ Waiting Room
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-700 border-t pt-4"
            style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)" }}
          >
            👋 Hello, <span className="text-indigo-700">{player}</span>! Please wait for the host to start the game...
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6"
          >
            {!isReady ? (
              <Button onClick={markReady} variant="primary">
                I&apos;m Ready! ✅
              </Button>
            ) : (
              <span className="text-xl font-semibold text-green-600 mt-4">Ready 🎉</span>
            )}
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
