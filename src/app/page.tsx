import { FC } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

import {
  Header,
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
  Footer,
} from "../components/atoms/index";

const Home: FC = () => {
  return (
    <div>
      <Header />
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
      <Footer />
    </div>
  );
};

export default Home;
