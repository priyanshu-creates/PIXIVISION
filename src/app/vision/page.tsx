'use client';

import { useState } from 'react';
import ImageUploadForm from './components/ImageUploadForm';
import ResultsDisplay from './components/ResultsDisplay';
import type { ClassifyUploadedImageOutput } from '@/ai/flows/classify-uploaded-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VisionPage() {
  const [result, setResult] = useState<ClassifyUploadedImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleProcessingStart = (previewUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setImagePreviewUrl(previewUrl);
  };

  const handleProcessingComplete = (
    data: ClassifyUploadedImageOutput | null,
    errorMessage?: string
  ) => {
    setIsLoading(false);
    if (errorMessage) {
      setError(errorMessage);
      setResult(null);
    } else if (data) {
      setResult(data);
      setError(null);
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setIsLoading(false);
    setError(null);
    setImagePreviewUrl(null);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold" style={{ color: 'hsl(var(--secondary))' }}>
            Analyze Your Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!result && !isLoading && (
            <ImageUploadForm
              onProcessingStart={handleProcessingStart}
              onProcessingComplete={handleProcessingComplete}
            />
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 min-h-[200px]">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-xl text-muted-foreground">Analyzing your image, please wait...</p>
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="Uploading preview" className="mt-4 max-w-xs max-h-64 rounded-lg shadow-md object-contain" />
              )}
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTitle>Processing Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && !isLoading && imagePreviewUrl && (
            <ResultsDisplay
              result={result}
              imagePreviewUrl={imagePreviewUrl}
              onScanAgain={handleScanAgain}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
