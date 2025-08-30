
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Zap } from "lucide-react";

const Pricing = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free, pay as you explore more beautiful names
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="glass-effect border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Free Start</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-4xl font-bold gradient-text pt-4">
                Free
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>2 Free Name Suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>All Languages & Religions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Zodiac Integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Basic Name Analysis</span>
                </div>
              </div>
              <Button className="w-full gradient-primary text-white hover:scale-105 transition-transform">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-2 border-secondary/20 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="gradient-primary px-4 py-1 rounded-full text-white text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-full bg-secondary/10 w-fit mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Credit Pack</CardTitle>
              <CardDescription>More suggestions, more options</CardDescription>
              <div className="text-4xl font-bold gradient-text pt-4">
                ₹50
                <span className="text-base text-muted-foreground font-normal">
                  /5 credits
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-secondary" />
                  <span>5 Name Suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-secondary" />
                  <span>Detailed Name Meanings</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-secondary" />
                  <span>Cultural Context</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-secondary" />
                  <span>Priority Support</span>
                </div>
              </div>
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-white hover:scale-105 transition-transform">
                Buy Credits
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
