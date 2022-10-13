import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const fragment = `
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vColor;
float PI = 3.141592653589793238;
void main() {
  // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
  gl_FragColor = vec4(vUv,0.0,1.);
  gl_FragColor = vec4(vColor,1.);
}
`

const vertex = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec3 uColor[5];
varying vec3 vColor;
uniform vec2 pixels;
float PI = 3.141592653589793238;
//  Simplex 3D Noise
//  by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vec2 noiseCoord = uv*vec2(3.,4.);

  float tilt = -0.8*uv.y;

  float incline  = uv.x*0.1;

  float offset = incline*mix(-.25,0.25,uv.y);

  float noise = snoise(vec3(noiseCoord.x + time*3.,noiseCoord.y, time * 10.));

  noise = max(0.,noise);

  vec3 pos = vec3(position.x,position.y,position.z + noise * 0.3 +tilt + incline + offset);

  vColor = uColor[4];

  for(int i = 0; i < 4; i++) {

    float noiseFlow  = 5. + float(i)*0.3;
    float noiseSpeed  = 10. + float(i)*0.3;

    float noiseSeed = 1. + float(i)*10.;
    vec2 noiseFreq = vec2(1.,1.4)*.4;

    float noiseFloor = 0.1;
    float noiseCeil = 0.6 + float(i)*0.07;

    float noise = smoothstep(noiseFloor,noiseCeil,
      snoise(
        vec3(
          noiseCoord.x*noiseFreq.x + time*noiseFlow,
          noiseCoord.y*noiseFreq.y,
          time * noiseSpeed + noiseSeed
        )
      )
    );

    vColor = mix(vColor,uColor[i],noise);
  }

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`

let pallete = [
  'hsl(40, 99%, 61%)',
  // 'hsl(30, 100%, 68%)',
  // 'hsl(16, 100%, 75%)',
  'hsl(355, 100%, 81%)',
  // 'hsl(334, 100%, 81%)',
  'hsl(317, 100%, 83%) 56%',
  // 'hsl(290, 93%, 85%) 67%',
  'hsl(256, 100%, 88%) 78%',
  'hsl(223, 100%, 85%) 89%',
  // 'hsl(210, 100%, 81%) 100%',
]


pallete = pallete.map((color) => new THREE.Color(color))


export default class PlanetAnimation {
  constructor(options={}) {
    this.options = options
    this.scene = new THREE.Scene();
    this.maskImageUrl = options.maskImageUrl

    this.container = options.container;
    this.width = options.width;
    this.height = options.height;
    this.bgColor = options.bgColor;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 0.2);
    this.time = 0;

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path
    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(this.dracoLoader);

    this.isPlaying = true;

    this.addObjects();
    // this.addLights();
    this.resize();
    this.render();
    this.setupResize();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.options.width;
    this.height = this.options.height;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    // Mask
    const loader = new THREE.TextureLoader();
    const texture = loader.load(this.maskImageUrl);

    const geometry = new THREE.PlaneGeometry(0.35, 0.35);
    const material = new THREE.MeshBasicMaterial( { alphaMap: texture, alphaTest: 0.5, color: this.bgColor } );

    const mesh = new THREE.Mesh( geometry, material );
    this.scene.add( mesh );

    // Fancy color thing
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 10000 },
        uColor: { value: pallete },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.geometry = new THREE.PlaneGeometry(1.5, 1.5, 300, 300);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  addLights() {
    const light1 = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(0.5, 0, 0.866); // ~60º
    this.scene.add(light2);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.isPlaying = true;
      this.render()
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.0002;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

window.mountPlanetAnimation = function mountPlanetAnimation({ container, maskImageUrl, bgColor, width, height }) {
  new PlanetAnimation({
    container,
    width: width || 512,
    height: height || 512,
    maskImageUrl,
    bgColor,
  });
}
