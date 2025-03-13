import { useState, useEffect } from "react";
import { database } from "../firebaseConfig";
import { ref, onValue, remove, update, get } from "firebase/database";
import Container from "../components/Container";

export default function MasterControl() {
  const [players, setPlayers] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [playersFinished, setPlayersFinished] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [allSubmitted, setAllSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    // Track players in the game
    const waitingRoomRef = ref(database, "waitingRoom");
    onValue(waitingRoomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playerList = Object.keys(data);
        setPlayers(playerList);
        setTotalPlayers(playerList.length);
      } else {
        setPlayers([]);
        setTotalPlayers(0);
      }
    });

    // Track finished players
    const finishedRef = ref(database, "finishedCount");
    onValue(finishedRef, (snapshot) => {
      setPlayersFinished(snapshot.val()?.count || 0);
    });

    // Track submissions
    const submissionsRef = ref(database, "submissions");
    onValue(submissionsRef, (snapshot) => {
      const submissions = snapshot.val();
      if (submissions) {
        const submittedPlayers = Object.keys(submissions).length;
        setAllSubmitted(submittedPlayers === totalPlayers && totalPlayers > 0);
      } else {
        setAllSubmitted(false);
      }
    });

    // Track current question
    const questionRef = ref(database, "currentQuestion");
    onValue(questionRef, (snapshot) => {
      setCurrentQuestion(snapshot.val()?.value || 0);
    });
  }, [totalPlayers]);

  const nextQuestion = () => {
    update(ref(database, "currentQuestion"), { value: currentQuestion + 1 });
    remove(ref(database, "submissions")); // Reset submissions for the next question
    setAllSubmitted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        <h1 className="text-3xl font-bold text-indigo-700">🎮 Master Control Panel</h1>

        <h2 className="text-xl font-semibold mt-4">Players in Game: {totalPlayers}</h2>
        <ul className="mt-2 text-lg">
          {players.map((player, index) => (
            <li key={index} className="text-gray-800">
              {player} ✅
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mt-4">Players Finished: {playersFinished}</h2>

        <div className="mt-6 space-y-3">
          {/* Reset Game Button */}
          <button
            onClick={() => {
              remove(ref(database, "scores"));
              remove(ref(database, "waitingRoom"));
              remove(ref(database, "finishedCount"));
              remove(ref(database, "submissions"));
              update(ref(database, "gameState"), { started: false, showResults: false });
              update(ref(database, "currentQuestion"), { value: 0 });
              setGameStarted(false);
              setTotalPlayers(0);
            }}
            className="px-6 py-3 text-lg font-semibold bg-red-600 text-white rounded-lg shadow-md transition duration-300 w-full"
          >
            Reset Game 🔄
          </button>

          {/* Start Game Button */}
          <button
            onClick={() => {
              if (players.length === 0 || !players.every((p) => p.ready)) return;
              remove(ref(database, "waitingRoom"));
              update(ref(database, "gameState"), { started: true });
              update(ref(database, "currentQuestion"), { value: 0 });
              setTotalPlayers(players.length);
              setGameStarted(true);
            }}
            className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-300 w-full ${
              players.length > 0 && players.every((p) => p.ready)
                ? "bg-green-600 text-white"
                : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
            disabled={players.length === 0 || !players.every((p) => p.ready)}
          >
            Start Game 🚀
          </button>

          {/* Next Question Button */}
          <button
            onClick={nextQuestion}
            className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-300 w-full ${
              allSubmitted ? "bg-orange-600 text-white" : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
            disabled={!allSubmitted}
          >
            Next Question ➡️
          </button>

          {/* Show Results Button */}
          <button
            onClick={() => {
              update(ref(database, "gameState"), { showResults: true });
              get(ref(database, "scores")).then((snapshot) => {
                if (!snapshot.exists()) {
                  alert("No scores found! Make sure all players finish before showing results.");
                }
              });
            }}
            className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-300 w-full ${
              playersFinished === totalPlayers && totalPlayers > 0
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
            disabled={playersFinished !== totalPlayers || totalPlayers === 0}
          >
            Show Results 🏆
          </button>
        </div>
      </Container>
    </div>
  );
}
