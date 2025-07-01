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
    <div>
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
