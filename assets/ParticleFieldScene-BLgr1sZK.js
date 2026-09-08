import{S as p,P as c,B as d,V as h,a as f,A as v,L as P,b as m}from"./WebGLManager-BbUWUYNa.js";import{c as g,d as s}from"./visualTheme-Cxea0b9S.js";import"./index-WsA4L-9P.js";const y=`precision highp float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;

void main() {
  gl_FragColor = vec4(uColor, uOpacity * vAlpha);
}
`,x=`precision highp float;

uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerActive;

attribute vec3 aPyramidPosition;

varying float vAlpha;

void main() {
  float phase = mod(uTime * 0.5, 4.0);
  vec3 transformed = position;

  if (phase < 1.0) {
    transformed = position;
  } else if (phase < 2.0) {
    float amount = smoothstep(0.0, 1.0, phase - 1.0);
    transformed = mix(position, aPyramidPosition, amount);
  } else if (phase < 3.0) {
    transformed = aPyramidPosition;
  } else {
    float amount = smoothstep(0.0, 1.0, phase - 3.0);
    transformed = mix(aPyramidPosition, position, amount);
  }

  float turnY = uTime * 0.22 + uPointer.x * uPointerActive * 0.22;
  float turnX = -0.18 + sin(uTime * 0.31) * 0.08 -
    uPointer.y * uPointerActive * 0.12;
  mat2 rotateY = mat2(cos(turnY), -sin(turnY), sin(turnY), cos(turnY));
  mat2 rotateX = mat2(cos(turnX), -sin(turnX), sin(turnX), cos(turnX));
  transformed.xz = rotateY * transformed.xz;
  transformed.yz = rotateX * transformed.yz;

  vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  float depthLight = smoothstep(-4.8, -2.45, viewPosition.z);
  float pulse = 0.86 + 0.14 * sin(uTime * 1.2 + transformed.y * 4.0);
  vAlpha = depthLight * pulse;
}
`,a=12,t=.82,l=[[-t,-t,-t],[t,-t,-t],[t,-t,t],[-t,-t,t],[-t,t,-t],[t,t,-t],[t,t,t],[-t,t,t]],A=[...l.slice(0,4),[0,t,0],[0,t,0],[0,t,0],[0,t,0]],S=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];class b{id="particle-field";scene=new p;camera=new c(40,1,.1,20);geometry=new d;uniforms={uTime:{value:0},uPointer:{value:new h},uPointerActive:{value:0},uColor:{value:g("primary")},uOpacity:{value:.92}};material=new f({uniforms:this.uniforms,vertexShader:x,fragmentShader:y,transparent:!0,blending:v,depthTest:!0,depthWrite:!1,toneMapped:!1});outline=new P(this.geometry,this.material);animationTime=0;pointerX=0;pointerY=0;pointerStrength=0;constructor(e){this.populateGeometry(),this.camera.position.set(0,0,3.65),this.outline.frustumCulled=!1,this.scene.add(this.outline)}update(e,n){const{pointer:i,runtime:o}=n,r=i.active?o.reducedMotion?.18:1:0;this.pointerX=s(this.pointerX,i.active?i.x:0,7,e.delta),this.pointerY=s(this.pointerY,i.active?i.y:0,7,e.delta),this.pointerStrength=s(this.pointerStrength,r,6,e.delta),o.reducedMotion||(this.animationTime+=e.delta),this.uniforms.uTime.value=this.animationTime,this.uniforms.uPointer.value.set(this.pointerX,this.pointerY),this.uniforms.uPointerActive.value=this.pointerStrength}render(e){e.render(this.scene,this.camera)}resize(e){this.camera.aspect=e.aspect,this.camera.updateProjectionMatrix()}setVisible(e){this.outline.visible=e}getDebugInfo(){return`cube ↔ pyramid / ${a} outer edges`}dispose(){this.scene.remove(this.outline),this.geometry.dispose(),this.material.dispose()}populateGeometry(){const e=new Float32Array(a*2*3),n=new Float32Array(a*2*3);let i=0;for(const[o,r]of S)for(const u of[o,r])e.set(l[u],i),n.set(A[u],i),i+=3;this.geometry.setAttribute("position",new m(e,3)),this.geometry.setAttribute("aPyramidPosition",new m(n,3))}}export{b as ParticleFieldScene};
