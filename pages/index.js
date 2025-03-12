import { useState } from "react";
import { useRouter } from "next/router";
import Container from "../components/Container";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");

  const startQuiz = () => {
    if (name.trim() === "") {
      alert("Please enter your name to start!");
      return;
    }
    localStorage.setItem("playerName", name);
    router.push(`/waiting-room/${name}`); // 🔥 Redirect to player-specific waiting room
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        <h1 className="text-4xl font-bold text-indigo-700">🎉 Welcome to Alex Trivia! 🎉</h1>
        <p className="text-lg mt-2 text-gray-700">Enter your name to begin</p>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-4 p-3 w-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={startQuiz}
          className="mt-6 px-6 py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-800 text-white rounded-lg shadow-md transition duration-300 w-full"
        >
          Join Alex's Trivia
        </button>
      </Container>
    </div>
  );
}
