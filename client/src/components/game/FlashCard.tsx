import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface FlashCardProps {
  num1: number;
  num2: number;
  show: boolean;
  themeColor: string; // Added themeColor prop
}

export function FlashCard({ num1, num2, show, themeColor = 'primary' }: FlashCardProps) {
  // Added default themeColor
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="perspective-1000"
        >
          <Card className="w-full max-w-md p-8 shadow-lg bg-white border-2">
            {' '}
            {/* Added border-2 */}
            <div className="flex items-center justify-center text-6xl font-bold space-x-4">
              <span className={`text-${themeColor}`}>{num1}</span> {/* Apply themeColor */}
              <span className="text-2xl text-gray-400">×</span>
              <span className={`text-${themeColor}`}>{num2}</span> {/* Apply themeColor */}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
