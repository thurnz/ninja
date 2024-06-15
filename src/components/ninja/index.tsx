import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Application, ICanvas, Sprite, BaseTexture, Texture } from "pixi.js";

const ninja = (app: Application<ICanvas> ) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  const texture = new THREE.TextureLoader().load('model/ninja.png');
  const clock = new THREE.Clock();
  let ninja: THREE.Group;
  let mixer: THREE.AnimationMixer;
  let idleAction: THREE.AnimationAction;
  let attackAction: THREE.AnimationAction;
  let bragAction: THREE.AnimationAction;

  const loader = new GLTFLoader();
  loader.load('model/cibus_ninja.glb', (gltf) => {
    ninja = gltf.scene;
    ninja.traverse((node) => {
      if(node instanceof THREE.Mesh){
        node.material.map = texture;
      }
    });

    mixer = new THREE.AnimationMixer(ninja);
    const clips = gltf.animations;
    console.log(clips);

    let clip = THREE.AnimationClip.findByName(clips, clips[4].name);
    idleAction = mixer.clipAction(clip);
    idleAction.play();

    clip = THREE.AnimationClip.findByName(clips, clips[0].name);
    attackAction = mixer.clipAction(clip);

    clip = THREE.AnimationClip.findByName(clips, clips[1].name);
    bragAction = mixer.clipAction(clip);
    
    ninja.rotation.y = 135;
    scene.add(ninja);

    mixer.addEventListener('loop', (e) => {
      if(e.action.getClip().name === attackAction.getClip().name || e.action.getClip().name === bragAction.getClip().name){
        attackAction.stop();
        bragAction.stop();
        idleAction.play();
      }
    });
  });

  const geom = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
  const mat = new THREE.MeshBasicMaterial({visible: false});
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = 'plane';
  scene.add(mesh);

  const target = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let startTime = 0;

  const move = (x: number, y: number) => {
    const pointer = new THREE.Vector2();
    pointer.x = (x / window.innerWidth) * 2 - 1;
    pointer.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    for(let i = 0; i < intersects.length; i++){
      if(intersects[i].object.name === mesh.name){
        target.x = intersects[i].point.x;
        target.y = intersects[i].point.y;

        startTime = clock.getElapsedTime();
        if(target.x > ninja.position.x)
          bragAction.play();
        else
          attackAction.play();
      }
    }   
  };

  const baseTexture = BaseTexture.from(renderer.domElement);
  const sprite = Sprite.from(new Texture(baseTexture));
  app.stage.addChild(sprite);

  const update = () => {
    if(mixer) mixer.update(clock.getDelta());
    if(ninja && startTime) {
      const time = clock.getElapsedTime() - startTime;
      const dur = attackAction.getClip().duration;
      ninja.position.x += (target.x - ninja.position.x) * time / dur;
      ninja.position.y += (target.y - ninja.position.y) * time / dur;
      if(ninja.position.x < target.x){
        ninja.rotation.y = 90;
      }else if(ninja.position.x > target.x){
        ninja.rotation.y = 180;
      }else{
        ninja.rotation.y += 0.01;
      }
    }
    renderer.render(scene, camera);
    baseTexture.update();
  }

  return {
    update,
    move
  };
};

export default ninja;