import{g as r,h as x,O as T,f as S,W as w,U as k,R as U,e as c,V as l,a as u,S as m,M as d}from"./WebGLManager-sA1UzttP.js";import{c as D,d as o,a as h}from"./visualTheme-D3H7PJr5.js";import{g as A,a as b}from"./quality-hGduBxES.js";import"./index-CbcRAWJb.js";class C{viewport=new r;scissor=new r;clearColor=new x;renderTarget=null;scissorTest=!1;clearAlpha=0;autoClear=!1;capture(e){this.renderTarget=e.getRenderTarget(),this.scissorTest=e.getScissorTest(),this.clearAlpha=e.getClearAlpha(),this.autoClear=e.autoClear,e.getViewport(this.viewport),e.getScissor(this.scissor),e.getClearColor(this.clearColor)}restore(e){e.setRenderTarget(this.renderTarget),e.autoClear=this.autoClear,e.setClearColor(this.clearColor,this.clearAlpha),e.setViewport(this.viewport),e.setScissor(this.scissor),e.setScissorTest(this.scissorTest)}}function P(n,e,i,t,a,s,f=!0,g=0,y=0){n.autoClear=!1,n.setRenderTarget(e),n.setScissorTest(!1),n.setViewport(0,0,i,t),f&&(n.setClearColor(g,y),n.clear(!0,!0,!1)),n.render(a,s)}const p=`precision highp float;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,V=`precision highp float;

uniform float uTime;
uniform float uAspect;
uniform vec2 uPointer;
uniform vec2 uPointerVelocity;
uniform float uPointerActive;

varying vec2 vUv;

vec2 mod289(vec2 value) {
  return value - floor(value * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 value) {
  return value - floor(value * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 value) {
  return mod289(((value * 34.0) + 1.0) * value);
}

// 2D simplex noise keeps the field directional and organic without textures.
float simplexNoise(vec2 point) {
  const vec4 constants = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 cell = floor(point + dot(point, constants.yy));
  vec2 local0 = point - cell + dot(cell, constants.xx);
  vec2 corner = local0.x > local0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 local12 = local0.xyxy + constants.xxzz;
  local12.xy -= corner;
  cell = mod289(cell);
  vec3 permutation = permute(
    permute(cell.y + vec3(0.0, corner.y, 1.0)) +
    cell.x + vec3(0.0, corner.x, 1.0)
  );
  vec3 influence = max(
    0.5 - vec3(
      dot(local0, local0),
      dot(local12.xy, local12.xy),
      dot(local12.zw, local12.zw)
    ),
    0.0
  );
  influence *= influence;
  influence *= influence;
  vec3 gradient = 2.0 * fract(permutation * constants.www) - 1.0;
  vec3 gradientAbs = abs(gradient) - 0.5;
  vec3 gradientFloor = floor(gradient + 0.5);
  vec3 adjusted = gradient - gradientFloor;
  influence *= 1.79284291400159 - 0.85373472095314 *
    (adjusted * adjusted + gradientAbs * gradientAbs);
  vec3 contribution;
  contribution.x = adjusted.x * local0.x + gradientAbs.x * local0.y;
  contribution.yz = adjusted.yz * local12.xz + gradientAbs.yz * local12.yw;
  return 130.0 * dot(influence, contribution);
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.54;
  mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);

  for (int octave = 0; octave < 4; octave++) {
    value += (simplexNoise(point) * 0.5 + 0.5) * amplitude;
    point = rotation * point * 2.03 + vec2(1.71, -2.43);
    amplitude *= 0.5;
  }

  return value;
}

float edgeMask(vec2 uv) {
  vec2 edge = smoothstep(vec2(0.0), vec2(0.11), uv) *
    smoothstep(vec2(0.0), vec2(0.11), 1.0 - uv);
  return edge.x * edge.y;
}

void main() {
  vec2 centered = vUv - 0.5;
  centered.x *= uAspect;
  float flowTime = uTime * 0.075;
  vec2 base = centered * 2.15;

  vec2 pointerDelta = vUv - uPointer;
  pointerDelta.x *= uAspect;
  float pointerWake = exp(-dot(pointerDelta, pointerDelta) * 18.0) *
    uPointerActive;
  base -= uPointerVelocity * pointerWake * 0.055;

  // Two-stage domain warping creates a field that continually folds into itself.
  vec2 firstWarp = vec2(
    fbm(base * 0.82 + vec2(flowTime, -flowTime * 0.7)),
    fbm(base * 0.91 + vec2(5.2, -3.7) - flowTime * 0.55)
  );
  vec2 secondWarp = vec2(
    fbm(base + firstWarp * 1.7 + vec2(-2.4, 1.3) + flowTime * 0.35),
    fbm(base + firstWarp * 1.45 + vec2(3.8, 4.1) - flowTime * 0.28)
  );
  vec2 warped = base + (secondWarp - 0.5) * 1.42;
  warped.y -= flowTime * 0.42;

  float broadCloud = fbm(warped * 1.18);
  float fineDust = simplexNoise(warped * 8.5 - flowTime * 1.4) * 0.5 + 0.5;
  float microGrain = simplexNoise(warped * 21.0 + flowTime * 2.1) * 0.5 + 0.5;

  vec2 cloudCenter = vec2(
    sin(flowTime * 0.72) * 0.18,
    cos(flowTime * 0.51) * 0.1
  );
  vec2 cloudShape = centered - cloudCenter;
  cloudShape.x *= 0.68;
  float radialMask = 1.0 - smoothstep(0.22, 0.86, length(cloudShape));
  float ribbonMask = 1.0 - smoothstep(
    0.24,
    0.72,
    abs(centered.y + (firstWarp.x - 0.5) * 0.46)
  );
  float compositionalMask = max(radialMask, ribbonMask * 0.72) * edgeMask(vUv);

  float displacedDensity = broadCloud + (fineDust - 0.5) * 0.2;
  float softBody = smoothstep(0.42, 0.78, displacedDensity);
  float thresholdBody = smoothstep(0.59, 0.69, displacedDensity);
  float evolvingThreshold = 0.28 + 0.72 *
    (0.5 + 0.5 * sin(flowTime * 1.7 + secondWarp.y * 5.0));
  float contrasted = mix(softBody, thresholdBody, evolvingThreshold * 0.5);

  float dust = smoothstep(0.72, 0.94, fineDust * microGrain) * softBody;
  float velocityEnergy = min(length(uPointerVelocity), 2.5);
  float density = contrasted * compositionalMask * 0.78;
  density += dust * compositionalMask * 0.2;
  density += pointerWake * velocityEnergy * 0.08;
  density = clamp(density, 0.0, 1.0);

  gl_FragColor = vec4(
    density,
    fineDust,
    secondWarp.x,
    smoothstep(0.025, 0.82, density)
  );
}
`,M=`precision highp float;

uniform sampler2D uSmoke;
uniform vec3 uColor;
uniform float uTime;
uniform float uAspect;
uniform vec2 uTexelSize;
uniform vec2 uPointer;
uniform float uPointerActive;

varying vec2 vUv;

float hash21(vec2 point) {
  vec3 value = fract(vec3(point.xyx) * 0.1031);
  value += dot(value, value.yzx + 33.33);
  return fract((value.x + value.y) * value.z);
}

void main() {
  // The field periodically resolves into small cells. Pointer interaction only
  // quantizes a feathered region around the cursor, leaving the rest organic.
  float tileWindow = pow(max(0.0, sin(uTime * 0.31 - 0.72)), 10.0);
  vec2 pointerDelta = vUv - uPointer;
  pointerDelta.x *= uAspect;
  float pointerTileMask = 1.0 - smoothstep(
    0.045,
    0.27,
    length(pointerDelta)
  );
  float hoverTiles = smoothstep(0.04, 0.92, uPointerActive);
  float tileAmount = max(tileWindow, hoverTiles * pointerTileMask);
  vec2 tileCount = vec2(46.0 * max(uAspect, 1.0), 46.0);
  vec2 tiledUv = (floor(vUv * tileCount) + 0.5) / tileCount;
  vec2 sampleUv = mix(vUv, tiledUv, tileAmount * 0.94);

  // Displace the generated texture with its own local density gradient.
  float densityLeft = texture2D(uSmoke, sampleUv - vec2(uTexelSize.x, 0.0)).r;
  float densityRight = texture2D(uSmoke, sampleUv + vec2(uTexelSize.x, 0.0)).r;
  float densityDown = texture2D(uSmoke, sampleUv - vec2(0.0, uTexelSize.y)).r;
  float densityUp = texture2D(uSmoke, sampleUv + vec2(0.0, uTexelSize.y)).r;
  vec2 displacement = vec2(
    densityRight - densityLeft,
    densityUp - densityDown
  );
  vec2 displacedUv = clamp(sampleUv + displacement * 0.045, 0.0, 1.0);
  vec4 field = texture2D(uSmoke, displacedUv);

  float softDensity = smoothstep(0.025, 0.72, field.r);
  float thresholdDensity = smoothstep(0.34, 0.58, field.r);
  float contrasted = mix(softDensity, thresholdDensity, 0.34 + tileAmount * 0.5);
  float contour = smoothstep(0.14, 0.34, field.r) *
    (1.0 - smoothstep(0.56, 0.82, field.r));

  float temporalStep = floor(uTime * 12.0);
  float grain = hash21(gl_FragCoord.xy + temporalStep * vec2(17.0, 31.0));
  float microscopicDust = step(0.91, grain) *
    smoothstep(0.04, 0.52, field.g) *
    softDensity;
  vec2 cellDistance = abs(fract(vUv * tileCount) - 0.5);
  float cellEdge = tileAmount * max(
    smoothstep(0.43, 0.49, cellDistance.x),
    smoothstep(0.43, 0.49, cellDistance.y)
  );

  float luminance = contrasted * (0.38 + grain * 0.2);
  luminance += contour * 0.1 + microscopicDust * 0.34;
  luminance *= 1.0 - cellEdge * 0.32;
  float alpha = contrasted * 0.72 + contour * 0.07 + microscopicDust * 0.28;

  if (alpha < 0.008) {
    discard;
  }

  gl_FragColor = vec4(uColor * luminance, clamp(alpha, 0.0, 0.86));
}
`,v={low:{resolutionScale:.42,maxDimension:224,simulationRate:20},medium:{resolutionScale:.5,maxDimension:320,simulationRate:24},high:{resolutionScale:.54,maxDimension:384,simulationRate:24}};class I{id="smoke-field";camera=new T(-1,1,1,-1,0,1);geometry=new S(2,2);rendererState=new C;smokeTarget=new w(64,64,{minFilter:c,magFilter:c,format:U,type:k,depthBuffer:!1,stencilBuffer:!1});smokeUniforms={uTime:{value:0},uAspect:{value:1},uPointer:{value:new l(.5,.5)},uPointerVelocity:{value:new l},uPointerActive:{value:0}};smokeMaterial=new u({uniforms:this.smokeUniforms,vertexShader:p,fragmentShader:V,depthTest:!1,depthWrite:!1,toneMapped:!1});smokeScene=new m;smokeQuad=new d(this.geometry,this.smokeMaterial);displayUniforms={uSmoke:{value:this.smokeTarget.texture},uColor:{value:D("primary")},uTime:{value:0},uAspect:{value:1},uTexelSize:{value:new l(1/64,1/64)},uPointer:{value:new l(.5,.5)},uPointerActive:{value:0}};displayMaterial=new u({uniforms:this.displayUniforms,vertexShader:p,fragmentShader:M,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1});displayScene=new m;displayQuad=new d(this.geometry,this.displayMaterial);targetWidth=64;targetHeight=64;simulationInterval=1/v.medium.simulationRate;simulationAccumulator=this.simulationInterval;simulationPending=!0;animationTime=0;pointerU=.5;pointerV=.5;pointerVelocityX=0;pointerVelocityY=0;pointerStrength=0;constructor(){this.smokeTarget.texture.generateMipmaps=!1,this.smokeScene.add(this.smokeQuad),this.displayScene.add(this.displayQuad)}update(e,i){const{pointer:t,runtime:a}=i,s=a.reducedMotion?0:1;this.pointerU=o(this.pointerU,t.active?t.u:.5,5,e.delta),this.pointerV=o(this.pointerV,t.active?1-t.v:.5,5,e.delta),this.pointerVelocityX=o(this.pointerVelocityX,t.active?h(t.velocityX,-3,3)*s:0,7,e.delta),this.pointerVelocityY=o(this.pointerVelocityY,t.active?h(t.velocityY,-3,3)*s:0,7,e.delta),this.pointerStrength=o(this.pointerStrength,t.active?1:0,5,e.delta),a.reducedMotion||(this.animationTime+=e.delta,this.simulationAccumulator+=e.delta,this.simulationAccumulator>=this.simulationInterval&&(this.simulationAccumulator%=this.simulationInterval,this.simulationPending=!0)),this.smokeUniforms.uTime.value=this.animationTime,this.smokeUniforms.uPointer.value.set(this.pointerU,this.pointerV),this.smokeUniforms.uPointerVelocity.value.set(this.pointerVelocityX,this.pointerVelocityY),this.smokeUniforms.uPointerActive.value=this.pointerStrength,this.displayUniforms.uTime.value=this.animationTime,this.displayUniforms.uPointer.value.set(this.pointerU,this.pointerV),this.displayUniforms.uPointerActive.value=this.pointerStrength}render(e){if(this.simulationPending){this.rendererState.capture(e);try{P(e,this.smokeTarget,this.targetWidth,this.targetHeight,this.smokeScene,this.camera)}finally{this.rendererState.restore(e)}this.simulationPending=!1}e.render(this.displayScene,this.camera)}resize(e){const i=v[A(e)],t=b(e,i.resolutionScale,i.maxDimension);(t.width!==this.targetWidth||t.height!==this.targetHeight)&&(this.targetWidth=t.width,this.targetHeight=t.height,this.smokeTarget.setSize(this.targetWidth,this.targetHeight),this.displayUniforms.uTexelSize.value.set(1/this.targetWidth,1/this.targetHeight),this.simulationPending=!0),this.simulationInterval=1/i.simulationRate,this.smokeUniforms.uAspect.value=e.aspect,this.displayUniforms.uAspect.value=e.aspect}setVisible(e){this.smokeQuad.visible=e,this.displayQuad.visible=e}reset(){this.simulationPending=!0,this.simulationAccumulator=this.simulationInterval}getDebugInfo(){return`${this.targetWidth}x${this.targetHeight} / ${Math.round(1/this.simulationInterval)} Hz`}dispose(){this.smokeScene.remove(this.smokeQuad),this.displayScene.remove(this.displayQuad),this.geometry.dispose(),this.smokeMaterial.dispose(),this.displayMaterial.dispose(),this.smokeTarget.dispose()}}export{I as SmokeFieldScene};
