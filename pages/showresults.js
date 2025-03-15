// pages/showresults.js
import { useEffect, useState } from "react";
import { database } from "../firebaseConfig";
import { ref, onValue, get } from "firebase/database";
import Container from "../components/Container";

export default function ShowResults() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      const scoresRef = ref(database, "scores");
      const snapshot = await get(scoresRef);
      const data = snapshot.val();

      if (data) {
        const sortedScores = Object.entries(data)
          .map(([name, info]) => ({ name, score: info.score }))
          .sort((a, b) => b.score - a.score);
        setLeaderboard(sortedScores);
      }
    };

    const gameStateRef = ref(database, "gameState/showResults");
    onValue(gameStateRef, (snapshot) => {
      if (snapshot.val() === true) {
        setShowResults(true);
        fetchScores(); // Fetch scores when showResults is triggered
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        {!showResults ? (
          <h1 className="text-3xl font-semibold">⌛ Waiting for results...</h1>
        ) : (
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-600">🏆 Final Leaderboard 🏆</h1>
            <ol className="mt-4 space-y-2 text-lg">
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <li key={index} className="text-gray-800">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎖"}{" "}
                    {player.name}: {player.score}
                  </li>
                ))
              ) : (
                <p className="text-gray-600">No scores available yet.</p>
              )}
            </ol>
          </div>
        )}
      </Container>
    </div>
  );
}
