import {
  Book, Pencil, Eraser, Paperclip, Folder, Briefcase, Coffee, Calculator, StickyNote, Headphones, Laptop, GraduationCap, FileText, Ruler, Paintbrush, Scissors, PenTool, Usb, MessageSquare, Lightbulb, Brain, Compass, Globe, Mic, Music, Palette, Video, Camera, Monitor, Mouse, Keyboard, Smartphone, Tablet, Wifi, Battery, Clock, Calendar, Award, Target, Zap
} from "lucide-react";

export default function BackgroundPattern() {
  const icons = [
    { Icon: Smartphone, x: -11, y: 53, rotate: 78, scale: 0.59, color: "text-yellow-500/50" },
    { Icon: Keyboard, x: 16, y: 79, rotate: 291, scale: 0.71, color: "text-yellow-500/50" },
    { Icon: Battery, x: 22, y: 169, rotate: 309, scale: 0.58, color: "text-slate-400/60" },
    { Icon: Paperclip, x: 20, y: 275, rotate: 42, scale: 0.85, color: "text-zinc-400/60" },
    { Icon: Coffee, x: 41, y: 341, rotate: 115, scale: 0.70, color: "text-yellow-500/50" },
    { Icon: Lightbulb, x: 37, y: 430, rotate: 9, scale: 0.41, color: "text-slate-400/60" },
    { Icon: Smartphone, x: 139, y: -8, rotate: 340, scale: 0.90, color: "text-blue-500/50" },
    { Icon: Target, x: 109, y: 99, rotate: 107, scale: 0.56, color: "text-zinc-400/60" },
    { Icon: Paperclip, x: 145, y: 228, rotate: 139, scale: 0.79, color: "text-zinc-400/60" },
    { Icon: PenTool, x: 145, y: 308, rotate: 148, scale: 0.75, color: "text-gray-400/60" },
    { Icon: PenTool, x: 88, y: 341, rotate: 82, scale: 0.61, color: "text-zinc-400/60" },
    { Icon: StickyNote, x: 89, y: 408, rotate: 87, scale: 0.68, color: "text-yellow-500/50" },
    { Icon: Award, x: 204, y: 50, rotate: 337, scale: 0.83, color: "text-emerald-500/50" },
    { Icon: Folder, x: 195, y: 123, rotate: 103, scale: 0.89, color: "text-slate-400/60" },
    { Icon: Music, x: 239, y: 159, rotate: 227, scale: 0.50, color: "text-zinc-400/60" },
    { Icon: Folder, x: 229, y: 292, rotate: 48, scale: 0.62, color: "text-blue-500/50" },
    { Icon: Paintbrush, x: 173, y: 388, rotate: 310, scale: 0.72, color: "text-emerald-500/50" },
    { Icon: Palette, x: 234, y: 407, rotate: 273, scale: 0.57, color: "text-gray-400/60" },
    { Icon: Scissors, x: 261, y: 9, rotate: 294, scale: 0.72, color: "text-emerald-500/50" },
    { Icon: Target, x: 314, y: 121, rotate: 277, scale: 0.69, color: "text-zinc-400/60" },
    { Icon: Lightbulb, x: 272, y: 197, rotate: 130, scale: 0.86, color: "text-zinc-400/60" },
    { Icon: Ruler, x: 303, y: 300, rotate: 169, scale: 0.65, color: "text-slate-400/60" },
    { Icon: PenTool, x: 272, y: 337, rotate: 159, scale: 0.51, color: "text-zinc-400/60" },
    { Icon: StickyNote, x: 287, y: 480, rotate: 295, scale: 0.51, color: "text-yellow-500/50" },
    { Icon: Palette, x: 417, y: 46, rotate: 353, scale: 0.86, color: "text-emerald-500/50" },
    { Icon: Tablet, x: 364, y: 121, rotate: 152, scale: 0.56, color: "text-slate-400/60" },
    { Icon: StickyNote, x: 356, y: 200, rotate: 36, scale: 0.44, color: "text-yellow-500/50" },
    { Icon: Folder, x: 359, y: 266, rotate: 174, scale: 0.81, color: "text-yellow-500/50" },
    { Icon: Wifi, x: 382, y: 372, rotate: 350, scale: 0.88, color: "text-yellow-500/50" },
    { Icon: Tablet, x: 412, y: 452, rotate: 282, scale: 0.48, color: "text-zinc-400/60" },
    { Icon: Battery, x: 449, y: 29, rotate: 334, scale: 0.47, color: "text-zinc-400/60" },
    { Icon: Zap, x: 454, y: 105, rotate: 225, scale: 0.78, color: "text-gray-400/60" },
    { Icon: Pencil, x: 511, y: 189, rotate: 285, scale: 0.44, color: "text-zinc-400/60" },
    { Icon: Folder, x: 473, y: 287, rotate: 187, scale: 0.78, color: "text-slate-400/60" },
    { Icon: Video, x: 438, y: 378, rotate: 355, scale: 0.87, color: "text-emerald-500/50" },
    { Icon: Camera, x: 466, y: 420, rotate: 321, scale: 0.51, color: "text-blue-500/50" },
    { Icon: Tablet, x: 594, y: -5, rotate: 194, scale: 0.42, color: "text-slate-400/60" },
    { Icon: Calendar, x: 599, y: 128, rotate: 67, scale: 0.80, color: "text-emerald-500/50" },
    { Icon: Paperclip, x: 575, y: 226, rotate: 310, scale: 0.72, color: "text-slate-400/60" },
    { Icon: Palette, x: 541, y: 253, rotate: 237, scale: 0.62, color: "text-zinc-400/60" },
    { Icon: Folder, x: 601, y: 337, rotate: 160, scale: 0.85, color: "text-slate-400/60" },
    { Icon: Monitor, x: 526, y: 477, rotate: 184, scale: 0.84, color: "text-yellow-500/50" },
    { Icon: Zap, x: 686, y: 3, rotate: 198, scale: 0.45, color: "text-zinc-400/60" },
    { Icon: Pencil, x: 667, y: 127, rotate: 300, scale: 0.87, color: "text-slate-400/60" },
    { Icon: Camera, x: 624, y: 155, rotate: 251, scale: 0.49, color: "text-yellow-500/50" },
    { Icon: Ruler, x: 687, y: 272, rotate: 172, scale: 0.68, color: "text-zinc-400/60" },
    { Icon: MessageSquare, x: 659, y: 387, rotate: 297, scale: 0.67, color: "text-zinc-400/60" },
    { Icon: StickyNote, x: 667, y: 479, rotate: 62, scale: 0.56, color: "text-zinc-400/60" },
    { Icon: Award, x: 770, y: 44, rotate: 98, scale: 0.45, color: "text-emerald-500/50" },
    { Icon: Mic, x: 731, y: 141, rotate: 197, scale: 0.40, color: "text-slate-400/60" },
    { Icon: Keyboard, x: 711, y: 211, rotate: 274, scale: 0.70, color: "text-zinc-400/60" },
    { Icon: Keyboard, x: 739, y: 307, rotate: 161, scale: 0.47, color: "text-blue-500/50" },
    { Icon: Paperclip, x: 744, y: 363, rotate: 253, scale: 0.44, color: "text-gray-400/60" },
    { Icon: Briefcase, x: 733, y: 466, rotate: 211, scale: 0.45, color: "text-zinc-400/60" }
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
