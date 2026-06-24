/* ============================================================
   3D animated particle-network background (Three.js, global build)
   Nodes + connecting links = neural network / packet flow.
   Mouse-reactive parallax. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 60;

  // --- Node field ---------------------------------------------------------
  const isMobile = window.innerWidth < 720;
  const COUNT = isMobile ? 70 : 130;
  const RANGE = 90;
  const LINK_DIST = isMobile ? 16 : 18;

  const positions = new Float32Array(COUNT * 3);
  const velocities = [];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * RANGE;
    positions[i * 3 + 1] = (Math.random() - 0.5) * RANGE * 0.6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * RANGE * 0.5;
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.04
    ));
  }

  // Points (the nodes)
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const sprite = makeGlowSprite();
  const pointsMat = new THREE.PointsMaterial({
    size: 2.3,
    map: sprite,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0x9db4ff,
  });
  const points = new THREE.Points(pointsGeo, pointsMat);
  scene.add(points);

  // Lines (the links) — geometry rebuilt each frame
  const lineGeo = new THREE.BufferGeometry();
  const maxSegments = COUNT * COUNT;
  const linePositions = new Float32Array(maxSegments * 3);
  const lineColors = new Float32Array(maxSegments * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const colA = new THREE.Color(0x38bdf8); // sky
  const colB = new THREE.Color(0x818cf8); // indigo

  // --- Mouse parallax -----------------------------------------------------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5);
    mouse.ty = (e.clientY / window.innerHeight - 0.5);
  });

  // --- Animate ------------------------------------------------------------
  const pos = pointsGeo.attributes.position.array;
  let raf;

  function frame() {
    // drift nodes
    if (!reduceMotion) {
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        pos[ix]     += velocities[i].x;
        pos[ix + 1] += velocities[i].y;
        pos[ix + 2] += velocities[i].z;
        // bounce within range
        if (pos[ix]     >  RANGE / 2 || pos[ix]     < -RANGE / 2) velocities[i].x *= -1;
        if (pos[ix + 1] >  RANGE * 0.3 || pos[ix + 1] < -RANGE * 0.3) velocities[i].y *= -1;
        if (pos[ix + 2] >  RANGE * 0.25 || pos[ix + 2] < -RANGE * 0.25) velocities[i].z *= -1;
      }
      pointsGeo.attributes.position.needsUpdate = true;
    }

    // build links
    let seg = 0;
    for (let i = 0; i < COUNT; i++) {
      const ax = pos[i * 3], ay = pos[i * 3 + 1], az = pos[i * 3 + 2];
      for (let j = i + 1; j < COUNT; j++) {
        const dx = ax - pos[j * 3];
        const dy = ay - pos[j * 3 + 1];
        const dz = az - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < LINK_DIST) {
          const t = 1 - dist / LINK_DIST; // 0..1 closeness
          const c = colA.clone().lerp(colB, (ax + RANGE / 2) / RANGE);
          // On a dark background (additive blending), dimmer = fades to invisible
          linePositions[seg * 3]     = ax;
          linePositions[seg * 3 + 1] = ay;
          linePositions[seg * 3 + 2] = az;
          lineColors[seg * 3] = c.r * t; lineColors[seg * 3 + 1] = c.g * t; lineColors[seg * 3 + 2] = c.b * t;
          seg++;

          linePositions[seg * 3]     = pos[j * 3];
          linePositions[seg * 3 + 1] = pos[j * 3 + 1];
          linePositions[seg * 3 + 2] = pos[j * 3 + 2];
          lineColors[seg * 3] = c.r * t; lineColors[seg * 3 + 1] = c.g * t; lineColors[seg * 3 + 2] = c.b * t;
          seg++;
        }
      }
    }
    lineGeo.setDrawRange(0, seg);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    // parallax + slow auto-rotate
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    const group = scene;
    group.rotation.y = mouse.x * 0.5 + (reduceMotion ? 0 : performance.now() * 0.00002);
    group.rotation.x = mouse.y * 0.35;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  frame();

  // pause when tab hidden (save battery)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { frame(); }
  });

  // --- Resize -------------------------------------------------------------
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 150);
  });

  // --- Helper: soft round glow texture for points -------------------------
  function makeGlowSprite() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,   'rgba(255,255,255,1)');
    g.addColorStop(0.35,'rgba(255,255,255,0.55)');
    g.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }
})();
