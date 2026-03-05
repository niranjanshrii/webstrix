document.addEventListener('DOMContentLoaded', () => {

    /* --- Preloader Logic --- */
    const preloader = document.querySelector('.preloader');
    const loaderBar = document.querySelector('.loader-bar');
    const loaderPercentage = document.querySelector('.loader-percentage');
    let progress = 0;

    // Simulate loading progress
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        loaderBar.style.width = `${progress}%`;
        loaderPercentage.textContent = `${Math.floor(progress)}%`;

        if (progress === 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.transform = 'scale(1.05)';
                document.body.classList.remove('locked');

                setTimeout(() => {
                    preloader.style.display = 'none';
                    // Trigger initial animations
                    document.querySelector('.fade-in-nav').classList.add('appear');
                    document.querySelectorAll('.hero .slide-up').forEach(el => el.classList.add('appear'));
                    document.querySelectorAll('.hero .fade-in').forEach(el => el.classList.add('appear'));
                }, 1000);
            }, 500);
        }
    }, 150);


    /* --- Custom Cursor --- */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorGlow = document.querySelector('.cursor-glow');
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    // Remove cursor entirely on mobile
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Glow follows with ease (requestAnimationFrame for smoothness)
        const animateCursor = () => {
            glowX += (mouseX - glowX) * 0.15;
            glowY += (mouseY - glowY) * 0.15;

            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Magnetic effect and cursor styling on hover
        const interactables = document.querySelectorAll('a, button, .magnetic, .magnetic-text');

        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('active');
                cursorGlow.classList.add('active');
            });

            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('active');
                cursorGlow.classList.remove('active');

                // Reset magnetic transform
                if (el.classList.contains('magnetic') || el.classList.contains('magnetic-text')) {
                    el.style.transform = `translate(0px, 0px)`;
                }
            });

            // Magnetic Pull
            if (el.classList.contains('magnetic') || el.classList.contains('magnetic-text')) {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    const pullStr = el.classList.contains('magnetic-text') ? 0.2 : 0.4;
                    el.style.transform = `translate(${x * pullStr}px, ${y * pullStr}px)`;
                });
            }
        });
    }


    /* --- Scroll Animations (Intersection Observer) --- */
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');

                // If it's a target containing slide-ups, trigger them
                const slideUps = entry.target.querySelectorAll('.slide-up');
                if (slideUps.length) {
                    slideUps.forEach(el => el.classList.add('appear'));
                }

                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    document.querySelectorAll('.fade-in, section').forEach(el => {
        appearOnScroll.observe(el);
    });

    /* --- Navbar Scroll Effect --- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- 3D Tilt Effect on Project Cards --- */
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        const content = card.querySelector('.project-content');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // max rotation 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            content.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            content.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            content.style.transition = `transform 0.5s ease`;

            setTimeout(() => {
                content.style.transition = ``; // Remove transition to prevent delay on next hover
            }, 500);
        });
    });


    /* --- Parallax Scrolling Elements --- */
    const parallaxElements = document.querySelectorAll('.parallax');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });


    /* --- Three.js WebGL Particle Wave Background --- */
    initThreeJsBackground();

});

function initThreeJsBackground() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded.');
        return;
    }

    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();

    // Add subtle fog to blend into background
    scene.fog = new THREE.FogExp2(0x030305, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // Particle Setup
    const particlesData = [];
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const SEPARATION = 100;
    const AMOUNTX = 50;
    const AMOUNTY = 50;

    let initNum = 0;
    const color = new THREE.Color();

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            if (initNum >= particleCount) break;

            positions[initNum * 3] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
            positions[initNum * 3 + 1] = 0;
            positions[initNum * 3 + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);

            // Base color matches accent-1 (#00f2fe to #4facfe)
            color.setHSL(0.55 + Math.random() * 0.05, 1.0, 0.6);
            colors[initNum * 3] = color.r;
            colors[initNum * 3 + 1] = color.g;
            colors[initNum * 3 + 2] = color.b;

            initNum++;
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader material for glowing round particles
    const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    });

    // Animation Loop
    let count = 0;
    function animate() {
        requestAnimationFrame(animate);

        // Interpolate target for smooth camera movement
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY + 400 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        const positions = particles.geometry.attributes.position.array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                if (i >= particleCount) break;

                // Sine wave math
                positions[i * 3 + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                    (Math.sin((iy + count) * 0.5) * 50);
                i++;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;

        count += 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
