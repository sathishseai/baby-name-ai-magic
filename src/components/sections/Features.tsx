
import { Globe, Heart, Star, Calendar, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Discover names from over 50 languages and cultures worldwide"
    },
    {
      icon: Star,
      title: "Zodiac Integration",
      description: "Get names that align with your baby's zodiac sign and birth date"
    },
    {
      icon: Heart,
      title: "Religious Significance",
      description: "Find names with deep religious and spiritual meanings"
    },
    {
      icon: Calendar,
      title: "Birth Date Analysis",
      description: "Personalized suggestions based on your baby's birth date"
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Advanced AI analyzes your preferences for perfect matches"
    },
    {
      icon: Users,
      title: "Family Emotions",
      description: "Include family traditions and emotional preferences"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Choose <span className="gradient-text">NameMe</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive approach ensures you find the perfect name that resonates with your family's values and traditions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="glass-effect border-0 hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full gradient-primary w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
