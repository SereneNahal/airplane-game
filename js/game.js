// Main game variables
let scene, camera, renderer;
let airplane, obstacles = [], stars = [], enemies = [];
let playerProjectiles = [], enemyProjectiles = [];
let score = 0;
let playerHealth = 350;  // Increased player health for better survivability
let gameActive = true;
let clock = new THREE.Clock();
let speed = 0.5;
let lastShootTime = 0;  // For controlling shooting rate

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    // Add lighting
    addLights();
    
    // Create clouds (environment)
    createEnvironment();
    
    // Create airplane
    createAirplane();
    
    // Handle keyboard input
    setupControls();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
    
    // Start generating stars and enemies
    setInterval(createStar, 3000);
    setInterval(createEnemy, 5000);
}

// Add lights to the scene
function addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
}

// Create clouds and environment
function createEnvironment() {
    // Add a simple ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x1E824C, // Green
        side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -10;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add some clouds (simple white spheres)
    for (let i = 0; i < 20; i++) {
        const cloudGeometry = new THREE.SphereGeometry(2, 8, 8);
        const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        
        cloud.position.x = Math.random() * 100 - 50;
        cloud.position.y = Math.random() * 20 + 10;
        cloud.position.z = Math.random() * 100 - 50;
        
        // Make clouds a bit random in shape
        cloud.scale.set(
            1 + Math.random() * 2,
            0.8 + Math.random(),
            0.7 + Math.random() * 1.5
        );
        
        scene.add(cloud);
    }
    
    // Add trees to the environment
    createTrees();
}

// Create realistic trees
function createTrees() {
    for (let i = 0; i < 80; i++) {
        // Create tree group
        const treeGroup = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Tree foliage (multiple layers for more realistic look)
        const foliageColors = [0x2E8B57, 0x3CB371, 0x228B22]; // Different shades of green
        
        for (let j = 0; j < 3; j++) {
            const foliageGeometry = new THREE.ConeGeometry(2 - j * 0.3, 3, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ 
                color: foliageColors[j % foliageColors.length] 
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 5 + j * 1.5;
            foliage.castShadow = true;
            treeGroup.add(foliage);
        }
        
        // Position trees around the ground
        const angle = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 75;
        treeGroup.position.x = Math.sin(angle) * radius;
        treeGroup.position.z = Math.cos(angle) * radius;
        treeGroup.position.y = -10; // At ground level
        
        // Random scaling for variety
        const scale = 0.7 + Math.random() * 0.6;
        treeGroup.scale.set(scale, scale, scale);
        
        // Random rotation
        treeGroup.rotation.y = Math.random() * Math.PI * 2;
        
        scene.add(treeGroup);
    }
}

// Create the player's airplane
function createAirplane() {
    // More detailed airplane
    const airplaneGroup = new THREE.Group();
    
    // Airplane body (fuselage)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.3, 4, 12);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3498DB });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    airplaneGroup.add(body);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(5, 0.1, 1.2);
    const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x2980B9 });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = 0.1;
    wings.castShadow = true;
    airplaneGroup.add(wings);
    
    // Tail wing (vertical)
    const tailFinGeometry = new THREE.BoxGeometry(0.8, 1, 0.1);
    const tailFinMaterial = new THREE.MeshLambertMaterial({ color: 0x2980B9 });
    const tailFin = new THREE.Mesh(tailFinGeometry, tailFinMaterial);
    tailFin.position.z = -1.5;
    tailFin.position.y = 0.5;
    tailFin.castShadow = true;
    airplaneGroup.add(tailFin);
    
    // Horizontal tail wings
    const horizTailGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
    const horizTailMaterial = new THREE.MeshLambertMaterial({ color: 0x2980B9 });
    const horizTail = new THREE.Mesh(horizTailGeometry, horizTailMaterial);
    horizTail.position.z = -1.5;
    horizTail.position.y = 0.2;
    horizTail.castShadow = true;
    airplaneGroup.add(horizTail);
    
    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshLambertMaterial({ color: 0xAED6F1, transparent: true, opacity: 0.7 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.z = 0.7;
    cockpit.position.y = 0.5;
    cockpit.rotation.x = Math.PI / 2;
    cockpit.castShadow = true;
    airplaneGroup.add(cockpit);
    
    // Propeller hub
    const propHubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
    const propHubMaterial = new THREE.MeshLambertMaterial({ color: 0x34495E });
    const propHub = new THREE.Mesh(propHubGeometry, propHubMaterial);
    propHub.position.z = 2;
    propHub.rotation.x = Math.PI / 2;
    airplaneGroup.add(propHub);
    
    // Propeller blades
    const propGeometry = new THREE.BoxGeometry(1.8, 0.2, 0.05);
    const propMaterial = new THREE.MeshLambertMaterial({ color: 0x7F8C8D });
    
    // Prop 1
    const prop1 = new THREE.Mesh(propGeometry, propMaterial);
    prop1.position.z = 2.15;
    airplaneGroup.add(prop1);
    
    // Prop 2
    const prop2 = new THREE.Mesh(propGeometry, propMaterial);
    prop2.position.z = 2.15;
    prop2.rotation.z = Math.PI / 2;
    airplaneGroup.add(prop2);
    
    // Landing gear
    const gearLegGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const gearLegMaterial = new THREE.MeshLambertMaterial({ color: 0x7F8C8D });
    
    // Left gear
    const leftGearLeg = new THREE.Mesh(gearLegGeometry, gearLegMaterial);
    leftGearLeg.position.x = -0.8;
    leftGearLeg.position.y = -0.5;
    airplaneGroup.add(leftGearLeg);
    
    // Right gear
    const rightGearLeg = new THREE.Mesh(gearLegGeometry, gearLegMaterial);
    rightGearLeg.position.x = 0.8;
    rightGearLeg.position.y = -0.5;
    airplaneGroup.add(rightGearLeg);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x17202A });
    
    // Left wheel
    const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    leftWheel.position.x = -0.8;
    leftWheel.position.y = -0.9;
    leftWheel.rotation.x = Math.PI / 2;
    airplaneGroup.add(leftWheel);
    
    // Right wheel
    const rightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rightWheel.position.x = 0.8;
    rightWheel.position.y = -0.9;
    rightWheel.rotation.x = Math.PI / 2;
    airplaneGroup.add(rightWheel);
    
    // Animate propeller
    propHub.userData = {
        propellers: [prop1, prop2],
        rotationSpeed: 0.3
    };
    
    // Add to scene and save reference
    airplaneGroup.position.set(0, 0, 0);
    scene.add(airplaneGroup);
    airplane = airplaneGroup;
}

// Create enemy airplane
function createEnemy() {
    if (!gameActive) return;
    
    // Create enemy airplane - more detailed
    const enemyGroup = new THREE.Group();
    
    // Enemy body (fuselage)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.3, 3.5, 10);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x800000 }); // Dark red
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    enemyGroup.add(body);
    
    // Enemy wings
    const wingGeometry = new THREE.BoxGeometry(4, 0.1, 1);
    const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x580000 }); // Darker red
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = 0.1;
    wings.castShadow = true;
    enemyGroup.add(wings);
    
    // Tail wing (vertical)
    const tailFinGeometry = new THREE.BoxGeometry(0.7, 0.8, 0.1);
    const tailFinMaterial = new THREE.MeshLambertMaterial({ color: 0x580000 });
    const tailFin = new THREE.Mesh(tailFinGeometry, tailFinMaterial);
    tailFin.position.z = -1.4;
    tailFin.position.y = 0.4;
    tailFin.castShadow = true;
    enemyGroup.add(tailFin);
    
    // Horizontal tail wings
    const horizTailGeometry = new THREE.BoxGeometry(1.6, 0.1, 0.5);
    const horizTailMaterial = new THREE.MeshLambertMaterial({ color: 0x580000 });
    const horizTail = new THREE.Mesh(horizTailGeometry, horizTailMaterial);
    horizTail.position.z = -1.4;
    horizTail.position.y = 0.1;
    horizTail.castShadow = true;
    enemyGroup.add(horizTail);
    
    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.4, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.z = 0.6;
    cockpit.position.y = 0.4;
    cockpit.rotation.x = Math.PI / 2;
    cockpit.castShadow = true;
    enemyGroup.add(cockpit);
    
    // Propeller hub
    const propHubGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.25, 8);
    const propHubMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const propHub = new THREE.Mesh(propHubGeometry, propHubMaterial);
    propHub.position.z = 1.8;
    propHub.rotation.x = Math.PI / 2;
    enemyGroup.add(propHub);
    
    // Propeller blades
    const propGeometry = new THREE.BoxGeometry(1.4, 0.2, 0.05);
    const propMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    // Prop 1
    const prop1 = new THREE.Mesh(propGeometry, propMaterial);
    prop1.position.z = 1.9;
    enemyGroup.add(prop1);
    
    // Prop 2
    const prop2 = new THREE.Mesh(propGeometry, propMaterial);
    prop2.position.z = 1.9;
    prop2.rotation.z = Math.PI / 2;
    enemyGroup.add(prop2);
    
    // Position the enemy ahead of the camera at random position
    enemyGroup.position.x = Math.random() * 20 - 10;
    enemyGroup.position.y = Math.random() * 10 - 5;
    enemyGroup.position.z = -70; // Further ahead than obstacles
    
    // Add targeting data to make enemy follow player
    enemyGroup.userData = { 
        speed: 0.4 + Math.random() * 0.3, // Random speed
        turnRate: 0.01 + Math.random() * 0.02, // Random turning speed
        health: 70, // Enemy health as requested
        lastShootTime: 0, // For controlling enemy shooting rate
        propellers: [prop1, prop2],
        rotationSpeed: 0.3 + Math.random() * 0.1
    };
    
    scene.add(enemyGroup);
    enemies.push(enemyGroup);
}

// Create collectible stars
function createStar() {
    if (!gameActive) return;
    
    // Create a star (yellow cone)
    const starGeometry = new THREE.OctahedronGeometry(0.5, 0);
    const starMaterial = new THREE.MeshLambertMaterial({ color: 0xF1C40F });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    
    // Position the star ahead of the camera
    star.position.x = Math.random() * 16 - 8;
    star.position.y = Math.random() * 8 - 4;
    star.position.z = -50; // Far ahead
    
    // Rotation animation
    star.userData = { rotationSpeed: 0.03 };
    
    scene.add(star);
    stars.push(star);
}

// Create player projectile
function createPlayerProjectile() {
    // Limit shooting rate (can only shoot every 300ms)
    const currentTime = Date.now();
    if (currentTime - lastShootTime < 300) return;
    lastShootTime = currentTime;
    
    // Triple shot - create 3 projectiles
    createSingleProjectile(0); // Center projectile
    createSingleProjectile(-0.4); // Left projectile
    createSingleProjectile(0.4); // Right projectile
    
    // Add muzzle flash effect
    createMuzzleFlash(airplane.position.clone());
}

// Create a single player projectile
function createSingleProjectile(offsetX) {
    // Create projectile geometry - larger size
    const projectileGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
    }); // Brighter green projectile
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    // Position projectile at airplane's position with offset
    projectile.position.copy(airplane.position);
    projectile.position.x += offsetX;
    
    // Set projectile velocity (forward direction)
    projectile.userData = {
        velocity: new THREE.Vector3(0, 0, -2.5), // Faster projectiles
        damage: 50, // Increased damage from 30 to 50
        lifetime: 100 // frames
    };
    
    scene.add(projectile);
    playerProjectiles.push(projectile);
}

// Create enemy projectile
function createEnemyProjectile(enemy) {
    // Limit shooting rate (can only shoot every 1200ms)
    const currentTime = Date.now();
    if (currentTime - enemy.userData.lastShootTime < 1200) return;
    enemy.userData.lastShootTime = currentTime;
    
    // Create projectile geometry
    const projectileGeometry = new THREE.SphereGeometry(0.25, 8, 8); // Larger projectile
    const projectileMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    }); // Brighter red projectile
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    // Position projectile at enemy's position
    projectile.position.copy(enemy.position);
    
    // Calculate direction toward player
    const direction = new THREE.Vector3();
    direction.subVectors(airplane.position, enemy.position).normalize();
    
    // Set projectile velocity (toward player)
    projectile.userData = {
        velocity: direction.multiplyScalar(1.5), // Moving toward player
        damage: 70, // Enemy projectile damage updated to 70
        lifetime: 100 // frames
    };
    
    scene.add(projectile);
    enemyProjectiles.push(projectile);
    
    // Add muzzle flash effect
    createMuzzleFlash(enemy.position.clone());
}

// Create muzzle flash effect
function createMuzzleFlash(position) {
    const flashGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    
    // Position flash at shooter position
    flash.position.copy(position);
    
    scene.add(flash);
    
    // Remove flash after short duration
    setTimeout(() => {
        scene.remove(flash);
    }, 50);
}

// Handle keyboard controls
function setupControls() {
    const keys = {
        'arrowup': false, 
        'arrowdown': false, 
        'arrowleft': false, 
        'arrowright': false,
        ' ': false  // Space key for shooting
    };
    
    // Key down event
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (keys[key] !== undefined) {
            keys[key] = true;
            
            // Shoot when space is pressed
            if (key === ' ' && gameActive) {
                createPlayerProjectile();
            }
        }
    });
    
    // Key up event
    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (keys[key] !== undefined) {
            keys[key] = false;
        }
    });
    
    // Update movement in the animation loop
    airplane.userData = { keys: keys };
    
    // Handle restart button
    document.getElementById('restartButton').addEventListener('click', restartGame);
}

// Update airplane position based on key presses
function updateAirplaneMovement() {
    const keys = airplane.userData.keys;
    const moveSpeed = 0.15;
    
    // Move up/down (y-axis)
    if (keys['arrowup']) {
        airplane.position.y += moveSpeed;
    }
    if (keys['arrowdown']) {
        airplane.position.y -= moveSpeed;
    }
    
    // Move left/right (x-axis)
    if (keys['arrowleft']) {
        airplane.position.x -= moveSpeed;
    }
    if (keys['arrowright']) {
        airplane.position.x += moveSpeed;
    }
    
    // Add a little tilt when turning
    const targetRotationZ = keys['arrowleft'] ? 0.3 : (keys['arrowright'] ? -0.3 : 0);
    airplane.rotation.z = THREE.MathUtils.lerp(airplane.rotation.z, targetRotationZ, 0.1);
    
    // Add a little pitch when going up or down
    const targetRotationX = keys['arrowup'] ? 0.2 : (keys['arrowdown'] ? -0.2 : 0);
    airplane.rotation.x = THREE.MathUtils.lerp(airplane.rotation.x, targetRotationX, 0.1);
    
    // Keep airplane within bounds
    airplane.position.x = Math.max(-10, Math.min(10, airplane.position.x));
    airplane.position.y = Math.max(-5, Math.min(5, airplane.position.y));
}

// Handle window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update enemy movement to follow the player
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // Move enemy forward
        enemy.position.z += speed * 0.8;
        
        // Make enemy follow player with some lag
        const targetX = airplane.position.x;
        const targetY = airplane.position.y;
        
        // Gradually move toward player's position
        enemy.position.x += (targetX - enemy.position.x) * enemy.userData.turnRate;
        enemy.position.y += (targetY - enemy.position.y) * enemy.userData.turnRate;
        
        // Rotate enemy to face movement direction
        const angleToPlayer = Math.atan2(
            targetY - enemy.position.y,
            targetX - enemy.position.x
        );
        
        // Apply smooth rotation
        enemy.rotation.y = THREE.MathUtils.lerp(
            enemy.rotation.y,
            -angleToPlayer,
            0.1
        );
        
        // Remove enemies that are behind the camera
        if (enemy.position.z > 10) {
            scene.remove(enemy);
            enemies.splice(index, 1);
        }
        
        // Random chance for enemy to shoot at player (if within range)
        if (enemy.position.z > -50 && enemy.position.z < 5 && Math.random() < 0.01) {
            createEnemyProjectile(enemy);
        }
    });
}

// Update projectiles
function updateProjectiles() {
    // Update player projectiles
    playerProjectiles.forEach((projectile, index) => {
        // Move projectile
        projectile.position.add(projectile.userData.velocity);
        
        // Decrease lifetime
        projectile.userData.lifetime--;
        
        // Remove projectile if lifetime is over or out of bounds
        if (projectile.userData.lifetime <= 0 || 
            projectile.position.z < -100 || 
            Math.abs(projectile.position.x) > 50 ||
            Math.abs(projectile.position.y) > 50) {
            scene.remove(projectile);
            playerProjectiles.splice(index, 1);
        }
    });
    
    // Update enemy projectiles
    enemyProjectiles.forEach((projectile, index) => {
        // Move projectile
        projectile.position.add(projectile.userData.velocity);
        
        // Decrease lifetime
        projectile.userData.lifetime--;
        
        // Remove projectile if lifetime is over or out of bounds
        if (projectile.userData.lifetime <= 0 || 
            projectile.position.z > 20 || 
            Math.abs(projectile.position.x) > 50 ||
            Math.abs(projectile.position.y) > 50) {
            scene.remove(projectile);
            enemyProjectiles.splice(index, 1);
        }
    });
}

// Check for collisions between airplane and obstacles/stars
function checkCollisions() {
    // Get airplane dimensions (approximated)
    const airplaneBox = new THREE.Box3().setFromObject(airplane);
    
    // Check enemy collisions
    enemies.forEach((enemy, index) => {
        const enemyBox = new THREE.Box3().setFromObject(enemy);
        
        if (airplaneBox.intersectsBox(enemyBox)) {
            // Collision with enemy - game over
            playerHealth = 0;
            updateHealthDisplay();
            gameOver();
            
            // Create explosion effect
            createExplosion(airplane.position.clone());
        }
    });
    
    // Check player projectile collisions with enemies
    playerProjectiles.forEach((projectile, pIndex) => {
        const projectileBox = new THREE.Box3().setFromObject(projectile);
        
        enemies.forEach((enemy, eIndex) => {
            const enemyBox = new THREE.Box3().setFromObject(enemy);
            
            if (projectileBox.intersectsBox(enemyBox)) {
                // Hit enemy - reduce health
                enemy.userData.health -= projectile.userData.damage;
                
                // Remove projectile
                scene.remove(projectile);
                playerProjectiles.splice(pIndex, 1);
                
                // Check if enemy is destroyed
                if (enemy.userData.health <= 0) {
                    // Create explosion
                    createExplosion(enemy.position.clone());
                    
                    // Remove enemy
                    scene.remove(enemy);
                    enemies.splice(eIndex, 1);
                    
                    // Increase score
                    score += 50;
                    document.getElementById('score').textContent = 'Score: ' + score;
                } else {
                    // Create smaller hit effect
                    createHitEffect(projectile.position.clone());
                }
            }
        });
    });
    
    // Check enemy projectile collisions with player
    enemyProjectiles.forEach((projectile, index) => {
        const projectileBox = new THREE.Box3().setFromObject(projectile);
        
        if (projectileBox.intersectsBox(airplaneBox)) {
            // Hit player - reduce health
            playerHealth -= projectile.userData.damage;
            updateHealthDisplay();
            
            // Remove projectile
            scene.remove(projectile);
            enemyProjectiles.splice(index, 1);
            
            // Create hit effect
            createHitEffect(projectile.position.clone());
            
            // Check if player is destroyed
            if (playerHealth <= 0) {
                createExplosion(airplane.position.clone());
                gameOver();
            }
        }
    });
    
    // Check star collisions (collection)
    stars.forEach((star, index) => {
        const starBox = new THREE.Box3().setFromObject(star);
        
        if (airplaneBox.intersectsBox(starBox)) {
            // Collect the star
            scene.remove(star);
            stars.splice(index, 1);
            
            // Update score
            score += 10;
            document.getElementById('score').textContent = 'Score: ' + score;
            
            // Heal player a bit
            playerHealth = Math.min(playerHealth + 15, 350);
            updateHealthDisplay();
        }
    });
}

// Create hit effect (smaller than explosion)
function createHitEffect(position) {
    // Create particle group for hit effect
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
        // Create particle geometry
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffaa00, // Orange
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Set position to hit center
        particle.position.copy(position);
        
        // Give random velocity
        const velocity = new THREE.Vector3(
            Math.random() * 0.2 - 0.1,
            Math.random() * 0.2 - 0.1,
            Math.random() * 0.2 - 0.1
        );
        
        // Store velocity and lifetime in userData
        particle.userData = {
            velocity: velocity,
            lifetime: 20 // frames
        };
        
        scene.add(particle);
        
        // Animate particles
        const animateParticle = function() {
            particle.position.add(particle.userData.velocity);
            particle.userData.lifetime--;
            
            // Remove when lifetime is over
            if (particle.userData.lifetime <= 0) {
                scene.remove(particle);
                return;
            }
            
            requestAnimationFrame(animateParticle);
        };
        
        animateParticle();
    }
}

// Create explosion effect
function createExplosion(position) {
    // Create particle group for explosion
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        // Create particle geometry
        const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0xff5500 : 0xffaa00 // Orange/yellow
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Set position to explosion center
        particle.position.copy(position);
        
        // Give random velocity
        const velocity = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
        
        // Store velocity and lifetime in userData
        particle.userData = {
            velocity: velocity,
            lifetime: 60 // frames
        };
        
        scene.add(particle);
        
        // Animate particles
        const animateParticle = function() {
            particle.position.add(particle.userData.velocity);
            particle.userData.lifetime--;
            
            // Remove when lifetime is over
            if (particle.userData.lifetime <= 0) {
                scene.remove(particle);
                return;
            }
            
            requestAnimationFrame(animateParticle);
        };
        
        animateParticle();
    }
}

// Game over function
function gameOver() {
    gameActive = false;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = 'Your score: ' + score;
}

// Restart game
function restartGame() {
    // Remove all obstacles, stars, enemies and projectiles
    obstacles.forEach(obstacle => scene.remove(obstacle));
    stars.forEach(star => scene.remove(star));
    enemies.forEach(enemy => scene.remove(enemy));
    playerProjectiles.forEach(projectile => scene.remove(projectile));
    enemyProjectiles.forEach(projectile => scene.remove(projectile));
    
    obstacles = [];
    stars = [];
    enemies = [];
    playerProjectiles = [];
    enemyProjectiles = [];
    
    // Reset airplane position
    airplane.position.set(0, 0, 0);
    airplane.rotation.set(0, 0, 0);
    
    // Reset health
    playerHealth = 350;
    updateHealthDisplay();
    
    // Reset score
    score = 0;
    document.getElementById('score').textContent = 'Score: 0';
    
    // Hide game over screen
    document.getElementById('gameOver').style.display = 'none';
    
    // Restart game
    gameActive = true;
}

// Update health display
function updateHealthDisplay() {
    document.getElementById('health').textContent = 'Health: ' + playerHealth;
    
    // Update health bar color based on health level
    const healthBar = document.getElementById('healthBar');
    const healthPercent = (playerHealth / 350) * 100;
    healthBar.style.width = healthPercent + '%';
    
    if (healthPercent > 60) {
        healthBar.style.backgroundColor = '#2ecc71'; // Green
    } else if (healthPercent > 30) {
        healthBar.style.backgroundColor = '#f39c12'; // Orange
    } else {
        healthBar.style.backgroundColor = '#e74c3c'; // Red
    }
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (gameActive) {
        // Update airplane movement
        updateAirplaneMovement();
        
        // Update enemy movement
        updateEnemies();
        
        // Update projectiles
        updateProjectiles();
        
        // Animate propellers
        if (airplane.userData.propellers) {
            airplane.userData.propellers.forEach(prop => {
                prop.rotation.z += 0.3;
            });
        }
        
        // Animate enemy propellers
        enemies.forEach(enemy => {
            if (enemy.userData.propellers) {
                enemy.userData.propellers.forEach(prop => {
                    prop.rotation.z += enemy.userData.rotationSpeed;
                });
            }
        });
        
        // Move stars towards the player
        const delta = clock.getDelta();
        const moveAmount = speed * delta * 30;
        
        stars.forEach((star, index) => {
            star.position.z += moveAmount;
            
            // Rotate the star
            star.rotation.y += star.userData.rotationSpeed;
            star.rotation.x += star.userData.rotationSpeed / 2;
            
            // Remove stars that are behind the camera
            if (star.position.z > 10) {
                scene.remove(star);
                stars.splice(index, 1);
            }
        });
        
        // Check for collisions
        checkCollisions();
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Start the game when the page loads
window.onload = function() {
    init();
    
    // Initialize health display
    updateHealthDisplay();
    
    // Schedule enemy creation
    setInterval(createEnemy, 5000);
    
    // Schedule star creation
    setInterval(createStar, 3000);
};
