import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Results() {
  const router = useRouter();
  const { score, total } = router.query;
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const storedLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    storedLeaderboard.sort((a, b) => b.score - a.score);
    setLeaderboard(storedLeaderboard);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Quiz Completed! 🎉</h1>
      <h2>Your Score: {score} / {total}</h2>

      <h2>Leaderboard 🏆</h2>
      <ol>
        {leaderboard.map((player, index) => (
          <li key={index} style={{ fontSize: "20px", margin: "5px 0" }}>
            {index === 0 ? "🥇 " : index === 1 ? "🥈 " : index === 2 ? "🥉 " : ""}
            {player.name}: {player.score}
          </li>
        ))}
      </ol>

      <button
        onClick={() => router.push("/")}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          backgroundColor: "blue",
          color: "white",
          borderRadius: "5px",
          marginTop: "20px",
        }}
      >
        Play Again
      </button>
    </div>
  );
}
