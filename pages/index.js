// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import Container from "../components/Container";
import Button from "../components/Button";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState(""); // State for error messages

  const startQuiz = () => {
    if (name.trim() === "") {
      setError("Please enter your name to start!");
      return;
    }
    setError(""); // Clear previous errors

    // Redirect to the waiting room with the player's name in the URL.
    router.push(`/waiting-room/${encodeURIComponent(name)}`);
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

        {/* Display error if present */}
        {error && <p className="text-red-500 mt-2">{error}</p>}

        <Button onClick={startQuiz} variant="primary">
          Join Alex&apos;s Trivia
        </Button>
      </Container>
    </div>
  );
}
