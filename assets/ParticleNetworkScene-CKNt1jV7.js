import{S as T,P as V,B as b,b as u,D as y,a as N,A as M,c as _,L as G}from"./WebGLManager-B68qVaOA.js";import{c as O,d as m,a as x}from"./visualTheme-DHPPKk2d.js";import{c as E,g as F}from"./quality-hGduBxES.js";import{r as S,c as z}from"./random-Bf6ty-81.js";import"./index-DWmZU-JA.js";const X=`precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;

void main() {
  vec2 centered = gl_PointCoord - 0.5;
  float distanceToCenter = length(centered);
  float outer = smoothstep(0.5, 0.28, distanceToCenter);
  float core = smoothstep(0.22, 0.02, distanceToCenter);
  float alpha = (outer * 0.72 + core * 0.28) * vAlpha * uOpacity;

  if (alpha < 0.004) {
    discard;
  }

  gl_FragColor = vec4(uColor, alpha);
}
`,I=`precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;

void main() {
  float alpha = vAlpha * uOpacity;

  if (alpha < 0.004) {
    discard;
  }

  gl_FragColor = vec4(uColor, alpha);
}
`,Y=`precision highp float;

attribute float aStrength;

varying float vAlpha;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  float depthFade = smoothstep(-6.4, -3.8, viewPosition.z);
  vAlpha = (0.28 + aStrength * 0.72) * depthFade;
}
`,k=`precision highp float;

uniform float uPixelRatio;

attribute float aSize;
attribute float aSeed;

varying float vAlpha;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  float perspectiveScale = clamp(3.4 / -viewPosition.z, 0.68, 1.6);
  gl_PointSize = clamp(aSize * uPixelRatio * perspectiveScale, 2.2, 8.5);

  float depthFade = smoothstep(-6.4, -3.8, viewPosition.z);
  vAlpha = (0.72 + aSeed * 0.28) * depthFade;
}
`,r=96,g=340,D=7,A=.86,L=A*A,C=1/24,U={low:38,medium:64,high:92},R=[[-.95,.35,-.18],[.35,.5,.16],[-.18,-.62,-.35],[1.02,-.38,.04]];class J{id="particle-network";scene=new T;camera=new V(39,1,.1,20);nodeGeometry=new b;lineGeometry=new b;basePositions=new Float32Array(r*3);nodePositions=new Float32Array(r*3);nodePhases=new Float32Array(r*3);nodeSizes=new Float32Array(r);nodeSeeds=new Float32Array(r);linePositions=new Float32Array(g*2*3);lineStrengths=new Float32Array(g*2);connectionCounts=new Uint8Array(r);nodePositionAttribute=new u(this.nodePositions,3).setUsage(y);linePositionAttribute=new u(this.linePositions,3).setUsage(y);lineStrengthAttribute=new u(this.lineStrengths,1).setUsage(y);nodeUniforms={uPixelRatio:{value:1},uColor:{value:O("primary")},uOpacity:{value:1}};lineUniforms={uColor:{value:O("secondary")},uOpacity:{value:.68}};nodeMaterial=new N({uniforms:this.nodeUniforms,vertexShader:k,fragmentShader:X,transparent:!0,blending:M,depthTest:!0,depthWrite:!1,toneMapped:!1});lineMaterial=new N({uniforms:this.lineUniforms,vertexShader:Y,fragmentShader:I,transparent:!0,blending:M,depthTest:!0,depthWrite:!1,toneMapped:!1});nodes=new _(this.nodeGeometry,this.nodeMaterial);lines=new G(this.lineGeometry,this.lineMaterial);activeNodeCount=U.medium;activeConnectionCount=0;animationTime=0;updateAccumulator=C;topologyDirty=!0;pointerX=0;pointerY=0;pointerVelocityX=0;pointerVelocityY=0;pointerStrength=0;constructor(t){this.populateNodes(t),this.nodeGeometry.setAttribute("position",this.nodePositionAttribute),this.nodeGeometry.setAttribute("aSize",new u(this.nodeSizes,1)),this.nodeGeometry.setAttribute("aSeed",new u(this.nodeSeeds,1)),this.nodeGeometry.setDrawRange(0,this.activeNodeCount),this.lineGeometry.setAttribute("position",this.linePositionAttribute),this.lineGeometry.setAttribute("aStrength",this.lineStrengthAttribute),this.lineGeometry.setDrawRange(0,0),this.camera.position.set(.05,.02,4.25),this.nodes.frustumCulled=!1,this.lines.frustumCulled=!1,this.nodes.renderOrder=2,this.lines.renderOrder=1,this.scene.add(this.lines,this.nodes)}update(t,i){const{pointer:e,runtime:n}=i,o=n.reducedMotion?.2:1;this.pointerX=m(this.pointerX,e.active?e.x:0,7,t.delta),this.pointerY=m(this.pointerY,e.active?e.y:0,7,t.delta),this.pointerVelocityX=m(this.pointerVelocityX,e.active?x(e.velocityX,-3,3)*o:0,9,t.delta),this.pointerVelocityY=m(this.pointerVelocityY,e.active?x(e.velocityY,-3,3)*o:0,9,t.delta),this.pointerStrength=m(this.pointerStrength,e.active?o:0,6,t.delta),n.reducedMotion||(this.animationTime+=t.delta,this.updateAccumulator+=t.delta),(this.topologyDirty||n.reducedMotion||this.updateAccumulator>=C)&&(this.updateNodePositions(i.viewport.aspect),this.updateConnections(),this.updateAccumulator%=C,this.topologyDirty=!1)}render(t){t.render(this.scene,this.camera)}resize(t){const i=E(F(t),U);i!==this.activeNodeCount&&(this.activeNodeCount=i,this.nodeGeometry.setDrawRange(0,this.activeNodeCount),this.topologyDirty=!0),this.camera.aspect=t.aspect,this.camera.updateProjectionMatrix(),this.nodeUniforms.uPixelRatio.value=t.pixelRatio,this.topologyDirty=!0}setVisible(t){this.nodes.visible=t,this.lines.visible=t}dispose(){this.scene.remove(this.lines,this.nodes),this.nodeGeometry.dispose(),this.lineGeometry.dispose(),this.nodeMaterial.dispose(),this.lineMaterial.dispose()}populateNodes(t){const i=z(608135816+t*193);for(let e=0;e<r;e+=1){const n=e*3,o=R[e%R.length];this.basePositions[n]=o[0]+S(i)*.52,this.basePositions[n+1]=o[1]+S(i)*.42,this.basePositions[n+2]=o[2]+S(i)*.48,this.nodePhases[n]=i()*Math.PI*2,this.nodePhases[n+1]=i()*Math.PI*2,this.nodePhases[n+2]=i()*Math.PI*2,this.nodeSizes[e]=2.4+i()*2.1,this.nodeSeeds[e]=i()}}updateNodePositions(t){const i=Math.tan(this.camera.fov*Math.PI/360)*4.25,e=this.pointerX*i*t,n=this.pointerY*i;for(let o=0;o<this.activeNodeCount;o+=1){const s=o*3;let h=this.basePositions[s]+Math.sin(this.animationTime*.18+this.nodePhases[s])*.1,d=this.basePositions[s+1]+Math.cos(this.animationTime*.15+this.nodePhases[s+1])*.08;const f=this.basePositions[s+2]+Math.sin(this.animationTime*.11+this.nodePhases[s+2])*.07,l=h-e,a=d-n,p=l*l+a*a,c=.78;if(this.pointerStrength>.001&&p<c*c){const v=Math.sqrt(p)+.001,w=1-v/c,P=w*w*.15*this.pointerStrength;h+=l/v*P+this.pointerVelocityX*P*.014,d+=a/v*P+this.pointerVelocityY*P*.014}this.nodePositions[s]=h,this.nodePositions[s+1]=d,this.nodePositions[s+2]=f}this.nodePositionAttribute.clearUpdateRanges(),this.nodePositionAttribute.addUpdateRange(0,this.activeNodeCount*3),this.nodePositionAttribute.needsUpdate=!0}updateConnections(){this.connectionCounts.fill(0,0,this.activeNodeCount);let t=0;for(let e=0;e<this.activeNodeCount&&!(t>=g);e+=1){const n=e*3;for(let o=e+1;o<this.activeNodeCount&&!(t>=g||this.connectionCounts[e]>=D);o+=1){if(this.connectionCounts[o]>=D)continue;const s=o*3,h=this.nodePositions[n]-this.nodePositions[s],d=this.nodePositions[n+1]-this.nodePositions[s+1],f=this.nodePositions[n+2]-this.nodePositions[s+2],l=h*h+d*d+f*f;if(l>=L)continue;const a=t*6,p=t*2,c=1-Math.sqrt(l)/A;this.linePositions[a]=this.nodePositions[n],this.linePositions[a+1]=this.nodePositions[n+1],this.linePositions[a+2]=this.nodePositions[n+2],this.linePositions[a+3]=this.nodePositions[s],this.linePositions[a+4]=this.nodePositions[s+1],this.linePositions[a+5]=this.nodePositions[s+2],this.lineStrengths[p]=c,this.lineStrengths[p+1]=c,this.connectionCounts[e]+=1,this.connectionCounts[o]+=1,t+=1}}this.activeConnectionCount=t;const i=this.activeConnectionCount*2;this.lineGeometry.setDrawRange(0,i),this.linePositionAttribute.clearUpdateRanges(),this.linePositionAttribute.addUpdateRange(0,i*3),this.linePositionAttribute.needsUpdate=!0,this.lineStrengthAttribute.clearUpdateRanges(),this.lineStrengthAttribute.addUpdateRange(0,i),this.lineStrengthAttribute.needsUpdate=!0}}export{J as ParticleNetworkScene};
