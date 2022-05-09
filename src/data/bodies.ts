import { ColorRepresentation } from "three";

export type BodyType = {
  displayName: string; // name
  isLight?: boolean; // is a light source
  color: ColorRepresentation; // hexadecimal
  orbitColor: ColorRepresentation; // hexadecimal
  diameter: number; // km
  rotationPeriod: number; // hours
  axialTilt: number; // degrees
  distanceFromSun: number; // 10^6 km
  orbitalPeriod: number; // days
  orbitalInclination: number; // degrees
};

/**
 * data: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
 */
export const bodies: BodyType[] = [
  {
    displayName: "Sun",
    isLight: true,
    color: 0xfdfbd3,
    orbitColor: 0xfdfbd3,
    diameter: 1392700,
    rotationPeriod: 587.3,
    axialTilt: 0,
    distanceFromSun: 0,
    orbitalPeriod: 1,
    orbitalInclination: 0,
  },
  {
    displayName: "Mercury",
    color: 0x1a1a1a,
    orbitColor: 0xf58536,
    diameter: 4879,
    rotationPeriod: 1407.6,
    axialTilt: 0.034,
    distanceFromSun: 57.9,
    orbitalPeriod: 88.0,
    orbitalInclination: 7.0,
  },
  {
    displayName: "Venus",
    color: 0xe6e6e6,
    orbitColor: 0xc35fed,
    diameter: 12104,
    rotationPeriod: -5832.5,
    axialTilt: 177.4,
    distanceFromSun: 108.2,
    orbitalPeriod: 224.7,
    orbitalInclination: 3.4,
  },
  {
    displayName: "Earth",
    color: 0x2f6a69,
    orbitColor: 0x1fd137,
    diameter: 12756,
    rotationPeriod: 23.9,
    axialTilt: 23.4,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.2,
    orbitalInclination: 0.0,
  },
  {
    displayName: "Mars",
    color: 0x993d00,
    orbitColor: 0xe84f25,
    diameter: 6792,
    rotationPeriod: 24.6,
    axialTilt: 25.2,
    distanceFromSun: 228.0,
    orbitalPeriod: 687.0,
    orbitalInclination: 1.8,
  },
  {
    displayName: "Jupiter",
    color: 0xb07f35,
    orbitColor: 0xedab47,
    diameter: 142984,
    rotationPeriod: 9.9,
    axialTilt: 3.1,
    distanceFromSun: 778.5,
    orbitalPeriod: 4331,
    orbitalInclination: 1.3,
  },
  {
    displayName: "Saturn",
    color: 0xb08f36,
    orbitColor: 0xedd05a,
    diameter: 120536,
    rotationPeriod: 10.7,
    axialTilt: 26.7,
    distanceFromSun: 1432.0,
    orbitalPeriod: 10747,
    orbitalInclination: 2.5,
  },
  {
    displayName: "Uranus",
    color: 0x5580aa,
    orbitColor: 0x9ddcf5,
    diameter: 51118,
    rotationPeriod: -17.2,
    axialTilt: 97.8,
    distanceFromSun: 2867.0,
    orbitalPeriod: 30589,
    orbitalInclination: 0.8,
  },
  {
    displayName: "Neptune",
    color: 0x366896,
    orbitColor: 0x3179de,
    diameter: 49528,
    rotationPeriod: 16.1,
    axialTilt: 28.3,
    distanceFromSun: 4515.0,
    orbitalPeriod: 59800,
    orbitalInclination: 1.8,
  },
  {
    displayName: "Pluto",
    color: 0xdad7ce,
    orbitColor: 0xa19181,
    diameter: 2376,
    rotationPeriod: -153.3,
    axialTilt: 122.5,
    distanceFromSun: 5906.4,
    orbitalPeriod: 90560,
    orbitalInclination: 17.2,
  },
];