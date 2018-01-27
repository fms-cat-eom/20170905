#define PARTICLE_LIFE_SPEED 2.0

#define HUGE 9E16
#define PI 3.14159265
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))

// ------

precision highp float;

varying vec3 vPos;
varying float vLife;
varying float vMode;
varying float vLen;

uniform bool depth;

uniform float time;
uniform float frames;
uniform vec2 resolution;
uniform vec3 cameraPos;
uniform vec3 lightPos;

// ------

vec3 catColor( float _p ) {
  return 0.5 + 0.5 * vec3(
    cos( _p ),
    cos( _p + PI / 3.0 * 2.0 ),
    cos( _p + PI / 3.0 * 4.0 )
  );
}

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

void main() {
  vec3 color = vec3( 1.0 );

  float spawncurve = 1.0 - exp( -5.0 * ( 1.0 - vLife ) );
  
  float shape;
  if ( vMode < 0.2 ) {
    shape = smoothstep( 0.12, 0.08, abs( length( gl_PointCoord.xy - 0.5 ) + 0.2 - 0.55 * spawncurve ) );
  } else if ( vMode < 0.4 ) {
    vec2 coord = abs( rotate2D( PI * 0.25 ) * ( gl_PointCoord.xy - 0.5 ) );
    shape = smoothstep( -0.1, 0.1, cos( coord.y * PI * 6.0 ) - 1.1 * ( 1.0 - spawncurve ) ); 
  } else if ( vMode < 0.6 ) {
    vec2 coord = abs( rotate2D( PI * ( 0.25 + spawncurve * 0.5 ) ) * ( gl_PointCoord.xy - 0.5 ) );
    shape = smoothstep( -0.03, 0.0, 0.07 - min( coord.x, coord.y ) );
    shape *= smoothstep( -0.03, 0.0, 0.3 * spawncurve - max( coord.x, coord.y ) );
  } else if ( vMode < 0.8 ) {
    vec2 coord = rotate2D( -PI * ( 1.0 + spawncurve ) ) * ( gl_PointCoord.xy - 0.5 );
    shape = smoothstep( -0.03, 0.0, 0.2 * spawncurve - coord.y );
    coord = rotate2D( PI * 2.0 / 3.0 ) * coord;
    shape *= smoothstep( -0.03, 0.0, 0.2 * spawncurve - coord.y );
    coord = rotate2D( PI * 2.0 / 3.0 ) * coord;
    shape *= smoothstep( -0.03, 0.0, 0.2 * spawncurve - coord.y );
  } else {
    vec2 coord = abs( fract( gl_PointCoord.xy * 3.0 ) - 0.5 );
    float p = ( floor( gl_PointCoord.x * 3.0 ) + floor( gl_PointCoord.y * 3.0 ) ) / 4.0;
    float spawncurve = 1.0 - exp( -5.0 * ( 1.0 - vLife - 0.1 * p ) );
    shape = smoothstep( -0.1, 0.0, 0.3 * spawncurve - max( coord.x, coord.y ) );
  }

  float despawn = 0.07 < vLife ? 1.0 : mod( floor( vLife / PARTICLE_LIFE_SPEED * frames ), 2.0 );
  float decay = exp( -0.6 * vLen );

  gl_FragColor = vec4( color * 5.0, shape * despawn * decay );
}