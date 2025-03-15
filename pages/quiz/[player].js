import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { database } from "../../firebaseConfig";
import { ref, get, update, onValue } from "firebase/database";
import questions from "../../data/questions.json";
import Container from "../../components/Container";
import ImageQuestion from "../../components/ImageQuestion";
import Button from "../../components/Button";
import SubmitButton from "../../components/SubmitButton";
import { motion } from "framer-motion";

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
    if (!selectedAnswer) return;
    setIsSubmitted(true);
  
    const isCorrect =
      questions[currentQuestion] &&
      selectedAnswer === questions[currentQuestion].answer;
  
    if (player) {
      const playerScoreRef = ref(database, `scores/${player}`);
      const snapshot = await get(playerScoreRef);
      let currentFirebaseScore = snapshot.val()?.score || 0; // Get score from Firebase
  
      if (isCorrect) {
        currentFirebaseScore += 1;
      }
  
      update(playerScoreRef, { score: currentFirebaseScore }); // Update Firebase
  
      const submittedRef = ref(database, `submissions/${player}`);
      update(submittedRef, { submitted: true });
    }
  
    if (currentQuestion >= questions.length - 1) {
      setShowThankYou(true);
      const finishedCountRef = ref(database, "finishedCount");
      const snapshot = await get(finishedCountRef);
      const currentCount = snapshot.val()?.count || 0;
      update(finishedCountRef, { count: currentCount + 1 });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl font-bold mb-4"
          >
            Player: {player}
          </motion.h2>
        </motion.div>

        {showThankYou ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
          >
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
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {questions[currentQuestion] && questions[currentQuestion].image && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <ImageQuestion
                  imageSrc={questions[currentQuestion].image}
                  altText={questions[currentQuestion].question}
                />
              </motion.div>
            )}

            {questions[currentQuestion] && (
              <>
                <motion.h2 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-2xl font-semibold mt-4"
                >
                  {questions[currentQuestion].question}
                </motion.h2>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="mt-4 space-y-3"
                >
                  {questions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isSubmitted}
                      variant={selectedAnswer === option ? "success" : "primary"}
                    >
                      {selectedAnswer === option && (
                        <span role="img" aria-label="selected" className="mr-2">
                          ✅
                        </span>
                      )}
                      {option}
                    </Button>
                  ))}
                </motion.div>
              </>
            )}

            {/* Submit Button - Only show if an answer is selected and not submitted */}
            {!isSubmitted && selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-6"
              >
                <SubmitButton onClick={handleSubmit} />
              </motion.div>
            )}
          </motion.div>
        )}
      </Container>
    </div>
  );
}
