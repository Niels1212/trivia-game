import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { database } from "../../firebaseConfig";
import { ref, get, update } from "firebase/database";
import questions from "../../data/questions.json";
import Container from "../../components/Container";
import ImageQuestion from "../../components/ImageQuestion"; 
import AnimatedAnswerButton from "../../components/AnimatedAnswerButton"; 

export default function Quiz() {
  const router = useRouter();
  const { player } = router.query;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!player) return;
  }, [player]);

  const handleAnswer = (selectedOption) => {
    setIsAnswered(true);

    // Check if the selected answer is correct
    const isCorrect = selectedOption === questions[currentQuestion].answer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setTimeout(() => {
      setIsAnswered(false);

      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Game finished - Save final score to Firebase
        if (player) {
          const finalScore = isCorrect ? score + 1 : score; // Capture correct score before updating
          const playerScoreRef = ref(database, `scores/${player}`);

          update(playerScoreRef, { score: finalScore }) 
            .then(() => {
              const finishedRef = ref(database, "finishedCount");
              get(finishedRef).then((snapshot) => {
                let finishedCount = snapshot.val()?.count || 0;
                update(finishedRef, { count: finishedCount + 1 }).then(() => {
                  setShowThankYou(true);
                });
              });
            });
        }
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        <h2 className="text-2xl font-bold">Player: {player}</h2>

        {showThankYou ? (
          <div>
            <h1 className="text-3xl font-extrabold text-purple-600">Thank You for Playing! 🎉</h1>
            <p className="text-lg mt-2">Your answers have been submitted.</p>
            <p>Please wait for the results!</p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 px-6 py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-800 text-white rounded-lg shadow-md transition duration-300"
            >
              🏠 Go Home
            </button>
          </div>
        ) : (
          <div>
            {/* ✅ Display Image for the Question */}
            {questions[currentQuestion].image && (
              <ImageQuestion
                imageSrc={questions[currentQuestion].image}
                altText={questions[currentQuestion].question}
              />
            )}

            {/* ✅ Display Question Text */}
            <h2 className="text-2xl font-semibold mt-4">{questions[currentQuestion].question}</h2>

            {/* ✅ Display Answer Options with Animated Buttons */}
            <div className="mt-4 space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <AnimatedAnswerButton
                  key={index}
                  text={option}
                  onClick={() => handleAnswer(option)} // ✅ Pass selected answer
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
