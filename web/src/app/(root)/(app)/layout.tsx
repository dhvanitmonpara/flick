"use client"

import { Suspense, ReactNode, useState } from "react"
import { PiCardsThreeFill, PiCardsThreeLight } from "react-icons/pi";
import { RiGraduationCapFill, RiGraduationCapLine } from "react-icons/ri";
import { PiFireFill, PiFireLight } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import TerminateSessions from "@/components/actions/TerminateSessions";
import useProfileStore from "@/store/profileStore";
import CreatePost from "@/components/general/CreatePost";
import AuthCard from "@/components/general/AuthCard";
import { PostTopic } from "@/types/postTopics";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { PostBranches } from "@/types/PostBranchs";
import { SocketProvider } from "@/socket/SocketContext";
import TrendingPostSection from "@/components/general/TrendingPostSection";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import parseTopic from "@/utils/parse-topic";
import Logo from "@/components/general/Logo";

function AppLayoutContent({ children }: { children: ReactNode }) {
  const reset = useSearchParams().get('reset');

  return (
    <>
      <Sidebar />
      <div className="max-h-screen overflow-y-auto no-scrollbar w-full pb-16 md:pb-0">
        {children}
      </div>
      <TrendingPostSection />
      <MobileNav />
      {(reset === "true") && <TerminateSessions />}
    </>
  )
}

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-7xl mx-auto w-full h-screen md:pr-8 md:divide-x divide-zinc-200 dark:divide-zinc-800">
      <SocketProvider>
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <AppLayoutContent>{children}</AppLayoutContent>
        </Suspense>
      </SocketProvider>
    </div>
  )
}

function MobileNav() {
  const pathname = usePathname()
  const theme = useProfileStore(state => state.theme)
  const isLoggedIn = Boolean(useProfileStore(state => state.profile.id))

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-around items-center h-14 z-50">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${pathname === "/" || pathname.startsWith("/?topic=") || pathname.startsWith("/?branch=") ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"}`}>
        {pathname === "/" || pathname.startsWith("/?topic=") || pathname.startsWith("/?branch=") ? <PiCardsThreeFill size={26} /> : <PiCardsThreeLight size={26} />}
      </Link>
      <Link href="/college" className={`flex flex-col items-center justify-center w-full h-full ${pathname === "/college" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"}`}>
        {pathname === "/college" ? <RiGraduationCapFill size={26} /> : <RiGraduationCapLine size={26} />}
      </Link>
      <div className="flex items-center justify-center w-full h-full">
        {isLoggedIn ? (
          <CreatePost>
            <button type="button" className="flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full w-10 h-10">
              <FaPlus size={16} />
            </button>
          </CreatePost>
        ) : (
          <Link href="/auth/signin">
            <button type="button" className="flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full w-10 h-10">
              <FaPlus size={16} />
            </button>
          </Link>
        )}
      </div>
      <Link href="/trending" className={`flex flex-col items-center justify-center w-full h-full ${pathname === "/trending" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"}`}>
        {pathname === "/trending" ? <PiFireFill size={26} /> : <PiFireLight size={26} />}
      </Link>
      <Link href="/u/profile" className={`flex flex-col items-center justify-center w-full h-full ${pathname.startsWith("/u/profile") ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"}`}>
        <img className="h-7 w-7 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover bg-zinc-100 dark:bg-zinc-800 p-0.5" src={isLoggedIn ? ((useProfileStore.getState().profile.college as any)?.profile || `https://api.dicebear.com/9.x/initials/svg?seed=${useProfileStore.getState().profile.username || "U"}`) : (theme === "dark" ? "/logo-w.png" : "/logo-b.png")} alt="profile" />
      </Link>
    </div>
  )
}

function Sidebar() {

  const [showAllBranches, setShowAllBranches] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  const isLoggedIn = Boolean(useProfileStore(state => state.profile.id))

  return (
    <>
      <div className="hidden md:block min-w-[270px] w-[270px] h-screen py-6 overflow-y-auto no-scrollbar space-y-1 px-4">
        <div className="flex items-center">
          <Logo />
        </div>
        <section className="space-y-2">
          <Tab to="/" text="Feed" activeIcon={<PiCardsThreeFill size={22} />} passiveIcon={<PiCardsThreeLight size={22} />} />
          <Tab to="/college" text="My College" activeIcon={<RiGraduationCapFill size={22} />} passiveIcon={<RiGraduationCapLine size={22} />} />
          <Tab to="/trending" text="Trending" activeIcon={<PiFireFill size={22} />} passiveIcon={<PiFireLight size={22} />} />
        </section>
        <Separator className="my-2" />
        <Heading text="Branches" />
        {showAllBranches
          ? <>
            {PostBranches.map((branch) => (
              <Tab key={branch} to={`/?branch=${branch.toLowerCase().replace(" ", "+")}`} text={branch} />
            ))}
            <button type="button" className="flex justify-center items-center space-x-1 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pl-4 py-2" onClick={() => setShowAllBranches(false)}>
              <span>Show less</span>
              <IoMdArrowDropup className="text-xl" />
            </button>
          </>
          : <>
            {PostBranches.filter((_, index) => index < 5).map((branch) => (
              <Tab key={branch} to={`/?branch=${branch.toLowerCase().replace(" ", "+")}`} text={branch} />
            ))}
            <button type="button" className="flex justify-center items-center space-x-1 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pl-4 py-2" onClick={() => setShowAllBranches(true)}>
              <span>Show more</span>
              <IoMdArrowDropdown className="text-xl" />
            </button>
          </>
        }
        <Separator className="my-2" />
        <Heading text="Topics" />
        {showAllTopics
          ? <>
            {PostTopic.map((topic) => (
              <Tab key={topic} to={`/?topic=${parseTopic(topic)}`} text={topic} />
            ))}
            <button type="button" className="flex justify-center items-center space-x-1 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pl-4 py-2" onClick={() => setShowAllTopics(false)}>
              <span>Show less</span>
              <IoMdArrowDropup className="text-xl" />
            </button>
          </>
          : <>
            {PostTopic.filter((_, index) => index < 5).map((topic) => (
              <Tab key={topic} to={`/?topic=${parseTopic(topic)}`} text={topic} />
            ))}
            <button type="button" className="flex justify-center items-center space-x-1 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pl-4 py-2" onClick={() => setShowAllTopics(true)}>
              <span>Show more</span>
              <IoMdArrowDropdown className="text-xl" />
            </button>
          </>
        }
        <div className="h-24"></div>
      </div>
      <div className="hidden md:block fixed w-[270px] bottom-0 p-4 space-y-2 bg-zinc-100 dark:bg-zinc-900">
        {isLoggedIn && <CreatePost className="" />}
        <AuthCard className="bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      </div>
    </>
  )
}

function Tab({ to, text, activeIcon, passiveIcon }: { to: string, text: string, activeIcon?: ReactNode, passiveIcon?: ReactNode }) {
  const pathname = usePathname()
  const currentSearchParams = useSearchParams()
  const isActive = to.includes("?") ? `${pathname}?${currentSearchParams.toString()}` === to : pathname === to
  return <Link href={to} className={`flex justify-start items-center space-x-3 px-4 ${activeIcon && passiveIcon ? "py-2" : "py-1.5"} rounded-md ${isActive ? "bg-zinc-200/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40"}`}>
    {isActive ? (activeIcon || null) : (passiveIcon || null)}
    <span>
      {text}
    </span>
  </Link>
}

function Heading({ text }: { text: string }) {
  return (
    <h3 className="text-lg uppercase px-4 pt-3 pb-1">{text}</h3>
  )
}

export default AppLayout
