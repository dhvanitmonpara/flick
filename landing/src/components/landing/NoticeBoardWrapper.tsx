import Image from "next/image";

interface FlickNoticeBoardProps {
  screenshotSrc: string;
  alt?: string;
  note?: string;
}

export function FlickNoticeBoard({
  screenshotSrc,
  alt = "Flick App Screenshot",
  note,
}: FlickNoticeBoardProps) {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="border-[20px] rounded-xl shadow-lg bg-green-board bg-cover bg-center border-wood-frame max-w-4xl w-full relative">
        {/* Screenshot */}
        <div className="relative m-8 bg-white shadow-lg rounded-md overflow-hidden border border-gray-300">
          <Image
            src={screenshotSrc}
            alt={alt}
            width={800}
            height={450}
            className="w-full h-auto object-contain"
          />

          {/* Optional single tape corner */}
          <div className="absolute top-0 left-0 w-6 h-6 bg-yellow-200 rotate-45 -translate-x-1/2 -translate-y-1/2 shadow-sm" />
        </div>

        {/* Optional Note */}
        {note && (
          <div className="text-white text-center italic py-4 text-sm">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}
