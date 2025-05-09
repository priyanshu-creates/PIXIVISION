'use server';

/**
 * @fileOverview Image classification AI agent that predicts labels with confidence scores for uploaded images, including bounding boxes for objects.
 *
 * - classifyUploadedImage - A function that handles the image classification process.
 * - ClassifyUploadedImageInput - The input type for the classifyUploadedImage function.
 * - ClassifyUploadedImageOutput - The return type for the classifyUploadedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyUploadedImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the image to classify, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyUploadedImageInput = z.infer<typeof ClassifyUploadedImageInputSchema>;

const ClassifyUploadedImageOutputSchema = z.object({
  labels: z
    .array(
      z.object({
        label: z.string().describe('The predicted label for the image.'),
        confidence: z.number().describe('The confidence score for the predicted label (0-1).'),
        boundingBox: z.object({
          x: z.number().describe('Normalized X coordinate of the top-left corner of the bounding box (0-1).'),
          y: z.number().describe('Normalized Y coordinate of the top-left corner of the bounding box (0-1).'),
          width: z.number().describe('Normalized width of the bounding box (0-1).'),
          height: z.number().describe('Normalized height of the bounding box (0-1).')
        }).optional().describe('The bounding box of the detected label on the image. Coordinates are normalized (0-1), origin at top-left. Provided for distinct objects.')
      })
    )
    .describe('A list of predicted labels, their confidence scores, and optional bounding boxes.'),
  description: z.string().describe('A natural language description of the image based on the predicted labels.'),
});
export type ClassifyUploadedImageOutput = z.infer<typeof ClassifyUploadedImageOutputSchema>;

export async function classifyUploadedImage(input: ClassifyUploadedImageInput): Promise<ClassifyUploadedImageOutput> {
  return classifyUploadedImageFlow(input);
}

const classifyUploadedImagePrompt = ai.definePrompt({
  name: 'classifyUploadedImagePrompt',
  input: {schema: ClassifyUploadedImageInputSchema},
  output: {schema: ClassifyUploadedImageOutputSchema},
  prompt: `You are an AI vision model that classifies images and generates descriptions.
  Analyze the image and provide a list of predicted labels with confidence scores.
  For distinct, clearly identifiable objects in the image, also provide a 'boundingBox' object containing 'x', 'y', 'width', and 'height' normalized (0-1 range) coordinates for each. 'x' and 'y' should be the top-left corner. If an object cannot be clearly bounded or is not a distinct object (e.g., "sky", "outdoor scene"), omit the boundingBox for that label.
  Then, generate a natural language description of the image based on the predicted labels. Choose the most appropriate level of detail for the description.

  Image: {{media url=photoDataUri}}
  `,
  config: { // Added safety settings as per guidelines, can be adjusted
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }
});

const classifyUploadedImageFlow = ai.defineFlow(
  {
    name: 'classifyUploadedImageFlow',
    inputSchema: ClassifyUploadedImageInputSchema,
    outputSchema: ClassifyUploadedImageOutputSchema,
  },
  async input => {
    const {output} = await classifyUploadedImagePrompt(input);
    return output!;
  }
);
