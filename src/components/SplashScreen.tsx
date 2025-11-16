import React, { useEffect } from "react";
import { useRive } from "@rive-app/react-canvas";

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  // We no longer need the 'animationLevel' state
  // const [animationLevel, setAnimationLevel] = useState(0);

  const { RiveComponent, rive } = useRive({
    src: "/TreeW.riv",
    stateMachines: "State Machine 1",
    artboard: "Artboard",
    autoplay: true,
  });

  // This single useEffect now handles the entire animation loop
  useEffect(() => {
    // Don't start until Rive is loaded
    if (!rive) return;

    // Find the Rive input
    const inputs = rive.stateMachineInputs("State Machine 1");
    if (!inputs) return;

    const numGrowingInput = inputs.find(
      (input) => input.name === "Numgrowing"
    );

    if (!numGrowingInput) {
      console.warn("Rive input 'Numgrowing' not found");
      // Still call onAnimationComplete to avoid getting stuck
      onAnimationComplete();
      return;
    }

    // --- Animation Parameters (Easy to change) ---

    // The total time for the tree to grow from 0 to 100
    // (Faster: 2000ms = 2 seconds)
    const totalGrowthDuration = 2000;
    
    // The final pause time after the tree is fully grown
    // (Faster: 500ms = 0.5 seconds)
    const finalPauseDuration = 500;

    // --- End of Parameters ---

    let frameId: number | null = null;
    let pauseTimeoutId: NodeJS.Timeout | null = null;
    let startTime: number | null = null;

    // This is our new animation loop
    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp; // Set start time on first frame
      }

      const elapsed = timestamp - startTime;
      
      // Calculate progress as a value from 0.0 to 1.0
      const progress = Math.min(elapsed / totalGrowthDuration, 1);

      // Apply the value (0-100) directly to the Rive input
      // This is much smoother and more performant than using React state
      numGrowingInput.value = progress * 100;

      // Check if the growth animation is finished
      if (progress < 1) {
        // Keep animating
        frameId = requestAnimationFrame(animate);
      } else {
        // Growth is done, now start the final pause
        console.log("Tree growth finished, pausing...");
        numGrowingInput.value = 100; // Ensure it's exactly 100
        
        pauseTimeoutId = setTimeout(() => {
          console.log("Animation complete, transitioning...");
          onAnimationComplete();
        }, finalPauseDuration);
      }
    };

    // Start the animation loop
    frameId = requestAnimationFrame(animate);

    // Cleanup function: This is crucial!
    // It stops the animation if the component is unmounted
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (pauseTimeoutId) {
        clearTimeout(pauseTimeoutId);
      }
    };
    
  // We only depend on rive (to start) and the callback
  }, [rive, onAnimationComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#FFFACD] min-h-screen">
      {/* Rive Animation Container */}
      <div className="w-full h-64 max-w-sm mx-auto mb-8">
        <RiveComponent />
      </div>

      {/* App Title */}
      <h1 className="text-5xl text-black mt-8 font-serif font-bold">
        BudgetBloom
      </h1>
      
      {/* Loading indicator */}
      <p className="text-gray-600 mt-4 text-sm animate-pulse">
        Growing your money tree...
      </p>
    </div>
  );
}