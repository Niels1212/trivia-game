import { useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedAnswerButton({ text, onClick }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    onClick(); 

    setTimeout(() => {
      setClicked(false);
    }, 500);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={clicked} // Prevent multiple clicks
      className="w-full py-3 px-6 font-bold text-white rounded-lg bg-blue-500 hover:bg-blue-700 
                 transition-all active:scale-95 shadow-md"
      whileTap={{ scale: 0.9 }} // Tap effect (slight shrink)
      animate={clicked ? { scale: [1.2, 1], opacity: [0.5, 1] } : {}} // Bounce effect when clicked
    >
      {text}
    </motion.button>
  );
}
