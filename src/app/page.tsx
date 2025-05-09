import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ScanEye, Bot, Brain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12">
      <section className="mt-10 md:mt-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Unlock the Story in Your Images with <span style={{ color: 'hsl(var(--primary))' }}>PIXIVISION</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Upload any image and let our advanced AI provide insightful classifications and captivating descriptions. Discover the unseen details and narratives within your visuals.
        </p>
        {/* The "Get Started Free" button Link was previously here and has been removed as per user request. */}
      </section>

      <section className="w-full max-w-5xl grid md:grid-cols-3 gap-8 my-16">
        <Card className="text-left shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
               <ScanEye className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl" style={{ color: 'hsl(var(--secondary))' }}>Instant Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Our AI swiftly analyzes your image, identifying objects, scenes, and concepts with remarkable accuracy.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-left shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl" style={{ color: 'hsl(var(--secondary))' }}>AI-Generated Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Receive a human-like, natural language description that beautifully articulates the essence of your image.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-left shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
               <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl" style={{ color: 'hsl(var(--secondary))' }}>Confidence Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Understand the AI's certainty with clear confidence scores for each predicted label.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
      

      <section className="py-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to See the Unseen?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Dive into the world of AI-powered image analysis. It's simple, fast, and free to try.
        </p>
        <Link href="/vision">
          <Button size="lg" className="text-lg px-8 py-6">
            Try PIXIVISION Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

