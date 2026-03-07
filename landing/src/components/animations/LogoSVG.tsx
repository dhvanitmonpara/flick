import { useState } from "react";

export default function App() {
  const [animationKey] = useState(0);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-8 font-sans">
      {/* Container with Tailwind responsive sizing */}
      <div className="w-full max-w-4xl aspect-video relative flex items-center justify-center">
        {/* Scoped CSS for the complex SVG stroke animations */}
        <style>{`
          .logo-group {
            fill: none;
            stroke: url(#ink-gradient-${animationKey});
            stroke-width: 22;
            stroke-linecap: round;
            stroke-linejoin: round;
            animation: thicken 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.8s;
          }
          
          .letter {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          
          /* Cascading handwriting delays matching natural sequence */
          .f-top   { animation: draw 0.40s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
          .f-stem  { animation: draw 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.20s; }
          .f-mid   { animation: draw 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.40s; }
          
          .l-stem  { animation: draw 0.40s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.60s; }
          
          .i-stem  { animation: draw 0.30s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.80s; }
          
          .c-curve { animation: draw 0.40s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.00s; }
          
          .k-stem  { animation: draw 0.40s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.20s; }
          .k-top   { animation: draw 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.40s; }
          .k-bot   { animation: draw 0.40s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.55s; }
          
          .i-dot   { animation: draw 0.20s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.75s; }

          @keyframes draw {
            100% { stroke-dashoffset: 0; }
          }
          
          @keyframes thicken {
            0% { stroke-width: 22; }
            100% { stroke-width: 36; }
          }
        `}</style>

        <svg
          key={animationKey}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 600"
          className="w-full h-full drop-shadow-md"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`ink-gradient-${animationKey}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              {/* Note: React requires camelCase for attributes like stopColor */}
              <stop offset="0%" stopColor="#050505" />
              <stop offset="100%" stopColor="#151515" />
            </linearGradient>
          </defs>

          <g className="logo-group">
            {/* 'F' */}
            <path
              className="letter f-top"
              pathLength="100"
              d="M 110 230 C 180 190, 280 170, 390 150"
            />
            <path
              className="letter f-stem"
              pathLength="100"
              d="M 190 110 C 180 250, 160 380, 130 500"
            />
            <path
              className="letter f-mid"
              pathLength="100"
              d="M 110 340 C 150 330, 190 310, 230 290"
            />

            {/* 'l' */}
            <path
              className="letter l-stem"
              pathLength="100"
              d="M 430 150 C 410 280, 390 400, 380 450 C 378 460, 385 465, 395 455"
            />

            {/* 'i' */}
            <path
              className="letter i-stem"
              pathLength="100"
              d="M 500 250 C 480 330, 470 400, 460 440 C 458 450, 465 455, 475 445"
            />
            <path
              className="letter i-dot"
              pathLength="100"
              d="M 520 150 L 505 180"
            />

            {/* 'c' */}
            <path
              className="letter c-curve"
              pathLength="100"
              d="M 660 270 C 600 240, 550 290, 550 350 C 550 410, 610 430, 670 390"
            />

            {/* 'k' */}
            <path
              className="letter k-stem"
              pathLength="100"
              d="M 750 140 C 730 280, 710 400, 700 470"
            />
            <path
              className="letter k-top"
              pathLength="100"
              d="M 830 240 C 790 280, 750 310, 720 340"
            />
            <path
              className="letter k-bot"
              pathLength="100"
              d="M 720 340 C 760 410, 820 440, 900 410"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
