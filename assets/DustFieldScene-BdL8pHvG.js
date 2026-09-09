import{S as q,O as I,B as E,a as j,A as N,c as Q,b,D as U}from"./WebGLManager-B68qVaOA.js";import{c as K,d as V,a as $}from"./visualTheme-DHPPKk2d.js";import{c as J,g as L}from"./quality-hGduBxES.js";import{r as _,c as Z}from"./random-Bf6ty-81.js";import"./index-DWmZU-JA.js";const tt=`precision highp float;

uniform float uPixelRatio;

attribute float aSize;
attribute float aHeading;
attribute float aPhase;

varying float vAlpha;
varying float vHeading;
varying float vPhase;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = clamp(aSize * uPixelRatio, 14.0, 42.0);
  vAlpha = 1.0;
  vHeading = aHeading;
  vPhase = aPhase;
}
`,it=`precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;
varying float vHeading;
varying float vPhase;

vec2 rotatePoint(vec2 point, float angle) {
  float angleCos = cos(angle);
  float angleSin = sin(angle);
  return vec2(
    angleCos * point.x - angleSin * point.y,
    angleSin * point.x + angleCos * point.y
  );
}

void main() {
  vec2 sprite = (gl_PointCoord - 0.5) * 2.0;
  vec2 fish = rotatePoint(sprite, -vHeading);

  // Head points along +X, which is always aligned to the boid velocity in
  // DustFieldScene. The locomotion wave begins behind the stabilized head and
  // travels backward with increasing amplitude.
  float cycle = uTime * 5.0 + vPhase;
  float spineProgress = clamp((0.48 - fish.x) / 1.28, 0.0, 1.0);
  float neckRelease = smoothstep(0.08, 0.34, spineProgress);
  float spineAmplitude =
    mix(0.006, 0.235, pow(spineProgress, 1.7)) * neckRelease;
  float spinePhase = cycle - spineProgress * 5.4;
  float spineY = sin(spinePhase) * spineAmplitude;

  float bodyRange =
    smoothstep(-0.83, -0.72, fish.x) *
    (1.0 - smoothstep(0.72, 0.88, fish.x));
  float bodyProgress = clamp((fish.x + 0.78) / 1.58, 0.0, 1.0);
  float bodyWidth =
    0.075 + pow(sin(bodyProgress * 3.14159265), 0.72) * 0.285;
  float body = bodyRange *
    (1.0 - smoothstep(bodyWidth * 0.8, bodyWidth, abs(fish.y - spineY)));

  // Keep the head and neck comparatively rigid so the eye and nose remain
  // locked to the forward velocity direction instead of being swept sideways.
  vec2 headPoint = vec2((fish.x - 0.55) / 0.34, fish.y / 0.275);
  float head = 1.0 - smoothstep(0.84, 1.0, length(headPoint));

  // The peduncle inherits the final spine tangent. The caudal joint trails it
  // by a distinct phase delay and amplifies the angle like a flexible paddle.
  float tailBaseProgress = 0.94;
  float tailBasePhase = cycle - tailBaseProgress * 5.4;
  float tailBaseY =
    sin(tailBasePhase) *
    mix(0.006, 0.235, pow(tailBaseProgress, 1.7));
  float peduncleAngle = cos(tailBasePhase) * 0.25;
  float caudalAngle = peduncleAngle + sin(tailBasePhase - 0.9) * 0.36;
  vec2 caudal = rotatePoint(
    fish - vec2(-0.72, tailBaseY),
    -caudalAngle
  );
  float caudalProgress = clamp(-caudal.x / 0.35, 0.0, 1.0);
  float caudalRange =
    smoothstep(-0.37, -0.3, caudal.x) *
    (1.0 - smoothstep(-0.035, 0.025, caudal.x));
  float caudalWidth = mix(0.055, 0.31, pow(caudalProgress, 0.72));
  float caudalFin = caudalRange *
    (1.0 - smoothstep(caudalWidth * 0.78, caudalWidth, abs(caudal.y)));

  float silhouette = max(max(body, head), caudalFin * 0.9);
  float eye = 1.0 - smoothstep(
    0.025,
    0.075,
    length(fish - vec2(0.66, 0.08))
  );
  float highlight =
    (1.0 - smoothstep(0.02, 0.3, abs(fish.y - spineY + 0.08))) *
    body *
    0.22;
  float tailFade = mix(0.72, 1.0, bodyProgress);
  float luminance = min(
    1.0,
    0.74 + eye * 0.42 + highlight + tailFade * body * 0.08
  );
  float alpha = silhouette * uOpacity * vAlpha;

  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uColor * luminance, alpha);
}
`,c=240,W={low:72,medium:132,high:216},g=1/30,et=2;class ht{id="dust-field";scene=new q;camera=new I(-1,1,1,-1,.1,10);boidGeometry=new E;boidPositions=new Float32Array(c*2);boidVelocities=new Float32Array(c*2);nextVelocities=new Float32Array(c*2);boidHeadings=new Float32Array(c);boidPhases=new Float32Array(c);pointSizes=new Float32Array(c);pointPositions=new Float32Array(c*3);boidUniforms={uTime:{value:0},uPixelRatio:{value:1},uColor:{value:K("primary")},uOpacity:{value:1}};boidMaterial=new j({uniforms:this.boidUniforms,vertexShader:tt,fragmentShader:it,transparent:!0,blending:N,depthTest:!1,depthWrite:!1,toneMapped:!1});flock=new Q(this.boidGeometry,this.boidMaterial);animationTime=0;accumulator=g;activeCount=W.medium;boundX=1;boundY=.9;pointerX=0;pointerY=0;pointerStrength=0;constructor(t){this.initializeBoids(t);const o=new b(this.pointPositions,3),i=new b(this.boidHeadings,1);o.setUsage(U),i.setUsage(U),this.boidGeometry.setAttribute("position",o),this.boidGeometry.setAttribute("aSize",new b(this.pointSizes,1)),this.boidGeometry.setAttribute("aHeading",i),this.boidGeometry.setAttribute("aPhase",new b(this.boidPhases,1)),this.boidGeometry.setDrawRange(0,this.activeCount),this.camera.position.z=3,this.flock.frustumCulled=!1,this.scene.add(this.flock),this.writeGeometry()}update(t,o){const{pointer:i,runtime:a}=o,l=a.reducedMotion?.18:1;if(this.pointerX=V(this.pointerX,i.active?i.x*this.boundX:0,7,t.delta),this.pointerY=V(this.pointerY,i.active?i.y*this.boundY:0,7,t.delta),this.pointerStrength=V(this.pointerStrength,i.active?l:0,6,t.delta),a.reducedMotion)return;this.animationTime+=t.delta,this.accumulator+=t.delta;const n=Math.min(et,Math.floor(this.accumulator/g));for(let e=0;e<n;e+=1)this.stepBoids(g),this.accumulator-=g;n>0&&this.writeGeometry(),this.boidUniforms.uTime.value=this.animationTime}render(t){t.render(this.scene,this.camera)}resize(t){this.activeCount=J(L(t),W),this.boundX=Math.max(.52,t.aspect*.92),this.boundY=.9,this.camera.left=-t.aspect,this.camera.right=t.aspect,this.camera.top=1,this.camera.bottom=-1,this.camera.updateProjectionMatrix(),this.boidGeometry.setDrawRange(0,this.activeCount),this.boidUniforms.uPixelRatio.value=t.pixelRatio,this.writeGeometry()}setVisible(t){this.flock.visible=t}getDebugInfo(){return`${this.activeCount} articulated fish boids / velocity-aligned undulation`}dispose(){this.scene.remove(this.flock),this.boidGeometry.dispose(),this.boidMaterial.dispose()}initializeBoids(t){const o=Z(1597463007+t*131);for(let i=0;i<c;i+=1){const a=i*2,l=o()*Math.PI*2,n=.19+o()*.23;this.boidPositions[a]=_(o)*.86,this.boidPositions[a+1]=_(o)*.72,this.boidVelocities[a]=Math.cos(l)*n,this.boidVelocities[a+1]=Math.sin(l)*n,this.boidHeadings[i]=l,this.boidPhases[i]=o()*Math.PI*2,this.pointSizes[i]=15+o()*9}}stepBoids(t){const i=.007225000000000001,a=Math.cos(this.animationTime*.34)*this.boundX*.34,l=Math.sin(this.animationTime*.41)*.28;for(let n=0;n<this.activeCount;n+=1){const e=n*2,h=this.boidPositions[e],d=this.boidPositions[e+1],Y=this.boidVelocities[e],X=this.boidVelocities[e+1];let C=0,B=0,R=0,F=0,D=0,G=0,y=0;for(let s=0;s<this.activeCount;s+=1){if(s===n)continue;const r=s*2,w=this.boidPositions[r]-h,A=this.boidPositions[r+1]-d,M=w*w+A*A;if(!(M>=.0961)&&(C+=this.boidVelocities[r],B+=this.boidVelocities[r+1],R+=this.boidPositions[r],F+=this.boidPositions[r+1],y+=1,M<i)){const k=1/Math.max(M,.001);D-=w*k,G-=A*k}}let p=(a-h)*.055,u=(l-d)*.055;if(y>0){const s=1/y;p+=(C*s-Y)*.68,u+=(B*s-X)*.68,p+=(R*s-h)*.22,u+=(F*s-d)*.22,p+=D*.011,u+=G*.011}const T=Math.hypot(h,d)+.001;p+=-d/T*.038,u+=h/T*.038;const H=Math.abs(h)/this.boundX,z=Math.abs(d)/this.boundY;H>.76&&(p-=Math.sign(h)*(H-.76)*1.7),z>.72&&(u-=Math.sign(d)*(z-.72)*1.9);const P=h-this.pointerX,v=d-this.pointerY,x=P*P+v*v;if(x<.24&&this.pointerStrength>.001){const s=(1-x/.24)*this.pointerStrength,r=1/Math.sqrt(x+.002);p+=P*r*s*1.3,u+=v*r*s*1.3}let f=Y+p*t,m=X+u*t;const S=Math.hypot(f,m)+1e-4,O=$(S,.2,.54);f=f/S*O,m=m/S*O,this.nextVelocities[e]=f,this.nextVelocities[e+1]=m}for(let n=0;n<this.activeCount;n+=1){const e=n*2;this.boidVelocities[e]=this.nextVelocities[e],this.boidVelocities[e+1]=this.nextVelocities[e+1],this.boidPositions[e]+=this.boidVelocities[e]*t,this.boidPositions[e+1]+=this.boidVelocities[e+1]*t}}writeGeometry(){for(let t=0;t<this.activeCount;t+=1){const o=t*2,i=t*3,a=this.boidPositions[o],l=this.boidPositions[o+1],n=this.boidVelocities[o],e=this.boidVelocities[o+1];this.pointPositions[i]=a,this.pointPositions[i+1]=l,this.pointPositions[i+2]=0,this.boidHeadings[t]=Math.atan2(e,n)}this.boidGeometry.getAttribute("position").needsUpdate=!0,this.boidGeometry.getAttribute("aHeading").needsUpdate=!0}}export{ht as DustFieldScene};
