<template>
  <div class="site-backdrop" aria-hidden="true">
    <canvas ref="canvas" :class="{ ready }"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement>()
const ready = ref(false)
let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let buffer: WebGLBuffer | null = null
let frame = 0

const vertexSource = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`
const fragmentSource = `
precision highp float;
uniform vec2 resolution;

float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y) / resolution;
  float edge = 0.96 - 0.10 * sin(uv.y * 4.0 - 0.8);
  float rightWash = smoothstep(edge - 0.28, edge + 0.12, uv.x)
             * smoothstep(0.0, 0.32, uv.y);
  float cornerDistance = length((uv - vec2(0.0, 0.05)) / vec2(0.38, 0.39));
  float leftWash = (1.0 - smoothstep(0.0, 1.0, cornerDistance)) * 0.85;
  float wash = max(leftWash, rightWash);
  vec3 brandOrange = vec3(252.0, 179.0, 52.0) / 255.0;
  float tintStrength = mix(0.21, 0.09, smoothstep(0.28, 0.86, uv.y));
  vec3 tint = mix(vec3(1.0), brandOrange, tintStrength);
  float grain = (random(gl_FragCoord.xy) - 0.5) * 0.065;
  vec3 color = mix(vec3(1.0), tint + grain, wash);

  gl_FragColor = vec4(color, 1.0);
}
`

function compileShader(type: number, source: string) {
  if (!gl) return null
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initialize() {
  if (!canvas.value) return
  gl = canvas.value.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
  if (!gl) return
  const vertex = compileShader(gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource)
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex)
    if (fragment) gl.deleteShader(fragment)
    return
  }
  const linked = gl.createProgram()
  if (!linked) { gl.deleteShader(vertex); gl.deleteShader(fragment); return }
  gl.attachShader(linked, vertex)
  gl.attachShader(linked, fragment)
  gl.linkProgram(linked)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) { gl.deleteProgram(linked); return }
  buffer = gl.createBuffer()
  if (!buffer) { gl.deleteProgram(linked); return }
  program = linked
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
}

function draw() {
  frame = 0
  const target = canvas.value
  if (!target || !gl || !program || gl.isContextLost()) return
  const width = target.clientWidth
  const height = target.clientHeight
  if (!width || !height) return
  const scale = Math.min(1, Math.sqrt(2_000_000 / (width * height)))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))
  if (target.width !== w || target.height !== h) { target.width = w; target.height = h }
  gl.viewport(0, 0, w, h)
  gl.useProgram(program)
  gl.uniform2f(gl.getUniformLocation(program, 'resolution'), w, h)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  ready.value = true
}

function scheduleDraw() {
  if (!frame) frame = requestAnimationFrame(draw)
}
function onContextLost(event: Event) { event.preventDefault(); ready.value = false }
function onContextRestored() { initialize(); draw() }

onMounted(() => {
  initialize()
  draw()
  canvas.value?.addEventListener('webglcontextlost', onContextLost)
  canvas.value?.addEventListener('webglcontextrestored', onContextRestored)
  window.addEventListener('resize', scheduleDraw, { passive: true })
  window.visualViewport?.addEventListener('resize', scheduleDraw, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('resize', scheduleDraw)
  window.visualViewport?.removeEventListener('resize', scheduleDraw)
  canvas.value?.removeEventListener('webglcontextlost', onContextLost)
  canvas.value?.removeEventListener('webglcontextrestored', onContextRestored)
  if (gl && !gl.isContextLost()) {
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
  }
})
</script>

<style scoped>
.site-backdrop {
  position: absolute;
  top: 0;
  inset-inline: calc(-1 * var(--page-gutter));
  height: 100vh;
  height: 100svh;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 38% 39% at 0% 5%, rgb(252 179 52 / 18%), transparent),
    radial-gradient(ellipse 40% 54% at 106% 45%, rgb(252 179 52 / 15%), transparent),
    #fdfdfd;
  mask-image: linear-gradient(#000 45%, transparent 100%);
}
.site-backdrop canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.site-backdrop canvas.ready { opacity: 1; }
@media (forced-colors: active) { .site-backdrop { display: none; } }
</style>
