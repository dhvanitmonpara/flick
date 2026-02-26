import {
  Book, Pencil, Eraser, Paperclip, Folder, Briefcase, Coffee, Calculator, StickyNote, Headphones, Laptop, GraduationCap, FileText, Ruler, Paintbrush, Scissors, PenTool, Usb, MessageSquare, Lightbulb, Brain, Compass, Globe, Mic, Music, Palette, Video, Camera, Monitor, Mouse, Keyboard, Smartphone, Tablet, Wifi, Battery, Clock, Calendar, Award, Target, Zap
} from "lucide-react";

export default function BackgroundPattern() {
  const icons = [
    { Icon: StickyNote, x: 11, y: 17, rotate: 321, scale: 0.74, color: "text-zinc-400/60" },
    { Icon: Mouse, x: 6, y: 120, rotate: 216, scale: 0.87, color: "text-zinc-400/60" },
    { Icon: FileText, x: 14, y: 210, rotate: 15, scale: 0.67, color: "text-blue-500/50" },
    { Icon: Scissors, x: -3, y: 275, rotate: 196, scale: 0.45, color: "text-gray-400/60" },
    { Icon: Scissors, x: 11, y: 346, rotate: 276, scale: 0.46, color: "text-slate-400/60" },
    { Icon: Zap, x: 45, y: 439, rotate: 51, scale: 0.40, color: "text-blue-500/50" },
    { Icon: Compass, x: 91, y: -7, rotate: 56, scale: 0.82, color: "text-emerald-500/50" },
    { Icon: PenTool, x: 139, y: 131, rotate: 228, scale: 0.90, color: "text-emerald-500/50" },
    { Icon: FileText, x: 157, y: 173, rotate: 114, scale: 0.41, color: "text-slate-400/60" },
    { Icon: Folder, x: 101, y: 313, rotate: 344, scale: 0.53, color: "text-zinc-400/60" },
    { Icon: Compass, x: 156, y: 378, rotate: 95, scale: 0.69, color: "text-blue-500/50" },
    { Icon: Folder, x: 139, y: 407, rotate: 1, scale: 0.56, color: "text-blue-500/50" },
    { Icon: Scissors, x: 232, y: 34, rotate: 355, scale: 0.86, color: "text-yellow-500/50" },
    { Icon: Scissors, x: 193, y: 131, rotate: 358, scale: 0.47, color: "text-blue-500/50" },
    { Icon: PenTool, x: 237, y: 228, rotate: 1, scale: 0.77, color: "text-gray-400/60" },
    { Icon: Paperclip, x: 241, y: 256, rotate: 61, scale: 0.70, color: "text-yellow-500/50" },
    { Icon: StickyNote, x: 189, y: 392, rotate: 85, scale: 0.81, color: "text-blue-500/50" },
    { Icon: Lightbulb, x: 187, y: 421, rotate: 320, scale: 0.86, color: "text-blue-500/50" },
    { Icon: Paintbrush, x: 268, y: 54, rotate: 140, scale: 0.42, color: "text-zinc-400/60" },
    { Icon: Battery, x: 267, y: 125, rotate: 324, scale: 0.54, color: "text-yellow-500/50" },
    { Icon: StickyNote, x: 315, y: 193, rotate: 201, scale: 0.78, color: "text-zinc-400/60" },
    { Icon: Zap, x: 311, y: 292, rotate: 242, scale: 0.82, color: "text-gray-400/60" },
    { Icon: Clock, x: 305, y: 335, rotate: 116, scale: 0.69, color: "text-slate-400/60" },
    { Icon: Target, x: 261, y: 435, rotate: 2, scale: 0.62, color: "text-slate-400/60" },
    { Icon: Tablet, x: 377, y: 28, rotate: 354, scale: 0.86, color: "text-slate-400/60" },
    { Icon: FileText, x: 405, y: 104, rotate: 272, scale: 0.61, color: "text-blue-500/50" },
    { Icon: Coffee, x: 387, y: 168, rotate: 303, scale: 0.83, color: "text-zinc-400/60" },
    { Icon: Zap, x: 418, y: 245, rotate: 189, scale: 0.86, color: "text-slate-400/60" },
    { Icon: Camera, x: 364, y: 377, rotate: 81, scale: 0.58, color: "text-slate-400/60" },
    { Icon: Coffee, x: 420, y: 451, rotate: 148, scale: 0.66, color: "text-blue-500/50" },
    { Icon: Wifi, x: 509, y: 22, rotate: 109, scale: 0.86, color: "text-gray-400/60" },
    { Icon: Folder, x: 501, y: 116, rotate: 235, scale: 0.87, color: "text-gray-400/60" },
    { Icon: Laptop, x: 453, y: 195, rotate: 177, scale: 0.67, color: "text-gray-400/60" },
    { Icon: Monitor, x: 480, y: 300, rotate: 163, scale: 0.58, color: "text-emerald-500/50" },
    { Icon: Scissors, x: 441, y: 396, rotate: 284, scale: 0.70, color: "text-gray-400/60" },
    { Icon: Monitor, x: 472, y: 410, rotate: 280, scale: 0.45, color: "text-zinc-400/60" },
    { Icon: Paperclip, x: 599, y: 14, rotate: 54, scale: 0.63, color: "text-blue-500/50" },
    { Icon: Paintbrush, x: 572, y: 86, rotate: 0, scale: 0.87, color: "text-gray-400/60" },
    { Icon: Globe, x: 591, y: 228, rotate: 163, scale: 0.68, color: "text-zinc-400/60" },
    { Icon: MessageSquare, x: 539, y: 251, rotate: 212, scale: 0.74, color: "text-yellow-500/50" },
    { Icon: Video, x: 554, y: 391, rotate: 259, scale: 0.51, color: "text-zinc-400/60" },
    { Icon: Smartphone, x: 583, y: 441, rotate: 183, scale: 0.69, color: "text-gray-400/60" },
    { Icon: FileText, x: 653, y: 51, rotate: 31, scale: 0.70, color: "text-slate-400/60" },
    { Icon: Video, x: 661, y: 99, rotate: 245, scale: 0.53, color: "text-slate-400/60" },
    { Icon: Lightbulb, x: 680, y: 196, rotate: 36, scale: 0.71, color: "text-yellow-500/50" },
    { Icon: Zap, x: 640, y: 273, rotate: 162, scale: 0.83, color: "text-emerald-500/50" },
    { Icon: Globe, x: 683, y: 359, rotate: 155, scale: 0.67, color: "text-zinc-400/60" },
    { Icon: Briefcase, x: 655, y: 472, rotate: 233, scale: 0.64, color: "text-slate-400/60" },
    { Icon: Scissors, x: 760, y: 47, rotate: 239, scale: 0.73, color: "text-emerald-500/50" },
    { Icon: Lightbulb, x: 748, y: 115, rotate: 154, scale: 0.56, color: "text-blue-500/50" },
    { Icon: Eraser, x: 710, y: 155, rotate: 296, scale: 0.79, color: "text-blue-500/50" },
    { Icon: Coffee, x: 718, y: 283, rotate: 1, scale: 0.42, color: "text-emerald-500/50" },
    { Icon: Compass, x: 745, y: 356, rotate: 238, scale: 0.79, color: "text-slate-400/60" },
    { Icon: Palette, x: 710, y: 407, rotate: 326, scale: 0.54, color: "text-slate-400/60" }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40 mix-blend-multiply">
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
