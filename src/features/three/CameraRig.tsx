import { useFrame } from "@react-three/fiber";
import type { HomeMotion } from "@/lib/home-motion";

export function CameraRig({ motion }: { motion: HomeMotion }) {
  useFrame(({ camera }) => {
    camera.position.z = 6 - motion.heroProgress * 0.3;
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  }, -2);
  return null;
}
