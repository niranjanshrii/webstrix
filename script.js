document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. LENIS SMOOTH SCROLL --- */
    const lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0, 0);

    /* --- 2. Cursors & Global Mouse --- */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;
    window.glmouseX = 0; window.glmouseY = 0;

    if (window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`;
            window.glmouseX = (e.clientX / window.innerWidth) * 2 - 1;
            window.glmouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        const renderCursor = () => {
            ringX += (mouseX - ringX) * 0.15; ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = `${ringX}px`; cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(renderCursor);
        };
        renderCursor();

        document.querySelectorAll('a, .magnetic').forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
        });
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const strength = el.getAttribute('data-strength') || 20;
                gsap.to(el, { x: x * (strength / 100), y: y * (strength / 100), duration: 0.5, ease: 'power2.out' });
            });
            el.addEventListener('mouseleave', () => { gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' }); });
        });
    }

    gsap.to('.fade-in', { opacity: 1, duration: 1.5, delay: 0.5 });

    /* --- 3. GSAP ScrollTrigger ANIMATIONS (works on mobile too) --- */

    // Animate project cards as they enter view
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 60 },
            {
                opacity: 1, y: 0,
                duration: 0.8,
                delay: (i % 3) * 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Animate content blocks (About section)
    gsap.utils.toArray('.text-block').forEach(block => {
        gsap.fromTo(block,
            { opacity: 0, y: 50 },
            {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: block, start: 'top 85%', toggleActions: 'play none none none' }
            }
        );
    });

    // Animate contact glass container
    gsap.utils.toArray('.fade-up').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
            }
        );
    });

    // Fix nav anchor scrolling with Lenis
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) lenis.scrollTo(target, { offset: -80, duration: 1.8 });
        });
    });

    /* --- 4. INITIATE EFFECTS --- */
    initMouseTrail();

    // Only init heavy 3D on desktop (saves mobile performance + fixes mobile blank screen)
    if (window.innerWidth > 768) {
        initPremiumScene(); // Unified UnrealBloomPass Pipeline
    }
});

/* ========================================================
   MOUSE TRAIL (Premium Particle Fade)
   ======================================================== */
function initMouseTrail() {
    const canvas = document.getElementById('trail-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let isHovering = false;

    // A subtle, elegant dot effect
    class Particle {
        constructor(x, y, isHover) {
            this.x = x;
            this.y = y;
            this.size = isHover ? Math.random() * 4 + 2 : Math.random() * 2 + 0.5;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.color = isHover ? '0, 229, 255' : '181, 60, 255'; // Cyan on hover, subtle purple default
        }

        update() {
            // Drift slightly up and fade out
            this.y -= 0.5;
            this.x += (Math.random() - 0.5) * 1.5;
            this.life -= this.decay;
        }

        draw() {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.life})`;

            if (isHovering) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.color}, ${this.life})`;
            } else {
                ctx.shadowBlur = 5;
                ctx.shadowColor = `rgba(${this.color}, ${this.life})`;
            }

            ctx.fill();
        }
    }

    window.addEventListener('mousemove', (e) => {
        // Spawn 2-3 particles per move for a clean, non-cluttered trail
        for (let i = 0; i < 2; i++) {
            particles.push(new Particle(e.clientX, e.clientY, isHovering));
        }
    });

    document.querySelectorAll('a, button, .nav-item, .magnetic, .magnetic-btn').forEach(el => {
        el.addEventListener('mouseenter', () => isHovering = true);
        el.addEventListener('mouseleave', () => isHovering = false);
    });

    function renderTrail() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        particles = particles.filter(p => p.life > 0);
        requestAnimationFrame(renderTrail);
    }
    renderTrail();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}


/* ========================================================
   THE UNIFIED WEBGL PIPELINE (Glowing Orb + Particle Ocean)
   ======================================================== */
function initPremiumScene() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0015); // Deep fog blending

    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.z = 8; // Start at the Hero (Orb) level
    cameraGroup.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. Post-Processing (Unreal Bloom Glow) ---
    let composer;
    if (typeof THREE.EffectComposer !== 'undefined') {
        const renderPass = new THREE.RenderPass(scene, camera);
        // Resolution, Strength, Radius, Threshold
        const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.8, 0.1);

        composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderPass);
        composer.addPass(bloomPass);
    }

    // --- 3. The Liquid Glowing Orb (Hero Section) ---
    const orbGroup = new THREE.Group();
    const orbGeometry = new THREE.IcosahedronGeometry(2.5, 64);
    const orbUniforms = { uTime: { value: 0 }, uHover: { value: 0 } };

    // Shader pulls from HTML tags as previously written
    const orbMaterial = new THREE.ShaderMaterial({
        vertexShader: document.getElementById('liquidVertex').textContent,
        fragmentShader: document.getElementById('liquidFragment').textContent,
        uniforms: orbUniforms, wireframe: false
    });
    const liquidSphere = new THREE.Mesh(orbGeometry, orbMaterial);

    // Faint tech-wireframe around the orb
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.1 });
    const wireSphere = new THREE.Mesh(orbGeometry, wireMat);
    wireSphere.scale.set(1.03, 1.03, 1.03);

    orbGroup.add(liquidSphere);
    orbGroup.add(wireSphere);
    scene.add(orbGroup); // Placed at 0,0,0

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();
    let currentHover = 0;


    // --- 4. The Infinite Wave Particle Ocean (Spatial Computing Section) ---
    // Make the dots extremely dense but tiny, perfectly matching the FWA reference
    const gridSizeX = 300; // Ultra dense
    const gridSizeY = 300;
    const spacing = 8;     // Tightly packed
    const particleCount = gridSizeX * gridSizeY;

    const oceanGeo = new THREE.BufferGeometry();
    const oceanPos = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const oceanColors = new Float32Array(particleCount * 3);

    const colCore = new THREE.Color(0x0044ff); // Deep ocean blue
    const colHighlight = new THREE.Color(0x00e5ff); // Cyan wave peaks
    const tempCol = new THREE.Color();
    const noise = new SimplexNoise();

    let pIndex = 0;
    for (let i = 0; i < gridSizeX; i++) {
        for (let j = 0; j < gridSizeY; j++) {
            const x = (i - gridSizeX / 2) * spacing;
            const y = -35; // Position the ocean WAY below the orb
            const z = (j - gridSizeY / 2) * spacing - 100; // Stretch it back

            oceanPos[pIndex * 3] = x;
            oceanPos[pIndex * 3 + 1] = y;
            oceanPos[pIndex * 3 + 2] = z;

            originalPositions[pIndex * 3] = x;
            originalPositions[pIndex * 3 + 1] = y;
            originalPositions[pIndex * 3 + 2] = z;

            // Paint the particles with organic noise chunks
            const n = noise.noise3D(x * 0.003, 0, z * 0.003);
            tempCol.lerpColors(colCore, colHighlight, (n + 1) / 2);
            oceanColors[pIndex * 3] = tempCol.r;
            oceanColors[pIndex * 3 + 1] = tempCol.g;
            oceanColors[pIndex * 3 + 2] = tempCol.b;

            pIndex++;
        }
    }
    oceanGeo.setAttribute('position', new THREE.BufferAttribute(oceanPos, 3));
    oceanGeo.setAttribute('color', new THREE.BufferAttribute(oceanColors, 3));

    // The key to the premium look: Tiny size (0.3), heavy glow, additive blending
    const oceanMat = new THREE.PointsMaterial({
        size: 0.3, vertexColors: true, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const particleOcean = new THREE.Points(oceanGeo, oceanMat);
    scene.add(particleOcean);

    // --- 4.5. Deep Space Background (Horizontal Squares) ---
    // The user requested the horizontal subtle square particles in the background
    const spaceGeo = new THREE.BufferGeometry();
    const spaceCount = 5000;
    const spacePos = new Float32Array(spaceCount * 3);
    const spaceColors = new Float32Array(spaceCount * 3);

    for (let i = 0; i < spaceCount; i++) {
        // Scatter widely across the background
        spacePos[i * 3] = (Math.random() - 0.5) * 4000;
        spacePos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        spacePos[i * 3 + 2] = -Math.random() * 3000 - 500; // Deep in the background

        // Subtle blue/gray colors
        const c = new THREE.Color();
        if (Math.random() > 0.9) c.setHex(0x4a6fa5); // Light slate blue
        else if (Math.random() > 0.5) c.setHex(0x162c46); // Dark blue 
        else c.setHex(0x2a3d54); // Muted blue

        spaceColors[i * 3] = c.r;
        spaceColors[i * 3 + 1] = c.g;
        spaceColors[i * 3 + 2] = c.b;
    }
    spaceGeo.setAttribute('position', new THREE.BufferAttribute(spacePos, 3));
    spaceGeo.setAttribute('color', new THREE.BufferAttribute(spaceColors, 3));

    // Keep size small to simulate distant squares, opacity low
    const spaceMat = new THREE.PointsMaterial({
        size: 2.0, vertexColors: true, transparent: true, opacity: 0.15,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const spaceLayer = new THREE.Points(spaceGeo, spaceMat);
    scene.add(spaceLayer);


    // --- 5. Cinematic Scroll Journey (GSAP) ---

    // 1. As you scroll away from hero, the Orb physically shoots UP and fades out
    gsap.to(orbGroup.position, {
        y: 10, z: -5, ease: "none",
        scrollTrigger: { trigger: "#smooth-wrapper", start: "top top", end: "+=800", scrub: 1 }
    });
    // Shrink the orb so it vanishes naturally
    gsap.to(orbGroup.scale, {
        x: 0, y: 0, z: 0, ease: "none",
        scrollTrigger: { trigger: "#smooth-wrapper", start: "top top", end: "+=600", scrub: 1 }
    });
    // Fade out text layers
    gsap.to('.hero-text-layer', {
        opacity: 0, y: -100, ease: "none",
        scrollTrigger: { trigger: "#smooth-wrapper", start: "top top", end: "+=600", scrub: true }
    });

    // 2. The Epic Camera Plunge into the Ocean
    // Camera dives down from Y:0 to Y:-30 (just above the wave surface) and pushes forward into Z
    gsap.to(cameraGroup.position, {
        y: -32, // Dive down close to the sea level
        z: -150, // Fly forward
        ease: "power2.inOut",
        scrollTrigger: { trigger: "#space", start: "top bottom", end: "bottom top", scrub: 1.5 }
    });

    // Pitch the camera down slightly to survey the ocean
    gsap.to(cameraGroup.rotation, {
        x: -0.1, // Look down
        ease: "none",
        scrollTrigger: { trigger: "#space", start: "top bottom", end: "bottom top", scrub: 1 }
    });


    // --- 6. The Master Render Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime() * 0.5;

        mouseVector.x = window.glmouseX || 0;
        mouseVector.y = window.glmouseY || 0;

        // Animate Orb
        orbUniforms.uTime.value = time;
        raycaster.setFromCamera(mouseVector, camera);
        const intersects = raycaster.intersectObject(liquidSphere);
        let targetHover = (intersects.length > 0) ? 1 : 0;
        currentHover += (targetHover - currentHover) * 0.1;
        orbUniforms.uHover.value = currentHover;

        orbGroup.rotation.y += 0.005;
        orbGroup.rotation.x = mouseVector.y * 0.2;
        orbGroup.rotation.z = -mouseVector.x * 0.2;
        wireSphere.rotation.y -= 0.01;

        // Animate Ocean Waves mathematically (Massive, slow rolling flow)
        const positions = oceanGeo.attributes.position;
        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            const ox = originalPositions[ix];
            const oz = originalPositions[ix + 2];

            // Smooth, large-scale sweeping sine waves (V4 FWA style)
            let waveY = Math.sin(ox * 0.01 + time * 1.5) * 40;
            waveY += Math.cos(oz * 0.01 + time * 1.0) * 40;

            positions.array[ix + 1] = originalPositions[ix + 1] + waveY;
        }
        positions.needsUpdate = true;
        // Make the ocean slowly drift forward over time
        particleOcean.position.z += 0.02;
        if (particleOcean.position.z > spacing) {
            particleOcean.position.z -= spacing;
        }

        // Horizontal drift for Deep Space
        if (typeof spaceLayer !== 'undefined') {
            spaceLayer.position.x += 0.1;
            if (spaceLayer.position.x > 2000) spaceLayer.position.x -= 4000;
        }

        // Camera Mouse Parallax
        camera.position.x += ((mouseVector.x * 2) - camera.position.x) * 0.05;
        // Slight Y tilt, but maintain the base scroll Y
        camera.position.y += ((mouseVector.y * 2) - (camera.position.y - cameraGroup.position.y)) * 0.05;

        // Render with Bloom
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (composer) composer.setSize(window.innerWidth, window.innerHeight);
    });
}
