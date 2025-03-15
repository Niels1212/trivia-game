import { useState } from "react";
import Container from "../Container";
import { database } from "../../firebaseConfig";
import { ref, get, update } from "firebase/database";

export default function PlayersList({ players }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [points, setPoints] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const openModal = (player) => {
    setSelectedPlayer(player);
    setPoints(1);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setShowModal(false);
  };

  const sendPoints = async () => {
    if (!selectedPlayer) return;
    const pointsToAdd = parseInt(points, 10);
    if (isNaN(pointsToAdd) || pointsToAdd <= 0) return;

    // Reference the player's score path in the database.
    const scoreRef = ref(database, `scores/${selectedPlayer.name}`);
    const snapshot = await get(scoreRef);
    let currentScore = 0;
    if (snapshot.exists() && snapshot.val().score !== undefined) {
      currentScore = snapshot.val().score;
    }
    const newScore = currentScore + pointsToAdd;
    await update(scoreRef, { score: newScore });
    closeModal();
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold text-indigo-700">🤝 Players Joined</h1>
      <div className="mt-4 space-y-3">
        {players.map((player, index) => (
          <div
            key={index}
            onClick={() => openModal(player)}
            className="cursor-pointer flex items-center justify-between p-4 bg-indigo-100 rounded-lg shadow hover:shadow-lg transition duration-200"
          >
            <span className="text-lg font-medium text-gray-800">
              {player.name}
            </span>
            {player.ready ? (
              <span className="text-green-600 text-xl" title="Ready">
                💚
              </span>
            ) : (
              <span className="text-yellow-500 text-xl" title="Not ready">
                🟡
              </span>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">
              Award Points to {selectedPlayer?.name}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Points:</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                min="1"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={sendPoints}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-800 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
