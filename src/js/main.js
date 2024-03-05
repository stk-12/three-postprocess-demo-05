import '../css/style.scss';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass.js';
import { MaskPass, ClearMaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js';
import { OutputPass } from './OutputPass.js';

import videoSource from '../images/video2.mp4';
import videoSource2 from '../images/video1.mp4';

class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.scene = new THREE.Scene();
    this.scene2 = new THREE.Scene();
    this.camera = null;
    this.mesh = null;

    this.controls = null;

    this.videoTexture = null;
    // this.videoAspectRatio = 1678 / 944; // 元動画の縦横比
    // this.plane = null; // 動画用板ポリ

    // post processing
    this.composer = null;

    this._init();
    this._setTexture();
    this._setComposer();

    this._update();
    this._addEvent();
  }

  _setCamera() {
    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = (this.viewport.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.width / this.viewport.height, 1, distance * 2);
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  _setControlls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
  }

  _setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }

  _setTexture() {
    const video = document.createElement('video');
    video.src = videoSource;
    video.loop = true;
    video.muted = true;
    video.setAttribute('crossorigin', 'anonymous');
    video.play();
    this.videoTexture = new THREE.VideoTexture(video);
    this.videoTexture.minFilter = THREE.LinearFilter;

    const video2 = document.createElement('video');
    video2.src = videoSource2;
    video2.loop = true;
    video2.muted = true;
    video2.setAttribute('crossorigin', 'anonymous');
    video2.play();
    this.videoTexture2 = new THREE.VideoTexture(video2);
    this.videoTexture2.minFilter = THREE.LinearFilter;
  }

  _setComposer() {
    const clearPass = new ClearPass();
    const clearMaskPass = new ClearMaskPass();
    const maskPass = new MaskPass( this.scene, this.camera );
    const maskPass2 = new MaskPass( this.scene2, this.camera );
    const texturePass = new TexturePass(this.videoTexture);
    const texturePass2 = new TexturePass(this.videoTexture2);
    const outputPass = new OutputPass();

    const parameters = {
      stencilBuffer: true
    };

    const renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );

    this.composer = new EffectComposer(this.renderer, renderTarget);
    // const renderPass = new RenderPass(this.scene, this.camera);
    // this.composer.addPass(renderPass);
    this.composer.addPass( clearPass );
    this.composer.addPass( maskPass );
    this.composer.addPass( texturePass );
    this.composer.addPass( maskPass2 );
    this.composer.addPass( texturePass2 );
    this.composer.addPass( clearMaskPass );
    this.composer.addPass( outputPass );  
  }

  _addMesh() {
    const geometry = new THREE.CapsuleGeometry( 100, 300, 32, 32 ); 
    const material = new THREE.MeshStandardMaterial({color: 0x444444});
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.mesh2 = new THREE.Mesh(geometry, material);
    this.scene2.add(this.mesh2);
  }

  _init() {
    this._setCamera();
    this._setControlls();
    this._setLight();
    this._addMesh();
  }

  _update() {
    this.mesh.rotation.y += 0.01;
    this.mesh.rotation.x += 0.02;
    this.mesh.rotation.z += 0.005;

    this.mesh.position.x = Math.sin(Date.now() * 0.003) * 200;

    this.camera.position.z += Math.sin(Date.now() * 0.002) * 15;
    this.camera.position.y += Math.sin(Date.now() * 0.004) * 15;


    this.mesh2.rotation.y += 0.005;
    this.mesh2.rotation.x += 0.02;
    this.mesh2.rotation.z += 0.02;

    this.mesh2.position.x = Math.cos(Date.now() * 0.002) * 280;


    // 動画テクスチャがある場合、更新する
    if (this.videoTexture) {
      this.videoTexture.needsUpdate = true;
    }

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    this.composer.render();
    requestAnimationFrame(this._update.bind(this));
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
  }
}

new Main();



