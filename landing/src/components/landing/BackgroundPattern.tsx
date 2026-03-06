import {
  Book, Pencil, Eraser, Paperclip, Folder, Briefcase, Coffee, Calculator, StickyNote, Headphones, Laptop, GraduationCap, FileText, Ruler, Paintbrush, Scissors, PenTool, Usb, MessageSquare, Lightbulb, Brain, Compass, Globe, Mic, Music, Palette, Video, Camera, Monitor, Mouse, Keyboard, Smartphone, Tablet, Wifi, Battery, Clock, Calendar, Award, Target, Zap
} from "lucide-react";

export default function BackgroundPattern() {
  const icons = [
    { Icon: Laptop, x: 53, y: 24, rotate: 202, scale: 0.51, color: "text-slate-400/60" },
    { Icon: Eraser, x: 13, y: 102, rotate: 208, scale: 0.47, color: "text-emerald-500/50" },
    { Icon: Video, x: 54, y: 215, rotate: 238, scale: 0.70, color: "text-slate-400/60" },
    { Icon: Ruler, x: 8, y: 303, rotate: 128, scale: 0.49, color: "text-emerald-500/50" },
    { Icon: Clock, x: 29, y: 396, rotate: 228, scale: 0.76, color: "text-emerald-500/50" },
    { Icon: Camera, x: -7, y: 451, rotate: 319, scale: 0.68, color: "text-zinc-400/60" },
    { Icon: Wifi, x: 126, y: 15, rotate: 216, scale: 0.81, color: "text-slate-400/60" },
    { Icon: Mouse, x: 113, y: 133, rotate: 234, scale: 0.57, color: "text-zinc-400/60" },
    { Icon: Coffee, x: 138, y: 193, rotate: 329, scale: 0.54, color: "text-yellow-500/50" },
    { Icon: Coffee, x: 126, y: 245, rotate: 43, scale: 0.61, color: "text-slate-400/60" },
    { Icon: Wifi, x: 96, y: 383, rotate: 248, scale: 0.45, color: "text-zinc-400/60" },
    { Icon: Award, x: 139, y: 448, rotate: 205, scale: 0.72, color: "text-blue-500/50" },
    { Icon: Wifi, x: 181, y: 47, rotate: 91, scale: 0.70, color: "text-yellow-500/50" },
    { Icon: Paperclip, x: 240, y: 113, rotate: 208, scale: 0.72, color: "text-slate-400/60" },
    { Icon: Keyboard, x: 225, y: 186, rotate: 185, scale: 0.65, color: "text-blue-500/50" },
    { Icon: Zap, x: 190, y: 287, rotate: 169, scale: 0.71, color: "text-zinc-400/60" },
    { Icon: PenTool, x: 246, y: 386, rotate: 79, scale: 0.68, color: "text-emerald-500/50" },
    { Icon: Folder, x: 182, y: 447, rotate: 243, scale: 0.79, color: "text-slate-400/60" },
    { Icon: Battery, x: 282, y: 23, rotate: 289, scale: 0.64, color: "text-zinc-400/60" },
    { Icon: Camera, x: 333, y: 86, rotate: 356, scale: 0.46, color: "text-yellow-500/50" },
    { Icon: StickyNote, x: 324, y: 195, rotate: 115, scale: 0.50, color: "text-zinc-400/60" },
    { Icon: Briefcase, x: 267, y: 308, rotate: 7, scale: 0.54, color: "text-zinc-400/60" },
    { Icon: Video, x: 293, y: 371, rotate: 296, scale: 0.78, color: "text-zinc-400/60" },
    { Icon: Briefcase, x: 307, y: 419, rotate: 74, scale: 0.52, color: "text-gray-400/60" },
    { Icon: Mic, x: 351, y: 63, rotate: 108, scale: 0.79, color: "text-emerald-500/50" },
    { Icon: FileText, x: 385, y: 72, rotate: 261, scale: 0.70, color: "text-slate-400/60" },
    { Icon: Eraser, x: 412, y: 175, rotate: 198, scale: 0.41, color: "text-slate-400/60" },
    { Icon: Battery, x: 355, y: 243, rotate: 73, scale: 0.62, color: "text-slate-400/60" },
    { Icon: Scissors, x: 372, y: 360, rotate: 182, scale: 0.86, color: "text-blue-500/50" },
    { Icon: Usb, x: 346, y: 455, rotate: 13, scale: 0.68, color: "text-yellow-500/50" },
    { Icon: FileText, x: 461, y: 19, rotate: 194, scale: 0.62, color: "text-emerald-500/50" },
    { Icon: Target, x: 477, y: 94, rotate: 156, scale: 0.73, color: "text-zinc-400/60" },
    { Icon: FileText, x: 448, y: 193, rotate: 66, scale: 0.76, color: "text-zinc-400/60" },
    { Icon: Video, x: 500, y: 302, rotate: 343, scale: 0.52, color: "text-slate-400/60" },
    { Icon: Target, x: 476, y: 341, rotate: 160, scale: 0.41, color: "text-gray-400/60" },
    { Icon: Wifi, x: 457, y: 433, rotate: 353, scale: 0.75, color: "text-yellow-500/50" },
    { Icon: Monitor, x: 556, y: 49, rotate: 259, scale: 0.58, color: "text-yellow-500/50" },
    { Icon: Battery, x: 534, y: 125, rotate: 171, scale: 0.67, color: "text-yellow-500/50" },
    { Icon: Headphones, x: 549, y: 170, rotate: 320, scale: 0.72, color: "text-zinc-400/60" },
    { Icon: Keyboard, x: 549, y: 289, rotate: 38, scale: 0.56, color: "text-zinc-400/60" },
    { Icon: GraduationCap, x: 555, y: 334, rotate: 186, scale: 0.88, color: "text-blue-500/50" },
    { Icon: Scissors, x: 563, y: 430, rotate: 234, scale: 0.56, color: "text-slate-400/60" },
    { Icon: Scissors, x: 667, y: 29, rotate: 122, scale: 0.70, color: "text-slate-400/60" },
    { Icon: Calendar, x: 668, y: 102, rotate: 152, scale: 0.62, color: "text-yellow-500/50" },
    { Icon: Zap, x: 659, y: 226, rotate: 27, scale: 0.65, color: "text-zinc-400/60" },
    { Icon: Lightbulb, x: 658, y: 270, rotate: 81, scale: 0.51, color: "text-slate-400/60" },
    { Icon: Usb, x: 689, y: 370, rotate: 18, scale: 0.69, color: "text-emerald-500/50" },
    { Icon: Tablet, x: 614, y: 454, rotate: 25, scale: 0.85, color: "text-slate-400/60" },
    { Icon: Mouse, x: 774, y: -4, rotate: 78, scale: 0.87, color: "text-zinc-400/60" },
    { Icon: Calendar, x: 728, y: 134, rotate: 55, scale: 0.90, color: "text-blue-500/50" },
    { Icon: Briefcase, x: 737, y: 220, rotate: 153, scale: 0.49, color: "text-emerald-500/50" },
    { Icon: Calculator, x: 737, y: 289, rotate: 80, scale: 0.62, color: "text-zinc-400/60" },
    { Icon: FileText, x: 776, y: 385, rotate: 178, scale: 0.85, color: "text-slate-400/60" },
    { Icon: Clock, x: 764, y: 428, rotate: 219, scale: 0.49, color: "text-slate-400/60" }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60 mix-blend-multiply">
      {/* 
        Smaller elements and smaller grid spacing.
        The pattern repeats every 800x500.
      */}
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="whatsapp-pattern"
            x="0"
            y="0"
            width="800"
            height="500"
            patternUnits="userSpaceOnUse"
          >
            {icons.map((item, i) => {
              const { Icon, x, y, rotate, scale, color } = item;
              return (
                <g
                  key={i}
                  transform={`translate(${x} ${y}) rotate(${rotate} 16 16) scale(${scale})`}
                  className={color}
                >
                  <Icon width={32} height={32} strokeWidth={1} />
                </g>
              );
            })}
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#whatsapp-pattern)" />
      </svg>
    </div>
  );
}
