// /components/master/components.js
import { useState } from "react";
import { database } from "../../firebaseConfig";
import { ref, get } from "firebase/database";
import Button from "../Button"; // Adjust the path if needed

export function AnimatedResults() {
  const [animatedPlayers, setAnimatedPlayers] = useState([]);
  const [showAnimatedResults, setShowAnimatedResults] = useState(false);

  const handleShowAnimatedResults = async () => {
    setShowAnimatedResults(true);
    const scoresRef = ref(database, "scores");
    const snapshot = await get(scoresRef);
    const data = snapshot.val();
    if (data) {
      // Create an ascending sorted list (worst to best)
      const sortedScores = Object.entries(data)
        .map(([name, info]) => ({ name, score: info.score }))
        .sort((a, b) => a.score - b.score);

      let index = 0;
      const animate = () => {
        setAnimatedPlayers((prev) => [...prev, sortedScores[index]]);
        index++;
        if (index < sortedScores.length) {
          // Use 2000ms for most entries, 4000ms for the final three entries
          const delay = index >= sortedScores.length - 3 ? 4000 : 2000;
          setTimeout(animate, delay);
        }
      };
      animate();
    }
  };

  return (
    <div className="mt-8">
      {!showAnimatedResults ? (
        <Button onClick={handleShowAnimatedResults}>Show Animated Results</Button>
      ) : (
        <ol className="mt-4 space-y-2 text-lg">
          {animatedPlayers.length > 0 ? (
            animatedPlayers.map((player, index) => (
              <li
                key={index}
                className="transition duration-500 ease-in-out transform hover:scale-105"
              >
                {player.name}: {player.score}
              </li>
            ))
          ) : (
            <p className="text-gray-600">Loading results...</p>
          )}
        </ol>
      )}
    </div>
  );
}
