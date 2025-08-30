
import { Button } from "@/components/ui/button";
import { ArrowRight, Baby, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      <div className="absolute inset-0 gradient-primary opacity-10"></div>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full glass-effect">
              <Baby className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Find the Perfect
            <span className="gradient-text block mt-2">Baby Name</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover meaningful names with our AI-powered platform. Get personalized suggestions based on culture, religion, zodiac signs, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/generate">
              <Button size="lg" className="gradient-primary text-white px-8 py-4 text-lg rounded-full hover:scale-105 transition-transform">
                Start Finding Names
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>2 Free Credits • No Credit Card Required</span>
            </div>
          </div>
          
          <div className="pt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-muted-foreground">Names Suggested</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold gradient-text">50+</div>
                <div className="text-muted-foreground">Languages Supported</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold gradient-text">98%</div>
                <div className="text-muted-foreground">Parent Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
