// @ts-nocheck
'use client';

import type { ClassifyUploadedImageOutput } from '@/ai/flows/classify-uploaded-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Sparkles, Tags, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type { CSSProperties, SyntheticEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResultsDisplayProps {
  result: ClassifyUploadedImageOutput;
  imagePreviewUrl: string;
  onScanAgain: () => void;
}

export default function ResultsDisplay({ result, imagePreviewUrl, onScanAgain }: ResultsDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const loadAndSetVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0) {
            const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
            let preferredVoice = 
                englishVoices.find(voice => voice.name.toLowerCase().includes('google') && voice.localService) ||
                englishVoices.find(voice => voice.name.toLowerCase().includes('microsoft') && voice.localService && (voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('mark'))) ||
                englishVoices.find(voice => ['Alex', 'Samantha', 'Daniel', 'Fiona', 'Google US English', 'Microsoft David Desktop - English (United States)', 'Microsoft Zira Desktop - English (United States)', 'Microsoft Mark Desktop - English (United States)'].includes(voice.name) && voice.localService) ||
                englishVoices.find(voice => voice.lang === 'en-US' && voice.localService) ||
                englishVoices.find(voice => voice.lang === 'en-US' && voice.default) ||
                englishVoices.find(voice => voice.lang === 'en-US') ||
                englishVoices.find(voice => voice.default) ||
                englishVoices[0];

            if (preferredVoice) {
                const utterance = new SpeechSynthesisUtterance();
                utterance.voice = preferredVoice;
            }
        }
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadAndSetVoices; // Use onvoiceschanged
      loadAndSetVoices(); 
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null; // Clear listener
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false); 
        }
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, [result.description]);

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        if (result.description && result.description.trim() !== "No description generated.") {
          const utterance = new SpeechSynthesisUtterance(result.description);
          
          if (availableVoices.length > 0) {
            const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
            let preferredVoice = 
                englishVoices.find(voice => voice.name.toLowerCase().includes('google') && voice.localService) || 
                englishVoices.find(voice => voice.name.toLowerCase().includes('microsoft') && voice.localService && (voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('mark'))) ||
                englishVoices.find(voice => ['Alex', 'Samantha', 'Daniel', 'Fiona'].includes(voice.name) && voice.localService) || 
                englishVoices.find(voice => voice.name.toLowerCase().includes('google us english')) || 
                englishVoices.find(voice => voice.lang === 'en-US' && voice.localService) || 
                englishVoices.find(voice => voice.lang === 'en-US' && voice.default) || 
                englishVoices.find(voice => voice.default) || 
                englishVoices[0]; 

            if (preferredVoice) {
              utterance.voice = preferredVoice;
              utterance.lang = preferredVoice.lang;
            } else {
              utterance.lang = 'en-US'; 
            }
          } else {
            utterance.lang = 'en-US';
          }
          
          utterance.pitch = 1; 
          utterance.rate = 0.95; 
          utterance.volume = 0.9; 

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            setIsSpeaking(false);
            toast({
              title: "Speech Error",
              description: `Could not read the description aloud. Error: ${event.error}. Ensure your browser has text-to-speech enabled.`,
              variant: "destructive",
            });
          };
          window.speechSynthesis.speak(utterance);
        } else {
           toast({
            title: "Nothing to read",
            description: "There is no description available to read aloud.",
            variant: "default",
          });
        }
      }
    } else {
      toast({
        title: "Unsupported Feature",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;
    setImageDimensions({ width: img.clientWidth, height: img.clientHeight });
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: 'hsl(var(--secondary))' }}>Uploaded Image</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <Image
              ref={imageRef}
              src={imagePreviewUrl}
              alt="Analyzed image"
              width={500} 
              height={400} 
              className="rounded-lg object-contain w-full max-h-[400px] shadow-inner"
              data-ai-hint="analyzed result"
              onLoad={handleImageLoad}
              priority 
            />
            {imageDimensions && result.labels && result.labels.map((labelData, index) => {
              if (!labelData.boundingBox) return null;

              const { x, y, width, height } = labelData.boundingBox;
              const boxLeft = x * imageDimensions.width;
              const boxTop = y * imageDimensions.height;
              const boxWidth = width * imageDimensions.width;
              const boxHeight = height * imageDimensions.height;
              
              if (index >= 10) return null; 

              const boxStyle: CSSProperties = {
                position: 'absolute',
                left: `${boxLeft}px`,
                top: `${boxTop}px`,
                width: `${boxWidth}px`,
                height: `${boxHeight}px`,
                border: '2px solid hsl(var(--primary))',
                boxSizing: 'border-box',
                zIndex: 9,
              };

              const labelTextStyle: CSSProperties = {
                position: 'absolute',
                left: `${boxLeft}px`,
                top: `${boxTop - 5}px`, 
                transform: 'translateY(-100%)', 
                backgroundColor: 'hsla(var(--primary-foreground), 0.85)',
                color: 'hsl(var(--primary))',
                padding: '2px 5px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
                border: '1px solid hsl(var(--primary))',
                whiteSpace: 'nowrap',
                zIndex: 10,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              };
              
              if (boxTop - 20 < 0) { 
                labelTextStyle.top = `${boxTop + boxHeight + 5}px`; // Position below box if no space above
                labelTextStyle.transform = 'translateY(0%)';
              }


              return (
                <div key={`vis-label-${index}-${labelData.label}`}>
                  <div style={boxStyle} />
                  <div style={labelTextStyle}>
                    {labelData.label} ({(labelData.confidence * 100).toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center gap-2">
              <Tags className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl" style={{ color: 'hsl(var(--secondary))' }}>Predicted Labels</CardTitle>
            </CardHeader>
            <CardContent>
              {result.labels && result.labels.length > 0 ? (
                <ul className="space-y-3">
                  {result.labels.slice(0, 5).map((labelData, index) => (
                    <li key={`${index}-${labelData.label}`} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{labelData.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {(labelData.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={labelData.confidence * 100} className="h-2" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No labels predicted or labels are not available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
             <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl" style={{ color: 'hsl(var(--secondary))' }}>AI Description</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                aria-label={isSpeaking ? "Stop reading description" : "Read description aloud"}
                title={isSpeaking ? "Stop reading description" : "Read description aloud"}
                className="text-primary hover:text-primary/80"
              >
                {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-foreground leading-relaxed">
                {result.description || "No description generated."}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Button 
          onClick={onScanAgain} 
          variant="outline" 
          size="lg" 
          className="text-lg border-accent text-accent hover:bg-accent/90 hover:text-accent-foreground"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Scan Another Image
        </Button>
      </div>
    </div>
  );
}
