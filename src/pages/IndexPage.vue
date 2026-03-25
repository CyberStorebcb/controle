.orbit-link { background: transparent; border: none; border-radius: 0; padding: 0; box-shadow: none;
display: flex; align-items: center; gap: 10px; cursor: pointer; transition: transform 0.3s ease;
opacity: 0; transform: scale(0.7); animation: orbitLinkIn 0.7s cubic-bezier(0.23, 1, 0.32, 1)
forwards; } .orbit-link__icon { width: 38px; height: 38px; border-radius: 12px; background:
linear-gradient(135deg, #1e88e5, #42a5f5); display: flex; align-items: center; justify-content:
center; color: #fff; } .orbit-link__label { font-weight: 600; color: #0b2145; letter-spacing: 0.5px;
background: transparent; padding: 0 8px; } .orbit-link:nth-of-type(1) { animation-delay: 0.1s; }
.orbit-link:nth-of-type(2) { animation-delay: 0.3s; } .orbit-link:nth-of-type(3) { animation-delay:
0.5s; } @keyframes orbitLinkIn { 0% { opacity: 0; transform: scale(0.7) translateY(40px); } 60% {
opacity: 1; transform: scale(1.08) translateY(-8px); } 100% { opacity: 1; transform: scale(1)
translateY(0); } }
<template>
  <q-page class="menu-page">
    <div class="menu-hero">
      <div class="orbit-wrapper">
        <div class="orbit-ring" aria-hidden="true" />
        <div class="orbit-glow" aria-hidden="true" />

        <div class="orbit-core" aria-label="Representação gráfica de caminhão">
          <svg viewBox="0 0 220 140" class="truck-illustration" role="img">
            <g fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <rect x="20" y="52" width="110" height="52" rx="10" fill="#f4f7ff" stroke="#0d47a1" />
              <rect x="130" y="74" width="60" height="30" rx="8" fill="#e8f1ff" stroke="#0d47a1" />
              <path d="M190 104h18" stroke="#0d47a1" />
              <circle cx="70" cy="116" r="16" fill="#0d47a1" stroke="#0d47a1" />
              <circle cx="70" cy="116" r="8" fill="#f4f7ff" stroke="#f4f7ff" />
              <circle cx="150" cy="116" r="16" fill="#0d47a1" stroke="#0d47a1" />
              <circle cx="150" cy="116" r="8" fill="#f4f7ff" stroke="#f4f7ff" />
              <polyline
                points="140,74 140,52 190,52 206,82 206,104"
                fill="#d7e8ff"
                stroke="#0d47a1"
              />
              <line x1="60" y1="52" x2="60" y2="24" stroke="#0d47a1" />
              <line x1="96" y1="52" x2="96" y2="30" stroke="#0d47a1" />
              <line x1="132" y1="52" x2="132" y2="40" stroke="#0d47a1" />
            </g>
          </svg>
          <div class="core-caption">Fluxo de entregas</div>
        </div>

        <button
          v-for="(link, index) in navLinks"
          :key="link.label"
          class="orbit-link"
          :style="customOrbitStyle(index)"
          @click="navigate(link)"
        >
          <span class="orbit-link__icon">
            <q-icon :name="link.icon" size="22px" />
          </span>
          <span class="orbit-link__label">{{ link.label }}</span>
        </button>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navLinks = [
  { label: 'MENU', icon: 'dashboard', to: { name: 'menu' } },
  { label: 'OBRAS', icon: 'engineering', to: { name: 'obras' } },
]

// Custom positions for each button (top, bottom-left, bottom-right) OUTSIDE the orbit-wrapper
const customOrbitStyle = (index) => {
  // Adjust these values to place buttons outside the blue square
  const positions = [
    { x: 0, y: -260 }, // Top (MENU)
    { x: -220, y: 170 }, // Bottom-left (OBRAS)
  ]
  const pos = positions[index] || { x: 0, y: 0 }
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
  }
}

function navigate(link) {
  router.push(link.to)
}
</script>
<style scoped lang="scss">
.menu-page {
  min-height: 100%;
  padding: 48px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #f8fbff 0%, #e8f1ff 50%, #f4f8ff 100%);
}

.menu-hero {
  width: 100%;
  max-width: 560px;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.orbit-wrapper {
  position: relative;
  width: 420px;
  height: 420px;
  margin: 0 auto;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px dashed rgba(30, 136, 229, 0.35);
  animation: orbitPulse 8s linear infinite;
}

.orbit-glow {
  position: absolute;
  inset: 30px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(66, 165, 245, 0.45), transparent 60%);
  filter: blur(8px);
}

.orbit-core {
  position: absolute;
  inset: 110px;
  border-radius: 32px;
  background: transparent;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.truck-illustration {
  width: 220px;
  height: 140px;
}

.core-caption {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #1e3a6d;
}

.orbit-link {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.orbit-link__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.orbit-link__label {
  font-weight: 600;
  color: #0b2145;
  letter-spacing: 0.5px;
  background: transparent;
  padding: 0 8px;
}

.orbit-link__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.orbit-link__label {
  font-weight: 600;
  color: #0b2145;
  letter-spacing: 0.5px;
}

@keyframes orbitPulse {
  0% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.7;
    transform: scale(0.98);
  }
}

@media (max-width: 768px) {
  .orbit-wrapper {
    width: 320px;
    height: 320px;
  }

  .orbit-core {
    inset: 80px;
  }

  .orbit-link {
    --orbit-radius: 130px;
    padding: 8px 14px;
  }
}
</style>
