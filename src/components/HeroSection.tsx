import React from "react";

import Image from "next/image";
import HeroImg1 from "@/assets/HeroImg1.png";
import HeroImg2 from "@/assets/HeroImg2.png";
import HeroImg3 from "@/assets/HeroImg3.png";

import FacebookIcon from "@/assets/FacebookIcon";
import InstagramIcon from "@/assets/InstagramIcon";
import TwitterIcon from "@/assets/TwitterIcon";
import YoutubeIcon from "@/assets/YoutubeIcon";

const HeroSection: React.FC = () => {
  return (
    <div
      className="relative bg-[#F8F8F8] flex  justify-between px-20"
      id="home"
    >
      Text Section
      <div className="max-w-2xl pt-20">
        <h1
          className="text-[72px]  text-black font-title "
          style={{ textShadow: "4px 4px 6px rgba(254, 221, 151, 0.52)" }}
        >
          Trust AutoOnline
        </h1>
        <p className="text-[18px] text-[#111102] font-body">
          Scale your business with an easy-to-manage solution that will
          revolutionize <br /> the way you sell and source auto parts.
        </p>
      </div>

      {/* Image Section */}
      <div className="relative overflow-hidden pb-5">
        <Image
          src={HeroImg1}
          alt="Car"
          className=" w-[534px] h-[408px]  right-[-25px] "
          style={{ position: "relative", top: "-25px" }}
        />
        <Image
          src={HeroImg2}
          alt="Oil Splash"
          className="absolute  w-[481px] h-[378] top-[150px] right-[-3px]  "
          style={{ rotate: "34.98deg" }}
        />
        <Image
          src={HeroImg3}
          alt="Oil Splash"
          className="absolute right-[-5px] w-[361px] h-[314] top-[100px] "
          style={{ rotate: "6deg" }}
        />
      </div>

      {/* Social Media Icons */}
      <div className="absolute bottom-8 left-0 flex space-x-4 text-gray-500 px-20">
        <a href="https://facebook.com" className="hover:text-blue-600">
          <FacebookIcon />
        </a>
        <a href="#" className="hover:text-red-600 ">
          <YoutubeIcon />
        </a>
        <a href="#" className="hover:text-pink-500">
          <InstagramIcon />
        </a>
        <a href="#" className="hover:text-sky-500">
          <TwitterIcon />
        </a>
      </div>
    </div>
  );
};

export default HeroSection;
