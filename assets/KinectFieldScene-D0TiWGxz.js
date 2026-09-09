import{T as v,S as d,O as f,f as g,V as s,a as S,M as A,d as c,e as u}from"./WebGLManager-B68qVaOA.js";import{c as x,d as a}from"./visualTheme-DHPPKk2d.js";import"./index-DWmZU-JA.js";const U="/assets/handsDepthAtlas-CeejesdP.webp",w=`precision highp float;

uniform sampler2D uSource;
uniform vec2 uGrid;
uniform vec3 uColor;
uniform float uSourceAspect;
uniform float uViewportAspect;
uniform vec2 uAtlasGrid;
uniform vec2 uFrameTexel;
uniform float uFrame;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerActive;

varying vec2 vUv;

float hash21(vec2 value) {
  vec3 seed = fract(vec3(value.xyx) * vec3(0.1031, 0.1030, 0.0973));
  seed += dot(seed, seed.yzx + 33.33);
  return fract((seed.x + seed.y) * seed.z);
}

float getSourceLuminance(vec2 sourceUv) {
  float frameColumn = mod(uFrame, uAtlasGrid.x);
  float sourceRow = floor(uFrame / uAtlasGrid.x);
  float textureRow = uAtlasGrid.y - sourceRow - 1.0;
  vec2 frameUv = clamp(
    sourceUv,
    uFrameTexel * 0.5,
    vec2(1.0) - uFrameTexel * 0.5
  );
  vec2 atlasUv = (vec2(frameColumn, textureRow) + frameUv) / uAtlasGrid;
  return texture2D(uSource, atlasUv).r;
}

float insideUnitSquare(vec2 value) {
  return
    step(0.0, value.x) *
    step(value.x, 1.0) *
    step(0.0, value.y) *
    step(value.y, 1.0);
}

void main() {
  vec2 gridPosition = vUv * uGrid;
  vec2 cell = floor(gridPosition);
  vec2 cellUv = fract(gridPosition);
  vec2 sampleUv = (cell + 0.5) / uGrid;

  // Contain the wide active crop on every panel shape. Black source margins
  // become empty sensor space rather than stretching or cropping the hands.
  vec2 containScale = vec2(1.0);
  if (uViewportAspect > uSourceAspect) {
    containScale.x = uViewportAspect / uSourceAspect;
  } else {
    containScale.y = uSourceAspect / uViewportAspect;
  }

  vec2 sourceUv = (sampleUv - 0.5) * containScale + 0.5;
  float sourceInside = insideUnitSquare(sourceUv);
  float baseLuminance = getSourceLuminance(sourceUv) * sourceInside;
  float baseDepth = pow(smoothstep(0.012, 0.82, baseLuminance), 0.62);

  vec2 pointerUv = uPointer * 0.5 + 0.5;
  vec2 hoverVector = vUv - pointerUv;
  hoverVector.x *= uViewportAspect;
  float hoverDistance = length(hoverVector);
  float hover =
    (1.0 - smoothstep(0.04, 0.34, hoverDistance)) * uPointerActive;

  // Brighter samples are treated as nearer Kinect returns. The pointer shifts
  // those returns farther than dark ones, revealing the synthesized depth.
  sourceUv -=
    vec2(uPointer.x / max(uViewportAspect, 0.001), uPointer.y) *
    baseDepth *
    uPointerActive *
    0.018;
  vec2 hoverDirection = hoverVector / max(hoverDistance, 0.001);
  sourceUv -=
    vec2(hoverDirection.x / max(uViewportAspect, 0.001), hoverDirection.y) *
    hover *
    (0.005 + baseDepth * 0.008);
  sourceUv.x +=
    sin(cell.y * 0.47 + uTime * 1.1) *
    smoothstep(0.55, 1.0, baseDepth) *
    0.0014;

  sourceInside = insideUnitSquare(sourceUv);
  float luminance = getSourceLuminance(sourceUv) * sourceInside;
  vec2 sourceStep = uFrameTexel * 1.35;
  float gradientX = abs(
    getSourceLuminance(sourceUv + vec2(sourceStep.x, 0.0)) -
    getSourceLuminance(sourceUv - vec2(sourceStep.x, 0.0))
  ) * sourceInside;
  float gradientY = abs(
    getSourceLuminance(sourceUv + vec2(0.0, sourceStep.y)) -
    getSourceLuminance(sourceUv - vec2(0.0, sourceStep.y))
  ) * sourceInside;
  float edge = clamp(gradientX + gradientY, 0.0, 1.0);
  float depth = pow(smoothstep(0.012, 0.84, luminance), 0.6);
  float confidence = max(
    smoothstep(0.008, 0.24, luminance),
    smoothstep(0.018, 0.3, edge) * 0.94
  );

  float randomValue = hash21(cell + 17.0);
  float returnMask = step(
    randomValue,
    clamp(confidence * (0.82 + edge * 0.32), 0.0, 1.0)
  );
  vec2 pointCenter = 0.5 + vec2(
    hash21(cell + 31.7) - 0.5,
    hash21(cell + 71.3) - 0.5
  ) * 0.22;
  vec2 pointOffset = cellUv - pointCenter;
  float pointRadius =
    mix(0.105, 0.34, max(depth, edge * 0.72)) *
    (1.0 + hover * 0.22);
  float roundPoint = 1.0 - smoothstep(
    pointRadius * 0.72,
    pointRadius,
    length(pointOffset)
  );
  float squarePoint = 1.0 - smoothstep(
    pointRadius * 0.7,
    pointRadius,
    max(abs(pointOffset.x), abs(pointOffset.y))
  );
  float point = mix(roundPoint, squarePoint, 0.28) * returnMask;

  float scanPosition = 1.15 - mod(uTime * 0.1, 1.3);
  float scanBand =
    (1.0 - smoothstep(0.0, 0.055, abs(vUv.y - scanPosition))) *
    confidence;
  float depthContour =
    (1.0 - smoothstep(
      0.085,
      0.23,
      abs(fract(depth * 5.0 - uTime * 0.035) - 0.5)
    )) *
    confidence;
  float focusRing =
    exp(-abs(hoverDistance - 0.18) * 52.0) *
    uPointerActive *
    confidence;
  float signal = clamp(
    0.24 + depth * 0.56 + edge * 0.34 +
    depthContour * 0.13 + scanBand * 0.36 + focusRing * 0.22,
    0.0,
    1.25
  );
  float alpha = point * signal * (0.58 + confidence * 0.42);

  if (alpha < 0.006) {
    discard;
  }

  gl_FragColor = vec4(uColor * signal, alpha);
}
`,T=`precision highp float;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,l=132,h=78,R=1080/720,y=11,F=10,r=105,m=10,P=192,C=128,p=54;function M(o){return o<240?72:o<420?100:o<700?132:180}class I{id="kinect-field";frameAtlas=new v().load(U);scene=new d;camera=new f(-1,1,1,-1,0,1);geometry=new g(2,2);uniforms={uSource:{value:this.frameAtlas},uGrid:{value:new s(l,h)},uColor:{value:x("primary")},uSourceAspect:{value:R},uViewportAspect:{value:1},uAtlasGrid:{value:new s(y,F)},uFrameTexel:{value:new s(1/P,1/C)},uFrame:{value:p},uTime:{value:0},uPointer:{value:new s},uPointerActive:{value:0}};material=new S({uniforms:this.uniforms,vertexShader:T,fragmentShader:w,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1});mesh=new A(this.geometry,this.material);pointerX=0;pointerY=0;pointerStrength=0;animationTime=0;gridColumns=l;gridRows=h;visible=!1;constructor(e){this.frameAtlas.wrapS=c,this.frameAtlas.wrapT=c,this.frameAtlas.minFilter=u,this.frameAtlas.magFilter=u,this.frameAtlas.generateMipmaps=!1,this.scene.add(this.mesh)}update(e,t){const{pointer:n,runtime:i}=t;this.pointerX=a(this.pointerX,n.active?n.x:0,5.5,e.delta),this.pointerY=a(this.pointerY,n.active?n.y:0,5.5,e.delta),this.pointerStrength=a(this.pointerStrength,n.active?1:0,5,e.delta),this.uniforms.uPointer.value.set(this.pointerX,this.pointerY),this.uniforms.uPointerActive.value=this.pointerStrength,this.visible&&!i.reducedMotion&&(this.animationTime=(this.animationTime+e.delta)%(r/m),this.uniforms.uTime.value+=e.delta,this.uniforms.uFrame.value=Math.min(r-1,Math.floor(this.animationTime*m)))}render(e){e.render(this.scene,this.camera)}resize(e){const t=M(e.width),n=Math.max(1,e.width/t),i=Math.max(42,Math.min(180,Math.round(e.height/n)));(t!==this.gridColumns||i!==this.gridRows)&&(this.gridColumns=t,this.gridRows=i,this.uniforms.uGrid.value.set(t,i)),this.uniforms.uViewportAspect.value=e.aspect}setVisible(e){this.visible=e,this.mesh.visible=e}reset(){this.animationTime=0,this.uniforms.uFrame.value=p,this.uniforms.uTime.value=0}getDebugInfo(){return`${this.gridColumns}x${this.gridRows} depth points / ${r}-frame hands atlas`}dispose(){this.scene.remove(this.mesh),this.frameAtlas.dispose(),this.geometry.dispose(),this.material.dispose()}}export{I as KinectFieldScene};
