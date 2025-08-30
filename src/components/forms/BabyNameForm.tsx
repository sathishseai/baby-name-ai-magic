import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import NameResults from "@/components/results/NameResults";

interface NameResult {
  name: string;
  meaning?: string;
  origin?: string;
  gender?: string;
}

const BabyNameForm = () => {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<NameResult[]>([]);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    gender: "",
    language: "",
    religion: "",
    startingLetters: "",
    zodiacSign: "",
    meaning: "",
    emotions: ""
  });

  const genders = ["Boy", "Girl", "Unisex"];
  const languages = ["Hindi", "English", "Sanskrit", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Punjabi", "Malayalam", "Kannada", "Urdu"];
  const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Other"];
  const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResults([]);
    
    const submissionData = {
      ...formData,
      birthDate: date ? format(date, "yyyy-MM-dd") : null
    };
    
    console.log("Submitting data to webhook:", submissionData);
    
    try {
      const response = await fetch('https://n8n.srv932017.hstgr.cloud/webhook-test/getbabyname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Webhook response:", result);
        
        // Handle different response formats
        let nameResults: NameResult[] = [];
        
        if (Array.isArray(result)) {
          nameResults = result;
        } else if (result.names && Array.isArray(result.names)) {
          nameResults = result.names;
        } else if (result.data && Array.isArray(result.data)) {
          nameResults = result.data;
        } else if (typeof result === 'object' && result.name) {
          nameResults = [result];
        }
        
        setResults(nameResults);
        
        toast({
          title: "Success!",
          description: `Generated ${nameResults.length} name${nameResults.length !== 1 ? 's' : ''} for you.`,
        });
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error calling webhook:", error);
      toast({
        title: "Error",
        description: "Failed to generate names. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass-effect border-0">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 rounded-full gradient-primary w-fit mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-3xl gradient-text">Find Your Perfect Name</CardTitle>
          <CardDescription className="text-lg">
            Fill in your preferences and let our AI suggest beautiful names for your baby
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender.toLowerCase()}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select onValueChange={(value) => handleInputChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language.toLowerCase()}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Select onValueChange={(value) => handleInputChange("religion", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map((religion) => (
                      <SelectItem key={religion} value={religion.toLowerCase()}>
                        {religion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startingLetters">Starting Letters</Label>
                <Input
                  id="startingLetters"
                  placeholder="e.g., A, Ra, Dev"
                  value={formData.startingLetters}
                  onChange={(e) => handleInputChange("startingLetters", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zodiacSign">Zodiac Sign</Label>
                <Select onValueChange={(value) => handleInputChange("zodiacSign", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zodiac sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {zodiacSigns.map((sign) => (
                      <SelectItem key={sign} value={sign.toLowerCase()}>
                        {sign}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meaning">Desired Meaning</Label>
              <Textarea
                id="meaning"
                placeholder="e.g., strength, wisdom, prosperity, happiness"
                value={formData.meaning}
                onChange={(e) => handleInputChange("meaning", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotions">Family Emotions & Traditions</Label>
              <Textarea
                id="emotions"
                placeholder="Share any family traditions, emotions, or special preferences for the name"
                value={formData.emotions}
                onChange={(e) => handleInputChange("emotions", e.target.value)}
                rows={3}
              />
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full gradient-primary text-white text-lg py-6 hover:scale-105 transition-transform"
              >
                {isSubmitting ? "Generating..." : "Generate Names (1 Credit)"}
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <NameResults results={results} isLoading={isSubmitting} />
    </div>
  );
};

export default BabyNameForm;
