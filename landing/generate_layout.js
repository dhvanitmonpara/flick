const icons = [
  "Book", "Pencil", "Eraser", "Paperclip", "Folder", "Backpack",
  "Coffee", "Calculator", "StickyNote", "Headphones", "Laptop",
  "GraduationCap", "FileText", "Ruler", "Paintbrush", "Scissors",
  "PenTool", "Usb", "MessageSquare", "Lightbulb", "Brain", "Compass",
  "Globe", "Mic", "Music", "Palette", "Video", "Camera"
];

const colors = [
  "text-emerald-200", // mint
  "text-blue-200",    // baby blue
  "text-yellow-200",  // soft yellow
  "text-gray-300",    // soft gray (base)
  "text-gray-300",
  "text-gray-300",
  "text-gray-300"
];

const width = 800;
const height = 800;
const cols = 5;
const rows = 6;
const cellWidth = width / cols;
const cellHeight = height / rows;

let output = [];
let index = 0;

for (let i = 0; i < cols; i++) {
  for (let j = 0; j < rows; j++) {
    if (index >= icons.length) break;
    
    // Add jitter to center of cell
    const cx = (i * cellWidth) + (cellWidth / 2);
    const cy = (j * cellHeight) + (cellHeight / 2);
    
    const maxJitterX = cellWidth * 0.3;
    const maxJitterY = cellHeight * 0.3;
    
    const x = cx + (Math.random() * maxJitterX * 2 - maxJitterX) - 24; // -24 for icon center approximation (48x48)
    const y = cy + (Math.random() * maxJitterY * 2 - maxJitterY) - 24;
    
    const rotation = Math.floor(Math.random() * 360);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const scale = 0.8 + Math.random() * 0.6; // 0.8 to 1.4
    
    output.push({
      id: index,
      icon: icons[index],
      x: Math.round(x),
      y: Math.round(y),
      rotation,
      color,
      scale: scale.toFixed(2),
    });
    
    index++;
  }
}

console.log(JSON.stringify(output, null, 2));
