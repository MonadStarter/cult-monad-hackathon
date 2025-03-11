"use client";

import * as React from "react";
import "./styles.css";
import * as SliderPrimitive from "@radix-ui/react-slider";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root ref={ref} className="SliderRoot" defaultValue={[50]} max={100} step={1} {...props}>
    <SliderPrimitive.Track className="SliderTrack">
      <SliderPrimitive.Range className="SliderRange" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="SliderThumb" aria-label="Volume" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };