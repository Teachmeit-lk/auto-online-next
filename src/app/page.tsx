import { FC } from "react";

import {
  AutoServices,
  HeroSection,
  ProductCategories,
  InfoComponent,
  ServiceCategories,
  StatsSection,
  AboutUs,
  ContactUsSection,
  ContactForm,
  ScrollToTopButton,
} from "../components/index";

const Home: FC = () => {
  return (
    <div>
      <HeroSection />
      <AutoServices />
      <ProductCategories />
      <InfoComponent />
      <ServiceCategories />
      <StatsSection />
      <AboutUs />
      <ContactUsSection />
      <ScrollToTopButton />
      <ContactForm />
    </div>
  );
};

export default Home;
