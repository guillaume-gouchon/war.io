WaterSurface = function(x, y, detailCoeff, waterTexture, waterTexture2) {
  this.speed = .15;
  this.geometry = new THREE.PlaneGeometry(x, y, 24*detailCoeff, 24*detailCoeff);
  waterTexture.wrapT = waterTexture.wrapS = THREE.RepeatWrapping;
  waterTexture.repeat.set( 16, 16 );
  waterTexture2.wrapT = waterTexture2.wrapS = THREE.RepeatWrapping;
  waterTexture2.repeat.set( 16, 16 );

  this.uniforms = {
    texture: {type: "t", value:waterTexture},
    texture2: {type: "t", value:waterTexture2},
    //color: { type: "c", value: new THREE.Color( 0x00ffff ) },
    waveWidth: {type: "f", value: 5},
    waveTime: {type: "f", value: 0},
    textRepeat: {type: "f", value: 16},
  };
  this.attributes = {
    size: { type: 'f', value: [] },
  };

  this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      attributes: this.attributes,
      vertexShader: [
          "// These have global scope",

          "uniform float waveWidth;",
          "uniform float waveTime;",
          "uniform float textRepeat;",
          "attribute float size;",

          "varying vec3 vPosition;",
          "varying vec2 vUv;",

          "void main() {",
            "//gl_PointSize = size;",
            // "vNormal = vec3(",
            //   "sin(sqrt(waveWidth * position.x + waveTime) * size*3.0) * cos(sqrt(waveWidth * position.y + waveTime) * size*3.0) * 0.06",
            //   "sin(waveWidth * waveTime*.2) * cos(waveWidth * waveTime*.2)*.09 * sin(position.y*position.x),",
            //   "max(0.0, sin(waveWidth * position.y + waveTime*.6) * cos(waveWidth * position.x + waveTime*.6) * 0.1)",
            //   ");",
            //   "normalize(vNormal);",

            "float z = sin(waveWidth * position.y + (waveTime-1.0)*.2) * cos(waveWidth * position.x + waveTime*.6) * 0.1 +",
            "sin(waveWidth * waveTime*.2) * cos(waveWidth * (waveTime+1.0)*.2)*.09 * sin(position.y*position.x) +",
            "sin(sqrt(waveWidth * position.x + (waveTime+2.0)) * size*1.0) * cos(sqrt(waveWidth * position.y + waveTime) * size*3.0) * 0.07;",
            "float x = 0.0 + sin(waveWidth * position.x + waveTime/2.0) * cos(waveWidth * position.y + waveTime/2.0) * 0.08;",
            "float y = 0.0 - cos(waveWidth * position.x + waveTime/2.0) * sin(waveWidth * position.y + waveTime/2.0) * 0.08;",
            "vPosition = vec3(x, y, z);",
            "vUv = vec2(uv.x * textRepeat + x * 1.0, uv.y * textRepeat + y * 1.0);",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(vPosition.x, vPosition.y, vPosition.z * 80.0), 1.0);",
          "}",
      ].join("\n"),
      fragmentShader: [
          "uniform sampler2D texture;",
          "uniform sampler2D texture2;",
          "varying vec3 vPosition;",
          "uniform float waveTime;",
          "uniform float textRepeat;",
          "varying vec2 vUv;",

          "void main() {",
              "vec4 texel = texture2D( texture, vUv ) * .6 + texture2D( texture2, vec2(vUv.y, vUv.x) ) * .4;",
              //"vec3 position = vec3(sin(vPosition.x) / 20.0, cos(vPosition.y) / 20.0, vPosition.z/4.0);",
              //"position = normalize(position);",
              //"vec3 light = vec3(0.2,0.2,2.0);",
              //"light = normalize(light);",
              //"float dProd = (1.0-min( .5, dot(position, light))) * .96;",

             "gl_FragColor = vec4(texel.rgb, 1.0);  // adjust the alpha",
            //"gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);  // adjust the alpha",
          "}",
      ].join("\n"),
      transparent:false,
  });

  for (var i=0; i<this.geometry.vertices.length; i++) {
      this.attributes.size.value[i] = Math.random() / (detailCoeff*detailCoeff);
  }

  this.model = new THREE.Mesh(this.geometry, this.material);
}

WaterSurface.prototype.animate = function (clockDelta) {
  this.speed += (.5-Math.random())*.02;
  if (this.speed > .2) this.speed = .2;
  if (this.speed < .15) this.speed = .15;
  this.uniforms.waveTime.value += this.speed * clockDelta * 10;
}