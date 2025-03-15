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
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!player) return;
  
    const playerRef = ref(database, `waitingRoom/${player}`);
  
    // ✅ Check if player exists in waitingRoom before adding them
    get(playerRef).then((snapshot) => {
      if (!snapshot.exists()) {
        update(playerRef, { name: player, ready: false });
      }
    });
  
    // ✅ Listen for current question updates
    const questionRef = ref(database, "currentQuestion");
    onValue(questionRef, (snapshot) => {
      const newQuestion = snapshot.val()?.value;
      if (newQuestion !== null && typeof newQuestion !== "undefined") {
        setCurrentQuestion(newQuestion);
        setIsSubmitted(false); // Allow resubmission on refresh
      }
    });
  
    // ✅ Restore selected answer on refresh
    const playerDataRef = ref(database, `players/${player}`);
    get(playerDataRef).then((snapshot) => {
      const data = snapshot.val();
      if (data?.selectedAnswer) {
        setSelectedAnswer(data.selectedAnswer);
      }
    });
  
  }, [player]);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
  
    if (player) {
      const playerScoreRef = ref(database, `scores/${player}`);
      const snapshot = await get(playerScoreRef);
      let currentFirebaseScore = snapshot.val()?.score || 0;
  
      if (selectedAnswer === questions[currentQuestion].answer) {
        currentFirebaseScore += 1;
      }
  
      update(playerScoreRef, { score: currentFirebaseScore });

          // ✅ Mark player as submitted in Firebase
    update(ref(database, `submissions/${player}`), { submitted: true });

    // ❌ Remove selected answer so it doesn’t persist across questions
    update(ref(database, `players/${player}`), { selectedAnswer: null });
    }
  
    // Remove the local question increment here!
    if (currentQuestion >= questions.length - 1) {
      setShowSummary(true);
      const finishedRef = ref(database, "finishedCount");
      get(finishedRef).then((snapshot) => {
      const finishedCount = snapshot.val()?.count || 0;
      update(finishedRef, { count: finishedCount + 1 });
});
    }
  };

  const handleSelectAnswer = (option) => {
    if (!isSubmitted) {
      setSelectedAnswer(option);
  
      // ✅ Save selected answer in Firebase to restore after refresh
      if (player) {
        update(ref(database, `players/${player}`), { selectedAnswer: option });
      }
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

        {showSummary ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-3xl font-extrabold text-purple-600 mb-6">
              Quiz Summary 📖
            </h1>
            <div className="space-y-6 text-left">
              {questions.map((q, index) => (
                <div key={index} className="p-4 border rounded-lg shadow-md bg-white">
                  <h2 className="text-xl font-semibold">{index + 1}. {q.question}</h2>
                  {q.image && (
                    <ImageQuestion imageSrc={q.image} altText={q.question} />
                  )}
                  <ul className="mt-2 space-y-1">
                    {q.options.map((option, idx) => (
                      <li key={idx} className="text-gray-700">
                        <span className="mr-2">🔹</span>{option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
