import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Three.js setup
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a); // slate-900

let mixer;
const loader = new GLTFLoader();
loader.load('assets/mouse.glb', function(glb) {
    const root = glb.scene;
    root.scale.set(0.25, 0.25, 0.25);
    root.position.y = -0.5;
    scene.add(root);
    
    if (glb.animations && glb.animations.length > 0) {
        mixer = new THREE.AnimationMixer(root);
        mixer.clipAction(glb.animations[0]).play();
    }
}, undefined, function(error) {
    console.error('Error loading model:', error);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 2, 5);
scene.add(directionalLight);

const sizes = {
    width: canvas.clientWidth,
    height: canvas.clientHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0.5, 3);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true 
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    if (mixer) mixer.update(delta);
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    sizes.width = canvas.clientWidth;
    sizes.height = canvas.clientHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

// UI interactivity
const componentsList = document.getElementById("content-components");
const dosesList = document.getElementById("content-doses");
const injectButton = document.getElementById("inject-button");
const messageBox = document.getElementById("message-box");

const tabs = {
    components: document.getElementById("tab-components"),
    doses: document.getElementById("tab-doses"),
    inject: document.getElementById("tab-inject"),
};
const tabContents = {
    components: document.getElementById("content-components"),
    doses: document.getElementById("content-doses"),
    inject: document.getElementById("content-inject"),
};

let selectedComponent = null;
let selectedDose = null;
let activeTab = "components";

// Mock data for chemical components and doses
const components = [
    "Paracetamol",
    "Cyanide",
    "Ibuprofen",
    "Caffeine",
    "Insulin",
];
const doses = ["10mg", "50mg", "100mg", "250mg"];

// Function to update the Inject button state
const updateInjectButtonState = () => {
    if (selectedComponent && selectedDose) {
        injectButton.disabled = false;
    } else {
        injectButton.disabled = true;
    }
};

// Function to handle tab clicks
const setActiveTab = (tabName) => {
    activeTab = tabName;
    for (const key in tabs) {
        const tab = tabs[key];
        const content = tabContents[key];
        if (key === tabName) {
            tab.classList.remove(
                "text-slate-400",
                "border-transparent",
                "hover:text-white"
            );
            tab.classList.add("text-white", "border-blue-500");
            content.classList.remove("hidden");
            content.classList.add("flex");
        } else {
            tab.classList.remove("text-white", "border-blue-500");
            tab.classList.add(
                "text-slate-400",
                "border-transparent",
                "hover:text-white"
            );
            content.classList.add("hidden");
            content.classList.remove("flex");
        }
    }
};

// Populate the components buttons
components.forEach((component) => {
    const button = document.createElement("button");
    button.textContent = component;
    button.className =
        "px-4 py-2 text-sm rounded-full font-semibold transition-all duration-200 bg-slate-600 hover:bg-blue-500 text-gray-200 hover:text-white";
    button.addEventListener("click", () => {
        document
            .querySelectorAll("#content-components button")
            .forEach((btn) => {
                btn.classList.remove("bg-blue-500");
                btn.classList.add("bg-slate-600");
            });
        button.classList.add("bg-blue-500");
        button.classList.remove("bg-slate-600");
        selectedComponent = component;
        updateInjectButtonState();
    });
    componentsList.appendChild(button);
});

// Populate the doses buttons
doses.forEach((dose) => {
    const button = document.createElement("button");
    button.textContent = dose;
    button.className =
        "px-4 py-2 text-sm rounded-full font-semibold transition-all duration-200 bg-slate-600 hover:bg-teal-500 text-gray-200 hover:text-white";
    button.addEventListener("click", () => {
        document
            .querySelectorAll("#content-doses button")
            .forEach((btn) => {
                btn.classList.remove("bg-teal-500");
                btn.classList.add("bg-slate-600");
            });
        button.classList.add("bg-teal-500");
        button.classList.remove("bg-slate-600");
        selectedDose = dose;
        updateInjectButtonState();
    });
    dosesList.appendChild(button);
});

// Handle the Inject button click
injectButton.addEventListener("click", () => {
    if (selectedComponent && selectedDose) {
        const message = `Simulating injection of ${selectedDose} of ${selectedComponent}.`;
        messageBox.textContent = message;
        messageBox.classList.remove("opacity-0", "invisible");

        setTimeout(() => {
            messageBox.classList.add("opacity-0", "invisible");
        }, 4000);
    }
});

// Set up tab click listeners
tabs["components"].addEventListener("click", () =>
    setActiveTab("components")
);
tabs["doses"].addEventListener("click", () => setActiveTab("doses"));
tabs["inject"].addEventListener("click", () => setActiveTab("inject"));

// Initialize active tab
setActiveTab("components");