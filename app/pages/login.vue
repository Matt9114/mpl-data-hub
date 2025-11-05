<!-- app/pages/login.vue -->
<!-- Login page with 3D animated background using Three.js. Part of the MPL Data Hub application for Jaguar Land Rover. -->

<template>
  <main
    class="login-layout bg-login-page text-login-muted font-login"
  >
    <!-- Radials (soft glow) -->
    <div class="radials" aria-hidden="true">
      <div class="radial radial-a"></div>
      <div class="radial radial-b"></div>
      <div class="radial radial-c"></div>
    </div>

    <!-- 3D pozadie -->
    <canvas ref="galaxy3d" class="galaxy-canvas" aria-hidden="true"></canvas>

    <!-- Karta -->
    <section
      @mouseenter="isCardHovered = true"
      @mouseleave="isCardHovered = false"
      class="login-card card-login"
    >
      <div class="brand">
        <div class="logo-tile">
          <img src="/logo.png" alt="JLR / MPL" class="logo-img" />
        </div>
        <div class="brand-title text-login-main">
          MPL DATA HUB
        </div>
      </div>

      <header class="header">
        <h1 class="page-title text-login-main">
          Odomknite svet dát
        </h1>
        <p class="subtitle text-login-sub">
          Vstupný bod do vášho dátového univerza
        </p>
      </header>

      <form class="form" @submit.prevent="onSubmit" :aria-busy="isPageLoading" aria-live="polite" novalidate>
        <div class="field">
          <label for="email" class="label text-login-label">Email</label>
          <input
            ref="emailEl" v-model.trim="form.email" id="email"
            type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username"
            placeholder="@jaguarlandrover.com"
            :aria-invalid="invalidEmail ? 'true' : 'false'"
            :aria-describedby="invalidEmail ? 'email-err' : undefined"
            class="input-login"
          />
          <p v-if="invalidEmail" id="email-err" class="error-text text-login-error">
            Zadajte platnú emailovú adresu.
          </p>
        </div>

        <div class="field">
          <label for="password" class="label text-login-label">Heslo</label>
          <div class="password-wrap">
            <input
              ref="passwordEl" v-model="form.password" :type="showPwd ? 'text' : 'password'" id="password"
              autocomplete="current-password" placeholder="••••••••"
              :aria-invalid="invalidPassword ? 'true' : 'false'"
              class="input-login input-has-icon"
            />
            <button
              type="button"
              class="btn-icon eye-toggle"
              @click="showPwd = !showPwd"
              :aria-pressed="showPwd ? 'true' : 'false'"
              :aria-label="showPwd ? 'Skryť heslo' : 'Zobraziť heslo'"
              :title="showPwd ? 'Skryť heslo' : 'Zobraziť heslo'"
            >
              <!-- Jedno SVG, dve vrstvy, prepínané cez v-show -->
              <svg class="icon eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <!-- EYE (showPwd = false) -->
                <g class="eye eye--on" v-show="!showPwd">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/>
                  <circle cx="12" cy="12" r="3.2"/>
                </g>
              
                <!-- EYE OFF (showPwd = true) -->
                <g class="eye eye--off" v-show="showPwd">
                  <!-- základ oka -->
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/>
                  <circle cx="12" cy="12" r="3.2"/>
                  <!-- škrtnutie -->
                  <path class="eye-slash" d="M3 3l18 18"/>
                </g>
              </svg>
            </button>
          </div>
          <p v-if="invalidPassword" class="error-text text-login-error">
            Zadajte vaše heslo.
          </p>
        </div>

        <!-- Submit -->
        <div class="actions">
          <button
            type="submit"
            :disabled="!canSubmit || isPageLoading"
            class="btn btn-primary btn-lg fixed-size"
          >
            <span v-if="!isPageLoading">Prihlásiť sa</span>
            <span v-else class="spinner spinner-lg"></span>
          </button>
        </div>

        <div class="help">
          <NuxtLink
            ref="forgotLinkEl"
            to="/forgot-password"
            @click.prevent="openForgotConfirm"
            class="link-muted link-grad-underline"
          >
            Zabudli ste heslo?
          </NuxtLink>
        </div>
      </form>
    </section>

    <!-- Globálny footer -->
    <footer class="login-footer">
      <p class="footer-text text-login-sub">
        © 2025 Jaguar Land Rover. Všetky práva vyhradené.
      </p>
    </footer>

    <!-- Forgot modal -->
    <transition name="fade">
      <div v-if="showForgotConfirm" class="modal-root">
        <div class="modal-backdrop" @click="closeForgotConfirm" aria-hidden="true"></div>
        <div class="modal-center">
          <div
            role="alertdialog" aria-modal="true"
            aria-labelledby="fp-title" aria-describedby="fp-desc"
            class="modal-card"
          >
            <div class="modal-body">
              <h2 id="fp-title" class="modal-title text-login-main">Zabudli ste heslo?</h2>
              <p id="fp-desc" class="modal-desc text-login-main">
                Naozaj chcete pokračovať na obnovu hesla?
              </p>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary btn-sm" @click="closeForgotConfirm">Nie, späť</button>
                <button ref="confirmBtnEl" type="button" class="btn btn-primary btn-sm text-white" :disabled="forgotBusy" @click="proceedForgot">
                  <span v-if="!forgotBusy">Áno, pokračovať</span>
                  <span v-else class="spinner spinner-sm"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from '#app'
import * as THREE from 'three'
// ⬇️ nahrádza pôvodné `useToast`
import { useNotify } from '~/shared/composables/useNotify'

import { useAuthStore } from '~/shared/stores/authStore'
import type { User } from '~/types/user'

definePageMeta({ layout: 'login' })

const authStore = useAuthStore()
const router = useRouter()
const { success, warning, notifyError } = useNotify()
const isPageLoading = useIsPageLoading?.() ?? ref(false)

/* ===== Form ===== */
const form = reactive({ email: '', password: '' })
const submitted = ref(false)
const showPwd = ref(false)
const emailEl = ref<HTMLInputElement | null>(null)
const passwordEl = ref<HTMLInputElement | null>(null)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const invalidEmail = computed(() => submitted.value && !emailRe.test(form.email))
const invalidPassword = computed(() => submitted.value && form.password.length === 0)
const canSubmit = computed(() => form.email.length > 3 && form.password.length > 0)

async function onSubmit() {
  submitted.value = true
  if (!emailRe.test(form.email)) { await nextTick(); emailEl.value?.focus(); return }
  if (!form.password) { await nextTick(); passwordEl.value?.focus(); return }

  isPageLoading.value = true
  try {
    const userData = await $fetch<User>('/api/login', {
      method: 'POST',
      body: { email: form.email, password: form.password }
    })
    authStore.login(userData)
    success('Prihlásenie bolo úspešné! Vitajte späť.')
    await router.push('/profil')
  } catch (err) {
    notifyError(err, 'Nesprávne prihlasovacie údaje alebo dočasný problém. Skúste znova.')
  } finally {
    isPageLoading.value = false
  }
}

/* ===== Hover flag ===== */
const isCardHovered = ref(false)

/* ===== 3D Data Network (Three.js) ===== */
const galaxy3d = ref<HTMLCanvasElement | null>(null)
let gRenderer!: THREE.WebGLRenderer
let gScene!: THREE.Scene
let gCamera!: THREE.PerspectiveCamera
let gRoot!: THREE.Group
let gNodes!: THREE.Points
let gEdges!: THREE.LineSegments
let gPackets!: THREE.Points
let gRaf: number | null = null
let reduced = false

const NODE_COUNT = 550
const SPACE = 900
const NEIGHBORS = 4
const PULSE_SPEED = 1.4
const PACKET_COUNT = 150

// 🎨 paleta z CSS premenných (fallbacky)
let COLOR_OK   = new THREE.Color('#ffffff')
let COLOR_WARN = new THREE.Color('#ffffff')
let COLOR_ERR  = new THREE.Color('#ffffff')
let COLOR_EDGE_A = new THREE.Color('#ffffff')
let COLOR_EDGE_B = new THREE.Color('#ffffff')
let COLOR_PACKET = new THREE.Color('#ffffff')

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}
function initPaletteFromCSS() {
  COLOR_OK.set(cssVar('--color-ok', '#22c55e'))
  COLOR_WARN.set(cssVar('--color-warn', '#f59e0b'))
  COLOR_ERR.set(cssVar('--color-err', '#ef4444'))
  COLOR_EDGE_A.set(cssVar('--color-edge-a', '#14b8a6'))
  COLOR_EDGE_B.set(cssVar('--color-edge-b', '#6366f1'))
  COLOR_PACKET.set(cssVar('--color-packet', '#ffffff'))
}

type Status = 'ok' | 'warn' | 'err'
type NodeInfo = { pos: THREE.Vector3; status: Status; phase: number }
const graph: NodeInfo[] = []

type PacketInfo = { edgeIndex: number, progress: number, speed: number }
const packets: PacketInfo[] = []

let nodePos!: Float32Array
let nodeCol!: Float32Array
let edgePos!: Float32Array
let edgeCol!: Float32Array
let edgePairs: Array<[number, number]> = []

function randStatus(): Status {
  const r = Math.random()
  if (r < 0.74) return 'ok'
  if (r < 0.93) return 'warn'
  return 'err'
}

function seedNodes3D() {
  graph.length = 0
  for (let i = 0; i < NODE_COUNT; i++) {
    graph.push({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * SPACE,
        (Math.random() - 0.5) * SPACE * 0.6,
        (Math.random() - 0.5) * SPACE
      ),
      status: randStatus(),
      phase: Math.random() * Math.PI * 2
    })
  }
}

function buildEdges3D() {
  const pairs = new Set<string>()
  edgePairs = []
  for (let i = 0; i < NODE_COUNT; i++) {
    const distances: Array<{ j: number; d: number }> = []
    const pi = graph[i]!.pos
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue
      const d = pi.distanceToSquared(graph[j]!.pos)
      distances.push({ j, d })
    }
    distances.sort((a, b) => a.d - b.d)
    for (let k = 0; k < NEIGHBORS; k++) {
      const j = distances[k]!.j
      const a = Math.min(i, j)
      const b = Math.max(i, j)
      const key = `${a}-${b}`
      if (!pairs.has(key)) {
        pairs.add(key)
        edgePairs.push([a, b] as const)
      }
    }
  }
}

function seedPackets() {
  packets.length = 0
  for (let i = 0; i < PACKET_COUNT; i++) {
    packets.push({
      edgeIndex: Math.floor(Math.random() * edgePairs.length),
      progress: Math.random(),
      speed: 0.15 + Math.random() * 0.2
    })
  }
}

function buildGalaxy3D() {
  if (!gScene) return
  gRoot = new THREE.Group()
  gScene.add(gRoot)

  nodePos = new Float32Array(NODE_COUNT * 3)
  nodeCol = new Float32Array(NODE_COUNT * 3)
  for (let i = 0; i < NODE_COUNT; i++) {
    const gi = graph[i]!, p = gi.pos
    nodePos[i*3+0]=p.x; nodePos[i*3+1]=p.y; nodePos[i*3+2]=p.z
    const base = gi.status==='ok'?COLOR_OK:gi.status==='warn'?COLOR_WARN:COLOR_ERR
    nodeCol[i*3+0]=base.r; nodeCol[i*3+1]=base.g; nodeCol[i*3+2]=base.b
  }
  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3))
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeCol, 3))
  const nodeMat = new THREE.PointsMaterial({
    size: 3.8, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false
  })
  gNodes = new THREE.Points(nodeGeo, nodeMat)
  gRoot.add(gNodes)

  edgePos = new Float32Array(edgePairs.length * 2 * 3)
  edgeCol = new Float32Array(edgePairs.length * 2 * 3)
  for (let i = 0; i < edgePairs.length; i++) {
    const [a,b]=edgePairs[i]!, pa=graph[a]!.pos, pb=graph[b]!.pos
    edgePos[i*6+0]=pa.x; edgePos[i*6+1]=pa.y; edgePos[i*6+2]=pa.z
    edgePos[i*6+3]=pb.x; edgePos[i*6+4]=pb.y; edgePos[i*6+5]=pb.z
    const c1=COLOR_EDGE_A, c2=COLOR_EDGE_B
    edgeCol[i*6+0]=c1.r; edgeCol[i*6+1]=c1.g; edgeCol[i*6+2]=c1.b
    edgeCol[i*6+3]=c2.r; edgeCol[i*6+4]=c2.g; edgeCol[i*6+5]=c2.b
  }
  const edgeGeo = new THREE.BufferGeometry()
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3))
  edgeGeo.setAttribute('color', new THREE.BufferAttribute(edgeCol, 3))
  const edgeMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false
  })
  gEdges = new THREE.LineSegments(edgeGeo, edgeMat)
  gRoot.add(gEdges)

  const packetPos = new Float32Array(PACKET_COUNT * 3)
  const packetGeo = new THREE.BufferGeometry()
  packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3))
  const packetMat = new THREE.PointsMaterial({
    size: 4.5, sizeAttenuation: true, color: COLOR_PACKET,
    transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false
  })
  gPackets = new THREE.Points(packetGeo, packetMat)
  gRoot.add(gPackets)
}

function initThree() {
  if (!galaxy3d.value) return
  initPaletteFromCSS()

  gScene = new THREE.Scene()
  gCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 6000)
  gCamera.position.set(0, 0, 1.25 * SPACE)
  gRenderer = new THREE.WebGLRenderer({ canvas: galaxy3d.value, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' })
  gRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  gRenderer.setSize(window.innerWidth, window.innerHeight, false)
  ;(gRenderer as any).outputColorSpace = THREE.SRGBColorSpace

  seedNodes3D()
  buildEdges3D()
  seedPackets()
  buildGalaxy3D()
}

function resizeThree() {
  if (!gRenderer || !gCamera) return
  gCamera.aspect = window.innerWidth / window.innerHeight
  gCamera.updateProjectionMatrix()
  gRenderer.setSize(window.innerWidth, window.innerHeight, false)
}

let gMx = 0, gMy = 0
function onMouseMove3D(e: MouseEvent) {
  gMx = (e.clientX / window.innerWidth - 0.5) * 2
  gMy = (e.clientY / window.innerHeight - 0.5) * 2
}

let gLast = 0
const _tmpVec = new THREE.Vector3()

function animateThree(now: number) {
  if (!gRenderer || !gScene || !gCamera || !gRoot || !gNodes || !gEdges || !gPackets) {
    gRaf = requestAnimationFrame(animateThree); return
  }

  const dt = gLast ? (now - gLast) / 1000 : 0
  gLast = now
  const t = now / 1000

  // pulz uzlov
  const colAttr = (gNodes.geometry as THREE.BufferGeometry).getAttribute('color') as THREE.BufferAttribute
  for (let i = 0; i < NODE_COUNT; i++) {
    const gi = graph[i]!
    const base = gi.status==='ok'?COLOR_OK:gi.status==='warn'?COLOR_WARN:COLOR_ERR
    const speed = gi.status==='err' ? PULSE_SPEED * 1.5 : PULSE_SPEED
    const amp   = gi.status==='err' ? 0.55 : gi.status==='warn' ? 0.45 : 0.35
    const min   = 0.55
    const pulse = min + amp * (0.5 + 0.5 * Math.sin(t * speed + gi.phase))
    colAttr.setXYZ(i, base.r * pulse, base.g * pulse, base.b * pulse)
  }
  colAttr.needsUpdate = true

  // farebný drift hrán
  const eColAttr = (gEdges.geometry as THREE.BufferGeometry).getAttribute('color') as THREE.BufferAttribute
  const len = eColAttr.count
  for (let v = 0; v < len; v++) {
    const phase = (v % 97) * 0.07, mix = 0.5 + 0.5 * Math.sin(t * 0.8 + phase)
    const r = COLOR_EDGE_A.r * (1 - mix) + COLOR_EDGE_B.r * mix
    const g = COLOR_EDGE_A.g * (1 - mix) + COLOR_EDGE_B.g * mix
    const b = COLOR_EDGE_A.b * (1 - mix) + COLOR_EDGE_B.b * mix
    eColAttr.setXYZ(v, r * 0.95, g * 0.95, b * 0.95)
  }
  eColAttr.needsUpdate = true

  // pakety
  const packetPosAttr = (gPackets.geometry as THREE.BufferGeometry).getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < PACKET_COUNT; i++) {
    const packet = packets[i]!
    packet.progress += dt * packet.speed
    if (packet.progress >= 1) {
      packet.progress = 0; packet.edgeIndex = Math.floor(Math.random() * edgePairs.length)
    }
    const [a, b] = edgePairs[packet.edgeIndex]!
    const p1 = graph[a]!.pos, p2 = graph[b]!.pos
    const currentPos = _tmpVec.lerpVectors(p1, p2, packet.progress)
    packetPosAttr.setXYZ(i, currentPos.x, currentPos.y, currentPos.z)
  }
  packetPosAttr.needsUpdate = true

  // rotácia + drift
  const rotationSpeed = isCardHovered.value ? 0.02 : 0.06
  gRoot.rotation.y += dt * rotationSpeed
  gRoot.rotation.x = Math.sin(t * 0.15) * 0.09
  gRoot.rotation.z = Math.cos(t * 0.12) * 0.09

  // parallax + zoom
  const targetX = gMx * 30, targetY = -gMy * 22
  gCamera.position.x += (targetX - gCamera.position.x) * 0.05
  gCamera.position.y += (targetY - gCamera.position.y) * 0.05
  const targetZ = isCardHovered.value ? (1.1 * SPACE) : (1.25 * SPACE)
  gCamera.position.z += (targetZ - gCamera.position.z) * 0.02
  gCamera.lookAt(0, 0, 0)

  gRenderer.render(gScene, gCamera)
  gRaf = requestAnimationFrame(animateThree)
}

/* ===== Lifecycle ===== */
let onVis: (() => void) | null = null

onMounted(() => {
  reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
  if (reduced) return

  initThree()
  resizeThree()
  window.addEventListener('resize', resizeThree, { passive: true })
  window.addEventListener('mousemove', onMouseMove3D, { passive: true })
  gRaf = requestAnimationFrame(animateThree)

  // ✅ šetrenie batérie: pauza pri skrytej karte
  onVis = () => {
    if (document.hidden) {
      if (gRaf) cancelAnimationFrame(gRaf)
      gRaf = null
    } else {
      if (!gRaf) gRaf = requestAnimationFrame(animateThree)
    }
  }
  document.addEventListener('visibilitychange', onVis)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeThree)
  window.removeEventListener('mousemove', onMouseMove3D)
  if (onVis) document.removeEventListener('visibilitychange', onVis)
  if (gRaf) cancelAnimationFrame(gRaf)

  gNodes?.geometry?.dispose?.()
  gEdges?.geometry?.dispose?.()
  gPackets?.geometry?.dispose?.()
  ;(gNodes?.material as any)?.dispose?.()
  ;(gEdges?.material as any)?.dispose?.()
  ;(gPackets?.material as any)?.dispose?.()
  gRenderer?.dispose?.()
})

/* ===== Forgot Password ===== */
const showForgotConfirm = ref(false)
const forgotLinkEl = ref<HTMLAnchorElement | null>(null)
const confirmBtnEl = ref<HTMLButtonElement | null>(null)
const forgotBusy = ref(false)

function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') closeForgotConfirm() }
function openForgotConfirm() {
  showForgotConfirm.value = true
  window.addEventListener('keydown', onEsc)
  nextTick(() => confirmBtnEl.value?.focus())
}
function closeForgotConfirm() {
  showForgotConfirm.value = false
  window.removeEventListener('keydown', onEsc)
  nextTick(() => forgotLinkEl.value?.focus())
}
async function proceedForgot() {
  if (!emailRe.test(form.email)) {
    warning('Zadajte platný email, aby sme vedeli kam poslať nové heslo.')
    closeForgotConfirm(); submitted.value = true; await nextTick(); emailEl.value?.focus(); return
  }
  try {
    forgotBusy.value = true
    await $fetch('/api/forgot-password', { method: 'POST', body: { email: form.email } })
    closeForgotConfirm(); form.password = ''; showPwd.value = false
    success('Ak účet existuje, odošleme inštrukcie na reset hesla.')
  } catch {
    success('Ak účet existuje, odošleme inštrukcie na reset hesla.')
  } finally {
    forgotBusy.value = false
  }
}
</script>

<style scoped>
/* ===== Layout ===== */
.login-layout {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100svh;
  overflow: hidden;
  /* text color inherited from .text-login-muted if defined globally */
}

/* ===== Radials ===== */
.radials {
  pointer-events: none;
  position: fixed; inset: 0;
  z-index: 0;
}
.radial {
  position: absolute;
  filter: blur(24px);
  opacity: 0.55;
}
.radial-a {
  top: -10%; left: -10%;
  width: 60vmin; height: 60vmin;
  background: radial-gradient(closest-side, var(--radial-a, rgba(20,184,166,.45)), transparent 70%);
}
.radial-b {
  right: -15%; top: 25%;
  width: 70vmin; height: 70vmin;
  background: radial-gradient(closest-side, var(--radial-b, rgba(99,102,241,.35)), transparent 70%);
}
.radial-c {
  left: 10%; bottom: -15%;
  width: 80vmin; height: 80vmin;
  background: radial-gradient(closest-side, var(--radial-c, rgba(34,197,94,.28)), transparent 75%);
}

/* ===== Canvas ===== */
.galaxy-canvas {
  pointer-events: none;
  position: fixed; inset: 0;
  z-index: 0;
}

/* ===== Card ===== */
.login-card {
  position: relative;
  z-index: 10;
  width: 92%;
  max-width: 32rem; /* ~max-w-lg */
  border-radius: 1.5rem; /* rounded-3xl */
  padding: 20px; /* p-5 */
  backdrop-filter: blur(12px); /* backdrop-blur-md */
  transition: transform .3s ease, box-shadow .3s ease, background-color .3s ease, border-color .3s ease, opacity .3s ease;
  background: var(--color-card-bg, rgba(12, 18, 34, 0.55));
  border: 1px solid var(--color-card-border, rgba(255,255,255,.08));
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
}
@media (min-width: 640px) {
  .login-card { padding: 32px; } /* sm:p-8 */
}

/* ===== Brand header ===== */
.brand {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.logo-tile {
  display: grid; place-items: center;
  width: 3.5rem; height: 3.5rem; /* h-14 w-14 */
  border-radius: .75rem;
  padding: .375rem;
  background: var(--logo-tile-bg, rgba(255,255,255,.05));
  border: 1px solid var(--logo-tile-border, rgba(255,255,255,.08));
}
.logo-img {
  width: 100%; height: 100%; object-fit: contain;
  filter: drop-shadow(0 0 0.5px rgba(0,0,0,.35));
}
.brand-title {
  letter-spacing: .04em; /* tracking-wide */
  color: var(--color-login-main, #e7e9ee);
  font-size: var(--text-xl, 1.25rem);
  font-weight: 600;
}

/* ===== Hero header ===== */
.header { margin-bottom: 24px; text-align: center; }
.page-title {
  letter-spacing: -0.01em; /* tracking-tight-ish */
  font-size: var(--text-xl, 1.25rem);
  font-weight: 600;
}
.subtitle {
  margin-top: 6px;
  font-size: var(--text-sm, .875rem);
}

/* ===== Form ===== */
.form > * + * { margin-top: 20px; } /* space-y-5 */
.field .label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-sm, .875rem);
  font-weight: 500;
}
.input-login {
  display: block;
  width: 100%;
  border-radius: .75rem;
  padding: 10px 14px;

  /* výrazne tmavšie pozadie a slabší okraj */
  background: var(--input-bg, rgba(9,14,24,.42));
  color: var(--input-fg, #e7e9ee);
  caret-color: #e7e9ee;

  transition:
    background-color .22s ease,
    box-shadow .22s ease,
    transform .22s ease;
}
.input-login::placeholder {
  /* tmavší placeholder, nech „nekričí“ */
  color: rgba(231,233,238,.38);
}
.input-login:focus {
  /* žiadny prepal – decentný ring a stále tmavé pozadie */
  background: var(--input-bg-focus, rgba(9,14,24,.50));
  box-shadow: none;
  outline: none;
  transform: translateY(-1px);
}

/* voliteľné: ak je invalid, nech je to tiež jemné */
.input-login[aria-invalid="true"] {
  background: rgba(9,14,24,.50);
  box-shadow: 0 0 0 3px color-mix(in srgb, #ef4444 18%, transparent);
}

.input-login:hover {
  /* len jemný posun, stále tmavé */
  background: var(--input-bg-hover, rgba(9,14,24,.46));
}

.password-wrap { position: relative; }
.input-has-icon { padding-right: 3rem; }
.btn-icon {
  position: absolute; right: .375rem; top: 50%; transform: translateY(-50%);
  width: 2.25rem; height: 2.25rem;
  display: inline-grid; place-items: center;
  border: 0; border-radius: .5rem;
  background: transparent; color: var(--icon-fg, #cbd2e0);
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease, transform .1s ease;
}
.btn-icon:hover { background: rgba(255,255,255,.06); color: var(--icon-fg-hover, #e7e9ee); }
.btn-icon:active { transform: translateY(-50%) scale(.98); }
.icon { width: 20px; height: 20px; }

.error-text { margin-top: 6px; font-size: var(--text-xs, .75rem); }

/* ===== Actions ===== */
.actions { display: flex; justify-content: center; }
.fixed-size { width: 220px; height: 50px; margin-top: 8px; }

/* ===== Buttons ===== */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: .5rem;
  border-radius: .75rem;
  padding: .625rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform .06s ease, box-shadow .2s ease, background-color .2s ease, border-color .2s ease, color .2s ease, opacity .2s ease;
  user-select: none;
}
.btn:disabled { opacity: .6; cursor: not-allowed; }
.btn:active { transform: translateY(1px); }

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #14b8a6);
  color: #fff;
  transition: transform .25s ease, box-shadow .25s ease, filter .25s ease, background-position .25s ease;
  background-size: 200% 200%;
  background-position: 0% 50%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px color-mix(in srgb, #6366f1 30%, transparent);
  background-position: 100% 50%;
}

.btn-primary:focus-visible { outline: 2px solid color-mix(in srgb, #6366f1 55%, transparent); outline-offset: 2px; }

.btn-secondary {
  background: var(--btn-secondary-bg, rgba(255,255,255,.06));
  color: var(--btn-secondary-fg, #e7e9ee);
}
.btn-secondary:hover { background: rgba(255,255,255,.08); }

.btn-lg { padding: .875rem 1.25rem; font-size: 1.125rem; }
.btn-sm { padding: .5rem .8rem; font-size: .875rem; border-radius: .6rem; }

/* ===== Spinner ===== */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  display: inline-block;
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, #ffffff 30%, transparent);
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}
.spinner-lg { width: 24px; height: 24px; }
.spinner-sm { width: 16px; height: 16px; }

/* ===== Link ===== */
.help { margin-top: 24px; text-align: center; }
.link-muted {
  position: relative;
  display: inline-flex; align-items: center;
  font-weight: 500; font-size: .9rem;
  color: var(--link-muted, #98a2b3);
  text-decoration: none;
  transition: color .2s ease;
}
.link-muted:hover { color: var(--link-hover, #e7e9ee); }
.link-grad-underline::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
  opacity: .0; transform: scaleX(.75); transform-origin: center;
  transition: opacity .2s ease, transform .2s ease;
}
.link-grad-underline:hover::after { opacity: .8; transform: scaleX(1); }

/* ===== Footer ===== */
.login-footer {
  position: absolute; inset-inline: 0; bottom: 12px;
  z-index: 20; text-align: center;
}
.footer-text { font-size: var(--text-base, 1rem); }

/* ===== Modal ===== */
.modal-root { position: fixed; inset: 0; z-index: 50; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(2,6,23,.7); }
.modal-center {
  position: absolute; inset: 0;
  display: grid; place-items: center; padding: 16px;
}
.modal-card {
  width: 100%; max-width: 28rem;
  border-radius: 1rem;
  background: var(--color-card-bg, rgba(12, 18, 34, 0.8));
  border: 1px solid var(--color-card-border, rgba(255,255,255,.12));
  box-shadow: 0 10px 40px rgba(0,0,0,.45);
}
.modal-body { padding: 20px; }
.modal-title { font-weight: 600; font-size: var(--text-base, 1rem); }
.modal-desc { margin-top: 6px; font-size: var(--text-sm, .875rem); }
.modal-actions { margin-top: 20px; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }

/* ===== Transition ===== */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ===== Color helper classes (fallbacks if not globally defined) ===== */
.text-login-muted { color: var(--color-login-muted, #a5afc4); }
.text-login-main { color: var(--color-login-main, #e7e9ee); }
.text-login-sub  { color: var(--color-login-sub,  #9aa6bd); }
.text-login-label{ color: var(--color-login-label,#cbd2e0); }
.text-login-error{ color: var(--color-login-error,#ef4444); }

/* jemné vylepšenia ikony */
.eye-icon { width: 22px; height: 22px; }

/* hladký cross-fade medzi stavmi */
.eye { transition: opacity .18s ease, transform .18s ease; }
.eye--on[style*="display: none"] { opacity: 0; }
.eye--off[style*="display: none"] { opacity: 0; }

/* keď je heslo zobrazené, nech sa škrtnutie trošku „priplaví“ */
.eye--off { opacity: 1; }
.eye--off .eye-slash {
  transform-origin: 12px 12px;
  transition: transform .22s ease, opacity .18s ease;
}

/* hover/focus: jemné zvýraznenie a animácia škrtnutia */
.eye-toggle:hover .eye-icon,
.eye-toggle:focus-visible .eye-icon { filter: drop-shadow(0 0 2px color-mix(in srgb, currentColor 30%, transparent)); }

.eye-toggle:focus-visible .eye--off .eye-slash {
  transform: rotate(-6deg);
}

/* reduced motion rešpekt */
@media (prefers-reduced-motion: reduce) {
  .eye, .eye--off .eye-slash,
  .eye-toggle:hover .eye--off .eye-slash,
  .eye-toggle:focus-visible .eye--off .eye-slash {
    transition: none;
  }
}



</style>
