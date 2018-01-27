#define PARTICLE_LIFE_SPEED 2.0

#define HUGE 9E16
#define PI 3.14159265
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))

// ------

precision highp float;

uniform float time;
uniform float particlesSqrt;
uniform float particlePixels;
uniform float frame;
uniform float frames;
uniform bool init;
uniform float deltaTime;
uniform vec2 resolution;

uniform sampler2D textureReturn;
uniform sampler2D textureRandom;

// ------

vec2 vInvert( vec2 _uv ) {
  return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// ------

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

vec4 random( vec2 _uv ) {
  return texture2D( textureRandom, _uv );
}

#pragma glslify: noise = require( ./noise )
#pragma glslify: prng = require( ./prng )

vec3 randomSphere( inout vec4 seed ) {
  vec3 v;
  for ( int i = 0; i < 10; i ++ ) {
    v = vec3(
      prng( seed ),
      prng( seed ),
      prng( seed )
    ) * 2.0 - 1.0;
    if ( length( v ) < 1.0 ) { break; }
  }
  return v;
}

vec3 randomBox( inout vec4 seed ) {
  vec3 v;
  v = vec3(
    prng( seed ),
    prng( seed ),
    prng( seed )
  ) * 2.0 - 1.0;
  return v;
}

// ------

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 puv = vec2( ( floor( gl_FragCoord.x / particlePixels ) * particlePixels + 0.5 ) / resolution.x, uv.y );
  float number = ( ( gl_FragCoord.x - 0.5 ) / particlePixels ) + ( ( gl_FragCoord.y - 0.5 ) * particlesSqrt );
  float mode = mod( gl_FragCoord.x, particlePixels );
  vec2 dpix = vec2( 1.0 ) / resolution;

  vec4 seed = texture2D( textureRandom, puv );
  prng( seed );

  vec4 pos = texture2D( textureReturn, puv );
  vec4 vel = texture2D( textureReturn, puv + dpix * V.yx );
  vec4 col = texture2D( textureReturn, puv + dpix * V.yx * 2.0 );
  vec4 other = texture2D( textureReturn, puv + dpix * V.yx * 3.0 );

  float dt = deltaTime;

  float timing = number / particlesSqrt / particlesSqrt * frames / PARTICLE_LIFE_SPEED;
  float timingI = floor( timing );
  float timingF = fract( timing );
  if ( timingI == mod( frame, frames / PARTICLE_LIFE_SPEED ) ) {
    vec3 intrv = vec3( 0.2, 0.2, 0.2 );
    pos.xyz = ( floor( randomBox( seed ) * vec3( 4.0, 2.0, 4.0 ) / intrv + 0.5 ) ) * intrv;
    pos.w = 1.0;

    vel.xyz = vec3( 0.0 );
    col.x = prng( seed );
    other = vec4( 0.0 );

    dt = deltaTime * ( 1.0 - timingF );
  }

  pos.w -= dt * PARTICLE_LIFE_SPEED;

  pos.xyz += vel.xyz * dt;

  gl_FragColor = (
    mode < 1.0 ? pos :
    mode < 2.0 ? vel :
    mode < 3.0 ? col :
    other
  );
}