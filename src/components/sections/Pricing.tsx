
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import RazorpayPayment from "@/components/payment/RazorpayPayment";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/auth/AuthDialog";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const { user, profile } = useAuth();

  const creditPackages = [
    {
      id: "starter",
      credits: 5,
      amount: 5000, // ₹50 in paise
      icon: Sparkles,
      title: "Starter Pack",
      description: "Perfect for getting started",
      features: [
        "5 Name Suggestions",
        "All Languages & Religions",
        "Zodiac Integration",
        "Basic Name Analysis",
      ],
      popular: false,
    },
    {
      id: "popular",
      credits: 15,
      amount: 12000, // ₹120 in paise (25% bonus)
      icon: Zap,
      title: "Popular Pack",
      description: "Most popular choice",
      features: [
        "15 Name Suggestions",
        "Detailed Name Meanings",
        "Cultural Context",
        "Priority Support",
        "25% Bonus Credits",
      ],
      popular: true,
    },
    {
      id: "premium",
      credits: 35,
      amount: 25000, // ₹250 in paise (40% bonus)
      icon: Crown,
      title: "Premium Pack",
      description: "Maximum value & features",
      features: [
        "35 Name Suggestions",
        "Premium Name Analysis",
        "Exclusive Collections",
        "VIP Support",
        "40% Bonus Credits",
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free, pay as you explore more beautiful names
          </p>
          {user && profile && (
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Current Credits: {profile.credits}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="glass-effect border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Free Start</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-4xl font-bold gradient-text pt-4">Free</div>
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
              {user ? (
                <Button className="w-full gradient-primary text-white hover:scale-105 transition-transform">
                  Start Generating Names
                </Button>
              ) : (
                <AuthDialog>
                  <Button className="w-full gradient-primary text-white hover:scale-105 transition-transform">
                    Get Started Free
                  </Button>
                </AuthDialog>
              )}
            </CardContent>
          </Card>

          {/* Credit Packages */}
          {creditPackages.map((pkg) => {
            const IconComponent = pkg.icon;
            return (
              <Card
                key={pkg.id}
                className={`glass-effect border-2 relative ${
                  pkg.popular
                    ? "border-secondary/20 ring-2 ring-secondary/20"
                    : "border-primary/10"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="gradient-primary px-4 py-1 rounded-full text-white text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{pkg.title}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="text-4xl font-bold gradient-text pt-4">
                    ₹{pkg.amount / 100}
                    <span className="text-base text-muted-foreground font-normal">
                      /{pkg.credits} credits
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  {user ? (
                    <RazorpayPayment
                      credits={pkg.credits}
                      amount={pkg.amount}
                      onSuccess={() => {
                        // Optional: redirect or show success message
                      }}
                    />
                  ) : (
                    <AuthDialog>
                      <Button className="w-full gradient-primary text-white hover:scale-105 transition-transform">
                        Sign In to Buy
                      </Button>
                    </AuthDialog>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
