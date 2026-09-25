"use client";

import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedButton({ children, className = "", onClick, disabled, ...props }: AnimatedButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <button className={className} onClick={onClick} disabled={disabled} {...(props as any)}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
