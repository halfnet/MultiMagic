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
          <circle cx="50" cy="50" r="40" fill="#B0B0B0" />

          {/* Cat ears - moved higher up */}
          <path 
            d="M35 15L45 35L55 15" 
            fill="#B0B0B0" 
            stroke="#B0B0B0" 
            strokeWidth="2"
          />
          <path 
            d="M65 15L55 35L45 15" 
            fill="#B0B0B0" 
            stroke="#B0B0B0" 
            strokeWidth="2"
          />

          {/* Inner ears - adjusted to match new ear positions */}
          <path 
            d="M38 17L45 32L52 17" 
            fill="#FFE5E5"
          />
          <path 
            d="M62 17L55 32L48 17" 
            fill="#FFE5E5"
          />

          {/* Eyes */}
          <circle cx="35" cy="45" r="5" fill="#000" />
          <circle cx="65" cy="45" r="5" fill="#000" />

          {/* White eye highlights */}
          <circle cx="33" cy="43" r="2" fill="#FFF" />
          <circle cx="63" cy="43" r="2" fill="#FFF" />

          {/* Smile */}
          <path
            d="M40 60Q50 70 60 60"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />

          {/* Whiskers */}
          <line x1="25" y1="55" x2="35" y2="55" stroke="#666" strokeWidth="1.5" />
          <line x1="25" y1="60" x2="35" y2="60" stroke="#666" strokeWidth="1.5" />
          <line x1="65" y1="55" x2="75" y2="55" stroke="#666" strokeWidth="1.5" />
          <line x1="65" y1="60" x2="75" y2="60" stroke="#666" strokeWidth="1.5" />

          {/* Nose */}
          <path
            d="M47 55L50 58L53 55Z"
            fill="#FFB6C1"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}