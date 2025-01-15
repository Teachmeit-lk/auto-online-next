import { FC } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

import {
  AutoServices,
  HeroSection,
  ProductCategories,
  InfoComponent,
  OurServices,
  StatCard,
  AboutUs,
  ContactUsSection,
  ContactUsForm,
  ScrollToTopButton,
} from "../components/atoms/index";

const Home: FC = () => {
  return (
    <div>
      <HeroSection />
      <AutoServices />
      <ProductCategories />
      <InfoComponent />
      <OurServices />
      <StatCard />
      <AboutUs />
      <ContactUsSection />
      <ScrollToTopButton />
      <ContactUsForm />
    </div>
  );
};

export default Home;
