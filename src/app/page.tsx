import { FC, Suspense } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
// import AutoServices from "@/components/AutoServices";
// import ProductCategories from "@/components/ProductCategories";
// import InfoComponent from "@/components/InfoComponent";
// import OurServices from "@/components/OurServices";
// import StatCard from "@/components/StatCard";
// import AboutUs from "@/components/AboutUs";
// import ContactUsSection from "@/components/ContactUsSection";
// import ScrollToTopButton from "@/components/ScrollToTopButton";
// import ContactUsForm from "@/components/ContactUsForm";
// import Footer from "@/components/Footer";



const Home: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <HeroSection />
      {/* <AutoServices />
      <ProductCategories />
      <InfoComponent />
      <OurServices />
      <StatCard />
      <AboutUs />
      <ContactUsSection />
      <ScrollToTopButton />
      <ContactUsForm />
      <Footer /> */}
    </Suspense>
  );
};

export default Home;
