import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface NumberInputProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function NumberInput({ onSubmit, disabled }: NumberInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value) {
      onSubmit(parseInt(value, 10));
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-2xl font-bold text-center"
          placeholder="Your answer"
          disabled={disabled}
          min={0}
          max={400}
        />
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            size="lg"
            disabled={disabled || !value}
            className="px-8 text-lg"
          >
            Check
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
