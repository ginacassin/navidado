// Dado 3D en WebGL (three.js): aristas redondeadas, plástico brillante, luz y sombra reales.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mount, unmount, flushSync } from 'svelte';
import ActionIcon from '../components/ActionIcon.svelte';
import type { ActionId } from '../../shared/game';

export type FaceContent = { kind: 'action'; action: ActionId } | { kind: 'pips'; n: number };

export interface DieOptions {
  hat?: boolean;
  onLand?: () => void;
}

// Caras de la geometría de caja: +x, -x, +y, -y, +z, -z. Cara lógica (0..5) que muestra cada una.
const FACE_OF_MATERIAL = [1, 3, 4, 5, 0, 2];
// Rotación que lleva la cara lógica f al frente (+z, hacia la cámara).
const FRONT_ROT: [number, number, number][] = [
  [0, 0, 0],
  [0, -Math.PI / 2, 0],
  [0, Math.PI, 0],
  [0, Math.PI / 2, 0],
  [Math.PI / 2, 0, 0],
  [-Math.PI / 2, 0, 0]
];
const PRESENT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.16, -0.4, 0.03, 'YXZ'));

const iconCache = new Map<ActionId, Promise<HTMLImageElement>>();

/** Rasteriza el icono SVG de una acción (el mismo componente que usa la interfaz). */
function iconImage(action: ActionId): Promise<HTMLImageElement> {
  let p = iconCache.get(action);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const host = document.createElement('div');
      const comp = mount(ActionIcon, { target: host, props: { action, size: 512 } });
      flushSync();
      let svg = host.innerHTML.replace(/<!--.*?-->/g, '');
      unmount(comp);
      if (!svg.includes('xmlns=')) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
    iconCache.set(action, p);
  }
  return p;
}

const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.26, 0.26], [0.74, 0.26], [0.5, 0.5], [0.26, 0.74], [0.74, 0.74]],
  6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]]
};

const TEX = 512;

function baseCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = TEX;
  const g = c.getContext('2d')!;
  // superficie marfil con una ligerísima variación para que no parezca plástico plano
  const grad = g.createRadialGradient(TEX * 0.4, TEX * 0.35, TEX * 0.05, TEX * 0.5, TEX * 0.5, TEX * 0.75);
  grad.addColorStop(0, '#fffdf8');
  grad.addColorStop(1, '#f6efe4');
  g.fillStyle = grad;
  g.fillRect(0, 0, TEX, TEX);
  return [c, g];
}

async function faceTextures(content: FaceContent): Promise<{ map: THREE.Texture; bump?: THREE.Texture }> {
  const [c, g] = baseCanvas();
  let bump: THREE.Texture | undefined;
  if (content.kind === 'pips') {
    const b = document.createElement('canvas');
    b.width = b.height = TEX;
    const bg = b.getContext('2d')!;
    bg.fillStyle = '#fff';
    bg.fillRect(0, 0, TEX, TEX);
    const r = TEX * 0.085;
    for (const [px, py] of PIPS[content.n]) {
      const x = px * TEX, y = py * TEX;
      // hueco: sombra interior arriba-izquierda y brillo abajo-derecha
      const pg = g.createRadialGradient(x + r * 0.25, y + r * 0.3, r * 0.1, x, y, r);
      pg.addColorStop(0, '#d32020');
      pg.addColorStop(0.7, '#b01818');
      pg.addColorStop(1, '#6a0a0a');
      g.fillStyle = pg;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(120,20,20,.35)';
      g.lineWidth = 3;
      g.stroke();
      const bgr = bg.createRadialGradient(x, y, 0, x, y, r * 1.08);
      bgr.addColorStop(0, '#000');
      bgr.addColorStop(0.75, '#222');
      bgr.addColorStop(1, '#fff');
      bg.fillStyle = bgr;
      bg.beginPath();
      bg.arc(x, y, r * 1.08, 0, Math.PI * 2);
      bg.fill();
    }
    bump = new THREE.CanvasTexture(b);
  } else {
    const img = await iconImage(content.action);
    const s = TEX * 0.74;
    g.save();
    g.shadowColor = 'rgba(60,40,20,.28)';
    g.shadowBlur = 10;
    g.shadowOffsetY = 4;
    g.drawImage(img, (TEX - s) / 2, (TEX - s) / 2, s, s);
    g.restore();
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  return { map, bump };
}

function makeHat(): THREE.Group {
  const hat = new THREE.Group();
  const velvet = new THREE.MeshPhysicalMaterial({
    color: '#b3121a',
    roughness: 0.55,
    sheen: 0.55,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#ff6b6b')
  });
  const fur = new THREE.MeshStandardMaterial({ color: '#fbf8f3', roughness: 0.95 });
  // cono doblado hacia un lado
  const H = 0.95;
  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    profile.push(new THREE.Vector2(0.4 * Math.pow(1 - t, 0.9) + 0.015, t * H));
  }
  const cone = new THREE.LatheGeometry(profile, 48);
  const pos = cone.attributes.position;
  const bend = (y: number) => 0.5 * Math.pow(y / H, 2.2);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setX(i, pos.getX(i) + bend(y));
    pos.setY(i, y * (1 - 0.18 * Math.pow(y / H, 2)));
  }
  cone.computeVertexNormals();
  const body = new THREE.Mesh(cone, velvet);
  body.castShadow = true;
  body.position.y = 0.04;
  hat.add(body);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.115, 28, 72), fur);
  brim.rotation.x = Math.PI / 2;
  brim.position.y = 0.04;
  brim.castShadow = true;
  hat.add(brim);
  const tipY = H * (1 - 0.18) + 0.04;
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 24), fur);
  pom.position.set(bend(H) + 0.04, tipY - 0.02, 0);
  pom.castShadow = true;
  hat.add(pom);
  hat.position.set(0, 0.47, 0);
  hat.rotation.set(-0.08, 0.95, -0.12);
  return hat;
}

export class DieRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private die = new THREE.Group();
  private cube: THREE.Mesh;
  private materials: THREE.MeshPhysicalMaterial[] = [];
  private q = new THREE.Quaternion();
  private qStart = new THREE.Quaternion();
  private qTarget = new THREE.Quaternion();
  private spinAxis = new THREE.Vector3(1, 0, 0);
  private spinTurns = 0;
  private rollStart = -1;
  private landed = false;
  private idle = false;
  private bob = false;
  private raf = 0;
  private visible = true;
  private disposed = false;
  private clock = new THREE.Clock();

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: DieOptions = {}
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // El lienzo es más alto que el hueco que ocupa: el dado puede saltar por encima sin cortarse.
    this.camera = new THREE.PerspectiveCamera(30, 0.66, 0.1, 50);
    const look = opts.hat ? 0.62 : 0.55;
    this.camera.position.set(0, look + 1.35, 5.0);
    this.camera.lookAt(0, look, 0);

    const key = new THREE.DirectionalLight('#fff6e8', 2.4);
    key.position.set(-3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2;
    key.shadow.camera.bottom = -2;
    key.shadow.radius = 7;
    key.shadow.bias = -0.0005;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#cfe8ff', 0.6);
    rim.position.set(4, 2, -3);
    this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#1d4d33', 0.55));

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.32 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.505;
    ground.receiveShadow = true;
    this.scene.add(ground);

    for (let i = 0; i < 6; i++) {
      this.materials.push(
        new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          roughness: 0.34,
          clearcoat: 0.85,
          clearcoatRoughness: 0.16,
          bumpScale: 2.5
        })
      );
    }
    this.cube = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 7, 0.15), this.materials);
    this.cube.castShadow = true;
    this.die.add(this.cube);
    if (opts.hat) this.die.add(makeHat());
    this.scene.add(this.die);
    this.loop = this.loop.bind(this);
  }

  async setFaces(contents: FaceContent[]) {
    const tex = await Promise.all(FACE_OF_MATERIAL.map((f) => faceTextures(contents[f])));
    if (this.disposed) return;
    const aniso = this.renderer.capabilities.getMaxAnisotropy();
    tex.forEach(({ map, bump }, i) => {
      const m = this.materials[i];
      m.map?.dispose();
      m.bumpMap?.dispose();
      map.anisotropy = aniso;
      m.map = map;
      m.bumpMap = bump ?? null;
      m.needsUpdate = true;
    });
    this.render();
  }

  private faceQuat(f: number) {
    const [x, y, z] = FRONT_ROT[f] ?? FRONT_ROT[0];
    return PRESENT.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'XYZ')));
  }

  show(face: number) {
    this.q.copy(this.faceQuat(face));
    this.qTarget.copy(this.q);
    this.rollStart = -1;
    this.die.quaternion.copy(this.q);
    this.die.position.y = 0;
    this.render();
  }

  roll(face: number) {
    this.qStart.copy(this.die.quaternion);
    this.qTarget.copy(this.faceQuat(face));
    this.spinAxis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    this.spinTurns = Math.PI * 2 * (2 + Math.random());
    this.rollStart = performance.now();
    this.landed = false;
    this.kick();
  }

  setIdle(on: boolean) {
    this.idle = on;
    this.kick();
  }

  setBob(on: boolean) {
    this.bob = on;
    this.kick();
  }

  setVisible(v: boolean) {
    this.visible = v;
    this.kick();
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  private kick() {
    if (!this.raf && !this.disposed) this.raf = requestAnimationFrame(this.loop);
  }

  private loop() {
    this.raf = 0;
    if (this.disposed) return;
    const now = performance.now();
    const t = this.clock.getElapsedTime();
    let animating = false;
    if (this.rollStart >= 0) {
      const p = Math.min(1, (now - this.rollStart) / 1250);
      // altura: salto, rebote y reposo
      let y = 0;
      if (p < 0.55) y = 1.15 * Math.sin((Math.PI * p) / 0.55);
      else if (p < 0.78) y = 0.2 * Math.sin((Math.PI * (p - 0.55)) / 0.23);
      else if (p < 0.9) y = 0.05 * Math.sin((Math.PI * (p - 0.78)) / 0.12);
      const e = 1 - Math.pow(1 - Math.min(1, p / 0.82), 4);
      const spin = new THREE.Quaternion().setFromAxisAngle(this.spinAxis, this.spinTurns * (1 - e));
      const q = this.qTarget.clone().multiply(spin);
      if (p < 0.12) q.slerp(this.qStart, 1 - p / 0.12);
      this.die.quaternion.copy(q);
      this.die.position.y = Math.max(0, y);
      if (!this.landed && p >= 0.55) {
        this.landed = true;
        this.opts.onLand?.();
      }
      if (p >= 1) {
        this.rollStart = -1;
        this.die.quaternion.copy(this.qTarget);
        this.die.position.y = 0;
      } else animating = true;
    } else if (this.idle) {
      const w = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.sin(t * 1.6) * 0.07, Math.sin(t * 1.1) * 0.03));
      this.die.quaternion.copy(this.qTarget).premultiply(w);
      this.die.position.y = 0.05 + Math.sin(t * 2.2) * 0.05;
      animating = true;
    } else if (this.bob) {
      this.die.position.y = 0.04 + Math.sin(t * 1.8) * 0.045;
      const w = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.sin(t * 1.3) * 0.05));
      this.die.quaternion.copy(this.qTarget).premultiply(w);
      animating = true;
    }
    this.render();
    if (animating && this.visible) this.raf = requestAnimationFrame(this.loop);
  }

  render() {
    if (!this.disposed) this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.materials.forEach((m) => {
      m.map?.dispose();
      m.bumpMap?.dispose();
      m.dispose();
    });
    this.scene.traverse((o) => {
      if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose();
    });
    this.renderer.dispose();
  }
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
