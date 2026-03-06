"use client"

import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

const Footer = () => {
  return (
    <footer className="mt-32 px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-9 xl:grid-cols-4 gap-12">
        {/* Brand / About */}
        <div className="lg:col-span-2 xl:col-span-1">
          <h2 className="text-4xl font-avallon text-[#a86b4c]">Flick</h2>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
            Your anonymous campus hangout.
          </p>
          <div className="flex items-center space-x-3 pt-4 text-zinc-600">
            <FaGithub onClick={() => window.open("https://github.com/Dhvanitmonpara/flick", "_blank")} className="hover:text-[#a86b4c] cursor-pointer" />
            <FaXTwitter onClick={() => window.open("https://x.com/useFlick", "_blank")} className="hover:text-[#a86b4c] cursor-pointer" />
            <FaLinkedin onClick={() => window.open("https://www.linkedin.com/in/dhvanitmonpara/", "_blank")} className="hover:text-[#a86b4c] cursor-pointer" />
          </div>
        </div>

        {/* Navigation */}
        <div className="lg:col-span-2 xl:col-span-1">
          <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-3">
            Links
          </h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>
              <Link href="/" className="hover:text-neutral-900 transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/features" className="hover:text-neutral-900 transition">
                Features
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-neutral-900 transition">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-neutral-900 transition">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-neutral-900 transition">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2 xl:col-span-1">
          <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-3">
            Contact Us
          </h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>
              <a href="https://www.linkedin.com/in/dhvanitmonpara/" target="_blank" className="hover:text-neutral-900 transition">
                Linkedin
              </a>
            </li>
            <li>
              <a href="https://x.com/dhvanitcantcode" target="_blank" className="hover:text-neutral-900 transition">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://github.com/Dhvanitmonpara" target="_blank" className="hover:text-neutral-900 transition">
                Github
              </a>
            </li>
            <li>
              <a href="mailto:monparadhvanit@gmail.com" target="_blank" className="hover:text-neutral-900 transition">
                Email Us
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2 lg:col-span-3 xl:col-span-1">
          <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-3">
            Legal
          </h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>
              <Link href="/terms" className="hover:text-neutral-900 transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-neutral-900 transition">
                Privacy Policy
              </Link>
            </li>
          </ul>
          <Separator className="my-4 bg-neutral-300" />
          <form onSubmit={e => e.preventDefault()} className="mt-4 flex">
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 text-sm border border-neutral-300 rounded-l-md focus:outline-none"
            />
            <button className="bg-[#a86b4c] text-white px-4 py-2 text-sm rounded-r-md hover:bg-[#945c41]">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <Separator className="my-8 bg-neutral-300" />

      <div className="max-w-7xl mx-auto text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Flick. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
