// pages/quiz/[Player].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { database } from "../../firebaseConfig";
import { ref, get, update, onValue } from "firebase/database";
import questions from "../../data/questions.json";
import Container from "../../components/Container";
import ImageQuestion from "../../components/ImageQuestion";
import AnimatedAnswerButton from "../../components/AnimatedAnswerButton";
import SubmitButton from "../../components/SubmitButton"; // ✅ New Component

export default function Quiz() {
  const router = useRouter();
  const { player } = router.query;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!player) return;

    const questionRef = ref(database, "currentQuestion");
    onValue(questionRef, (snapshot) => {
      const newQuestion = snapshot.val()?.value;
      
      if (newQuestion !== null && typeof newQuestion !== "undefined") {
        setCurrentQuestion(newQuestion);
        setSelectedAnswer(null); // Reset selection
        setIsSubmitted(false);   // Allow new answer selection
      }
    });
  }, [player]);

  const handleSelectAnswer = (option) => {
    if (!isSubmitted) {
      setSelectedAnswer(option);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return; // Ensure answer is selected
    setIsSubmitted(true); // Lock in answer

    const isCorrect =
      questions[currentQuestion] && selectedAnswer === questions[currentQuestion].answer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    // Update Firebase with submission status
    if (player) {
      const playerScoreRef = ref(database, `scores/${player}`);
      update(playerScoreRef, { score: isCorrect ? score + 1 : score });

      const submittedRef = ref(database, `submissions/${player}`);
      update(submittedRef, { submitted: true });
    }

    // Check if this is the last question
    if (currentQuestion >= questions.length - 1) {
      setShowThankYou(true);
      // Update finishedCount in Firebase
      const finishedCountRef = ref(database, "finishedCount");
      const snapshot = await get(finishedCountRef);
      const currentCount = snapshot.val()?.count || 0;
      update(finishedCountRef, { count: currentCount + 1 });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        <h2 className="text-2xl font-bold">Player: {player}</h2>

        {showThankYou ? (
          <div>
            <h1 className="text-3xl font-extrabold text-purple-600">
              Thank You for Playing! 🎉
            </h1>
            <p className="text-lg mt-2">Your answers have been submitted.</p>
            <p>Please wait for the results!</p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 px-6 py-3 text-lg font-semibold bg-indigo-600 text-white rounded-lg shadow-md transition duration-300"
            >
              🏠 Go Home
            </button>
          </div>
        ) : (
          <div>
            {questions[currentQuestion] &&
              questions[currentQuestion].image && (
                <ImageQuestion
                  imageSrc={questions[currentQuestion].image}
                  altText={questions[currentQuestion].question}
                />
              )}

            {questions[currentQuestion] && (
              <>
                <h2 className="text-2xl font-semibold mt-4">
                  {questions[currentQuestion].question}
                </h2>

                <div className="mt-4 space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <AnimatedAnswerButton
                      key={index}
                      text={option}
                      onClick={() => handleSelectAnswer(option)}
                      isSelected={selectedAnswer === option}
                      disabled={isSubmitted}
                      className={
                        selectedAnswer === option
                          ? "bg-green-500 text-white border-2 border-green-700"
                          : "bg-gray-200"
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {/* Submit Button - Only show if an answer is selected and not submitted */}
            {!isSubmitted && selectedAnswer && (
              <SubmitButton onClick={handleSubmit} />
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
