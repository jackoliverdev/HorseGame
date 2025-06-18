// 3D Hero Component for Horse Game - SIMPLE VERSION! 🐎✨
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class Hero3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // Mobile detection - same as script.js
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
                        window.innerWidth <= 768;
        
        console.log(`📱 Hero3D Device detected: ${this.isMobile ? 'Mobile' : 'Desktop'}`);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !this.isMobile, // Disable antialiasing on mobile for performance
            alpha: true,
            powerPreference: this.isMobile ? "low-power" : "high-performance"
        });
        this.clock = new THREE.Clock();
        this.horse = null;
        this.horse2 = null; // Second horse
        this.horseMixer = null;
        this.horseMixer2 = null; // Second horse mixer
        this.prevTime = Date.now();
        this.prevTime2 = Date.now(); // Separate time tracking for second horse
        
        this.init();
        this.createScene();
        this.setupResizeHandler();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB, 1.0); // Sky blue like script.js
        this.renderer.shadowMap.enabled = false;
        
        // Mobile-specific optimizations
        if (this.isMobile) {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio on mobile
            console.log('📱 Mobile optimizations applied to Hero3D');
        } else {
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
        
        this.container.appendChild(this.renderer.domElement);
        
        console.log('🎮 Hero 3D scene initialized!');
    }

    createScene() {
        this.createSky();
        this.createGround();
        this.createFences();
        this.createBarn();
        
        // Reduce complexity on mobile
        if (this.isMobile) {
            this.createTreesMobile(); // Fewer trees for mobile
            this.createRocksMobile(); // Fewer rocks for mobile
            this.createFieldContentMobile(); // Simplified field content for mobile
        } else {
            this.createTrees();
            this.createRocks();
            this.createFieldContent();
        }
        
        this.createLighting();
        this.createHorse();
        this.setupCamera();
        this.animate();
    }

    createSky() {
        // Create sky with mobile optimization
        const segments = this.isMobile ? 16 : 32; // Reduce segments on mobile
        const rings = this.isMobile ? 8 : 15; // Reduce rings on mobile
        
        const skyGeometry = new THREE.SphereGeometry(1000, segments, rings);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB, // Sky blue
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        
        if (this.isMobile) {
            console.log('📱 Mobile: Created optimized sky');
        }
    }

    createGround() {
        // Create ground with mobile optimization
        const segments = this.isMobile ? 50 : 100; // Reduce segments on mobile
        
        const groundGeometry = new THREE.PlaneGeometry(800, 800, segments, segments);
        
        // Create grass texture
        const grassTexture = this.createGrassTexture();
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(20, 20);

        const groundMaterial = new THREE.MeshLambertMaterial({
            map: grassTexture
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = -1; // Slightly below origin like script.js
        ground.receiveShadow = false;
        this.scene.add(ground);
        
        if (this.isMobile) {
            console.log('📱 Mobile: Created optimized ground');
        }
    }

    createFences() {
        // Create fences exactly like script.js but scaled down
        const scale = 0.1; // Scale down the fences for hero section
        
        // Create the 4 field boundaries (2x2 grid) - scaled down
        const fences = [];
        
        // Outer boundary fences - scaled down from script.js
        fences.push(this.createFence(-200, -200, 200, -200, 8)); // North fence
        fences.push(this.createFence(-200, 200, 200, 200, 8)); // South fence  
        fences.push(this.createFence(-200, -200, -200, 200, 8)); // West fence
        fences.push(this.createFence(200, -200, 200, 200, 8)); // East fence
        
        // Internal dividers - CLEAN CROSS
        fences.push(this.createFence(-200, 0, 200, 0, 8)); // Horizontal divider
        fences.push(this.createFence(0, -200, 0, 200, 8)); // Vertical divider
        
        // Add gate openings
        fences.push(this.createFence(-15, -0.1, 15, -0.1, 6)); // North-South gate
        fences.push(this.createFence(-0.1, -15, -0.1, 15, 6)); // East-West gate
        
        fences.forEach(fence => this.scene.add(fence));
    }

    createFence(startX, startZ, endX, endZ, height = 8) {
        // Create fence exactly like script.js but scaled down
        const fenceGroup = new THREE.Group();
        
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2));
        const posts = Math.floor(distance / 5) + 1; // Post every 5 units (scaled down)
        
        for (let i = 0; i < posts; i++) {
            const t = i / (posts - 1);
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            
            // Fence post - scaled down
            const postGeometry = new THREE.BoxGeometry(0.8, height, 0.8);
            const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(x, height / 2, z);
            post.castShadow = false;
            fenceGroup.add(post);
            
            // Horizontal rails (if not the last post)
            if (i < posts - 1) {
                const nextT = (i + 1) / (posts - 1);
                const nextX = startX + (endX - startX) * nextT;
                const nextZ = startZ + (endZ - startZ) * nextT;
                
                const railLength = Math.sqrt(Math.pow(nextX - x, 2) + Math.pow(nextZ - z, 2));
                const angle = Math.atan2(nextZ - z, nextX - x);
                
                // Three horizontal rails - scaled down
                for (let railY of [height * 0.25, height * 0.5, height * 0.75]) {
                    const railGeometry = new THREE.BoxGeometry(railLength, 0.6, 2); // Scaled down
                    const railMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
                    const rail = new THREE.Mesh(railGeometry, railMaterial);
                    rail.position.set(
                        x + (nextX - x) / 2,
                        railY,
                        z + (nextZ - z) / 2
                    );
                    rail.rotation.y = angle;
                    rail.castShadow = false;
                    fenceGroup.add(rail);
                }
            }
        }
        
        return fenceGroup;
    }

    createGrassTexture() {
        // Create grass texture exactly like script.js
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Create grass base colour
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4a7c59'); // Darker green
        gradient.addColorStop(1, '#6b8e23'); // Olive green
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some grass texture noise
        for (let i = 0; i < 1000; i++) {
            context.fillStyle = Math.random() > 0.5 ? '#5a8b3a' : '#3d5a2a';
            context.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 3 + 1,
                Math.random() * 3 + 1
            );
        }
        
        return new THREE.CanvasTexture(canvas);
    }

    createLighting() {
        // Simple lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
    }

    createHorse() {
        // Load horse model - fewer horses on mobile for performance
        console.log('🐎 Loading horse models...');
        
        const loader = new GLTFLoader();
        
        // Load first horse (always load this one)
        loader.load('https://threejs.org/examples/models/gltf/Horse.glb', (gltf) => {
            console.log('🐎 FIRST HORSE LOADED!');
            
            this.horse = gltf.scene.children[0].clone();
            this.horse.scale.set(0.15, 0.15, 0.15);
            this.horse.position.set(-80, 0, 50); // Better position in the left field
            
            // Disable frustum culling completely
            this.horse.frustumCulled = false;
            this.horse.traverse((child) => {
                if (child.isMesh) {
                    child.frustumCulled = false;
                }
            });
            
            this.scene.add(this.horse);

            // Animation for first horse
            this.horseMixer = new THREE.AnimationMixer(this.horse);
            this.horseMixer.clipAction(gltf.animations[0]).setDuration(1).play();
            
            // Movement setup for first horse - smaller radius and better centered
            this.horseMovement = {
                angle: 0,
                radius: 10, // Much smaller radius to keep horse on screen
                speed: 0.01,
                centerX: -80, // Better centered in the left field
                centerZ: 50
            };
            
            console.log('🏃‍♂️ First horse ready!');
            
            // Only load second horse on desktop for performance
            if (!this.isMobile) {
                this.loadSecondHorse(gltf);
            } else {
                console.log('📱 Mobile: Skipping second horse for performance');
            }
        }, (progress) => {
            console.log('Loading first horse:', Math.round(progress.loaded / progress.total * 100) + '%');
        }, (error) => {
            console.error('❌ First horse loading failed:', error);
        });
    }

    loadSecondHorse(gltf) {
        // Load second horse (desktop only)
        console.log('🐎 Loading second horse for desktop...');
        
        this.horse2 = gltf.scene.children[0].clone();
        this.horse2.scale.set(0.15, 0.15, 0.15);
        this.horse2.position.set(80, 0, -50); // Position in the back-right field
        
        // Disable frustum culling completely
        this.horse2.frustumCulled = false;
        this.horse2.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
            }
        });
        
        this.scene.add(this.horse2);

        // Animation for second horse
        this.horseMixer2 = new THREE.AnimationMixer(this.horse2);
        this.horseMixer2.clipAction(gltf.animations[0]).setDuration(1).play();
        
        // Movement setup for second horse - opposite direction
        this.horseMovement2 = {
            angle: Math.PI, // Start at opposite angle
            radius: 10,
            speed: 0.01,
            centerX: 80, // Centered in the back-right field
            centerZ: -50
        };
        
        console.log('🏃‍♂️ Second horse ready!');
    }

    setupCamera() {
        // Move camera back and up for better view of the fields
        this.camera.position.set(60, 50, 100); // Moved back and higher
        this.camera.lookAt(-50, 0, -50); // Look at the front field where horse is running
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update horse animations
        if (this.horseMixer) {
            const time = Date.now();
            this.horseMixer.update((time - this.prevTime) * 0.001);
            this.prevTime = time;
        }
        
        if (this.horseMixer2) {
            const time2 = Date.now();
            this.horseMixer2.update((time2 - this.prevTime2) * 0.001);
            this.prevTime2 = time2;
        }
        
        // Move first horse in circle
        if (this.horse && this.horseMovement) {
            this.horseMovement.angle += this.horseMovement.speed;
            
            this.horse.position.x = Math.cos(this.horseMovement.angle) * this.horseMovement.radius + this.horseMovement.centerX;
            this.horse.position.z = Math.sin(this.horseMovement.angle) * this.horseMovement.radius + this.horseMovement.centerZ;
            this.horse.position.y = 0;
            
            // Face movement direction
            const lookX = Math.cos(this.horseMovement.angle + 0.1) * this.horseMovement.radius + this.horseMovement.centerX;
            const lookZ = Math.sin(this.horseMovement.angle + 0.1) * this.horseMovement.radius + this.horseMovement.centerZ;
            this.horse.lookAt(lookX, 0, lookZ);
        }
        
        // Move second horse in circle (opposite direction)
        if (this.horse2 && this.horseMovement2) {
            this.horseMovement2.angle += this.horseMovement2.speed;
            
            this.horse2.position.x = Math.cos(this.horseMovement2.angle) * this.horseMovement2.radius + this.horseMovement2.centerX;
            this.horse2.position.z = Math.sin(this.horseMovement2.angle) * this.horseMovement2.radius + this.horseMovement2.centerZ;
            this.horse2.position.y = 0;
            
            // Face movement direction
            const lookX2 = Math.cos(this.horseMovement2.angle + 0.1) * this.horseMovement2.radius + this.horseMovement2.centerX;
            const lookZ2 = Math.sin(this.horseMovement2.angle + 0.1) * this.horseMovement2.radius + this.horseMovement2.centerZ;
            this.horse2.lookAt(lookX2, 0, lookZ2);
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }

    createBarn() {
        // Create barn exactly like script.js but scaled down for hero section
        const barn = this.createBarnStructure(-100, -100); // Position in back-left field
        this.scene.add(barn);
    }

    createBarnStructure(x, z) {
        // EXACT same barn creation as script.js but scaled down
        const barn = new THREE.Group();
        
        // Main barn structure - bigger scale (6x smaller instead of 10x)
        const barnGeometry = new THREE.BoxGeometry(50, 33, 83); // 6x smaller
        const barnMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Dark red
        const barnMain = new THREE.Mesh(barnGeometry, barnMaterial);
        barnMain.position.y = 16.5; // 6x smaller
        barnMain.castShadow = false;
        
        // Barn roof
        const roofGeometry = new THREE.ConeGeometry(42, 13, 4); // 6x smaller
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 40; // 6x smaller
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = false;
        
        // Barn doors
        const doorGeometry = new THREE.BoxGeometry(13, 20, 0.8); // 6x smaller
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
        const door1 = new THREE.Mesh(doorGeometry, doorMaterial);
        door1.position.set(-3.3, 10, 42); // 6x smaller
        const door2 = new THREE.Mesh(doorGeometry, doorMaterial);
        door2.position.set(3.3, 10, 42); // 6x smaller
        
        barn.add(barnMain, roof, door1, door2);
        barn.position.set(x, 0, z);
        return barn;
    }

    createTrees() {
        // Create trees exactly like script.js but scaled down for hero section
        const trees = [];
        
        // Add a few scattered trees in different fields
        for (let i = 0; i < 6; i++) {
            const x = (Math.random() - 0.5) * 300; // Scaled down range
            const z = (Math.random() - 0.5) * 300;
            const scale = 0.1 + Math.random() * 0.05; // Much smaller scale for hero
            trees.push(this.createTreeStructure(x, z, scale));
        }
        
        trees.forEach(tree => this.scene.add(tree));
    }

    createTreeStructure(x, z, scale = 0.1) {
        // EXACT same tree creation as script.js but scaled down
        const tree = new THREE.Group();
        
        // Tree trunk - scaled down from script.js
        const trunkGeometry = new THREE.CylinderGeometry(15 * scale, 25 * scale, 120 * scale);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 60 * scale;
        trunk.castShadow = false;
        
        // Tree foliage - scaled down from script.js
        const foliageGeometry = new THREE.SphereGeometry(80 * scale, 8, 6);
        const foliageMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.3, 0.6, 0.3 + Math.random() * 0.2) // Varied greens
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 150 * scale;
        foliage.castShadow = false;
        
        tree.add(trunk);
        tree.add(foliage);
        tree.position.set(x, 0, z);
        
        return tree;
    }

    createRocks() {
        // Create rocks/boulders exactly like script.js but scaled down
        for (let i = 0; i < 4; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 5 + 2.5); // 10x smaller
            const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 300, // Scaled down range
                Math.random() * 1.5, // Scaled down height
                (Math.random() - 0.5) * 300
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = false;
            this.scene.add(rock);
        }
    }

    createFieldContent() {
        // Create themed field content exactly like script.js but scaled down
        
        // Wildflower Field (back-left: -100, -100)
        for (let i = 0; i < 3; i++) {
            const x = -100 + (Math.random() - 0.5) * 80; // Scaled down from 1600 to 80
            const z = -100 + (Math.random() - 0.5) * 80;
            const wildflowers = this.createWildflowerPatchStructure(x, z);
            this.scene.add(wildflowers);
        }
        
        // Wheat Field (back-right: 100, -100)
        for (let i = 0; i < 3; i++) {
            const x = 100 + (Math.random() - 0.5) * 70; // Scaled down from 1400 to 70
            const z = -100 + (Math.random() - 0.5) * 70;
            const wheat = this.createWheatFieldStructure(x, z);
            this.scene.add(wheat);
        }
        
        // Cattle Pasture (front-left: -100, 100) - just extra trees since horses are there
        for (let i = 0; i < 2; i++) {
            const x = -100 + (Math.random() - 0.5) * 70;
            const z = 100 + (Math.random() - 0.5) * 70;
            const tree = this.createTreeStructure(x, z, 0.12);
            this.scene.add(tree);
        }
        
        // Hay Field (front-right: 100, 100) - just extra trees since horses are there
        for (let i = 0; i < 2; i++) {
            const x = 100 + (Math.random() - 0.5) * 70;
            const z = 100 + (Math.random() - 0.5) * 70;
            const tree = this.createTreeStructure(x, z, 0.12);
            this.scene.add(tree);
        }
    }

    createWildflowerPatchStructure(x, z) {
        // EXACT same wildflower creation as script.js but scaled down
        const flowerPatch = new THREE.Group();
        
        // Create various wildflowers - scaled down from 25 to 5
        for (let i = 0; i < 5; i++) {
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 4); // 10x smaller
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            
            // Flower head
            const flowerGeometry = new THREE.SphereGeometry(0.4, 6, 4); // 10x smaller
            const flowerColors = [0xFF69B4, 0xFF4500, 0xFFFF00, 0x9370DB, 0xFF1493];
            const flowerMaterial = new THREE.MeshLambertMaterial({ 
                color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
            });
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flower.position.y = 2; // 10x smaller
            
            stem.add(flower);
            stem.position.set(
                (Math.random() - 0.5) * 8, // 10x smaller
                1, // 10x smaller
                (Math.random() - 0.5) * 8
            );
            stem.castShadow = false;
            flowerPatch.add(stem);
        }
        
        flowerPatch.position.set(x, 0, z);
        return flowerPatch;
    }

    createWheatFieldStructure(x, z) {
        // EXACT same wheat creation as script.js but scaled down
        const wheatField = new THREE.Group();
        
        // Create multiple wheat stalks - scaled down from 20 to 4
        for (let i = 0; i < 4; i++) {
            const wheatGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6, 4); // 10x smaller
            const wheatMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
            const wheat = new THREE.Mesh(wheatGeometry, wheatMaterial);
            
            wheat.position.set(
                (Math.random() - 0.5) * 10, // 10x smaller
                3, // 10x smaller
                (Math.random() - 0.5) * 10
            );
            wheat.castShadow = false;
            wheatField.add(wheat);
        }
        
        wheatField.position.set(x, 0, z);
        return wheatField;
    }

    createTreesMobile() {
        // Create fewer trees for mobile performance - only 3 instead of 6
        const trees = [];
        
        for (let i = 0; i < 3; i++) {
            const x = (Math.random() - 0.5) * 200; // Smaller range
            const z = (Math.random() - 0.5) * 200;
            const scale = 0.08 + Math.random() * 0.03; // Slightly smaller
            trees.push(this.createTreeStructure(x, z, scale));
        }
        
        trees.forEach(tree => this.scene.add(tree));
        console.log('📱 Mobile: Created 3 optimized trees');
    }

    createRocksMobile() {
        // Create fewer rocks for mobile performance - only 2 instead of 4
        for (let i = 0; i < 2; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 3 + 1.5); // Smaller rocks
            const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 200, // Smaller range
                Math.random() * 1,
                (Math.random() - 0.5) * 200
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = false;
            this.scene.add(rock);
        }
        console.log('📱 Mobile: Created 2 optimized rocks');
    }

    createFieldContentMobile() {
        // Simplified field content for mobile - fewer plants per field
        
        // Wildflower Field (back-left) - only 1 patch instead of 3
        const x1 = -100 + (Math.random() - 0.5) * 60;
        const z1 = -100 + (Math.random() - 0.5) * 60;
        const wildflowers = this.createWildflowerPatchMobile(x1, z1);
        this.scene.add(wildflowers);
        
        // Wheat Field (back-right) - only 1 patch instead of 3
        const x2 = 100 + (Math.random() - 0.5) * 60;
        const z2 = -100 + (Math.random() - 0.5) * 60;
        const wheat = this.createWheatFieldMobile(x2, z2);
        this.scene.add(wheat);
        
        // Skip extra trees in pasture fields for mobile performance
        
        console.log('📱 Mobile: Created simplified field content');
    }

    createWildflowerPatchMobile(x, z) {
        // Simplified wildflower patch for mobile - only 3 flowers instead of 5
        const flowerPatch = new THREE.Group();
        
        for (let i = 0; i < 3; i++) {
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 3); // Lower poly count
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            
            // Flower head
            const flowerGeometry = new THREE.SphereGeometry(0.4, 4, 3); // Lower poly count
            const flowerColors = [0xFF69B4, 0xFF4500, 0xFFFF00, 0x9370DB, 0xFF1493];
            const flowerMaterial = new THREE.MeshLambertMaterial({ 
                color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
            });
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flower.position.y = 2;
            
            stem.add(flower);
            stem.position.set(
                (Math.random() - 0.5) * 6,
                1,
                (Math.random() - 0.5) * 6
            );
            stem.castShadow = false;
            flowerPatch.add(stem);
        }
        
        flowerPatch.position.set(x, 0, z);
        return flowerPatch;
    }

    createWheatFieldMobile(x, z) {
        // Simplified wheat field for mobile - only 2 stalks instead of 4
        const wheatField = new THREE.Group();
        
        for (let i = 0; i < 2; i++) {
            const wheatGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6, 3); // Lower poly count
            const wheatMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
            const wheat = new THREE.Mesh(wheatGeometry, wheatMaterial);
            
            wheat.position.set(
                (Math.random() - 0.5) * 8,
                3,
                (Math.random() - 0.5) * 8
            );
            wheat.castShadow = false;
            wheatField.add(wheat);
        }
        
        wheatField.position.set(x, 0, z);
        return wheatField;
    }

    setupResizeHandler() {
        // Handle window resize and mobile orientation changes
        const handleResize = () => {
            // Update camera aspect ratio
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            // Update renderer size
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Mobile-specific handling
            if (this.isMobile) {
                // Recalculate pixel ratio on mobile orientation change
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                console.log('📱 Mobile: Hero3D resize handled');
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Handle mobile orientation changes specifically
        if (this.isMobile) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    handleResize();
                }, 500); // Delay for orientation change
            });
        }
    }
}

// Export for use in HTML
export default Hero3D;
window.Hero3D = Hero3D; 