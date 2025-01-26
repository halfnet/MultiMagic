import { motion } from "framer-motion";

export function DancingCat() {
  return (
    <motion.div
      initial={{ scale: 0, x: "100%" }}
      animate={{ scale: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="fixed bottom-4 right-4 z-50"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, -5, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Cat body */}
          <circle cx="50" cy="50" r="40" fill="#FFA07A" />
          {/* Ears */}
          <path d="M25 25L35 35L45 25Z" fill="#FFA07A" />
          <path d="M75 25L65 35L55 25Z" fill="#FFA07A" />
          {/* Eyes */}
          <circle cx="35" cy="45" r="5" fill="#000" />
          <circle cx="65" cy="45" r="5" fill="#000" />
          {/* Smile */}
          <path
            d="M40 60Q50 70 60 60"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />
          {/* Whiskers */}
          <line x1="25" y1="55" x2="35" y2="55" stroke="#000" />
          <line x1="25" y1="60" x2="35" y2="60" stroke="#000" />
          <line x1="65" y1="55" x2="75" y2="55" stroke="#000" />
          <line x1="65" y1="60" x2="75" y2="60" stroke="#000" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
