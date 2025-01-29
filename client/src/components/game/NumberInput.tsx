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
          className={`text-2xl font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none number-input ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={disabled ? 'Processing...' : 'answer here, enter to submit'}
          disabled={disabled}
          min={0}
          max={400}
          autoFocus={!disabled}
        />
      </div>
    </form>
  );
}