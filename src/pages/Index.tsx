
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/navigation/Header";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import Footer from "@/components/sections/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash navigation when the component mounts
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // Use setTimeout to ensure the element is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <Hero />
        <Features />
        <Pricing />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
