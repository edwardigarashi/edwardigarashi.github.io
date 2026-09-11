import{C as g,d as s,e as u,T as A,S,O as U,f as y,V as a,a as x,M}from"./WebGLManager-DrtrsOVg.js";import{c as C,d as l}from"./visualTheme-phAdIzC7.js";import"./index-BLXPdJoI.js";const w=`precision mediump float;

uniform sampler2D uSource;
uniform sampler2D uGlyphAtlas;
uniform vec2 uGrid;
uniform float uGlyphCount;
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

void main() {
  vec2 gridPosition = vUv * uGrid;
  vec2 cell = floor(gridPosition);
  vec2 cellUv = fract(gridPosition);
  vec2 sourceUv = (cell + 0.5) / uGrid;
  vec2 coverScale = vec2(1.0);
  vec2 pointerUv = uPointer * 0.5 + 0.5;
  vec2 hoverVector = vUv - pointerUv;
  hoverVector.x *= uViewportAspect;
  float hoverDistance = length(hoverVector);
  float hover =
    (1.0 - smoothstep(0.035, 0.32, hoverDistance)) * uPointerActive;
  float hoverWave = sin(hoverDistance * 52.0 - uTime * 5.0);

  if (uViewportAspect > uSourceAspect) {
    coverScale.y = uSourceAspect / uViewportAspect;
  } else {
    coverScale.x = uViewportAspect / uSourceAspect;
  }

  sourceUv = (sourceUv - 0.5) * coverScale + 0.5;
  vec2 hoverDirection = hoverVector / max(hoverDistance, 0.001);
  sourceUv -=
    vec2(hoverDirection.x / uViewportAspect, hoverDirection.y) *
    hover * (0.006 + hoverWave * 0.0035);
  sourceUv += uPointer * uPointerActive * vec2(0.0025, 0.0015);
  vec2 sampleOffset = (coverScale / uGrid) * 0.42;
  float luminance = getSourceLuminance(sourceUv) * 0.48;
  luminance +=
    getSourceLuminance(sourceUv + vec2(sampleOffset.x, 0.0)) * 0.13;
  luminance +=
    getSourceLuminance(sourceUv - vec2(sampleOffset.x, 0.0)) * 0.13;
  luminance +=
    getSourceLuminance(sourceUv + vec2(0.0, sampleOffset.y)) * 0.13;
  luminance +=
    getSourceLuminance(sourceUv - vec2(0.0, sampleOffset.y)) * 0.13;
  float density = pow(smoothstep(0.01, 0.72, luminance), 0.72);
  float subjectMask = smoothstep(0.012, 0.11, luminance);
  density = clamp(
    density + hover * subjectMask * (0.085 + hoverWave * 0.024),
    0.0,
    1.0
  );
  float glyphIndex = floor(clamp(density, 0.0, 0.9999) * uGlyphCount);
  float glyphScale = 1.0 + hover * 0.18;
  vec2 focusedCellUv = (cellUv - 0.5) / glyphScale + 0.5;
  vec2 atlasUv = vec2(
    (glyphIndex + focusedCellUv.x) / uGlyphCount,
    focusedCellUv.y
  );
  float glyph = texture2D(uGlyphAtlas, atlasUv).a;
  float fieldMask = smoothstep(0.004, 0.04, density);
  float focusRing =
    exp(-abs(hoverDistance - 0.18) * 55.0) * uPointerActive * subjectMask;
  float alpha =
    glyph * fieldMask * (0.5 + density * 0.5) *
    (1.0 + hover * 0.62 + focusRing * 0.22);

  if (alpha < 0.004) {
    discard;
  }

  vec3 value =
    uColor * (0.48 + density * 0.52 + hover * 0.2 + focusRing * 0.14);
  gl_FragColor = vec4(value, alpha);
}
`,G=`precision highp float;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,r=" .,:;i1tfLCG08@",c=32,p=52;function T(){const o=document.createElement("canvas");o.width=c*r.length,o.height=p;const e=o.getContext("2d");if(e){e.clearRect(0,0,o.width,o.height),e.fillStyle="#ffffff",e.font="500 29px ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace",e.textAlign="center",e.textBaseline="middle";for(let n=0;n<r.length;n+=1)e.fillText(r[n],n*c+c/2,p/2+1)}const t=new g(o);return t.wrapS=s,t.wrapT=s,t.minFilter=u,t.magFilter=u,t.generateMipmaps=!1,t.needsUpdate=!0,t}const F="/assets/eagleFrameAtlas-t4S0_R2h.webp",h=64,m=40,R=1400/788,P=12,I=13,v=147,f=10,_=192,D=108;function L(o){return o<240?64:o<420?88:o<700?120:154}class b{id="ascii-field";frameAtlas=new A().load(F);outputScene=new S;outputCamera=new U(-1,1,1,-1,0,1);outputGeometry=new y(2,2);glyphAtlas=T();outputUniforms={uSource:{value:this.frameAtlas},uGlyphAtlas:{value:this.glyphAtlas},uGrid:{value:new a(h,m)},uGlyphCount:{value:r.length},uColor:{value:C("primary")},uSourceAspect:{value:R},uViewportAspect:{value:1},uAtlasGrid:{value:new a(P,I)},uFrameTexel:{value:new a(1/_,1/D)},uFrame:{value:0},uTime:{value:0},uPointer:{value:new a},uPointerActive:{value:0}};outputMaterial=new x({uniforms:this.outputUniforms,vertexShader:G,fragmentShader:w,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1});outputMesh=new M(this.outputGeometry,this.outputMaterial);pointerX=0;pointerY=0;pointerStrength=0;gridColumns=h;gridRows=m;animationTime=0;visible=!1;constructor(e){this.frameAtlas.wrapS=s,this.frameAtlas.wrapT=s,this.frameAtlas.minFilter=u,this.frameAtlas.magFilter=u,this.frameAtlas.generateMipmaps=!1,this.outputScene.add(this.outputMesh)}update(e,t){const{pointer:n,runtime:i}=t,d=1;this.pointerX=l(this.pointerX,n.active?n.x:0,5.5,e.delta),this.pointerY=l(this.pointerY,n.active?n.y:0,5.5,e.delta),this.pointerStrength=l(this.pointerStrength,n.active?d:0,5,e.delta),this.outputUniforms.uPointer.value.set(this.pointerX,this.pointerY),this.outputUniforms.uPointerActive.value=this.pointerStrength,this.visible&&!i.reducedMotion&&(this.animationTime=(this.animationTime+e.delta)%(v/f),this.outputUniforms.uTime.value+=e.delta,this.outputUniforms.uFrame.value=Math.min(v-1,Math.floor(this.animationTime*f)))}render(e){e.render(this.outputScene,this.outputCamera)}resize(e){const t=L(e.width),n=Math.max(1,e.width/t),i=Math.max(22,Math.min(84,Math.round(e.height/(n*1.62))));(t!==this.gridColumns||i!==this.gridRows)&&(this.gridColumns=t,this.gridRows=i,this.outputUniforms.uGrid.value.set(t,i)),this.outputUniforms.uViewportAspect.value=e.aspect}setVisible(e){this.visible=e,this.outputMesh.visible=e}reset(){this.animationTime=0,this.outputUniforms.uFrame.value=0,this.outputUniforms.uTime.value=0}getDebugInfo(){return`${this.gridColumns}x${this.gridRows} glyphs / ${v}-frame eagle atlas`}dispose(){this.outputScene.remove(this.outputMesh),this.frameAtlas.dispose(),this.outputGeometry.dispose(),this.outputMaterial.dispose(),this.glyphAtlas.dispose()}}export{b as AsciiFieldScene};
