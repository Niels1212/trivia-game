// components/master/GameControls.js
import Container from "../Container";
import Button from "../Button";
import questions from "../../data/questions.json";

export default function GameControls({
  resetGame,
  startGame,
  nextQuestion,
  showResults,
  players,
  allSubmitted,
  currentQuestion,
  playersFinished,
  totalPlayers,
}) {
  return (
    <Container>
      <h1 className="text-3xl font-bold text-indigo-700">🎮 Master Control Panel</h1>
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
          disabled={!allSubmitted || currentQuestion >= questions.length - 1}
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
  );
}
