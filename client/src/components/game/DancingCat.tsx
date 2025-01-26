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
        <motion.img
          src="https://images.pexels.com/photos/45170/kittens-cat-cat-puppy-rush-45170.jpeg"
          alt="Dancing Kitten"
          className="w-48 h-48 object-cover rounded-full shadow-lg"
          style={{ 
            transformOrigin: "center center",
            filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))"
          }}
          animate={{
            rotateY: [-5, 5, -5],
            y: [-10, 0, -10]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
}