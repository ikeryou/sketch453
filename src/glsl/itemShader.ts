const ItemShader = {
  uniforms: {},

  vertexShader: /* glsl */ `
    uniform float rot;
    uniform float fix;
    uniform float rate;
    attribute vec3 imgpoint;
    attribute vec3 imgpointFix;

    varying vec2 vUv;

    vec3 rotate(vec3 p, float angle, vec3 axis){
      vec3 a = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float r = 1.0 - c;
      mat3 m = mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
      );
      return m * p;
    }

    void main(){
      vUv = rotate(mix(imgpoint, imgpointFix, rate), mix(rot, 0.0, fix), vec3(0.0, 0.0, 1.0)).xy;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }`,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float rate;
    uniform float noise;
    uniform vec2 screenSize;

    varying vec2 vUv;

    void main(void) {
      vec4 dest = texture2D(tDiffuse, vUv);

      vec2 vUv2 = vUv;
      float mosaicScale = noise * 200.0;

      //モザイク処理
      vUv2.x = floor(vUv2.x * screenSize.x / mosaicScale) / (screenSize.x / mosaicScale) + (mosaicScale / 2.0) / screenSize.x;
      vUv2.y = floor(vUv2.y * screenSize.y / mosaicScale) / (screenSize.y / mosaicScale) + (mosaicScale / 2.0) / screenSize.y;
      vec4 dest2 = texture2D(tDiffuse, vUv2);

      dest.rgb = mix(dest.rgb, dest2.rgb * noise, min(1.0, rate));
      gl_FragColor = dest;
    }`,
}

export { ItemShader }
