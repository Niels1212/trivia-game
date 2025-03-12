import { useState, useEffect } from "react";
import { database } from "../firebaseConfig";
import { ref, onValue, remove, update, get } from "firebase/database";
import Container from "../components/Container"; // ✅ Import the box component

export default function MasterControl() {
  const [players, setPlayers] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [playersFinished, setPlayersFinished] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const waitingRoomRef = ref(database, "waitingRoom");
    onValue(waitingRoomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playerList = Object.entries(data).map(([name, info]) => ({
          name,
          ready: info.ready || false,
        }));
        setPlayers(playerList);
      } else {
        setPlayers([]);
      }
    });

    const finishedRef = ref(database, "finishedCount");
    onValue(finishedRef, (snapshot) => {
      setPlayersFinished(snapshot.val()?.count || 0);
    });
  }, []);

  const startGame = () => {
    if (players.length === 0 || !players.every((p) => p.ready)) return;
    remove(ref(database, "waitingRoom"));
    update(ref(database, "gameState"), { started: true });
    setTotalPlayers(players.length);
    setGameStarted(true);
  };

  const resetGame = () => {
    remove(ref(database, "scores"));
    remove(ref(database, "waitingRoom"));
    remove(ref(database, "finishedCount"));
    update(ref(database, "gameState"), { started: false, showResults: false });
    setGameStarted(false);
    setTotalPlayers(0);
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
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container> {/* ✅ Wrap everything inside the box */}
        <h1 className="text-3xl font-bold text-indigo-700">🎮 Master Control Panel</h1>

        <h2 className="text-xl font-semibold mt-4">Players in Waiting Room: {players.length}</h2>
        <ul className="mt-2 text-lg">
          {players.map((player, index) => (
            <li key={index} className="text-gray-800">
              {player.name} {player.ready ? "✅ Ready" : "⏳ Waiting"}
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mt-4">Players Finished: {playersFinished}</h2>

        <div className="mt-6 space-y-3">
          <button
            onClick={resetGame}
            className="px-6 py-3 text-lg font-semibold bg-red-600 hover:bg-red-800 text-white rounded-lg shadow-md transition duration-300 w-full"
          >
            Reset Game 🔄
          </button>

          <button
            onClick={startGame}
            className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-300 w-full ${
              players.length > 0 && players.every((p) => p.ready)
                ? "bg-green-600 hover:bg-green-800 text-white"
                : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
            disabled={players.length === 0 || !players.every((p) => p.ready)}
          >
            Start Game 🚀
          </button>

          <button
            onClick={showResults}
            className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-300 w-full ${
              playersFinished === totalPlayers && totalPlayers > 0
                ? "bg-blue-600 hover:bg-blue-800 text-white"
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
