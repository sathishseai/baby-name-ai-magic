
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart } from "lucide-react";

interface NameResult {
  name: string;
  meaning?: string;
  origin?: string;
  gender?: string;
}

interface NameResultsProps {
  results: NameResult[];
  isLoading: boolean;
}

const NameResults = ({ results, isLoading }: NameResultsProps) => {
  if (isLoading) {
    return (
      <Card className="glass-effect border-0 mt-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-6 h-6 animate-spin gradient-text" />
            <p className="text-lg">Generating beautiful names for your baby...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="glass-effect border-0 mt-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 gradient-text">
          <Heart className="w-6 h-6" />
          <span>Generated Names</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-white">{result.name}</h3>
                {result.gender && (
                  <Badge variant="outline" className="text-xs">
                    {result.gender}
                  </Badge>
                )}
              </div>
              {result.meaning && (
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-medium">Meaning:</span> {result.meaning}
                </p>
              )}
              {result.origin && (
                <p className="text-sm text-gray-400">
                  <span className="font-medium">Origin:</span> {result.origin}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NameResults;
