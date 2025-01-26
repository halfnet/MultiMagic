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
          x: [-10, 10, -10],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            <radialGradient id="catFur" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#D4D4D4"/>
              <stop offset="100%" stopColor="#A0A0A0"/>
            </radialGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="2"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <motion.g
            animate={{
              x: [-5, 5, -5],
              rotate: [-10, 10, -10]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "mirror"
            }}
          >
            <path
              d="M30 60 Q25 70 20 80"
              stroke="#A0A0A0"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M90 60 Q95 70 100 80"
              stroke="#A0A0A0"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </motion.g>

          <ellipse cx="60" cy="65" rx="35" ry="30" fill="url(#catFur)" filter="url(#shadow)"/>
          <circle cx="60" cy="45" r="25" fill="url(#catFur)"/>
          <path d="M40 25L50 40L60 25" fill="#A0A0A0" stroke="#909090"/>
          <path d="M80 25L70 40L60 25" fill="#A0A0A0" stroke="#909090"/>
          <path d="M43 27L50 38L57 27" fill="#FFE5E5"/>
          <path d="M77 27L70 38L63 27" fill="#FFE5E5"/>
          <ellipse cx="50" cy="45" rx="4" ry="5" fill="#000000"/> 
          <ellipse cx="70" cy="45" rx="4" ry="5" fill="#000000"/> 
          <circle cx="48" cy="43" r="1.5" fill="#FFFFFF"/> 
          <circle cx="68" cy="43" r="1.5" fill="#FFFFFF"/> 
          <path d="M57 50L60 53L63 50Z" fill="#FFB6C1"/>
          <g stroke="#666666" strokeWidth="1.2">
            <line x1="40" y1="52" x2="25" y2="50"/>
            <line x1="40" y1="55" x2="25" y2="55"/>
            <line x1="40" y1="58" x2="25" y2="60"/>
            <line x1="80" y1="52" x2="95" y2="50"/>
            <line x1="80" y1="55" x2="95" y2="55"/>
            <line x1="80" y1="58" x2="95" y2="60"/>
          </g>
          <path
            d="M55 55Q60 58 65 55"
            stroke="#000000"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M45 65Q60 70 75 65"
            stroke="#909090"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}