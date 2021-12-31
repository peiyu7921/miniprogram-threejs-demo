// index.js
// 获取应用实例

import { createScopedThreejs } from "threejs-miniprogram";

import { registerGLTFLoader } from "../../libs/gltfLoader";
import { registerOrbitControls } from "../../libs/OrbitControls";
import { registerDRACOLoader } from "../../libs//DRACOLoader";

Page({
    data: {},
    onReady() {
        wx.createSelectorQuery()
            .select("#canvas")
            .node()
            .exec((res) => {
                let THREE, camera, scene, light, renderer;
                const canvas = res[0].node;
                // 创建一个与 canvas 绑定的 three.js
                THREE = createScopedThreejs(canvas);
                // 注册gltfLoader
                registerGLTFLoader(THREE);
                registerDRACOLoader(THREE);
                registerOrbitControls(THREE);
                const init = () => {
                    camera = new THREE.PerspectiveCamera(
                        70,
                        canvas.width / canvas.height,
                        0.001,
                        1000
                    );
                    camera.position.set(1, 1, 1);
                    scene = new THREE.Scene();
                    scene.background = new THREE.Color(0xffffff);
                    light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
                    scene.add(light);
                    renderer = new THREE.WebGLRenderer();
                    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
                    renderer.setSize(canvas.width, canvas.height);
                    this.controls = new THREE.OrbitControls(camera, renderer.domElement);
                    const gltfLoader = new THREE.GLTFLoader();

                    const dracoLoader = new THREE.DRACOLoader();
                    dracoLoader.setDecoderPath("");
                    gltfLoader.setDRACOLoader(dracoLoader);

                    gltfLoader.load(
                        "",
                        (model) => {
                            const gltf = model.scene;
                            scene.add(gltf);
                            this.controls.rotateSpeed = 2;
                            const box3 = new THREE.Box3().setFromObject(gltf);
                            const length = box3.max.distanceTo(box3.min);
                            this.controls.target = box3.getCenter(new THREE.Vector3());
                            this.controls.minDistance = length;
                            this.controls.maxDistance = length * 2;
                            this.controls.maxPolarAngle = Math.PI / 2; // 限制摄像机旋转角度
                        },
                        function (err) {
                            console.error(err);
                        }
                    );
                    render();
                };

                const render = () => {
                    this.controls.update();
                    renderer.render(scene, camera);
                    canvas.requestAnimationFrame(render);
                };
                init();
            });
    },

    handleTouchstart(event) {
        if (this.controls) this.controls.onTouchStart(event);
    },
    handleTouchMove(event) {
        if (this.controls) this.controls.onTouchMove(event);
    },
    handleTouchEnd(event) {
        if (this.controls) this.controls.onTouchEnd(event);
    },
});
