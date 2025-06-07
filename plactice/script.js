// = 016 ======================================================================
// １つ前のサンプルで見たようにエフェクトコンポーザーを使っている場合は、描画さ
// れる順番を管理しているのはエフェクトコンポーザーになります。
// エフェクトコンポーザーには、複数のエフェクトを追加することもできます。
// さらに新しいパスをコンポーザーに追加する際には、その順序が非常に重要になりま
// すので、ここでドットスクリーンパスをさらに追加し、それらについてしっかりと理
// 解を深めておきましょう。
// ============================================================================

// 必要なモジュールを読み込み
import * as THREE from "../lib/three.module.js";

window.addEventListener(
	"DOMContentLoaded",
	async () => {
		const wrapper = document.querySelector("#webgl") || document.body;
		const app = new ThreeApp(wrapper);
		app.render();
	},
	false
);

class ThreeApp {
	static CAMERA_PARAM = {
		fovy: 60,
		aspect: window.innerWidth / window.innerHeight,
		near: 0.1,
		far: 20.0,
		position: new THREE.Vector3(0.0, 2.0, 8.0),
		lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
	};

	static RENDERER_PARAM = {
		clearColor: 0x001122,
		width: window.innerWidth,
		height: window.innerHeight,
	};

	constructor(wrapper) {
		// レンダラー
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setClearColor(ThreeApp.RENDERER_PARAM.clearColor);
		this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
		wrapper.appendChild(this.renderer.domElement);

		// シーン
		this.scene = new THREE.Scene();

		// カメラ
		this.camera = new THREE.PerspectiveCamera(ThreeApp.CAMERA_PARAM.fovy, ThreeApp.CAMERA_PARAM.aspect, ThreeApp.CAMERA_PARAM.near, ThreeApp.CAMERA_PARAM.far);
		this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
		this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

		// ライト
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(5, 5, 5);
		this.scene.add(directionalLight);

		// プロペラの作成
		this.createPropellers();

		// this のバインド
		this.render = this.render.bind(this);

		// ウィンドウのリサイズ対応
		window.addEventListener(
			"resize",
			() => {
				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();
			},
			false
		);
	}

	createPropellers() {
		// プロペラの形状を作るグループ
		this.propellerShape = new THREE.Group();

		// プロペラハブ（つるつる質感）
		const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 12);
		const hubMaterial = new THREE.MeshPhongMaterial({
			color: 0x333333,
			shininess: 100, // 光沢の強さ
			specular: 0x111111, // ハイライト色
		});
		const hub = new THREE.Mesh(hubGeometry, hubMaterial);
		this.propellerShape.add(hub);

		// プロペラブレード（つるつる質感）
		const bladeGeometry = new THREE.BoxGeometry(0.06, 3, 0.25);
		const bladeMaterial = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			shininess: 100, // 光沢の強さ
			specular: 0x222222, // ハイライト色
		});

		// 3枚のブレードを120度ずつ配置
		for (let i = 0; i < 3; i++) {
			const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
			// 各ブレードを120度ずつ回転
			blade.rotation.z = (i * Math.PI * 2) / 3;
			this.propellerShape.add(blade);
		}

		// 回転用の親グループを作成
		this.propeller = new THREE.Group();
		this.propeller.add(this.propellerShape);

		// プロペラの向きを設定（X軸0、Y軸0）
		this.propeller.rotation.x = 0;
		this.propeller.rotation.y = 0;
		this.propeller.rotation.z = 0;

		// プロペラを中央に配置
		this.propeller.position.set(0, 0, 0);

		this.scene.add(this.propeller);

		this.swingAngle = 0;
		this.swingDirection = 1;
		this.swingSpeed = 0.01;
		this.maxAngle = 0.9;
	}

	render() {
		requestAnimationFrame(this.render);
		this.propellerShape.rotation.z += 0.1;

		// 首振り運動（
		this.swingAngle += this.swingSpeed * this.swingDirection;

		// 端に達したら方向転換
		if (this.swingAngle > this.maxAngle) {
			this.swingDirection = -1;
		} else if (this.swingAngle < -this.maxAngle) {
			this.swingDirection = 1;
		}

		this.propeller.rotation.y = this.swingAngle;

		this.renderer.render(this.scene, this.camera);
	}
}
