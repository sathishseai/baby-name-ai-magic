
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Sparkles, Eye } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NameResults from "@/components/results/NameResults";
import { parseNamesFromText, tryParseJson, stripCodeFences, type NameResult } from "@/utils/nameParser";

const BabyNameForm = () => {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<NameResult[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
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

  // Helper function to convert any data to NameResult format
  const toNameResult = (item: any): NameResult | null => {
    if (typeof item === 'string') {
      return { name: item };
    }
    
    if (typeof item === 'object' && item !== null) {
      const name = item.name || item.Name || item.babyName || item.baby_name || 
                   item.fullName || item.full_name || item.title || item.value;
      
      if (name && typeof name === 'string') {
        return {
          name: name,
          meaning: item.meaning || item.Meaning || item.description || item.desc,
          origin: item.origin || item.Origin || item.language || item.Language,
          gender: item.gender || item.Gender || item.sex || item.Sex
        };
      }
    }
    
    return null;
  };

  // Enhanced function to normalize various response formats including JSON wrapped in code fences
  const normalizeResults = (data: any): NameResult[] => {
    console.log("Normalizing webhook response:", data);
    
    if (!data) return [];
    
    // Handle text responses (prioritize JSON parsing)
    if (typeof data === 'string') {
      const parsed = tryParseJson(data);
      if (parsed) {
        console.log("Successfully parsed JSON from string:", parsed);
        return normalizeResults(parsed);
      }
      // If not JSON, try to parse as formatted text
      const textResults = parseNamesFromText(stripCodeFences(data));
      console.log("Parsed text results:", textResults);
      return textResults;
    }
    
    // Handle objects with an 'output' property (like your n8n response)
    if (typeof data === 'object' && data.output) {
      if (typeof data.output === 'string') {
        const parsed = tryParseJson(data.output);
        if (parsed) {
          console.log("Successfully parsed JSON from output:", parsed);
          return normalizeResults(parsed);
        }
        // If not JSON, try to parse as formatted text
        const textResults = parseNamesFromText(stripCodeFences(data.output));
        console.log("Parsed output text results:", textResults);
        return textResults;
      }
      return normalizeResults(data.output);
    }
    
    // Handle arrays directly
    if (Array.isArray(data)) {
      const results = data.map(toNameResult).filter(Boolean) as NameResult[];
      console.log("Normalized array results:", results);
      return results;
    }
    
    // Handle objects with array properties
    if (typeof data === 'object') {
      const possibleArrayKeys = ['names', 'data', 'results', 'items', 'list', 'babyNames', 'baby_names'];
      
      for (const key of possibleArrayKeys) {
        if (data[key] && Array.isArray(data[key])) {
          const results = data[key].map(toNameResult).filter(Boolean) as NameResult[];
          console.log(`Normalized results from ${key}:`, results);
          return results;
        }
      }
      
      // Try to convert single object to name result
      const singleResult = toNameResult(data);
      if (singleResult) {
        console.log("Normalized single result:", [singleResult]);
        return [singleResult];
      }
    }
    
    console.log("Could not normalize results, returning empty array");
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResults([]);
    setRawResponse(null);
    
    const submissionData = {
      ...formData,
      birthDate: date ? format(date, "yyyy-MM-dd") : null
    };
    
    console.log("Submitting data to Supabase Edge Function proxy:", submissionData);
    
    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: submissionData,
      });

      console.log("Edge Function response:", { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to call Edge Function');
      }
      
      console.log("Webhook response via proxy:", data);
      setRawResponse(data);
      
      const nameResults = normalizeResults(data);
      setResults(nameResults);
      
      if (nameResults.length > 0) {
        toast({
          title: "Success!",
          description: `Generated ${nameResults.length} name${nameResults.length !== 1 ? 's' : ''} for you.`,
        });
      } else {
        toast({
          title: "No Names Found",
          description: "The webhook returned data but no names could be extracted. Check the debug panel for details.",
          variant: "destructive",
        });
        setShowDebug(true);
      }
    } catch (error) {
      console.error("Error calling Edge Function proxy:", error);
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

      {/* Debug Panel */}
      {rawResponse && results.length === 0 && (
        <Card className="glass-effect border-0 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-orange-400">No Names Found</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showDebug ? "Hide" : "View"} Raw Response
              </Button>
            </CardTitle>
          </CardHeader>
          {showDebug && (
            <CardContent>
              <div className="bg-slate-900/50 p-4 rounded-lg overflow-auto max-h-64">
                <pre className="text-sm text-gray-300">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                The webhook returned data but no names could be extracted. Please check if your webhook returns names in the expected format.
              </p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default BabyNameForm;
