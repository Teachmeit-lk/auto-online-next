"use client";

import { FC } from "react";

import {
  AutoServices,
  HeroSection,
  ProductCategories,
  InfoComponent,
  ServiceCategories,
  OurStatusSection,
  AboutUs,
  ContactUsSection,
  ContactForm,
  ScrollToTopButton,
} from "@/components";

const Home: FC = () => {
  return (
    <div className="max-w-screen-xl mx-auto w-full px-4 md:px-6">
      <HeroSection />
      <AutoServices />
      <ProductCategories />
      <InfoComponent />
      <ServiceCategories />
      <OurStatusSection />
      <AboutUs />
      <ContactUsSection />
      <ScrollToTopButton />
      <ContactForm />
    </div>
  );
};

export default Home;
