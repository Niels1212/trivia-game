import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { database } from "../../firebaseConfig";
import { ref, onValue, set, update, onDisconnect } from "firebase/database";
import Container from "../../components/Container"; // ✅ Import the Container component

export default function WaitingRoom() {
  const router = useRouter();
  const { player } = router.query; // 🔥 Get player name from URL
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!player) return;
  
    const playerRef = ref(database, `waitingRoom/${player}`);
    set(playerRef, { name: player, ready: false });
    onDisconnect(playerRef).remove();
  
    const waitingRoomRef = ref(database, "waitingRoom");
    const unsubscribe = onValue(waitingRoomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(Object.values(data));
      }
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
      <Container> {/* ✅ Wrap content inside the styled box */}
        <h1 className="text-3xl font-bold text-indigo-700">Waiting Room</h1>
        <p className="text-lg mt-2 text-gray-700">
          Welcome, {player}! Waiting for the host to start the game&hellip;
        </p>

        <h2 className="text-xl font-semibold mt-4">Players Joined:</h2>
        <ul className="mt-2 text-lg">
          {players.map((p, index) => (
            <li key={index} className="text-gray-800">
              {p.name} {p.ready ? "✅ Ready" : "⏳ Waiting"}
            </li>
          ))}
        </ul>

        {!isReady && (
          <button
            onClick={markReady}
            className="mt-6 px-6 py-3 text-lg font-semibold bg-green-600 hover:bg-green-800 text-white rounded-lg shadow-md transition duration-300 w-full"
          >
            I&apos;m Ready! ✅
          </button>
        )}
      </Container>
    </div>
  );
}
