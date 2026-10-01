import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

export const MAX_RENDER_BOXES = 800;

export class CargoVisualizer3D {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = new THREE.Scene();
    this.renderAll = false;

    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.initControls();

    this.packedGroup = new THREE.Group();
    this.scene.add(this.packedGroup);

    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);

    window.addEventListener('resize', this.handleResize);
    this.animate();
  }

  initCamera() {
    const w = this.container.clientWidth || 300;
    const h = this.container.clientHeight || 300;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 5000);
    this.camera.position.set(45, 45, 65);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(60, 100, 80);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
    dirLight2.position.set(-60, 40, -60);
    this.scene.add(dirLight2);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
  }

  updateScene(containerDim, packingResult) {
    while (this.packedGroup.children.length > 0) {
      const obj = this.packedGroup.children[0];
      this.packedGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    const cL = parseFloat(containerDim.length) || 20;
    const cW = parseFloat(containerDim.width) || 20;
    const cH = parseFloat(containerDim.height) || 20;

    // Container Wireframe
    const contGeo = new THREE.BoxGeometry(cL, cH, cW);
    const edges = new THREE.EdgesGeometry(contGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 1.5, opacity: 0.6, transparent: true });
    const contWire = new THREE.LineSegments(edges, lineMat);
    contWire.position.set(0, cH / 2, 0);
    this.packedGroup.add(contWire);

    // Subtle floor plane
    const floorGeo = new THREE.PlaneGeometry(cL, cW);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide, opacity: 0.35, transparent: true });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0.01, 0);
    this.packedGroup.add(floorMesh);

    // Materials: Type 1 (Azul), Type 2 (Verde), Type 3 (Naranja)
    const mat1 = new THREE.MeshPhongMaterial({ color: 0x0284c7, transparent: true, opacity: 0.88 });
    const mat2 = new THREE.MeshPhongMaterial({ color: 0x10b981, transparent: true, opacity: 0.88 });
    const mat3 = new THREE.MeshPhongMaterial({ color: 0xf97316, transparent: true, opacity: 0.88 });
    const edgeDark = new THREE.LineBasicMaterial({ color: 0x082f49, opacity: 0.65, transparent: true });

    const allItems = packingResult.items || [];
    let renderItems = allItems;

    // Proportional Limiter across all item types
    if (allItems.length > MAX_RENDER_BOXES && !this.renderAll) {
      renderItems = [];
      const total = allItems.length;
      const byType = {
        1: allItems.filter(i => i.type === 1),
        2: allItems.filter(i => i.type === 2),
        3: allItems.filter(i => i.type === 3)
      };

      [1, 2, 3].forEach(t => {
        const list = byType[t];
        if (list.length > 0) {
          const quota = Math.max(1, Math.round(MAX_RENDER_BOXES * (list.length / total)));
          const step = list.length / quota;
          for (let i = 0; i < quota && i < list.length; i++) {
            renderItems.push(list[Math.floor(i * step)]);
          }
        }
      });
    }

    renderItems.forEach(it => {
      const geo = new THREE.BoxGeometry(it.origDx, it.origDz, it.origDy);
      const mat = it.type === 3 ? mat3 : it.type === 2 ? mat2 : mat1;
      const mesh = new THREE.Mesh(geo, mat);

      const posX = it.x + it.origDx / 2 - cL / 2;
      const posY = it.z + it.origDz / 2;
      const posZ = it.y + it.origDy / 2 - cW / 2;

      mesh.position.set(posX, posY, posZ);

      const itemEdges = new THREE.EdgesGeometry(geo);
      const itemLines = new THREE.LineSegments(itemEdges, edgeDark);
      mesh.add(itemLines);

      this.packedGroup.add(mesh);
    });

    this.focusCamera(cL, cH, cW);
  }

  focusCamera(cL, cH, cW) {
    const maxDim = Math.max(cL, cH, cW);
    const dist = maxDim * 1.8;
    this.camera.position.set(dist * 0.9, dist * 0.75, dist * 1.1);
    this.controls.target.set(0, cH / 2, 0);
    this.controls.update();
  }

  handleResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
