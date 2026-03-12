<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="app-header text-white">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          round
          dense
          icon="menu"
          aria-label="Menu"
          class="menu-trigger"
          @click="toggleLeftDrawer"
        />

        <div class="brand-block">
          <q-avatar size="42px" class="brand-icon">
            <q-icon name="engineering" size="24px" />
          </q-avatar>
          <div class="brand-copy">
            <div class="brand-eyebrow">Controle</div>
            <q-toolbar-title class="brand-title q-pa-none"> Construção </q-toolbar-title>
            <div class="brand-subtitle">Monitoramento de envios e pendencias</div>
          </div>
        </div>

        <q-space />

        <div class="header-meta">
          <q-chip dense color="white" text-color="primary" icon="bolt" class="header-chip">
            Painel ao vivo
          </q-chip>
        </div>

        <button
          type="button"
          class="theme-toggle"
          :class="{ 'theme-toggle--dark': isDark }"
          :aria-label="isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'"
          :aria-pressed="isDark"
          @click="toggleDarkMode"
        >
          <span class="theme-toggle__icon theme-toggle__icon--sun">
            <q-icon name="wb_sunny" size="16px" />
          </span>
          <span class="theme-toggle__indicator" />
          <span class="theme-toggle__icon theme-toggle__icon--moon">
            <q-icon name="dark_mode" size="16px" />
          </span>
        </button>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :dark="isDark"
      :class="['main-drawer', { 'main-drawer--dark': isDark }]"
    >
      <q-scroll-area class="fit">
        <q-list padding class="drawer-list">
          <q-item-label header class="drawer-header">
            <span class="drawer-header__text">Navegação</span>
          </q-item-label>

          <q-item
            v-for="item in navItems"
            :key="item.label"
            clickable
            v-ripple
            :to="item.to"
            exact
            :class="['drawer-link', { 'drawer-link--active': route.name === item.to.name }]"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
              <q-item-label caption>{{ item.caption }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container @click="handleMainContentClick">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const navItems = [
  { label: 'MENU', caption: 'Resumo geral', icon: 'dashboard', to: { name: 'menu' } },
  { label: 'OBRAS', caption: 'Envios por obra', icon: 'engineering', to: { name: 'obras' } },
  { label: 'EME', caption: 'Distribuicao de equipes', icon: 'groups', to: { name: 'eme' } },
  {
    label: 'MESA DE PENDÊNCIAS',
    caption: 'Pendências em aberto',
    icon: 'pending_actions',
    to: { name: 'mesa-pendencias' },
  },
]

const leftDrawerOpen = ref(false)
const route = useRoute()
const $q = useQuasar()
const isDark = ref($q.dark.isActive)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleDarkMode() {
  isDark.value = !isDark.value
  $q.dark.set(isDark.value)
}

function handleMainContentClick() {
  if (leftDrawerOpen.value) {
    leftDrawerOpen.value = false
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: linear-gradient(115deg, #1976d2, #0a4fa3);
  box-shadow: 0 20px 50px rgba(10, 33, 69, 0.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.app-toolbar {
  min-height: 68px;
  padding: 0 24px;
  gap: 18px;
}

.menu-trigger {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.menu-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.1;
}

.brand-eyebrow {
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 4px;
  opacity: 0.85;
}

.brand-title {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1.15rem;
}

.brand-subtitle {
  font-size: 0.75rem;
  letter-spacing: 0.3px;
  opacity: 0.85;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-chip {
  border-radius: 999px;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(7, 90, 170, 0.25);
}

.theme-toggle {
  position: relative;
  width: 72px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  cursor: pointer;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.theme-toggle:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

.theme-toggle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd16a;
}

.theme-toggle__icon--moon {
  color: #d5e2ff;
}

.theme-toggle__indicator {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  top: 50%;
  left: 4px;
  transform: translateY(-50%);
  transition:
    transform 0.3s ease,
    background 0.3s ease;
  box-shadow: 0 10px 25px rgba(15, 33, 64, 0.35);
}

.theme-toggle--dark {
  background: rgba(8, 14, 28, 0.55);
  border-color: rgba(255, 255, 255, 0.2);
}

.theme-toggle--dark .theme-toggle__indicator {
  transform: translate(34px, -50%);
  background: #0a192f;
}

.main-drawer {
  background: linear-gradient(180deg, #f8fbff, #eef4ff 60%, #ffffff);
  border-right: none;
  box-shadow: 20px 0 50px rgba(10, 33, 69, 0.08);
  transition: background 0.4s ease;
}

.main-drawer--dark {
  background: linear-gradient(180deg, #0a1224, #121b32 65%, #05070f);
  box-shadow: 20px 0 50px rgba(0, 0, 0, 0.55);
}

.drawer-list {
  padding-top: 18px;
}

.drawer-header {
  padding: 12px 14px;
  font-size: 1.05rem;
  font-weight: 600;
  background: rgba(33, 150, 243, 0.15);
  border-radius: 14px;
  margin: 0 12px 12px;
  color: #0a1a2f;
  letter-spacing: 0.8px;
}

.main-drawer--dark .drawer-header {
  background: rgba(255, 255, 255, 0.08);
  color: #e1ecff;
}

.drawer-header__text {
  display: inline-block;
}

.drawer-link {
  border-radius: 16px;
  margin: 4px 12px;
  padding: 10px 12px;
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    color 0.25s ease;
  color: #26334c;
}

.drawer-link:hover {
  transform: translateX(6px);
  background: rgba(33, 150, 243, 0.12);
}

.drawer-link--active {
  background: linear-gradient(120deg, #1e88e5, #42a5f5);
  color: #fff;
  box-shadow: 0 12px 30px rgba(33, 150, 243, 0.25);
}

.drawer-link--active .q-item__label--caption {
  color: rgba(255, 255, 255, 0.78);
}

.main-drawer--dark .drawer-link {
  color: #d6def0;
}

.main-drawer--dark .drawer-link:hover {
  background: rgba(255, 255, 255, 0.08);
}

.main-drawer--dark .drawer-link--active {
  background: linear-gradient(120deg, #64b5f6, #1e88e5);
}

.q-header .q-toolbar-title {
  line-height: 1.1;
}

@media (max-width: 768px) {
  .app-toolbar {
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-meta {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
