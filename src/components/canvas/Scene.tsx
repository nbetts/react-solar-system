import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { PerspectiveCameraProps, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import store, { updateAppSetting } from "src/data/store";
import SpaceBackground from "./SpaceBackground";
import DebugInfo from "./DebugInfo";
import PostProcessingEffects from "./PostProcessingEffects";
import { sun } from "src/data/astronomicalBodyData";
import AstronomicalBody from "./AstronomicalBody";

const Scene = () => {
  const cameraRef = useRef<PerspectiveCameraProps>(null!);
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  useFrame(() => {
    const { appSettings, userSettings } = store.getRawState();

    if (appSettings.timeStepModifier !== userSettings.timeSpeedModifier) {
      updateAppSetting("timeStepModifier", userSettings.timeSpeedModifier);
      updateAppSetting("timeStep", Math.exp(userSettings.timeSpeedModifier * 20) * 0.00001);
    }

    const cameraDistance = controlsRef.current.getDistance();

    if (cameraDistance !== appSettings.cameraDistance) {
      updateAppSetting("cameraDistance", cameraDistance);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[3, 1, 3]} near={100} far={110000000000} />
      <OrbitControls ref={controlsRef} maxDistance={100000000000} />
      <SpaceBackground />
      <ambientLight color={sun.color} intensity={0.02} />
      <AstronomicalBody {...sun} cameraRef={cameraRef} controlsRef={controlsRef} />
      <DebugInfo />
      {/* <PostProcessingEffects /> */}
    </>
  );
};

export default Scene;
