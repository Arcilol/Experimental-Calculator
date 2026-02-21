import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import CalculatorEngine from "./../calculator/CalculatorEngine";

export default function MainScene() {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const engine = useRef(new CalculatorEngine());

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 1.5, 4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    // LUCES
    const hemiLight = new THREE.HemisphereLight(
      0xffffff, // color cielo
      0x444444, // color suelo
      1.2, // intensidad
    );
    scene.add(hemiLight);

    // 🔆 Luz principal (Key Light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // 💡 Luz de relleno (Fill Light)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 4, -5);
    scene.add(fillLight);

    // ✨ Luz trasera (Rim Light)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    const buttons = [];
    let screenMesh = null;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const context = canvas.getContext("2d");

    const texture = new THREE.CanvasTexture(canvas);

    // LOADER
    const loader = new GLTFLoader();
    loader.load("/calculator.glb", (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name.startsWith("btn_")) {
            buttons.push(child);
          }

          if (child.name === "pantalla") {
            screenMesh = child;

            screenMesh.material = new THREE.MeshStandardMaterial({
              map: texture,
              roughness: 0.6,
              metalness: 0.1,
            });

            updateDisplay("0");
          }
        }
      });

      console.log("Modelo cargado");
    });

    // RECONOCIMIENTO DE BOTONES
    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(buttons);

      if (intersects.length > 0) {
        const clicked = intersects[0].object;

        if (clicked.name.startsWith("btn_")) {
          const value = clicked.name.replace("btn_", "");

          let output;

          if (!isNaN(value)) {
            output = engine.current.inputNumber(value);
          } else if (value === "plus") {
            engine.current.setOperator("+");
            return;
          } else if (value === "minus") {
            engine.current.setOperator("-");
            return;
          } else if (value === "equals") {
            output = engine.current.calculate();
          } else if (value === "clear") {
            output = engine.current.clear();
          } else if (value === "dot") {
            output = engine.current.inputDecimal();
          } else if (value === "multiply") {
            engine.current.setOperator("*");
            return;
          } else if (value === "divide") {
            engine.current.setOperator("/");
            return;
          } else if (value === "mplus") {
            output = engine.current.memoryAdd();
            console.log("Memoria:", engine.current.memory);
          } else if (value === "mc") {
            output = engine.current.memoryClear();
            console.log("Memoria borrada");
          }
          console.log("Pantalla:", output);

          if (output !== undefined) {
            updateDisplay(output);
          }
        }
      }
    }

    renderer.domElement.addEventListener("click", onClick);

    function updateDisplay(text) {
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "lime";
      context.font = "80px Arial";
      context.textAlign = "right";
      context.textBaseline = "middle";
      context.fillText(text, canvas.width - 20, canvas.height / 2);

      texture.needsUpdate = true;
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      renderer.domElement.removeEventListener("click", onClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
}
