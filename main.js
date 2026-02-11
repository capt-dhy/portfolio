// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    paddingBottom: 20
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// GSAP registration
gsap.registerPlugin(ScrollTrigger);

// THREE.JS SETUP
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#webgl-canvas'),
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 5; // Spread particles
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0x00f3ff, // Primary cyan
    transparent: true,
    opacity: 0.8,
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

camera.position.z = 2;

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotate entire system slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Mouse interactive rotation
    particlesMesh.rotation.y += mouseX * 0.05;
    particlesMesh.rotation.x += mouseY * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// GSAP ANIMATIONS
// Hero Text Reveal
const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

tl.from(".hero-title .line", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    skewY: 7
})
    .from(".hero-subtitle", {
        y: 20,
        opacity: 0,
        duration: 1
    }, "-=1")
    .from(".navbar", {
        y: -50,
        opacity: 0,
        duration: 1
    }, "-=0.8");

// ScrollTriggers can be added here later for sections

// CUSTOM CURSOR
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot - instant
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline - animated
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// HORIZONTAL SCROLL - WORK SECTION
// Use ScrollTrigger.matchMedia for responsive handling
ScrollTrigger.matchMedia({
    // Desktop only
    "(min-width: 769px)": function() {
        const sections = gsap.utils.toArray('.project-card');
        const gallery = document.querySelector('.work-gallery');

        // Setup horizontal layout
        gallery.style.display = 'flex';
        gallery.style.width = '300%';
        gallery.style.gridTemplateColumns = 'none';

        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: ".work-section",
                pin: true,
                scrub: 1,
                snap: 1 / (sections.length - 1),
                end: () => "+=" + gallery.offsetWidth
            }
        });
    },
    
    // Mobile/Tablet
    "(max-width: 768px)": function() {
        // Reset styles for vertical stacking
        const gallery = document.querySelector('.work-gallery');
        gallery.style.display = 'grid';
        gallery.style.width = '100%';
        gallery.style.gridTemplateColumns = '1fr';
        
        // Ensure no transform remains
        gsap.set('.project-card', { clearProps: "all" });
    }
});
// PRELOADER
const counter = document.querySelector('.counter');
let count = 0;

const updateCounter = () => {
    count += Math.floor(Math.random() * 5) + 1;
    if (count >= 100) {
        count = 100;
        counter.textContent = count;

        // Finish Preloader
        gsap.to('.preloader', {
            y: '-100%',
            duration: 1.5,
            ease: "power4.inOut",
            delay: 0.5
        });

        // Start Here Animations
        revealHero();
    } else {
        counter.textContent = count;
        requestAnimationFrame(updateCounter);
    }
}
updateCounter();

function revealHero() {
    // Only run if not already running
    if (!tl.isActive()) {
        tl.restart();
    }
}

// MAGNETIC BUTTONS
const magnets = document.querySelectorAll('.nav-link, .btn-glow');

magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(magnet, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3
        });

        // Also attract cursor
        gsap.to('.cursor-outline', {
            width: 60,
            height: 60,
            duration: 0.2
        });
    });

    magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, {
            x: 0,
            y: 0,
            duration: 0.3
        });
        gsap.to('.cursor-outline', {
            width: 40,
            height: 40,
            duration: 0.2
        });
    });
});


// MOBILE MENU
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Icon toggle
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// AUDIO SYSTEM
const hoverSound = document.getElementById('hover-sound');
const clickSound = document.getElementById('click-sound');

if (hoverSound && clickSound) {
    // Buttons & Links
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .service-card, .close-modal');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            hoverSound.currentTime = 0;
            hoverSound.volume = 0.2;
            hoverSound.play().catch(() => { }); // catch error if no user interaction yet
        });

        el.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.volume = 0.3;
            clickSound.play().catch(() => { });
        });
    });
}

// PROJECT PORTALS (MODAL) SYSTEM
const modal = document.querySelector('.modal');
const modalTitle = document.querySelector('.modal-title');
const modalTech = document.querySelector('.modal-tech-stack');
const modalDesc = document.querySelector('.modal-description');
const modalImg = document.querySelector('.modal-image img');
const closeModal = document.querySelector('.close-modal');
const projectCards = document.querySelectorAll('.project-card');

const openModal = (card) => {
    // Populate Data
    modalTitle.textContent = card.dataset.title;
    modalTech.textContent = card.dataset.tech;
    modalDesc.textContent = card.dataset.description;
    
    // In a real app, you'd having matching images. For now we use the card BG color/gradient or a placeholder
    // If card has an image, use it. If not, maybe use a color.
    // Let's assume the images named in data-image exist, or fallback.
    modalImg.src = card.dataset.image; 
    // Fallback for demo if image fails or is empty
    modalImg.onerror = () => {
        modalImg.src = 'https://via.placeholder.com/800x600/000000/00f3ff?text=Project+Preview';
    };

    // Show Modal
    modal.classList.add('active');
    
    // Pause Lenis Scroll
    lenis.stop();
};

const closeModalFunc = () => {
    modal.classList.remove('active');
    lenis.start();
};

// Event Listeners
projectCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
});

closeModal.addEventListener('click', closeModalFunc);

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunc();
    }
});

// Close on Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModalFunc();
    }
});

// 3D SKILLS CONSTELLATION
const initSkills3D = () => {
    const container = document.getElementById('skills-3d-container');
    if (!container) return; // Guard clause

    // Scene Setup
    const scene = new THREE.Scene();
    // Camera
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Skills Data
    const skills = [
        { name: "React", type: "frontend", pos: [0, 0, 0] },
        { name: "Three.js", type: "frontend", pos: [3, 2, 1] },
        { name: "Node.js", type: "backend", pos: [-3, -2, 1] },
        { name: "Laravel", type: "backend", pos: [-2, 3, -1] },
        { name: "Vue.js", type: "frontend", pos: [2, -3, -1] },
        { name: "HTML/CSS", type: "frontend", pos: [4, 0, 2] },
        { name: "MongoDB", type: "backend", pos: [-4, 1, 2] },
        { name: "GSAP", type: "frontend", pos: [1, 4, 0] },
        { name: "MySQL", type: "backend", pos: [-1, -4, 0] },
        { name: "Git", type: "tool", pos: [0, -5, 3] },
        { name: "Figma", type: "tool", pos: [0, 5, 3] },
    ];

    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    // Geometry & Materials
    const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
    
    // Store meshes for raycasting
    const nodeMeshes = [];

    // Create Nodes
    skills.forEach(skill => {
        const mesh = new THREE.Mesh(sphereGeo, nodeMat.clone()); // Clone material to allow individual highlighting
        mesh.position.set(skill.pos[0], skill.pos[1], skill.pos[2]);
        mesh.userData = { name: skill.name, originalColor: 0x00f3ff };
        nodesGroup.add(mesh);
        nodeMeshes.push(mesh);
    });

    // Create Connections
    const linesMat = new THREE.LineBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.15
    });

    const linesGeo = new THREE.BufferGeometry();
    const positions = [];

    // Connect every node to every other node (if close enough) or just random connections
    // For a constellation, let's connect all nearby nodes
    for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
            const dist = new THREE.Vector3(...skills[i].pos).distanceTo(new THREE.Vector3(...skills[j].pos));
            if (dist < 8) { // Connection threshold
                positions.push(...skills[i].pos);
                positions.push(...skills[j].pos);
            }
        }
    }

    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const linesMesh = new THREE.LineSegments(linesGeo, linesMat);
    nodesGroup.add(linesMesh);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    container.appendChild(tooltip);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        // Tooltip positioning
        tooltip.style.left = `${event.clientX - rect.left}px`;
        tooltip.style.top = `${event.clientY - rect.top}px`;
    };

    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Auto Rotation
        nodesGroup.rotation.y += 0.002;
        nodesGroup.rotation.x += 0.001;

        // Raycasting
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes);

        // Reset all nodes
        nodeMeshes.forEach(mesh => {
            mesh.material.color.setHex(0x00f3ff);
            mesh.scale.set(1, 1, 1);
            mesh.material.wireframe = true;
        });

        tooltip.style.opacity = '0';

        if (intersects.length > 0) {
            const target = intersects[0].object;
            target.material.color.setHex(0xbc13fe); // Highlight color
            target.scale.set(1.5, 1.5, 1.5);
            target.material.wireframe = false;
            
            // Show Tooltip
            tooltip.textContent = target.userData.name;
            tooltip.style.opacity = '1';
            
            // Mouse interaction rotation effect
            nodesGroup.rotation.y += mouse.x * 0.01;
            nodesGroup.rotation.x -= mouse.y * 0.01;
        }

        renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
};

// Initialize after DOM load
window.addEventListener('load', () => {
    initSkills3D();
    initCommandMode();
});

// COMMAND MODE (GOD MODE)
const initCommandMode = () => {
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('palette-input');
    const suggestionsContainer = document.getElementById('palette-suggestions');
    
    if (!palette || !input || !suggestionsContainer) return;

    const commands = [
        { cmd: '> home', desc: 'Go to Top', action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); } },
        { cmd: '> work', desc: 'Browse Projects', action: () => { document.querySelector('#work').scrollIntoView({ behavior: 'smooth' }); } },
        { cmd: '> about', desc: 'View Skills & Bio', action: () => { document.querySelector('#about').scrollIntoView({ behavior: 'smooth' }); } },
        { cmd: '> contact', desc: 'Send a Message', action: () => { document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' }); } },
        { cmd: '> email', desc: 'Email Me', action: () => { window.location.href = 'mailto:hello@dhy.tech'; } },
        { cmd: '> github', desc: 'View GitHub Profile', action: () => { window.open('https://github.com/capt-dhy', '_blank'); } },
        { cmd: '> linkedin', desc: 'Connect on LinkedIn', action: () => { window.open('https://linkedin.com/in/dawood-hassan-882b26340', '_blank'); } },
        { cmd: '> theme', desc: 'Toggle Light/Dark Mode (Coming Soon)', action: () => { alert('Coming soon!'); } },
    ];

    let filteredCommands = [];
    let selectedIndex = 0;

    const openPalette = () => {
        palette.classList.add('active');
        input.value = '';
        input.focus();
        filterCommands('');
        lenis.stop();
    };

    const closePalette = () => {
        palette.classList.remove('active');
        lenis.start();
    };

    const renderSuggestions = () => {
        suggestionsContainer.innerHTML = '';
        filteredCommands.forEach((cmd, index) => {
            const div = document.createElement('div');
            div.className = `suggestion-item ${index === selectedIndex ? 'selected' : ''}`;
            div.innerHTML = `
                <span class="command">${cmd.cmd}</span>
                <span class="desc">${cmd.desc}</span>
            `;
            div.addEventListener('click', () => {
                cmd.action();
                closePalette();
            });
            div.addEventListener('mouseenter', () => {
                selectedIndex = index;
                renderSuggestions();
            });
            suggestionsContainer.appendChild(div);
        });
    };

    const filterCommands = (query) => {
        filteredCommands = commands.filter(c => c.cmd.includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase()));
        selectedIndex = 0;
        renderSuggestions();
    };

    // Global Shortcut
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (palette.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
        }
        
        if (e.key === 'Escape' && palette.classList.contains('active')) {
            closePalette();
        }
    });

    // Input Handling
    input.addEventListener('input', (e) => {
        filterCommands(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredCommands.length;
            renderSuggestions();
            // Scroll to view if needed
            const selected = suggestionsContainer.children[selectedIndex];
            if (selected) selected.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
            renderSuggestions();
            const selected = suggestionsContainer.children[selectedIndex];
            if (selected) selected.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                closePalette();
            }
        }
    });

    // Close on outside click
    palette.addEventListener('click', (e) => {
        if (e.target === palette) closePalette();
    });
};
