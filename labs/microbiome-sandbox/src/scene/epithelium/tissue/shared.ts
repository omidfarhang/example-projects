import * as THREE from "three";
import { P } from "../tissuePalette";
import type { EpitheliumKind } from "../types";

export interface TissueBuildResult {
  group: THREE.Group;
  inflamedMeshes: THREE.Mesh[];
  overlays: THREE.Mesh[];
  kind: EpitheliumKind;
}

/** Cross-section thickness — enough Z depth to read as 3D tissue, not a flat card. */
export const DEPTH = 0.38;

const textureCache = new Map<string, THREE.CanvasTexture>();
const bumpCache = new Map<string, THREE.CanvasTexture>();

function channel(color: number, shift: number) {
  return (color >> shift) & 255;
}

function textureSeed(color: number, variant = "tissue") {
  return `${variant}-${color.toString(16)}`;
}

function createCanvasTexture(color: number, variant = "tissue", bump = false) {
  const key = `${textureSeed(color, variant)}-${bump ? "bump" : "color"}`;
  const cache = bump ? bumpCache : textureCache;
  const existing = cache.get(key);
  if (existing) return existing;
  if (typeof document === "undefined") return undefined;

  const size = 192;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  const r = channel(color, 16);
  const g = channel(color, 8);
  const b = channel(color, 0);
  const base = bump ? 128 : 0;
  ctx.fillStyle = bump ? `rgb(${base},${base},${base})` : `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 1400; i++) {
    const x = (organic(i + color * 0.0001, 1) + 0.5) * size;
    const y = (organic(i * 1.91 + color * 0.0002, 1) + 0.5) * size;
    const radius = 0.45 + (i % 9) * 0.18;
    const shade = bump
      ? 112 + Math.round((organic(i + 9.4, 1) + 0.5) * 44)
      : 0;
    if (bump) {
      ctx.fillStyle = `rgba(${shade},${shade},${shade},0.34)`;
    } else {
      const tint = 0.82 + organic(i + 5.1, 0.28);
      ctx.fillStyle = `rgba(${Math.round(r * tint)},${Math.round(g * tint)},${Math.round(b * tint)},0.24)`;
    }
    ctx.beginPath();
    ctx.ellipse(x, y, radius * (1.4 + (i % 3) * 0.25), radius, organic(i + 2.4, Math.PI), 0, Math.PI * 2);
    ctx.fill();
  }

  if (!bump && variant !== "mucus") {
    for (let i = 0; i < 95; i++) {
      const x = (organic(i + color * 0.001, 1) + 0.5) * size;
      const y = (organic(i * 2.71 + color * 0.002, 1) + 0.5) * size;
      const radius = 2.2 + (i % 5) * 0.55;
      ctx.fillStyle = `rgba(58,32,72,${0.09 + (i % 4) * 0.015})`;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.45, radius * 0.8, organic(i + 3.3, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (variant === "mucus") {
    for (let i = 0; i < 70; i++) {
      const x = (organic(i + 7.7, 1) + 0.5) * size;
      const y = (organic(i * 1.37 + 3.1, 1) + 0.5) * size;
      ctx.strokeStyle = `rgba(255,255,255,${0.08 + (i % 4) * 0.025})`;
      ctx.lineWidth = 1 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + organic(i + 1, 30), y + organic(i + 2, 18), x + organic(i + 3, 42), y + organic(i + 4, 24), x + organic(i + 5, 55), y + organic(i + 6, 28));
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.4, 2.4);
  texture.colorSpace = bump ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}

export function mat(
  color: number,
  opts?: Partial<THREE.MeshStandardMaterialParameters>,
) {
  const variant = opts?.transparent ? "mucus" : "tissue";
  const material = new THREE.MeshStandardMaterial({
    color,
    map: opts?.map ?? createCanvasTexture(color, variant),
    bumpMap: opts?.bumpMap ?? createCanvasTexture(color, variant, true),
    bumpScale: opts?.bumpScale ?? 0.018,
    roughness: 0.74,
    metalness: 0.01,
    emissive: new THREE.Color(color).multiplyScalar(0.025),
    emissiveIntensity: 0.12,
    ...opts,
  });
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <output_fragment>",
      `
        float rimScatter = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.2);
        outgoingLight += diffuseColor.rgb * rimScatter * 0.13;
        #include <output_fragment>
      `,
    );
  };
  return material;
}

export function organic(seed: number, scale = 1) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * scale;
}

function roundedRectShape(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

export function livingSlab(
  width: number,
  height: number,
  depth: number,
  color: number,
  opts?: Partial<THREE.MeshStandardMaterialParameters>,
  seed = 0,
) {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, height, height * 0.28), {
    depth,
    bevelEnabled: true,
    bevelSize: Math.min(height * 0.12, 0.014),
    bevelThickness: Math.min(depth * 0.05, 0.014),
    bevelSegments: 3,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -depth / 2);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const wave = Math.sin((x * 2.7 + seed) * 3.1) * Math.cos((y * 6.3 + seed) * 1.7);
    positions.setX(i, x + wave * 0.004);
    positions.setY(i, y + organic(i + seed * 17, 0.004));
    positions.setZ(i, positions.getZ(i) + organic(i + seed * 29, 0.006));
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  return new THREE.Mesh(geometry, mat(color, { roughness: 0.78, ...opts }));
}

export function outline(mesh: THREE.Mesh, color = 0x38bdf8, opacity = 0.42) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  return edges;
}

/** Register epithelial geometry so inflammation tints the full surface, not a static hot spot. */
export function trackInflamed(
  mesh: THREE.Mesh,
  baseColor: number,
  inflamedMeshes: THREE.Mesh[],
) {
  mesh.userData.baseColor = baseColor;
  inflamedMeshes.push(mesh);
}

export function mucusSheet(w: number, h: number, y: number, z: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h, 18, 4),
    mat(P.mucus, {
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      roughness: 0.28,
      bumpScale: 0.01,
      side: THREE.DoubleSide,
    }),
  );
  const positions = m.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    positions.setZ(i, organic(i + w * 3 + h * 7, 0.018));
    positions.setY(i, positions.getY(i) + organic(i + 12, 0.012));
  }
  positions.needsUpdate = true;
  m.geometry.computeVertexNormals();
  m.position.set(0, y, z);
  m.userData.isMucus = true;
  return m;
}

export type HistologyFlavor = "gut" | "skin" | "sinus" | "oral" | "vaginal" | "scalp" | "ear";

function flavorPalette(flavor: HistologyFlavor) {
  switch (flavor) {
    case "gut":
      return { accent: 0xe79ca3, nucleus: 0x5a2f63, fiber: 0xf4d8d6, scale: 13.5 };
    case "skin":
      return { accent: 0xd99a8c, nucleus: 0x452456, fiber: 0xf7e3c9, scale: 10.5 };
    case "sinus":
      return { accent: 0xe2b0aa, nucleus: 0x4a2d5c, fiber: 0xe2f2f8, scale: 14.5 };
    case "oral":
      return { accent: 0xe3ada5, nucleus: 0x4f2d58, fiber: 0xf6e7e3, scale: 11.5 };
    case "vaginal":
      return { accent: 0xdf9d9d, nucleus: 0x4b2750, fiber: 0xf8eaee, scale: 11.8 };
    case "scalp":
      return { accent: 0xd5b28d, nucleus: 0x40272a, fiber: 0xf0e0cc, scale: 9.8 };
    case "ear":
      return { accent: 0xd8c08f, nucleus: 0x413540, fiber: 0xf3e2c7, scale: 10.8 };
  }
}

export function histologyVeil(
  flavor: HistologyFlavor,
  width: number,
  height: number,
  y: number,
  z: number,
) {
  const palette = flavorPalette(flavor);
  const geometry = new THREE.PlaneGeometry(width, height, 40, 22);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    positions.setZ(i, organic(i + width * 7 + height * 13, 0.02));
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uBaseColor: { value: new THREE.Color(P.cytoplasm) },
      uAccentColor: { value: new THREE.Color(palette.accent) },
      uNucleusColor: { value: new THREE.Color(palette.nucleus) },
      uFiberColor: { value: new THREE.Color(palette.fiber) },
      uOpacity: { value: 0.2 },
      uScale: { value: palette.scale },
      uSeed: { value: organic(width + height, 1) * 30 },
      uInflammation: { value: 0 },
      uMoisture: { value: 0.6 },
      uIntegrity: { value: 0.8 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalW;
      void main() {
        vUv = uv;
        vNormalW = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uBaseColor;
      uniform vec3 uAccentColor;
      uniform vec3 uNucleusColor;
      uniform vec3 uFiberColor;
      uniform float uOpacity;
      uniform float uScale;
      uniform float uSeed;
      uniform float uInflammation;
      uniform float uMoisture;
      uniform float uIntegrity;
      varying vec2 vUv;
      varying vec3 vNormalW;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345 + uSeed);
        return fract(p.x * p.y);
      }

      float cellNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float best = 10.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 g = vec2(float(x), float(y));
            vec2 o = vec2(hash21(i + g), hash21(i + g + 17.3));
            vec2 c = g + o;
            float d = length(f - c);
            best = min(best, d);
          }
        }
        return best;
      }

      void main() {
        vec2 uv = vUv;
        vec2 cells = uv * uScale;
        float d = cellNoise(cells);
        float membrane = smoothstep(0.46, 0.11, d);
        float nucleus = smoothstep(0.13, 0.0, abs(sin((cells.x + uSeed) * 2.9)) * 0.18 + abs(cos((cells.y - uSeed) * 3.4)) * 0.14);
        float fiber = smoothstep(0.42, 0.12, abs(sin((uv.x + uSeed * 0.03) * 19.0) * cos((uv.y + uSeed * 0.05) * 17.0)));
        float lambert = 0.62 + 0.38 * max(0.0, dot(normalize(vNormalW), normalize(vec3(0.25, 0.55, 0.8))));
        vec3 color = mix(uBaseColor, uAccentColor, membrane * 0.4);
        color = mix(color, uNucleusColor, nucleus * 0.68);
        color = mix(color, uFiberColor, fiber * 0.18);
        color *= lambert;
        color += uInflammation * vec3(0.12, 0.03, 0.03) * (0.25 + membrane * 0.75);
        color += (1.0 - uIntegrity) * vec3(0.05, 0.02, 0.02);
        float alpha = uOpacity + membrane * 0.12 + nucleus * 0.05 + uMoisture * 0.06;
        alpha *= mix(1.02, 0.78, uIntegrity);
        gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.92));
      }
    `,
  });

  const veil = new THREE.Mesh(geometry, material);
  veil.position.set(0, y, z);
  veil.userData.isHistology = true;
  return veil;
}

export function cellField(
  flavor: HistologyFlavor,
  width: number,
  height: number,
  y: number,
  z: number,
  count = 120,
) {
  const palette = flavorPalette(flavor);
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.008, 8, 6);
  const material = mat(palette.accent, {
    roughness: 0.92,
    metalness: 0,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const nx = organic(i + width * 2.3, 1);
    const ny = organic(i + height * 4.7, 1);
    const nz = organic(i + z * 9.1, 1);
    const px = nx * width * 0.5;
    const py = y + (ny - 0.5) * height * 0.8;
    const pz = z + (nz - 0.5) * 0.055;
    const s = 0.45 + Math.abs(organic(i + 17, 0.55));
    dummy.position.set(px, py, pz);
    dummy.scale.set(s * 1.45, s * 0.72, s * 0.38);
    dummy.rotation.set(organic(i + 3, Math.PI), organic(i + 5, Math.PI), organic(i + 7, Math.PI));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.setHSL(
      0.93 + organic(i + 11, 0.02),
      0.28 + organic(i + 13, 0.08),
      0.68 + organic(i + 15, 0.12),
    );
    mesh.setColorAt(i, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.userData.isCellField = true;
  group.add(mesh);
  return group;
}
