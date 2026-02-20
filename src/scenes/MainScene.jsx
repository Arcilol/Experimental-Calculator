import * as THREE from "three";
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
      50,
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
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);

    const buttons = [];

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
        if (child.isMesh && child.name.startsWith("btn_")) {
          buttons.push(child);
        }
      });

      console.log("Modelo cargado");
    });

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
        }
      }
    }

    renderer.domElement.addEventListener("click", onClick);

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
