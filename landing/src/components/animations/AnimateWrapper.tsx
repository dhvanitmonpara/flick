"use client";

import { motion, AnimatePresence, Variants, MotionProps } from "motion/react";
import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant =
  | "fadeIn"
  | "blurIn"
  | "slideUp"
  | "slideDown"
  | "slideDownBlur"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown";

interface AnimateWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationVariant;
  as?: ElementType;
  delay?: number;
  startOnView?: boolean;
  duration?: number;
  once?: boolean;
}

const variants: Record<AnimationVariant, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 },
  },
  blurIn: {
    hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
    show: { opacity: 1, filter: "blur(0px)", y: 0 },
    exit: { opacity: 0, filter: "blur(10px)", y: -10 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDownBlur: {
    hidden: { opacity: 0, y: -50, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: 50, filter: "blur(10px)" },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  scaleDown: {
    hidden: { opacity: 0, scale: 1.2 },
    show: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },
};

export function AnimateWrapper({
  children,
  className,
  animation = "blurIn",
  as: Component = "div",
  delay = 0,
  duration = 0.3,
  startOnView = true,
  once = false,
  ...props
}: AnimateWrapperProps) {
  const MotionComponent = motion(Component);

  return (
    <AnimatePresence mode="popLayout">
      <MotionComponent
        variants={variants[animation]}
        initial="hidden"
        whileInView={startOnView ? "show" : undefined}
        animate={startOnView ? undefined : "show"}
        exit="exit"
        className={cn(className)}
        viewport={{ once }}
        transition={{ delay, duration: 0.3 }}
        {...props}
      >
        {children}
      </MotionComponent>
    </AnimatePresence>
  );
}
