'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { classifyUploadedImage, type ClassifyUploadedImageOutput } from '@/ai/flows/classify-uploaded-image';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploadFormProps {
  onProcessingStart: (previewUrl: string) => void;
  onProcessingComplete: (result: ClassifyUploadedImageOutput | null, error?: string) => void;
}

export default function ImageUploadForm({ onProcessingStart, onProcessingComplete }: ImageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG, PNG, WEBP, or GIF image.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !previewUrl) {
      toast({
        title: 'No image selected',
        description: 'Please select an image file to upload.',
        variant: 'destructive',
      });
      return;
    }

    onProcessingStart(previewUrl);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;
        const result = await classifyUploadedImage({ photoDataUri });
        onProcessingComplete(result);
        toast({
          title: 'Analysis Complete',
          description: 'Image processed successfully.',
        });
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        onProcessingComplete(null, 'Failed to read the image file.');
        toast({
          title: 'Error Reading File',
          description: 'Could not read the selected image file.',
          variant: 'destructive',
        });
      };
    } catch (err) {
      console.error('Classification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image analysis.';
      onProcessingComplete(null, errorMessage);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const clearPreview = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="image-upload" className="text-lg font-medium mb-2 block">
          Upload Your Image
        </Label>
        <div 
          className="mt-2 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
              // Simulate a change event
              if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(droppedFile);
                fileInputRef.current.files = dataTransfer.files;
                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="flex text-sm text-muted-foreground">
              <span className="text-primary font-semibold">Click to upload</span>&nbsp;or drag and drop
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP up to 5MB</p>
          </div>
          <Input
            id="image-upload"
            name="image-upload"
            type="file"
            className="sr-only" 
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
      </div>

      {previewUrl && (
        <div className="mt-4 p-4 border rounded-md shadow-sm relative">
          <h3 className="text-lg font-medium mb-2 text-foreground">Image Preview</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={clearPreview}
            aria-label="Clear preview"
          >
            <X className="h-5 w-5" />
          </Button>
          <Image
            src={previewUrl}
            alt="Image preview"
            width={400}
            height={300}
            className="rounded-md object-contain max-h-80 w-auto mx-auto"
            data-ai-hint="uploaded image"
          />
        </div>
      )}

      <Button type="submit" className="w-full text-lg py-3" disabled={!file}>
        Analyze Image
      </Button>
    </form>
  );
}
