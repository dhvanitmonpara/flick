import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const avallon = localFont({
  src: '../assets/fonts/avallon-regular/Avallon.woff2',
  display: 'swap',
  variable: "--font-avallon"
});

export const editorial = localFont({
  src: '../assets/fonts/editorial-old-font/PPEditorialNew-Regular-BF644b214ff145f.otf',
  display: 'swap',
  variable: "--font-editorial"
});

export const soupbone = localFont({
  src: '../assets/fonts/SoupBone/SoupBone-Regular.ttf',
  display: 'swap',
  variable: "--font-soupbone"
});

export const caveat  = localFont({
  src: '../assets/fonts/Caveat/static/Caveat-Regular.ttf',
  display: 'swap',
  variable: "--font-caveat"
})

export const gloria  = localFont({
  src: '../assets/fonts/Gloria_Hallelujah/GloriaHallelujah-Regular.ttf',
  display: 'swap',
  variable: "--font-gloria"
})

export const handlee  = localFont({
  src: '../assets/fonts/Handlee/Handlee-Regular.ttf',
  display: 'swap',
  variable: "--font-handlee"
})

export const patrickhand  = localFont({
  src: '../assets/fonts/Patrick_Hand/PatrickHand-Regular.ttf',
  display: 'swap',
  variable: "--font-patrickhand"
})
export const shadowsintolight  = localFont({
  src: '../assets/fonts/Shadows_Into_Light/ShadowsIntoLight-Regular.ttf',
  display: 'swap',
  variable: "--font-shadowsintolight"
})

export const neuemontreal = localFont({
  src: '../assets/fonts/Neue Montreal/NeueMontreal-Bold.otf',
  display: 'swap',
  variable: "--font-neue-montreal"
});

export const garnett = localFont({
  src: '../assets/fonts/garnett/Garnett-Regular.ttf',
  display: 'swap',
  variable: "--font-garnett"
});

export const inter = localFont({
  src: '../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf',
  display: 'swap',
  variable: "--font-inter"
})

export const poppins = localFont({
  src: '../assets/fonts/Poppins/Poppins-Regular.ttf',
  display: 'swap',
  variable: "--font-poppins"
})
