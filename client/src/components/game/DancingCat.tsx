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

          {/* Cat ears - made more prominent and triangular */}
          <path 
            d="M30 25L40 40L50 25" 
            fill="#B0B0B0" 
            stroke="#B0B0B0" 
            strokeWidth="2"
          />
          <path 
            d="M70 25L60 40L50 25" 
            fill="#B0B0B0" 
            stroke="#B0B0B0" 
            strokeWidth="2"
          />

          {/* Inner ears */}
          <path 
            d="M33 27L40 37L47 27" 
            fill="#FFE5E5"
          />
          <path 
            d="M67 27L60 37L53 27" 
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