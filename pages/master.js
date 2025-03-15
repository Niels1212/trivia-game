import { useState, useEffect } from "react";
import { database } from "../firebaseConfig";
import { ref, onValue, remove, update, get } from "firebase/database";
import Container from "../components/Container";
import questions from "../data/questions.json";
import GameControls from "../components/master/GameControls";
import PlayersList from "../components/master/PlayersList";

export default function MasterControl() {
  const [players, setPlayers] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [playersFinished, setPlayersFinished] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [allSubmitted, setAllSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Listen for players in waiting room
  useEffect(() => {
    const waitingRoomRef = ref(database, "waitingRoom");
    const unsubscribeWaitingRoom = onValue(waitingRoomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playerList = Object.values(data);
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
    // Do not remove waitingRoom here so players remain visible.
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
    update(ref(database, "gameState"), { showResults: true });
    get(ref(database, "scores")).then((snapshot) => {
      if (!snapshot.exists()) {
        alert("No scores found! Make sure all players finish before showing results.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-8">
      <GameControls
        resetGame={resetGame}
        startGame={startGame}
        nextQuestion={nextQuestion}
        showResults={showResults}
        players={players}
        allSubmitted={allSubmitted}
        currentQuestion={currentQuestion}
        playersFinished={playersFinished}
        totalPlayers={totalPlayers}
      />

      <PlayersList players={players} />
    </div>
  );
}
