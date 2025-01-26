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
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            <radialGradient id="fur" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0%" stopColor="#F4F4F4"/>
              <stop offset="70%" stopColor="#E0E0E0"/>
              <stop offset="100%" stopColor="#D0D0D0"/>
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

          {/* Body */}
          <motion.g
            animate={{
              rotate: [-5, 5, -5],
              y: [-5, 5, -5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "mirror"
            }}
          >
            {/* Main body */}
            <ellipse cx="100" cy="110" rx="45" ry="40" fill="url(#fur)" filter="url(#shadow)"/>

            {/* Head */}
            <circle cx="100" cy="75" r="35" fill="url(#fur)"/>

            {/* Ears */}
            <path d="M75 45L85 65L95 45" fill="#E0E0E0" stroke="#D0D0D0"/>
            <path d="M125 45L115 65L105 45" fill="#E0E0E0" stroke="#D0D0D0"/>
            <path d="M78 47L85 62L92 47" fill="#FFE5E5"/>
            <path d="M122 47L115 62L108 47" fill="#FFE5E5"/>

            {/* Face features */}
            <ellipse cx="90" cy="75" rx="5" ry="6" fill="#000000"/>
            <ellipse cx="110" cy="75" rx="5" ry="6" fill="#000000"/>
            <circle cx="88" cy="73" r="2" fill="#FFFFFF"/>
            <circle cx="108" cy="73" r="2" fill="#FFFFFF"/>
            <path d="M97 82L100 85L103 82" fill="#FFB6C1"/>

            {/* Whiskers */}
            <g stroke="#888888" strokeWidth="1.5">
              <line x1="75" y1="85" x2="60" y2="80"/>
              <line x1="75" y1="88" x2="60" y2="88"/>
              <line x1="75" y1="91" x2="60" y2="96"/>
              <line x1="125" y1="85" x2="140" y2="80"/>
              <line x1="125" y1="88" x2="140" y2="88"/>
              <line x1="125" y1="91" x2="140" y2="96"/>
            </g>
          </motion.g>

          {/* Arms doing floss movement */}
          <motion.g
            animate={{
              x: [-30, 30, -30],
              rotate: [-20, 20, -20]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
          >
            {/* Left arm */}
            <path
              d="M70 110 Q65 120 60 130"
              stroke="#D0D0D0"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right arm */}
            <path
              d="M130 110 Q135 120 140 130"
              stroke="#D0D0D0"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Tail */}
          <motion.path
            d="M100 140 Q120 160 110 180"
            stroke="#D0D0D0"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: [
                "M100 140 Q120 160 110 180",
                "M100 140 Q80 160 90 180",
                "M100 140 Q120 160 110 180"
              ]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}