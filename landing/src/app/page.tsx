/** biome-ignore-all lint/suspicious/noArrayIndexKey: <i didn't want to use array index as key> */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaChartLine, FaRocket, FaUniversity } from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi";
import { AnimateWrapper } from "@/components/animations/AnimateWrapper";
import BackgroundPattern from "@/components/landing/BackgroundPattern";
import CTAButton from "@/components/landing/CTAButton";
import { FAQs } from "@/components/landing/FAQs";
import { FeatureCard } from "@/components/landing/FeatureCard";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import HowItWorksCard from "@/components/landing/HowItWorks";
import Post from "@/components/landing/Post";
import SecondaryButton from "@/components/landing/SecondaryButton";
import { TextAnimate } from "@/components/magicui/text-animate";
import howItWorksSteps from "@/data/HowItWorksSteps";
import mockPosts from "@/data/mockPosts";

const getRandomPosts = (count: number) => {
  const shuffled = [...mockPosts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function Home() {
  const [posts, setPosts] = useState(mockPosts);
  const [_postCount, setPostCount] = useState(10);

  useEffect(() => {
    const updatePostCount = () => {
      const width = window.innerWidth;
      let count: number;
      if (width < 640) {
        count = 3;
      } else if (width < 768) {
        count = 6;
      } else if (width < 1024) {
        count = 8;
      } else if (width < 1280) {
        count = 10;
      } else {
        count = mockPosts.length;
      }
      setPostCount(count);
      setPosts(getRandomPosts(count));
    };

    updatePostCount();
    window.addEventListener("resize", updatePostCount);
    return () => window.removeEventListener("resize", updatePostCount);
  }, []);

  return (
    <div className="min-h-screen relative bg-linear-to-tr bg-[linear-gradient(to_right,#fdfcfb,#e2d1c3)] z-0 isolation">
      <BackgroundPattern />
      <Header />
      <div className="max-w-6xl mx-auto px-8 lg:px-4 relative z-10">
        <div className="flex flex-col justify-center items-center gap-6 sm:gap-8 h-112.5 sm:h-125 md:h-137.5 lg:h-150 pb-8">
          <AnimateWrapper delay={0.05} once>
            <SecondaryButton />
          </AnimateWrapper>
          <div className="flex flex-col justify-center items-center text-neutral-700">
            <TextAnimate
              as="h1"
              delay={0.15}
              className="font-neue-montreal text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              animation="blurInUp"
              by="word"
              once
            >
              Your Anonymous Campus Hangout
            </TextAnimate>
            <TextAnimate
              delay={0.35}
              className="font-inter text-center mt-4 text-zinc-700 sm:mt-6 sm:text-lg md:text-xl lg:text-2xl"
              animation="blurInUp"
              by="word"
              once
            >
              Vent, share, connect - 100% anonymously. For Indian college
              students only.
            </TextAnimate>
          </div>
          <AnimateWrapper delay={0.55} once>
            <CTAButton
              size="xl"
              className="p-4 sm:p-6 text-sm md:text-md xl:text-lg"
            />
          </AnimateWrapper>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 grid-auto-rows-[150px]">
          {posts.map((post, index) => (
            <Post
              key={index}
              title={post.title}
              description={post.description}
              date={post.date}
              university={post.university}
              username={post.username}
              branch={post.branch}
              className={[
                index === 2 ? "row-span-2 sm:mt-16" : "row-span-3",
                index === 0 && "row-span-1! mt-8",
                "p-4 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.10)] overflow-hidden",
              ].join(" ")}
            />
          ))}
        </div>
        <div className="rounded-xl mt-24 sm:mt-32 sm:rounded-2xl overflow-hidden animate-fade-in-blur shadow-[0_-4px_28px_rgba(0,0,0,0.25)] border-[0.5px]">
          <div className="bg-zinc-100 h-6 sm:h-8 flex justify-between items-center px-4 sm:px-6">
            <div className="flex justify-center items-center gap-1 sm:gap-2">
              <span className="rounded-full bg-red-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"></span>
              <span className="rounded-full bg-yellow-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"></span>
              <span className="rounded-full bg-green-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"></span>
            </div>
          </div>
          <Image
            height={100}
            width={100}
            className="w-full h-full"
            src="/landing-mockup.png"
            alt="mockup"
          />
        </div>
        <div className="mt-24 sm:mt-32 animate-fade-in-blur">
          <h3 className="text-2xl sm:text-3xl font-semibold font-inter text-center mb-8 sm:mb-12">
            Why Flick?
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 text-center">
            <FeatureCard
              title="100% Anonymity"
              description="Speak your mind freely."
              icon={<HiOutlineUserCircle className="text-3xl" />}
            />
            <FeatureCard
              title="Student-Only Clubs"
              description="Each campus has a private feed."
              icon={<FaUniversity className="text-3xl" />}
            />
            <FeatureCard
              title="Earn Roles & Tags"
              description="Upvotes unlock exclusive badges."
              icon={<FaChartLine className="text-3xl" />}
            />
            <FeatureCard
              title="No Noise, No Ads"
              description="Just real talk, real people."
              icon={<FaRocket className="text-3xl" />}
            />
          </div>
        </div>
        <div className="mt-24 sm:mt-32 animate-fade-in-blur">
          <h3 className="text-2xl sm:text-3xl font-semibold font-inter text-center mb-8 sm:mb-12">
            How it works?
          </h3>
          <div className="flex flex-col lg:flex-row space-y-4 justify-between items-center text-center">
            {howItWorksSteps.map((step, idx) => (
              <HowItWorksCard
                key={idx}
                className={step.className}
                emoji={step.emoji}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
        <div className="mt-24 sm:mt-32 animate-fade-in-blur">
          <h3 className="text-2xl sm:text-3xl font-semibold font-inter text-center mb-8 sm:mb-12">
            FAQs
          </h3>
          <FAQs />
        </div>
      </div>
      <div className="mt-24 sm:mt-32 animate-fade-in-blur flex flex-col justify-center items-center space-y-6 px-4 text-center relative z-10">
        <h1
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.05)" }}
          className="font-neue-montreal text-[#5f4b32]/5 text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[12rem] font-extrabold bg-linear-to-r from-[#dfaf83] via-[#f0cda0] to-[#c4a484] bg-clip-text"
        >
          Join Flick Today
        </h1>

        <p className="text-lg sm:text-xl max-w-2xl text-gray-700">
          No bios. No selfies. Just unfiltered college life.
        </p>

        <CTAButton className="px-8 py-6 text-lg hover:scale-105 transition-transform duration-200" />
      </div>
      <Footer />
    </div>
  );
}
