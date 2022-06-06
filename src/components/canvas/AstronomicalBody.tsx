import { PerspectiveCameraProps, useFrame } from "@react-three/fiber";
import { MutableRefObject, useEffect, useRef } from "react";
import { AstronomicalBodyProps } from "src/data/astronomicalBodyData";
import { Html, useTexture } from "@react-three/drei";
import store, { updateAppSetting, updateRefSetting, updateUserSetting } from "src/data/store";
import { Mesh } from "three/src/objects/Mesh";
import { Object3D } from "three/src/core/Object3D";
import { Vector3 } from "three/src/math/Vector3";
import { PointLight } from "three/src/lights/PointLight";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { DoubleSide } from "three/src/constants";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { RingGeometry } from "three/src/geometries/RingGeometry";
import OrbitPath from "./OrbitPath";

type Props = {
  cameraRef: MutableRefObject<PerspectiveCameraProps>;
  controlsRef: MutableRefObject<OrbitControlsImpl>;
} & AstronomicalBodyProps;

const AstronomicalBody = ({ cameraRef, controlsRef, ...props }: Props) => {
  const showLabels = store.useState((s) => s.userSettings.showLabels);
  const showDebugInfo = store.useState((s) => s.userSettings.showDebugInfo);
  const actualScale = store.useState((s) => s.userSettings.actualScale);
  const quality = store.useState((s) => s.userSettings.quality);
  const divisionQuality = quality === "High" ? 32 : 16;

  const bodyOrbitRef = useRef<Object3D>(null!);
  const bodyPositionRef = useRef<Object3D>(null!);
  const bodyRef = useRef<Object3D>(null!);
  const bodyMeshRef = useRef<Mesh>(null!);
  const ringGeometryRef = useRef<RingGeometry>(null!);
  const pointLightRef = useRef<PointLight>(null!);
  const directionalLightRef = useRef<DirectionalLight>(null!);
  const bodyTexture = props.textureSrc ? useTexture(props.textureSrc) : null;
  const ringTexture = props.ring?.textureSrc ? useTexture(props.ring.textureSrc) : null;

  // useFrame refs
  const currentBodyPositionVectorRef = useRef<Vector3>(new Vector3());
  const nextBodyPositionVectorRef = useRef<Vector3>(new Vector3());
  const bodyFocusVectorRef = useRef<Vector3>(new Vector3());

  const focusBody = () => {
    if (store.getRawState().userSettings.focusedBody !== props.name) {
      updateUserSetting("focusedBody", props.name);
      updateAppSetting("focusingBody", true);
    }
  };

  // Rotate the initial body orbit positions by a random amount around the orbit circle.
  useEffect(() => {
    const randomAngleAlongOrbit = Math.floor(Math.random() * Math.PI * 2);
    bodyOrbitRef.current.rotation.y += randomAngleAlongOrbit;
    bodyPositionRef.current.rotation.y -= randomAngleAlongOrbit;

    // Rotate the moon so that the correct side is facing the Earth.
    if (props.name === "Moon") {
      bodyRef.current.rotation.y += randomAngleAlongOrbit + Math.PI;
    }
  }, []);

  useEffect(() => {
    updateRefSetting("lightSourceMeshRef", bodyMeshRef);
  }, [props.isLight]);

  useEffect(() => {
    updateAppSetting("focusingBody", true);
  }, [actualScale]);

  useEffect(() => {
    bodyFocusVectorRef.current.set(props.radius * 4, props.radius * 1.25, props.radius * 4);
  }, [props.radius]);

  /**
   * Ensure texture is mapped in a concentric way. Credits:
   * - https://stackoverflow.com/a/43024222
   * - https://stackoverflow.com/a/23659708
   */
  useEffect(() => {
    if (ringTexture) {
      const uvs = ringGeometryRef.current.attributes.uv.array as number[];
      const phiSegments = ringGeometryRef.current.parameters.phiSegments;
      const thetaSegments = ringGeometryRef.current.parameters.thetaSegments;

      for (var c = 0, j = 0; j <= phiSegments; j++) {
        for (var i = 0; i <= thetaSegments; i++) {
          uvs[c++] = j / phiSegments;
          uvs[c++] = i / thetaSegments;
        }
      }
    }
  }, [divisionQuality, actualScale, ringTexture]);

  /**
   * Initialize lighting and shadows.
   */
  useEffect(() => {
    if (pointLightRef.current) {
      pointLightRef.current.shadow.camera.far = 1500000; // approximately the farthest toon orbit radius
    }

    if (directionalLightRef.current) {
      directionalLightRef.current.shadow.camera.far = 6000000000; // approximately the farthest real orbit radius
    }
  }, [actualScale, pointLightRef, directionalLightRef]);

  useFrame(() => {
    const { appSettings, userSettings } = store.getRawState();

    bodyRef.current.getWorldPosition(currentBodyPositionVectorRef.current);

    if (userSettings.timeSpeedModifier > 0) {
      bodyOrbitRef.current.rotation.y += props.orbit.rotationPeriod * appSettings.timeStep;
      bodyPositionRef.current.rotation.y -= props.orbit.rotationPeriod * appSettings.timeStep;
      bodyRef.current.rotation.y += props.rotationPeriod * appSettings.timeStep;
    }

    if (userSettings.focusedBody === props.name) {
      const cameraPosition = cameraRef.current.position as Vector3;
      bodyRef.current.getWorldPosition(nextBodyPositionVectorRef.current);
      controlsRef.current.target = nextBodyPositionVectorRef.current;

      if (appSettings.focusingBody) {
        cameraPosition.x = nextBodyPositionVectorRef.current.x - bodyFocusVectorRef.current.x;
        cameraPosition.y = nextBodyPositionVectorRef.current.y + bodyFocusVectorRef.current.y;
        cameraPosition.z = nextBodyPositionVectorRef.current.z + bodyFocusVectorRef.current.z;

        // Prevent the camera from being inside the bodies.
        controlsRef.current.minDistance = props.radius + cameraRef.current.near!;

        updateAppSetting("focusingBody", false);
      } else {
        cameraPosition.x += nextBodyPositionVectorRef.current.x - currentBodyPositionVectorRef.current.x;
        cameraPosition.y += nextBodyPositionVectorRef.current.y - currentBodyPositionVectorRef.current.y;
        cameraPosition.z += nextBodyPositionVectorRef.current.z - currentBodyPositionVectorRef.current.z;
      }
    }

    if (props.isLight && actualScale) {
      directionalLightRef.current.position.x = -controlsRef.current.target.x;
      directionalLightRef.current.position.y = -controlsRef.current.target.y;
      directionalLightRef.current.position.z = -controlsRef.current.target.z;
    }
  });

  return (
    <object3D rotation={[0, 0, props.orbit.inclination]}>
      <object3D ref={bodyOrbitRef}>
        <OrbitPath color={props.orbit.color} radius={props.orbit.radius} />
        <object3D position={[props.orbit.radius, 0, 0]}>
          <object3D ref={bodyPositionRef} rotation={[0, 0, -props.orbit.inclination]}>
            {props.isLight && (
              <>
                <pointLight
                  ref={pointLightRef}
                  visible={!actualScale}
                  color={props.color}
                  intensity={2}
                  distance={0}
                  castShadow
                />
                <directionalLight
                  ref={directionalLightRef}
                  visible={actualScale}
                  color={props.color}
                  intensity={2}
                  castShadow
                />
              </>
            )}
            {showLabels && (
              <Html position={[0, props.radius * 1.8, 0]} center wrapperClass="canvas-body-object">
                <p onClick={focusBody}>{props.name}</p>
              </Html>
            )}
            <object3D rotation={[0, 0, props.orbit.inclination + props.axialTilt]}>
              <object3D
                ref={bodyRef}
                onPointerEnter={() => {
                  document.body.style.cursor = "pointer";
                }}
                onPointerLeave={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                {showDebugInfo && <axesHelper args={[props.radius * 1.6]} />}
                <mesh ref={bodyMeshRef} castShadow={!props.isLight} receiveShadow={!props.isLight} onClick={focusBody}>
                  <sphereGeometry args={[props.radius, divisionQuality * 2, divisionQuality]} />
                  <meshPhongMaterial
                    color={bodyTexture ? undefined : props.color}
                    map={bodyTexture}
                    emissive={props.isLight ? props.color : 0x000000}
                    shininess={props.albedo}
                  />
                </mesh>
                {props.ring && (
                  <mesh
                    rotation={[Math.PI / 2, 0, 0]}
                    castShadow={!props.isLight}
                    receiveShadow={!props.isLight}
                    onClick={focusBody}
                  >
                    <ringGeometry
                      ref={ringGeometryRef}
                      args={[props.ring.innerRadius * 2, props.ring.outerRadius * 2, divisionQuality * 4]}
                    />
                    <meshPhongMaterial
                      transparent
                      side={DoubleSide}
                      color={ringTexture ? undefined : props.color}
                      map={ringTexture}
                      shininess={props.albedo}
                    />
                  </mesh>
                )}
              </object3D>
            </object3D>
            {props.satellites.map((satellite, index) => (
              <AstronomicalBody key={index} {...satellite} cameraRef={cameraRef} controlsRef={controlsRef} />
            ))}
          </object3D>
        </object3D>
      </object3D>
    </object3D>
  );
};

export default AstronomicalBody;
