"use client"

import { IoIosArrowForward, IoMdArrowForward } from "react-icons/io";
import { Button } from "../ui/button";
import { useState } from "react";

const CTAButton = ({ size = "xl", className }: { size?: "sm" | "lg" | "xl", className?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Button
      size={size}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variant="primary"
      className={`group transition-all font-inter hover:scale-105 hover:shadow-xl hover:bg-red-500/90 ${className}`}
    >
      <span>Join Anonymously</span>
      {isHovered ? <IoMdArrowForward className="text-xs sm:text-sm" /> : <IoIosArrowForward className="text-xs sm:text-sm" />}
    </Button>
  )
}

export default CTAButton