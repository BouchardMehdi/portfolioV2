import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  Euler,
  Group,
  PerspectiveCamera,
  Quaternion,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import type { HomeMotion } from "@/lib/home-motion";
import {
  poireScreens,
  poireSegment as segment,
} from "@/features/selected-work/poire-story";

export function PoireInterface({
  motion,
  target,
}: {
  motion: HomeMotion;
  target: HTMLElement;
}) {
  const group = useRef<Group>(null);
  const frame = useRef<Group>(null);
  const destination = useMemo(() => new Vector3(), []);
  const flatRotation = useMemo(
    () => new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0)),
    [],
  );
  const readingBounds = useRef({ top: 0, bottom: 0, height: 0, width: 0 });
  const screens = useRef<(Group | null)[]>([]);
  const [textures, setTextures] = useState<Record<string, Texture>>({});
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    let started = false,
      cancelled = false;
    const loaded: Texture[] = [];
    const load = () => {
      if (started || motion.poireProgress < 0.62) return;
      started = true;
      poireScreens.forEach((screen) => {
        new TextureLoader().load(
          `/projects/ramenetapoire/${screen.file}`,
          (texture) => {
            if (cancelled) {
              texture.dispose();
              return;
            }
            texture.colorSpace = SRGBColorSpace;
            texture.repeat.set(
              screen.focus.width / screen.width,
              screen.focus.height / screen.height,
            );
            texture.offset.set(
              screen.focus.x / screen.width,
              1 - (screen.focus.y + screen.focus.height) / screen.height,
            );
            texture.anisotropy = Math.min(
              4,
              gl.capabilities.getMaxAnisotropy(),
            );
            loaded.push(texture);
            setTextures((previous) => ({ ...previous, [screen.id]: texture }));
            invalidate();
          },
          undefined,
          () => {
            /* La capture HTML prend le relais si la texture est indisponible. */
          },
        );
      });
    };
    load();
    const unsubscribe = motion.subscribe(load);
    return () => {
      cancelled = true;
      unsubscribe();
      loaded.forEach((texture) => texture.dispose());
      delete target.dataset.poireScreenReady;
    };
  }, [motion, gl, invalidate, target]);
  useEffect(() => {
    const panel = target.closest<HTMLElement>(".poire-panel")!;
    const stage = target.closest<HTMLElement>(".selected-work__stage")!;
    const measure = () => {
      const bounds = stage.getBoundingClientRect();
      const copy = panel
        .querySelector<HTMLElement>("[data-poire-beat]:not([hidden])")
        ?.getBoundingClientRect();
      const technologies = panel
        .querySelector<HTMLElement>(".work-technologies")
        ?.getBoundingClientRect();
      const footer = stage
        .querySelector<HTMLElement>(".selected-work__footer")
        ?.getBoundingClientRect();
      readingBounds.current = {
        width: bounds.width,
        height: bounds.height,
        top:
          Math.max(
            copy?.bottom ?? bounds.top,
            technologies?.bottom ?? bounds.top,
          ) -
          bounds.top +
          24,
        bottom: (footer?.top ?? bounds.bottom) - bounds.top - 28,
      };
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(panel.querySelector(".poire-copy")!);
    const unsubscribe = motion.subscribe(measure);
    measure();
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [motion, target]);
  useFrame(({ camera }) => {
    if (
      !group.current ||
      !frame.current ||
      !(camera instanceof PerspectiveCamera)
    )
      return;
    const p = motion.poireProgress;
    const arrival = segment(p, 0.705, 0.752);
    const departure = segment(p, 0.931, 0.952);
    const index = p >= 0.88 ? 2 : p >= 0.8 ? 1 : 0;
    const ready = Boolean(textures[poireScreens[index].id]);
    const focus = poireScreens[index].focus;
    const aspect = focus.width / focus.height;
    const bounds = readingBounds.current;
    const availableHeight = Math.max(1, bounds.bottom - bounds.top);
    const width = Math.min(bounds.width * 0.84, availableHeight * aspect);
    const viewHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * 9;
    const scale = ((width / Math.max(1, bounds.height)) * viewHeight) / 8.9;
    const centerY = (bounds.top + bounds.bottom) / 2;
    destination
      .set(0, (0.5 - centerY / Math.max(1, bounds.height)) * viewHeight, -9)
      .applyQuaternion(camera.quaternion)
      .add(camera.position);
    group.current.visible = p >= 0.7 && p < 0.954 && ready;
    group.current.position
      .set(0, 0.25, 0.4)
      .lerp(destination, arrival * (1 - departure));
    group.current.quaternion
      .copy(flatRotation)
      .slerp(camera.quaternion, arrival * (1 - departure));
    group.current.scale.setScalar(
      Math.max(0.001, (0.16 + (scale - 0.16) * arrival) * (1 - departure)),
    );
    frame.current.scale.y = 8.6 / aspect / 4.1;
    screens.current.forEach((screen, i) => {
      if (screen) screen.visible = i === index;
    });
    if (ready) target.setAttribute("data-poire-screen-ready", "true");
    else target.removeAttribute("data-poire-screen-ready");
  });
  return (
    <group ref={group}>
      <group ref={frame}>
        <RoundedBox args={[8.9, 4.36, 0.13]} radius={0.09} smoothness={3}>
          <meshStandardMaterial color="#61735b" roughness={0.9} />
        </RoundedBox>
        <RoundedBox
          args={[8.72, 4.18, 0.035]}
          position={[0, 0, 0.075]}
          radius={0.04}
          smoothness={2}
        >
          <meshStandardMaterial color="#f4f0e4" roughness={0.85} />
        </RoundedBox>
        {poireScreens.map((screen, index) => (
          <group
            key={screen.id}
            ref={(element) => {
              screens.current[index] = element;
            }}
          >
            {textures[screen.id] && (
              <mesh position={[0, 0, 0.098]}>
                <planeGeometry args={[8.6, 4.1]} />
                <meshBasicMaterial
                  map={textures[screen.id]}
                  toneMapped={false}
                />
              </mesh>
            )}
          </group>
        ))}
        <RoundedBox
          args={[2.2, 0.1, 0.7]}
          position={[0, -2.24, -0.1]}
          radius={0.04}
          smoothness={2}
        >
          <meshStandardMaterial color="#a98556" roughness={0.9} />
        </RoundedBox>
      </group>
    </group>
  );
}
