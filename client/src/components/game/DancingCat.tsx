import { motion } from "framer-motion";

export function DancingCat() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="fixed bottom-4 right-4 z-50 flex flex-col items-center"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg px-4 py-2 mb-2 shadow-lg"
      >
        <span className="text-xl font-bold text-primary">Great job! 🎉</span>
      </motion.div>
      <motion.img
        src="https://images.pexels.com/photos/45170/kittens-cat-cat-puppy-rush-45170.jpeg"
        alt="Celebrating Kitten"
        className="w-48 h-48 object-cover rounded-full shadow-lg"
        style={{ 
          filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))"
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [-2, 2, -2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}