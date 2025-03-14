// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import Container from "../components/Container";
import Button from "../components/Button";
import { motion } from "framer-motion";
import Image from "next/image";

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
        {/* Animated Image: Removed extra square container so that the image
            now sits directly on the Container's background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 flex justify-center items-center" // Centers the image
        >
          <Image
            src="/images/index.png"
            alt="Trivia Logo"
            width={300}
            height={300}
            className="mx-auto" // Centers the image within its container
          />
        </motion.div>

        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl font-bold text-indigo-700"
        >
          🎉 Welcome to Alex Trivia! 🎉
        </motion.h1>

        {/* Enhanced Subheading */}
        <motion.p
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg mt-2 text-purple-700 font-bold drop-shadow"
        >
          Enter your name to begin
        </motion.p>

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
