import { Canvas } from "@react-three/fiber";
import { FoodShareScene } from "./FoodShareScene";

export default function ProductVisualInner() {
  return (
    <Canvas className="h-full w-full">
      <FoodShareScene />
    </Canvas>
  );
}
