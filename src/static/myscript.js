import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const humanoidUrl = new URL('../assets/humanoid.glb', import.meta.url);

const renderer = new THREE.WebGL1Renderer();

renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    65, 
    window.innerWidth / window.innerHeight, 
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement)

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

camera.position.set(0, 3, 6);
orbit.update();

const planeGeometry = new THREE.PlaneGeometry(5, 5);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xF,
    side: THREE.DoubleSide
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -20; 

const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.position.set(40, 80, 20);
spotLight.castShadow = true;
spotLight.angle = 0.05;

renderer.setClearColor(0x00000);

const assetLoader = new GLTFLoader();

const gui = new dat.GUI();

const humanFolder = gui.addFolder( 'Human Size' );
humanFolder.open();

assetLoader.load(humanoidUrl.href, function(glb) {

    const model = glb.scene;
    scene.add(model);
    console.log(model)
    model.position.set(0, 0, 0);
    
    const options = {
        'Scale Model Proportionately': 1,
        'Height': 1,
        'Weight': 1,
        'Neck girth': 0.05,
        'Biceps girth': 0.05,
        'Calf girth': 0.05   
    }
    const scaleProportionately = humanFolder.addFolder('Scale Proportionately');
    scaleProportionately.add(options, 'Scale Model Proportionately', 0.7, 1.3).onChange(function(e){
        model.scale.set(e,e,e);
    });

    const anthropometrics = humanFolder.addFolder('Anthropometrics');
    anthropometrics.open();
    anthropometrics.add(options, 'Height', 0.7, 1.3).onChange(function(e){
        model.scale.y = e;
    });
    anthropometrics.add(options, 'Weight', 0.7, 1.3).onChange(function(e){
        model.scale.z = e;
        model.scale.x = e;
        
        if(bodyParts = e/7){
            model.getObjectByName('torso').scale.y = bodyParts;
            model.getObjectByName('torso').scale.x = bodyParts;
            model.getObjectByName('abdominal').scale.y = bodyParts;
            model.getObjectByName('abdominal').scale.x = bodyParts;
            model.getObjectByName('right_thigh').scale.y = bodyParts;
            model.getObjectByName('right_thigh').scale.x = bodyParts;
            model.getObjectByName('left_thigh').scale.y = bodyParts;
            model.getObjectByName('left_thigh').scale.x = bodyParts;
            model.getObjectByName('right_calf').scale.y = bodyParts;
            model.getObjectByName('abdominal').scale.x = bodyParts;
        }
    });
    anthropometrics.add(options, 'Neck girth', 0, 0.2).onChange(function(e){
        model.getObjectByName('neck').scale.y = e;
        model.getObjectByName('neck').scale.x = e;
    });
    anthropometrics.add(options, 'Biceps girth', 0, 0.2).onChange(function(e){
        model.getObjectByName('right_arm').scale.y = e;
        model.getObjectByName('left_arm').scale.y = e;
        model.getObjectByName('right_arm').scale.x = e;
        model.getObjectByName('left_arm').scale.x = e;
    });
    anthropometrics.add(options, 'Calf girth', 0, 0.2).onChange(function(e){
        model.getObjectByName('right_calf').scale.y = e;
        model.getObjectByName('left_calf').scale.y = e;
        model.getObjectByName('right_calf').scale.x = e;
        model.getObjectByName('left_calf').scale.x = e;
    });
    
}, undefined, function(error){
    console.error(error)
});

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(e){
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();

function animate(){


    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});