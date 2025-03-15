// pages/master.js
import { useState, useEffect } from "react";
import { database } from "../firebaseConfig";
import { ref, onValue, remove, update, get } from "firebase/database";
import Container from "../components/Container";
import Button from "../components/Button"; // Reusable button component
import questions from "../data/questions.json"; // Import questions to know total count

export default function MasterControl() {
  const [players, setPlayers] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [playersFinished, setPlayersFinished] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [allSubmitted, setAllSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Removed auto update effect that set gameState/showResults to true

  // Listen for players in waiting room
  useEffect(() => {
    const waitingRoomRef = ref(database, "waitingRoom");
    const unsubscribeWaitingRoom = onValue(waitingRoomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playerList = Object.values(data); // Getting player objects
        setPlayers(playerList);
        setTotalPlayers(playerList.length);
      } else {
        setPlayers([]);
        setTotalPlayers(0);
      }
    });
    return () => {
      unsubscribeWaitingRoom();
    };
  }, []);

  // Listen for finished players count
  useEffect(() => {
    const finishedRef = ref(database, "finishedCount");
    const unsubscribeFinished = onValue(finishedRef, (snapshot) => {
      setPlayersFinished(snapshot.val()?.count || 0);
    });
    return () => {
      unsubscribeFinished();
    };
  }, []);

  // Listen for submissions count
  useEffect(() => {
    const submissionsRef = ref(database, "submissions");
    const unsubscribeSubmissions = onValue(submissionsRef, (snapshot) => {
      const submissions = snapshot.val();
      if (submissions) {
        const submittedPlayers = Object.keys(submissions).length;
        setAllSubmitted(submittedPlayers === totalPlayers && totalPlayers > 0);
      } else {
        setAllSubmitted(false);
      }
    });
    return () => {
      unsubscribeSubmissions();
    };
  }, [totalPlayers]);

  // Listen for current question updates
  useEffect(() => {
    const questionRef = ref(database, "currentQuestion");
    const unsubscribeQuestion = onValue(questionRef, (snapshot) => {
      setCurrentQuestion(snapshot.val()?.value || 0);
    });
    return () => {
      unsubscribeQuestion();
    };
  }, []);

  // Button actions
  const resetGame = () => {
    remove(ref(database, "scores"));
    remove(ref(database, "waitingRoom"));
    remove(ref(database, "finishedCount"));
    remove(ref(database, "submissions"));
    update(ref(database, "gameState"), { started: false, showResults: false });
    update(ref(database, "currentQuestion"), { value: 0 });
    setGameStarted(false);
    setTotalPlayers(0);
  };

  const startGame = () => {
    if (players.length === 0 || !players.every((p) => p.ready)) return;
    remove(ref(database, "waitingRoom"));
    update(ref(database, "gameState"), { started: true });
    update(ref(database, "currentQuestion"), { value: 0 });
    setTotalPlayers(players.length);
    setGameStarted(true);
  };

  const nextQuestion = () => {
    update(ref(database, "currentQuestion"), { value: currentQuestion + 1 });
    remove(ref(database, "submissions")); // Reset submissions for the next question
    setAllSubmitted(false);
  };

  const showResults = () => {
    // Update gameState/showResults only when button is pressed
    update(ref(database, "gameState"), { showResults: true });
    get(ref(database, "scores")).then((snapshot) => {
      if (!snapshot.exists()) {
        alert("No scores found! Make sure all players finish before showing results.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        <h1 className="text-3xl font-bold text-indigo-700">🎮 Master Control Panel</h1>

        <h2 className="text-xl font-semibold mt-4">Players in Game: {totalPlayers}</h2>
        <ul className="mt-2 text-lg">
          {players.map((player, index) => (
            <li key={index} className="text-gray-800">
              {player.name} {player.ready ? "✅" : ""}
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mt-4">Players Finished: {playersFinished}</h2>

        <div className="mt-6 space-y-3">
          <Button onClick={resetGame} variant="danger">
            Reset Game 🔄
          </Button>

          <Button
            onClick={startGame}
            variant="success"
            disabled={players.length === 0 || !players.every((p) => p.ready)}
          >
            Start Game 🚀
          </Button>

          <Button
            onClick={nextQuestion}
            variant="warning"
            disabled={!allSubmitted || currentQuestion >= questions.length - 1} // Disabled on last question
          >
            Next Question ➡️
          </Button>

          <Button
            onClick={showResults}
            variant="primary"
            disabled={playersFinished !== totalPlayers || totalPlayers === 0}
          >
            Show Results 🏆
          </Button>
        </div>
      </Container>
    </div>
  );
}
