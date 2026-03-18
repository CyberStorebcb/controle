<template>
  <q-page class="croqui-page">
    <div class="drawing-toolbar">
      <button
        type="button"
        :class="[
          'drawing-toolbar__button',
          { 'drawing-toolbar__button--active': activeDrawTool === 'pen' },
        ]"
        @click="setDrawTool('pen')"
      >
        ✎ Lápis
      </button>
      <button
        type="button"
        :class="[
          'drawing-toolbar__button',
          { 'drawing-toolbar__button--active': activeDrawTool === 'eraser' },
        ]"
        @click="setDrawTool('eraser')"
      >
        ␡ Borracha
      </button>
    </div>
    <div class="sheet-stage" ref="sheetStageRef">
      <div class="selection-toolbar selection-toolbar--fixed">
        <div class="selection-toolbar__title">
          {{ selectedElementCount }} selecionado{{ selectedElementCount > 1 ? 's' : '' }}
        </div>
        <div class="selection-toolbar__actions">
          <button type="button" @click="alignSelection('left')" title="Alinhar à esquerda">
            ⟸
          </button>
          <button type="button" @click="alignSelection('center')" title="Centralizar">⇔</button>
          <button type="button" @click="alignSelection('right')" title="Alinhar à direita">
            ⟹
          </button>
          <span class="selection-toolbar__divider"></span>
          <button type="button" @click="alignSelection('top')" title="Alinhar ao topo">⟰</button>
          <button type="button" @click="alignSelection('middle')" title="Centralizar vertical">
            ⇕
          </button>
          <button type="button" @click="alignSelection('bottom')" title="Alinhar à base">⟱</button>
          <span class="selection-toolbar__divider"></span>
          <button
            type="button"
            @click="copySelectedElements"
            title="Copiar"
            :disabled="selectedElementCount === 0"
          >
            ⧉
          </button>
          <button
            type="button"
            @click="pasteClipboardElements"
            title="Colar"
            :disabled="!clipboardHasContent"
          >
            ⧥
          </button>
          <button type="button" @click="duplicateSelectedElements" title="Duplicar">✚</button>
          <button type="button" @click="selectAllElements" title="Selecionar tudo">∑</button>
          <button type="button" @click="clearSelection" title="Limpar seleção">✕</button>
        </div>
      </div>
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="contextMenuStyle"
        ref="contextMenuRef"
        @contextmenu.prevent
        @pointerdown.stop
      >
        <div class="context-menu__section">
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('edit')"
            :disabled="!canInlineEditSelection"
          >
            Editar texto
          </button>
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('duplicate')"
            :disabled="selectedElementCount === 0"
          >
            Duplicar
          </button>
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('delete')"
            :disabled="selectedElementCount === 0"
          >
            Excluir
          </button>
        </div>
        <div class="context-menu__section">
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('copy')"
            :disabled="selectedElementCount === 0"
          >
            Copiar
          </button>
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('paste')"
            :disabled="!clipboardHasContent"
          >
            Colar aqui
          </button>
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('selectAll')"
          >
            Selecionar tudo
          </button>
        </div>
        <div class="context-menu__section">
          <div class="context-menu__label">Alinhamento</div>
          <div class="context-menu__inline-group">
            <button
              type="button"
              @click="handleContextAlign('left')"
              :disabled="!canAlignSelection"
            >
              ⟸
            </button>
            <button
              type="button"
              @click="handleContextAlign('center')"
              :disabled="!canAlignSelection"
            >
              ⇔
            </button>
            <button
              type="button"
              @click="handleContextAlign('right')"
              :disabled="!canAlignSelection"
            >
              ⟹
            </button>
            <button type="button" @click="handleContextAlign('top')" :disabled="!canAlignSelection">
              ⟰
            </button>
            <button
              type="button"
              @click="handleContextAlign('middle')"
              :disabled="!canAlignSelection"
            >
              ⇕
            </button>
            <button
              type="button"
              @click="handleContextAlign('bottom')"
              :disabled="!canAlignSelection"
            >
              ⟱
            </button>
          </div>
        </div>
        <div
          v-if="showConnectorContextOptions"
          class="context-menu__section context-menu__section--connector"
        >
          <div class="context-menu__label">Conexões da linha</div>
          <div class="context-menu__connector-row">
            <button
              type="button"
              class="context-menu__button"
              @click="beginConnectionBinding('start')"
            >
              Definir início
            </button>
            <button
              type="button"
              class="context-menu__button"
              @click="clearConnectorEndpoint('start')"
              :disabled="!connectorHasEndpoint('start')"
            >
              Limpar início
            </button>
          </div>
          <div class="context-menu__connector-row">
            <button
              type="button"
              class="context-menu__button"
              @click="beginConnectionBinding('end')"
            >
              Definir fim
            </button>
            <button
              type="button"
              class="context-menu__button"
              @click="clearConnectorEndpoint('end')"
              :disabled="!connectorHasEndpoint('end')"
            >
              Limpar fim
            </button>
          </div>
        </div>
        <div class="context-menu__section">
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('bringFront')"
            :disabled="selectedElementCount === 0"
          >
            Trazer para frente
          </button>
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('sendBack')"
            :disabled="selectedElementCount === 0"
          >
            Enviar para trás
          </button>
          <button
            type="button"
            class="context-menu__button"
            @click="handleContextAction('clearSelection')"
            :disabled="selectedElementCount === 0"
          >
            Limpar seleção
          </button>
          <div class="context-menu__section context-menu__section--colors">
            <div class="context-menu__label">Cores</div>
            <div class="context-menu__color-row">
              <button
                v-for="color in COLOR_PRESETS"
                :key="color"
                type="button"
                class="context-menu__color-swatch"
                :style="{ '--swatch-color': color }"
                @click="handlePresetColor(color)"
                :disabled="!canEditColorSelection"
              ></button>
            </div>
            <label class="context-menu__color-picker">
              <span>Personalizar</span>
              <input
                type="color"
                :value="colorPickerValue"
                @input="handleCustomColorInput"
                :disabled="!canEditColorSelection"
              />
            </label>
          </div>
        </div>
      </div>
      <div class="sheet-wrapper">
        <div
          class="sheet-surface"
          :style="sheetStyle"
          ref="sheetSurfaceRef"
          @pointerdown="handleSurfacePointerDown"
          @pointermove="handleSurfacePointerMove"
          @pointerleave="handleSurfacePointerLeave"
        >
          <canvas
            ref="sheetCanvas"
            class="drawing-layer"
            @pointerdown="startDrawing"
            @pointermove="draw"
            @pointerup="stopDrawing"
            @pointerleave="cancelDrawing"
          />
          <div class="elements-layer">
            <div
              v-for="element in elements"
              :key="element.id"
              class="sheet-element"
              :class="elementClasses(element)"
              :style="getElementStyle(element)"
              :data-element-id="element.id"
              @pointerdown="(event) => startElementDrag(event, element)"
              @click.stop="(event) => handleElementClick(element, event)"
              @contextmenu.prevent="(event) => openContextMenu(event, element)"
              @dblclick.stop.prevent="startInlineEditing(element)"
            >
              <div
                v-if="element.kind === 'shape'"
                class="shape-render"
                :class="'shape-render--' + element.variant"
                :style="shapeStyle(element)"
              >
                <template v-if="isLineConnector(element) && isElementSelected(element)">
                  <div
                    class="connector-handle connector-handle--start"
                    @pointerdown.stop.prevent="
                      (event) => startConnectorHandleDrag(event, element, 'start')
                    "
                    title="Arraste para definir o início"
                  ></div>
                  <div
                    class="connector-handle connector-handle--end"
                    @pointerdown.stop.prevent="
                      (event) => startConnectorHandleDrag(event, element, 'end')
                    "
                    title="Arraste para definir o fim"
                  ></div>
                </template>
                <template v-if="element.variant === 'badge'">
                  <input
                    v-if="isInlineEditing(element)"
                    :ref="setInlineEditorRef"
                    v-model="inlineEditor.text"
                    class="inline-editor inline-editor--badge"
                    @blur="commitInlineEditing"
                    @keydown="handleInlineEditorKeydown"
                    spellcheck="false"
                  />
                  <span v-else class="shape-render__text">{{ element.text }}</span>
                </template>
              </div>

              <div
                v-else-if="element.kind === 'text'"
                class="text-render"
                :style="textStyle(element)"
              >
                <textarea
                  v-if="isInlineEditing(element)"
                  :ref="setInlineEditorRef"
                  v-model="inlineEditor.text"
                  class="inline-editor"
                  @blur="commitInlineEditing"
                  @keydown="handleInlineEditorKeydown"
                  spellcheck="false"
                ></textarea>
                <div v-else v-html="formatText(element.text)" />
              </div>

              <div
                v-else-if="element.kind === 'card'"
                class="card-render"
                :class="{ 'card-render--highlight': element.highlight }"
              >
                <textarea
                  v-if="isInlineEditing(element)"
                  :ref="setInlineEditorRef"
                  v-model="inlineEditor.text"
                  class="inline-editor"
                  @blur="commitInlineEditing"
                  @keydown="handleInlineEditorKeydown"
                  spellcheck="false"
                ></textarea>
                <div v-else v-html="formatText(element.text)" />
              </div>

              <div
                v-else-if="element.kind === 'tower'"
                class="tower-render"
                :style="{ '--tower-color': element.color || '#677187' }"
              >
                <div class="tower-render__label">{{ element.code }}</div>
              </div>
            </div>
          </div>
          <div
            v-if="connectorPreview.active"
            class="connector-preview-line"
            :style="connectorPreviewStyle"
          ></div>
          <div
            v-if="eraserPreview.visible"
            class="eraser-preview"
            :style="eraserPreviewStyle"
          ></div>
          <div v-if="isMarqueeSelecting" class="selection-marquee" :style="marqueeStyle"></div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import html2canvas from 'html2canvas'

const SHEET_WIDTH = 1400
const SHEET_HEIGHT = 990
const SHEET_RATIO = SHEET_WIDTH / SHEET_HEIGHT
const SAFE_MARGIN_X = 24
const SAFE_MARGIN_Y = 160
const SHAPE_BASELINE_Y = 660
const CARD_ROW_TOP_Y = 700
const TOWER_ROW_TOP_Y = 700
const COLOR_PRESETS = ['#0d1f3c', '#1a5fb4', '#43a047', '#f57c00', '#d81b60', '#8e24aa', '#fdd835']
const MIN_LINE_LENGTH = 6
const sheetStageRef = ref(null)
const sheetCanvas = ref(null)
const sheetSurfaceRef = ref(null)
const ctx = ref(null)
const isDrawing = ref(false)
const brushColor = ref('#0d1f3c')
const brushSize = ref(3)
const history = ref([])
const historyIndex = ref(-1)
const maxHistory = 20
const canvasSnapshot = ref(null)
const activeDrawTool = ref('none')

const selectedElementIds = ref(new Set())
const draggingElementId = ref(null)
const dragStartPoint = ref({ x: 0, y: 0 })
const dragSelectionState = ref({ snapshots: [], shiftLock: false, axis: null })
const clipboardElements = ref([])
const multiSelectMode = ref(false)
const isMarqueeSelecting = ref(false)
const marqueeStartPoint = ref({ x: 0, y: 0 })
const marqueeCurrentPoint = ref({ x: 0, y: 0 })
const colorPickerValue = ref(COLOR_PRESETS[0])
const contextMenuRef = ref(null)
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  sheetPoint: null,
})
const inlineEditorRef = ref(null)
const inlineEditor = reactive({ id: null, text: '', original: '' })
const defaultShapeColor = '#0d1f3c'
const sheetSize = ref({ width: SHEET_WIDTH, height: SHEET_HEIGHT })
const connectorBinding = reactive({
  active: false,
  endpoint: null,
  lineId: null,
  dragMode: false,
  modified: false,
})
const eraserPreview = reactive({ visible: false, x: 0, y: 0 })
const connectorPreview = reactive({
  active: false,
  start: { x: 0, y: 0 },
  current: { x: 0, y: 0 },
  color: defaultShapeColor,
})

const elements = ref([
  {
    id: 'header-block',
    kind: 'text',
    text: 'XX-XXXXXXXXXX.X.XXXX\nNOTA: XXXXXXXX',
    x: 70,
    y: 70,
    width: 360,
    height: 70,
    fontFamily: 'Courier New, monospace',
    fontSize: 20,
    color: '#0d1f3c',
  },
  {
    id: 'shape-01',
    kind: 'shape',
    variant: 'rect-outline',
    x: 70,
    y: 730,
    width: 28,
    height: 48,
    color: defaultShapeColor,
  },
  {
    id: 'shape-02',
    kind: 'shape',
    variant: 'rect-solid',
    x: 110,
    y: 730,
    width: 28,
    height: 48,
    color: defaultShapeColor,
  },
  {
    id: 'shape-03',
    kind: 'shape',
    variant: 'rect-split-left',
    x: 148,
    y: 730,
    width: 28,
    height: 48,
    color: defaultShapeColor,
  },
  {
    id: 'shape-04',
    kind: 'shape',
    variant: 'rect-split-right',
    x: 186,
    y: 730,
    width: 28,
    height: 48,
    color: defaultShapeColor,
  },
  {
    id: 'shape-05',
    kind: 'shape',
    variant: 'circle-outline',
    x: 226,
    y: 736,
    width: 26,
    height: 26,
    color: defaultShapeColor,
  },
  {
    id: 'shape-06',
    kind: 'shape',
    variant: 'circle-solid',
    x: 260,
    y: 736,
    width: 26,
    height: 26,
    color: defaultShapeColor,
  },
  {
    id: 'shape-07',
    kind: 'shape',
    variant: 'circle-half',
    x: 294,
    y: 736,
    width: 26,
    height: 26,
    color: defaultShapeColor,
  },
  {
    id: 'shape-08',
    kind: 'shape',
    variant: 'triangle-up',
    x: 332,
    y: 726,
    width: 26,
    height: 26,
    color: defaultShapeColor,
  },
  {
    id: 'shape-09',
    kind: 'shape',
    variant: 'triangle-down',
    x: 368,
    y: 734,
    width: 26,
    height: 26,
    color: defaultShapeColor,
  },
  {
    id: 'shape-10',
    kind: 'shape',
    variant: 'diamond',
    x: 404,
    y: 726,
    width: 26,
    height: 26,
    color: defaultShapeColor,
  },
  {
    id: 'shape-11',
    kind: 'shape',
    variant: 'plus',
    x: 440,
    y: 726,
    width: 30,
    height: 30,
    color: defaultShapeColor,
  },
  {
    id: 'shape-12',
    kind: 'shape',
    variant: 'xmark',
    x: 482,
    y: 726,
    width: 30,
    height: 30,
    color: defaultShapeColor,
  },
  {
    id: 'shape-13',
    kind: 'shape',
    variant: 'dot',
    x: 520,
    y: 738,
    width: 14,
    height: 14,
    color: defaultShapeColor,
  },
  {
    id: 'shape-14',
    kind: 'shape',
    variant: 'badge',
    text: 'R3',
    x: 548,
    y: 726,
    width: 34,
    height: 26,
    color: defaultShapeColor,
  },
  {
    id: 'shape-15',
    kind: 'shape',
    variant: 'antenna-solid',
    x: 590,
    y: 716,
    width: 20,
    height: 42,
    color: defaultShapeColor,
  },
  {
    id: 'shape-16',
    kind: 'shape',
    variant: 'antenna-hollow',
    x: 620,
    y: 716,
    width: 20,
    height: 42,
    color: defaultShapeColor,
  },
  {
    id: 'shape-17',
    kind: 'shape',
    variant: 'line-solid',
    x: 656,
    y: 746,
    width: 70,
    height: 6,
    color: defaultShapeColor,
  },
  {
    id: 'shape-18',
    kind: 'shape',
    variant: 'line-dashed',
    x: 734,
    y: 746,
    width: 70,
    height: 6,
    color: defaultShapeColor,
  },
  {
    id: 'legend-card',
    kind: 'card',
    text: 'XXX/XX XX\nPG: XXXXXXXX',
    highlight: true,
    x: 70,
    y: 760,
    width: 170,
    height: 78,
  },
  {
    id: 'tower-7m',
    kind: 'tower',
    code: '7M',
    x: 270,
    y: 762,
    width: 42,
    height: 96,
    color: '#5f6070',
  },
  {
    id: 'card-7m',
    kind: 'card',
    text: 'XXXX XXXXX\nCC:\nMED INST:',
    x: 320,
    y: 754,
    width: 190,
    height: 98,
  },
  {
    id: 'tower-5m',
    kind: 'tower',
    code: '5M',
    x: 540,
    y: 762,
    width: 42,
    height: 96,
    color: '#5f6070',
  },
  {
    id: 'card-5m',
    kind: 'card',
    text: 'XXXX XXXXX\nCC:\nMED INST:',
    x: 588,
    y: 754,
    width: 190,
    height: 98,
  },
  {
    id: 'tower-pp',
    kind: 'tower',
    code: 'PP',
    x: 816,
    y: 762,
    width: 42,
    height: 96,
    color: '#5f6070',
  },
  {
    id: 'card-pp',
    kind: 'card',
    text: 'XXXX XXXXX\nCC:\nMED INST:',
    x: 864,
    y: 754,
    width: 190,
    height: 98,
  },
  {
    id: 'meta-table',
    kind: 'meta',
    x: 1080,
    y: 680,
    width: 230,
    height: 148,
    fields: {
      ref: '',
      cliente: 'CC',
      endereco: '',
      municipio: '',
      regional: 'CENTRO',
      tecnico: 'MANOEL NETO',
      medRef: 'CP',
    },
  },
])

let elementIdCounter = elements.value.length + 1
let marqueeBaseSelection = new Set()
applyInitialVerticalAlignment()
let dragOperationHadEffect = false
const cloneDragState = {
  intent: false,
  performed: false,
  sourceElementId: null,
}

const sheetStyle = computed(() => ({
  width: `${sheetSize.value.width}px`,
  height: `${sheetSize.value.height}px`,
}))

const selectedElementCount = computed(() => selectedElementIds.value.size)
const clipboardHasContent = computed(() => clipboardElements.value.length > 0)
const canInlineEditSelection = computed(() => {
  if (selectedElementIds.value.size !== 1) {
    return false
  }
  const [element] = getSelectedElements()
  return Boolean(element && supportsInlineEditing(element))
})
const canAlignSelection = computed(() => selectedElementCount.value >= 2)
const contextMenuStyle = computed(() => ({
  left: `${contextMenu.x}px`,
  top: `${contextMenu.y}px`,
}))
const canEditColorSelection = computed(() => {
  return elements.value.some(
    (element) => selectedElementIds.value.has(element.id) && elementSupportsColor(element),
  )
})
const marqueeStyle = computed(() => {
  if (!isMarqueeSelecting.value) {
    return {}
  }
  const rect = getNormalizedMarqueeRect()
  if (!rect) {
    return {}
  }
  return {
    left: `${(rect.x / SHEET_WIDTH) * 100}%`,
    top: `${(rect.y / SHEET_HEIGHT) * 100}%`,
    width: `${(rect.width / SHEET_WIDTH) * 100}%`,
    height: `${(rect.height / SHEET_HEIGHT) * 100}%`,
  }
})

const eraserDiameter = computed(() => brushSize.value * 1.6)
const eraserPreviewStyle = computed(() => {
  if (!eraserPreview.visible) {
    return {}
  }
  const diameter = eraserDiameter.value
  const half = diameter / 2
  const clampedX = clamp(eraserPreview.x - half, 0, SHEET_WIDTH - diameter)
  const clampedY = clamp(eraserPreview.y - half, 0, SHEET_HEIGHT - diameter)
  return {
    width: `${(diameter / SHEET_WIDTH) * 100}%`,
    height: `${(diameter / SHEET_HEIGHT) * 100}%`,
    left: `${(clampedX / SHEET_WIDTH) * 100}%`,
    top: `${(clampedY / SHEET_HEIGHT) * 100}%`,
  }
})

const connectorPreviewStyle = computed(() => {
  if (!connectorPreview.active) {
    return {}
  }
  const start = connectorPreview.start
  const current = connectorPreview.current
  const dx = current.x - start.x
  const dy = current.y - start.y
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy))
  const angle = Math.atan2(dy, dx)
  const thickness = 6
  const top = clamp(start.y - thickness / 2, 0, SHEET_HEIGHT - thickness)
  return {
    left: `${(start.x / SHEET_WIDTH) * 100}%`,
    top: `${(top / SHEET_HEIGHT) * 100}%`,
    width: `${(length / SHEET_WIDTH) * 100}%`,
    height: `${(thickness / SHEET_HEIGHT) * 100}%`,
    transform: `rotate(${angle}rad)`,
    transformOrigin: '0 50%',
    '--connector-preview-color': connectorPreview.color || defaultShapeColor,
  }
})

const selectedConnectorElement = computed(() => {
  if (selectedElementIds.value.size !== 1) {
    return null
  }
  const [element] = getSelectedElements()
  return isLineConnector(element) ? element : null
})

const showConnectorContextOptions = computed(() => Boolean(selectedConnectorElement.value))

function applyInitialVerticalAlignment() {
  elements.value = elements.value.map((element) => {
    if (element.kind === 'shape') {
      const height = element.height || 0
      return {
        ...element,
        y: clamp(SHAPE_BASELINE_Y - height, 0, SHEET_HEIGHT - height),
      }
    }
    if (element.kind === 'card') {
      return {
        ...element,
        y: CARD_ROW_TOP_Y,
      }
    }
    if (element.kind === 'tower') {
      return {
        ...element,
        y: TOWER_ROW_TOP_Y,
      }
    }
    return element
  })
}

function supportsInlineEditing(element) {
  if (!element) {
    return false
  }
  if (element.kind === 'text' || element.kind === 'card') {
    return true
  }
  return element.kind === 'shape' && element.variant === 'badge'
}

function elementSupportsColor(element) {
  if (!element) {
    return false
  }
  return element.kind === 'shape' || element.kind === 'tower' || element.kind === 'text'
}

function isInlineEditing(element) {
  return inlineEditor.id === element.id
}

function isElementSelected(element) {
  return selectedElementIds.value.has(element.id)
}

function updateSelectionSet(updater) {
  const next = new Set(selectedElementIds.value)
  updater(next)
  selectedElementIds.value = next
}

function selectElement(element, event) {
  if (!element) {
    return
  }
  const additive = event && (event.shiftKey || event.metaKey || event.ctrlKey)
  if (additive) {
    updateSelectionSet((set) => {
      if (set.has(element.id)) {
        set.delete(element.id)
      } else {
        set.add(element.id)
      }
    })
    return
  }
  selectedElementIds.value = new Set([element.id])
}

function clearSelection() {
  selectedElementIds.value = new Set()
  cancelMarqueeSelection()
  cancelConnectionBinding()
  closeContextMenu()
}

function selectAllElements() {
  cancelMarqueeSelection()
  selectedElementIds.value = new Set(elements.value.map((element) => element.id))
}

function getSelectedElements() {
  return elements.value.filter((element) => selectedElementIds.value.has(element.id))
}

function getElementById(id) {
  if (!id) {
    return null
  }
  return elements.value.find((element) => element.id === id) || null
}

function isLineConnector(element) {
  return Boolean(
    element &&
    element.kind === 'shape' &&
    (element.variant === 'line-solid' || element.variant === 'line-dashed'),
  )
}

function hasCompleteLineConnection(element) {
  if (!isLineConnector(element)) {
    return false
  }
  const connections = element.connections || {}
  return Boolean(connections.start?.id && connections.end?.id)
}

function hasAnyLineConnection(element) {
  if (!isLineConnector(element)) {
    return false
  }
  const connections = element.connections || {}
  return Boolean(connections.start?.id || connections.end?.id)
}

function ensureLineConnectionsContainer(element) {
  if (!element) {
    return
  }
  if (!element.connections) {
    element.connections = { start: null, end: null }
    return
  }
  if (!Object.prototype.hasOwnProperty.call(element.connections, 'start')) {
    element.connections.start = null
  }
  if (!Object.prototype.hasOwnProperty.call(element.connections, 'end')) {
    element.connections.end = null
  }
}

function getElementAnchorPoint(element, anchor = 'center') {
  if (!element) {
    return null
  }
  const width = element.width || 0
  const height = element.height || 0
  const baseX = element.x || 0
  const baseY = element.y || 0
  const centerX = baseX + width / 2
  const centerY = baseY + height / 2
  switch (anchor) {
    case 'left':
      return { x: baseX, y: centerY }
    case 'right':
      return { x: baseX + width, y: centerY }
    case 'top':
      return { x: centerX, y: baseY }
    case 'bottom':
      return { x: centerX, y: baseY + height }
    default:
      return { x: centerX, y: centerY }
  }
}

function getLineConnectionPoints(element) {
  if (!isLineConnector(element) || !element.connections) {
    return null
  }
  const startPoint = getLineAnchorPointForEndpoint(element, 'start')
  const endPoint = getLineAnchorPointForEndpoint(element, 'end')
  if (!startPoint || !endPoint) {
    return null
  }
  return { start: startPoint, end: endPoint }
}

function getLineAnchorPointForEndpoint(line, endpoint) {
  if (!line || !isLineConnector(line)) {
    return null
  }
  const targetId = line.connections?.[endpoint]?.id
  if (targetId) {
    const target = getElementById(targetId)
    if (target) {
      const anchor = line.connections?.[endpoint]?.anchor || 'bottom'
      return getElementAnchorPoint(target, anchor)
    }
  }
  return getLineHandlePoint(line, endpoint)
}

function getLineHandlePoint(line, endpoint) {
  if (!line) {
    return null
  }
  const width = line.width || 0
  const height = line.height || 0
  const x = line.x || 0
  const y = line.y || 0
  const centerY = y + height / 2
  if (endpoint === 'start') {
    return { x, y: centerY }
  }
  return { x: x + width, y: centerY }
}

function getPreviewPointsForLine(line) {
  if (!line) {
    return null
  }
  if (!connectorPreview.active || !connectorBinding.dragMode) {
    return null
  }
  if (connectorBinding.lineId !== line.id) {
    return null
  }
  return {
    start: { ...connectorPreview.start },
    end: { ...connectorPreview.current },
  }
}

function buildLineStyleFromPoints(start, end, baseHeight) {
  if (!start || !end) {
    return null
  }
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy))
  const angle = Math.atan2(dy, dx)
  const resolvedHeight = baseHeight || 6
  const top = clamp(start.y - resolvedHeight / 2, 0, SHEET_HEIGHT - resolvedHeight)
  return {
    left: `${(start.x / SHEET_WIDTH) * 100}%`,
    top: `${(top / SHEET_HEIGHT) * 100}%`,
    width: `${(length / SHEET_WIDTH) * 100}%`,
    height: `${(resolvedHeight / SHEET_HEIGHT) * 100}%`,
    transform: `rotate(${angle}rad)`,
    transformOrigin: '0 50%',
  }
}

function shouldStretchLineGeometry(line, endpoint) {
  if (!line || !endpoint) {
    return true
  }
  if (!line.connections) {
    return true
  }
  return !line.connections[endpoint]?.id
}

function applyLineHandleStretch(line, endpoint, point) {
  if (!line || !point) {
    return false
  }
  const startX = line.x || 0
  const width = line.width || 0
  const endX = startX + width
  const clampedPointerX = clamp(point.x, 0, SHEET_WIDTH)
  let nextStartX = startX
  let nextWidth = width
  if (endpoint === 'start') {
    const maxStart = endX - MIN_LINE_LENGTH
    const candidate = Math.min(clampedPointerX, maxStart)
    nextStartX = clamp(candidate, 0, SHEET_WIDTH)
    nextWidth = Math.max(MIN_LINE_LENGTH, endX - nextStartX)
  } else {
    const minEnd = startX + MIN_LINE_LENGTH
    const candidate = Math.max(clampedPointerX, minEnd)
    const clampedEnd = clamp(candidate, 0, SHEET_WIDTH)
    nextWidth = Math.max(MIN_LINE_LENGTH, clampedEnd - startX)
  }
  const changed = Math.abs(nextStartX - startX) > 0.5 || Math.abs(nextWidth - width) > 0.5
  if (changed) {
    line.x = nextStartX
    line.width = nextWidth
  }
  return changed
}

function beginConnectionBinding(endpoint) {
  const connector = selectedConnectorElement.value
  if (!connector || (endpoint !== 'start' && endpoint !== 'end')) {
    return
  }
  connectorBinding.active = true
  connectorBinding.endpoint = endpoint
  connectorBinding.lineId = connector.id
  connectorBinding.dragMode = false
  connectorBinding.modified = false
  closeContextMenu()
}

function cancelConnectionBinding() {
  window.removeEventListener('pointermove', handleConnectorHandleMove)
  window.removeEventListener('pointerup', finishConnectorHandleDrag)
  hideConnectorPreview()
  connectorBinding.active = false
  connectorBinding.endpoint = null
  connectorBinding.lineId = null
  connectorBinding.dragMode = false
  connectorBinding.modified = false
}

function connectorHasEndpoint(endpoint) {
  const connector = selectedConnectorElement.value
  if (!connector || !connector.connections) {
    return false
  }
  return Boolean(connector.connections[endpoint]?.id)
}

function clearConnectorEndpoint(endpoint) {
  const connector = selectedConnectorElement.value
  if (!connector || !connector.connections) {
    cancelConnectionBinding()
    return
  }
  let cleared = false
  if (connector.connections[endpoint]) {
    connector.connections[endpoint] = null
    cleared = true
  }
  if (!connector.connections.start?.id && !connector.connections.end?.id) {
    connector.connections = null
  }
  cancelConnectionBinding()
  closeContextMenu()
  if (cleared) {
    saveState()
  }
}

function startConnectorHandleDrag(event, line, endpoint) {
  if (!line || !isLineConnector(line) || (endpoint !== 'start' && endpoint !== 'end')) {
    return
  }
  if (!isElementSelected(line)) {
    selectElement(line, event)
  }
  cancelMarqueeSelection()
  closeContextMenu()
  initializeConnectorPreview(line, endpoint)
  connectorBinding.active = true
  connectorBinding.endpoint = endpoint
  connectorBinding.lineId = line.id
  connectorBinding.dragMode = true
  connectorBinding.modified = false
  const initialPoint = getSheetCoordinatesFromClient(event.clientX, event.clientY)
  if (initialPoint) {
    updateConnectorPreview(initialPoint, line)
  }
  window.addEventListener('pointermove', handleConnectorHandleMove)
  window.addEventListener('pointerup', finishConnectorHandleDrag)
}

function finishConnectorHandleDrag(event) {
  window.removeEventListener('pointermove', handleConnectorHandleMove)
  window.removeEventListener('pointerup', finishConnectorHandleDrag)
  if (!connectorBinding.dragMode || !connectorBinding.lineId) {
    hideConnectorPreview()
    cancelConnectionBinding()
    return
  }
  const dropTarget = getElementFromClientPoint(event.clientX, event.clientY)
  const line = getElementById(connectorBinding.lineId)
  if (dropTarget && line && dropTarget.id !== line.id && !isLineConnector(dropTarget)) {
    const anchor = getPreferredConnectorAnchor(dropTarget, line)
    const attached = attachConnectorToElement(
      line,
      connectorBinding.endpoint,
      dropTarget.id,
      anchor,
    )
    if (attached) {
      selectedElementIds.value = new Set([line.id])
    }
  }
  if (connectorBinding.modified) {
    saveState()
  }
  hideConnectorPreview()
  cancelConnectionBinding()
}

function handleConnectorHandleMove(event) {
  if (!connectorBinding.dragMode) {
    return
  }
  const point = getSheetCoordinatesFromClient(event.clientX, event.clientY)
  if (!point) {
    return
  }
  const line = getElementById(connectorBinding.lineId)
  updateConnectorPreview(point, line)
}

function initializeConnectorPreview(line, draggedEndpoint) {
  const fixedEndpoint = draggedEndpoint === 'start' ? 'end' : 'start'
  const basePoint = getLineAnchorPointForEndpoint(line, fixedEndpoint) ||
    getLineHandlePoint(line, fixedEndpoint) ||
    getLineHandlePoint(line, draggedEndpoint) || { x: 0, y: 0 }
  const clampedBase = {
    x: clamp(basePoint.x, 0, SHEET_WIDTH),
    y: clamp(basePoint.y, 0, SHEET_HEIGHT),
  }
  connectorPreview.active = true
  connectorPreview.start = clampedBase
  connectorPreview.current = clampedBase
  connectorPreview.color = line.color || defaultShapeColor
}

function updateConnectorPreview(point, line = null) {
  if (!connectorPreview.active) {
    return
  }
  connectorPreview.current = {
    x: clamp(point.x, 0, SHEET_WIDTH),
    y: clamp(point.y, 0, SHEET_HEIGHT),
  }
  if (
    line &&
    connectorBinding.dragMode &&
    shouldStretchLineGeometry(line, connectorBinding.endpoint)
  ) {
    const stretched = applyLineHandleStretch(
      line,
      connectorBinding.endpoint,
      connectorPreview.current,
    )
    if (stretched) {
      connectorBinding.modified = true
    }
  }
}

function hideConnectorPreview() {
  connectorPreview.active = false
  connectorPreview.start = { x: 0, y: 0 }
  connectorPreview.current = { x: 0, y: 0 }
}

function handleElementClick(element, event) {
  if (!element) {
    return
  }
  if (connectorBinding.active) {
    const attached = tryAttachConnectorTarget(element)
    if (attached) {
      return
    }
  }
  selectElement(element, event)
}

function tryAttachConnectorTarget(targetElement) {
  const { lineId, endpoint } = connectorBinding
  if (!lineId || !endpoint) {
    cancelConnectionBinding()
    return false
  }
  if (!targetElement || targetElement.id === lineId || isLineConnector(targetElement)) {
    return false
  }
  const line = getElementById(lineId)
  if (!line || !isLineConnector(line)) {
    cancelConnectionBinding()
    return false
  }
  const anchor = getPreferredConnectorAnchor(targetElement, line)
  const attached = attachConnectorToElement(line, endpoint, targetElement.id, anchor)
  if (attached) {
    selectedElementIds.value = new Set([line.id])
    saveState()
  }
  cancelConnectionBinding()
  return Boolean(attached)
}

function attachConnectorToElement(line, endpoint, targetId, anchor = 'center') {
  if (!line || (endpoint !== 'start' && endpoint !== 'end')) {
    return false
  }
  const target = getElementById(targetId)
  if (!target) {
    return false
  }
  ensureLineConnectionsContainer(line)
  const current = line.connections[endpoint]
  const nextConnection = { id: targetId, anchor }
  if (current && current.id === nextConnection.id && current.anchor === nextConnection.anchor) {
    return false
  }
  line.connections[endpoint] = nextConnection
  connectorBinding.modified = true
  return true
}

function getPreferredConnectorAnchor(targetElement, lineElement = null) {
  if (!targetElement) {
    return 'center'
  }
  if (lineElement && isLineConnector(lineElement)) {
    if (lineElement.variant === 'line-solid') {
      return 'bottom'
    }
    if (lineElement.variant === 'line-dashed') {
      return 'center'
    }
  }
  return 'center'
}

function getElementFromClientPoint(clientX, clientY) {
  if (typeof clientX !== 'number' || typeof clientY !== 'number') {
    return null
  }
  if (typeof document === 'undefined') {
    return null
  }
  const hitNode = document.elementFromPoint(clientX, clientY)
  if (!hitNode) {
    return null
  }
  const sheetNode = hitNode.closest ? hitNode.closest('.sheet-element') : null
  if (!sheetNode) {
    return null
  }
  const elementId = sheetNode.getAttribute('data-element-id')
  return getElementById(elementId)
}

function cleanupConnectorReferences(removedIdsSet) {
  if (!removedIdsSet || removedIdsSet.size === 0) {
    return
  }
  elements.value.forEach((element) => {
    if (!isLineConnector(element) || !element.connections) {
      return
    }
    if (element.connections.start?.id && removedIdsSet.has(element.connections.start.id)) {
      element.connections.start = null
    }
    if (element.connections.end?.id && removedIdsSet.has(element.connections.end.id)) {
      element.connections.end = null
    }
    if (!element.connections.start?.id && !element.connections.end?.id) {
      element.connections = null
    }
  })
}

function handleSurfacePointerDown(event) {
  const elementTarget = event.target.closest ? event.target.closest('.sheet-element') : null
  if (multiSelectMode.value) {
    if (event.button && event.button !== 0) {
      return
    }
    if (elementTarget) {
      return
    }
    event.preventDefault()
    closeContextMenu()
    startMarqueeSelection(event)
    return
  }
  if (!elementTarget) {
    const clickedSurface =
      event.target === event.currentTarget || event.target === sheetCanvas.value
    if (clickedSurface) {
      if (connectorBinding.active) {
        event.preventDefault()
        cancelConnectionBinding()
        return
      }
      clearSelection()
    }
  }
}

function handleSurfacePointerMove(event) {
  if (activeDrawTool.value !== 'eraser') {
    hideEraserPreview()
    return
  }
  const point = getSheetCoordinatesFromClient(event.clientX, event.clientY)
  if (point) {
    showEraserPreview(point)
  }
}

function handleSurfacePointerLeave() {
  hideEraserPreview()
}

function startMarqueeSelection(event) {
  const point = getSheetCoordinatesFromClient(event.clientX, event.clientY)
  if (!point) {
    return
  }
  marqueeBaseSelection = new Set(selectedElementIds.value)
  marqueeStartPoint.value = point
  marqueeCurrentPoint.value = point
  isMarqueeSelecting.value = true
  window.addEventListener('pointermove', updateMarqueeSelection)
  window.addEventListener('pointerup', finishMarqueeSelection)
}

function updateMarqueeSelection(event) {
  const point = getSheetCoordinatesFromClient(event.clientX, event.clientY)
  if (!point) {
    return
  }
  marqueeCurrentPoint.value = point
}

function finishMarqueeSelection() {
  window.removeEventListener('pointermove', updateMarqueeSelection)
  window.removeEventListener('pointerup', finishMarqueeSelection)
  if (!isMarqueeSelecting.value) {
    return
  }
  isMarqueeSelecting.value = false
  const rect = getNormalizedMarqueeRect()
  if (!rect || (rect.width < 4 && rect.height < 4)) {
    marqueeBaseSelection = new Set()
    return
  }
  const intersecting = elements.value.filter((element) => elementIntersectsRect(element, rect))
  if (!intersecting.length) {
    marqueeBaseSelection = new Set()
    return
  }
  const nextSelection = new Set(marqueeBaseSelection)
  intersecting.forEach((element) => nextSelection.add(element.id))
  selectedElementIds.value = nextSelection
  marqueeBaseSelection = new Set()
}

function cancelMarqueeSelection() {
  if (!isMarqueeSelecting.value) {
    marqueeBaseSelection = new Set()
    return
  }
  isMarqueeSelecting.value = false
  window.removeEventListener('pointermove', updateMarqueeSelection)
  window.removeEventListener('pointerup', finishMarqueeSelection)
  marqueeBaseSelection = new Set()
}

function getNormalizedMarqueeRect() {
  const start = marqueeStartPoint.value
  const current = marqueeCurrentPoint.value
  if (!start || !current) {
    return null
  }
  const x1 = clamp(Math.min(start.x, current.x), 0, SHEET_WIDTH)
  const y1 = clamp(Math.min(start.y, current.y), 0, SHEET_HEIGHT)
  const x2 = clamp(Math.max(start.x, current.x), 0, SHEET_WIDTH)
  const y2 = clamp(Math.max(start.y, current.y), 0, SHEET_HEIGHT)
  return {
    x: x1,
    y: y1,
    width: Math.max(0, x2 - x1),
    height: Math.max(0, y2 - y1),
  }
}

function elementIntersectsRect(element, rect) {
  const width = element.width || 0
  const height = element.height || 0
  const elX1 = element.x || 0
  const elY1 = element.y || 0
  const elX2 = elX1 + width
  const elY2 = elY1 + height
  const rectX2 = rect.x + rect.width
  const rectY2 = rect.y + rect.height
  return !(elX2 < rect.x || elX1 > rectX2 || elY2 < rect.y || elY1 > rectY2)
}

function setDrawTool(tool) {
  if (tool !== 'pen' && tool !== 'eraser') {
    activeDrawTool.value = 'none'
  } else {
    activeDrawTool.value = tool
  }
  updateBrush()
}

function openContextMenu(event, element) {
  event.preventDefault()
  if (inlineEditor.id) {
    commitInlineEditing()
  }
  cancelConnectionBinding()
  cancelMarqueeSelection()
  if (element && !isElementSelected(element)) {
    selectElement(element, event)
  }
  syncColorPickerWithSelection()
  const sheetPoint = getSheetCoordinatesFromClient(event.clientX, event.clientY)
  contextMenu.sheetPoint = sheetPoint
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.visible = true
  nextTick(constrainContextMenuWithinViewport)
}

function closeContextMenu() {
  contextMenu.visible = false
  contextMenu.sheetPoint = null
}

function handleContextAction(action) {
  switch (action) {
    case 'edit':
      if (canInlineEditSelection.value) {
        editSelectedElement()
      }
      break
    case 'duplicate':
      duplicateSelectedElements()
      break
    case 'delete':
      deleteSelectedElements()
      break
    case 'copy':
      copySelectedElements()
      break
    case 'paste':
      pasteClipboardElements(contextMenu.sheetPoint || null)
      break
    case 'selectAll':
      selectAllElements()
      break
    case 'bringFront':
      bringSelectedToFront()
      break
    case 'sendBack':
      sendSelectedToBack()
      break
    case 'clearSelection':
      clearSelection()
      break
    default:
      break
  }
  closeContextMenu()
}

function handleContextAlign(mode) {
  if (!canAlignSelection.value) {
    closeContextMenu()
    return
  }
  alignSelection(mode)
  closeContextMenu()
}

function editSelectedElement() {
  const [element] = getSelectedElements()
  if (element) {
    startInlineEditing(element)
  }
}

function deleteSelectedElements() {
  const ids = new Set(selectedElementIds.value)
  if (!ids.size) {
    return
  }
  if (inlineEditor.id && ids.has(inlineEditor.id)) {
    cancelInlineEditing()
  }
  elements.value = elements.value.filter((element) => !ids.has(element.id))
  cleanupConnectorReferences(ids)
  saveState()
  clearSelection()
}

function bringSelectedToFront() {
  if (!selectedElementIds.value.size) {
    return
  }
  const ids = new Set(selectedElementIds.value)
  const selected = elements.value.filter((element) => ids.has(element.id))
  const remaining = elements.value.filter((element) => !ids.has(element.id))
  elements.value = [...remaining, ...selected]
  saveState()
}

function sendSelectedToBack() {
  if (!selectedElementIds.value.size) {
    return
  }
  const ids = new Set(selectedElementIds.value)
  const selected = elements.value.filter((element) => ids.has(element.id))
  const remaining = elements.value.filter((element) => !ids.has(element.id))
  elements.value = [...selected, ...remaining]
  saveState()
}

function handleGlobalPointerDown(event) {
  if (connectorBinding.active) {
    cancelConnectionBinding()
  }
  if (!contextMenu.visible) {
    return
  }
  const menu = contextMenuRef.value
  if (menu && event.target instanceof Node && menu.contains(event.target)) {
    return
  }
  closeContextMenu()
}

function constrainContextMenuWithinViewport() {
  if (!contextMenu.visible) {
    return
  }
  const menu = contextMenuRef.value
  if (!menu) {
    return
  }
  const rect = menu.getBoundingClientRect()
  let nextX = contextMenu.x
  let nextY = contextMenu.y
  if (rect.right > window.innerWidth) {
    nextX -= rect.right - window.innerWidth + 12
  }
  if (rect.bottom > window.innerHeight) {
    nextY -= rect.bottom - window.innerHeight + 12
  }
  if (rect.left < 0) {
    nextX = 12
  }
  if (rect.top < 0) {
    nextY = 12
  }
  contextMenu.x = Math.max(12, nextX)
  contextMenu.y = Math.max(12, nextY)
}

function elementClasses(element) {
  return [
    `sheet-element--${element.kind}`,
    {
      'sheet-element--selected': isElementSelected(element),
      'sheet-element--editing': isInlineEditing(element),
    },
  ]
}

function syncColorPickerWithSelection() {
  const candidate = getSelectedElements().find(
    (element) => elementSupportsColor(element) && element.color,
  )
  if (candidate && candidate.color) {
    colorPickerValue.value = candidate.color
  }
}

function applyColorToSelection(color) {
  if (!color) {
    return
  }
  const selected = getSelectedElements().filter(elementSupportsColor)
  if (!selected.length) {
    return
  }
  selected.forEach((element) => {
    element.color = color
  })
  colorPickerValue.value = color
  saveState()
}

function handlePresetColor(color) {
  applyColorToSelection(color)
}

function handleCustomColorInput(event) {
  const color = event.target.value
  applyColorToSelection(color)
}

function copySelectedElements() {
  const selected = getSelectedElements()
  if (!selected.length) {
    return
  }
  clipboardElements.value = selected.map((element) => cloneElement(element, { x: 0, y: 0 }))
}

function pasteClipboardElements(point = null) {
  if (!clipboardElements.value.length) {
    return
  }
  if (point) {
    pasteClipboardElementsAtPoint(point)
    return
  }
  const pasted = clipboardElements.value.map((element, index) =>
    cloneElement(element, { x: 20 + index * 6, y: 20 + index * 6 }),
  )
  pasted.forEach((element) => elements.value.push(element))
  selectedElementIds.value = new Set(pasted.map((element) => element.id))
  saveState()
}

function duplicateSelectedElements() {
  const selected = getSelectedElements()
  if (!selected.length) {
    return
  }
  const duplicates = selected.map((element) => cloneElement(element, { x: 24, y: 24 }))
  duplicates.forEach((element) => elements.value.push(element))
  selectedElementIds.value = new Set(duplicates.map((element) => element.id))
  saveState()
}

function cloneSelectionForDrag() {
  const selected = getSelectedElements()
  if (!selected.length) {
    return []
  }
  const clones = selected.map((element) => ({
    originalId: element.id,
    clone: cloneElement(element, { x: 0, y: 0 }),
  }))
  clones.forEach(({ clone }) => {
    elements.value.push(clone)
  })
  selectedElementIds.value = new Set(clones.map(({ clone }) => clone.id))
  return clones
}

function cloneElement(element, offset = { x: 0, y: 0 }) {
  const copy = JSON.parse(JSON.stringify(element))
  copy.id = generateElementId(element.id)
  copy.x = clamp((copy.x || 0) + offset.x, 0, SHEET_WIDTH - (copy.width || 1))
  copy.y = clamp((copy.y || 0) + offset.y, 0, SHEET_HEIGHT - (copy.height || 1))
  return copy
}

function pasteClipboardElementsAtPoint(point) {
  if (!point) {
    return
  }
  const pasted = clipboardElements.value.map((element, index) =>
    cloneElement(element, { x: index * 4, y: index * 4 }),
  )
  const bounds = getElementsBounds(pasted)
  if (!bounds) {
    return
  }
  const targetX = clamp(point.x - bounds.width / 2, 0, SHEET_WIDTH - bounds.width)
  const targetY = clamp(point.y - bounds.height / 2, 0, SHEET_HEIGHT - bounds.height)
  const deltaX = targetX - bounds.x
  const deltaY = targetY - bounds.y
  pasted.forEach((element) => {
    const width = element.width || 0
    const height = element.height || 0
    element.x = clamp(element.x + deltaX, 0, SHEET_WIDTH - width)
    element.y = clamp(element.y + deltaY, 0, SHEET_HEIGHT - height)
    elements.value.push(element)
  })
  selectedElementIds.value = new Set(pasted.map((element) => element.id))
  saveState()
}

function getElementsBounds(list) {
  if (!list.length) {
    return null
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  list.forEach((element) => {
    const width = element.width || 0
    const height = element.height || 0
    const x = element.x || 0
    const y = element.y || 0
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  })
  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  }
}

function generateElementId(baseId = 'element') {
  elementIdCounter += 1
  return `${baseId}-copy-${elementIdCounter}`
}

function alignSelection(mode) {
  const selected = getSelectedElements()
  if (selected.length < 2) {
    return
  }
  const anchor = selected[0]
  const anchorWidth = anchor.width || 0
  const anchorHeight = anchor.height || 0
  let changed = false
  selected.forEach((element) => {
    const elementWidth = element.width || 0
    const elementHeight = element.height || 0
    switch (mode) {
      case 'left':
        if (element.x !== anchor.x) {
          element.x = anchor.x
          changed = true
        }
        break
      case 'center':
        element.x = clamp(
          anchor.x + anchorWidth / 2 - elementWidth / 2,
          0,
          SHEET_WIDTH - elementWidth,
        )
        changed = true
        break
      case 'right':
        element.x = clamp(anchor.x + anchorWidth - elementWidth, 0, SHEET_WIDTH - elementWidth)
        changed = true
        break
      case 'top':
        if (element.y !== anchor.y) {
          element.y = anchor.y
          changed = true
        }
        break
      case 'middle':
        element.y = clamp(
          anchor.y + anchorHeight / 2 - elementHeight / 2,
          0,
          SHEET_HEIGHT - elementHeight,
        )
        changed = true
        break
      case 'bottom':
        element.y = clamp(anchor.y + anchorHeight - elementHeight, 0, SHEET_HEIGHT - elementHeight)
        changed = true
        break
      default:
        break
    }
  })
  if (changed) {
    saveState()
  }
}

function nudgeSelection(deltaX, deltaY) {
  if (!deltaX && !deltaY) {
    return
  }
  const selected = getSelectedElements()
  if (!selected.length) {
    return
  }
  let changed = false
  selected.forEach((element) => {
    const width = element.width || 0
    const height = element.height || 0
    const nextX = clamp((element.x || 0) + deltaX, 0, SHEET_WIDTH - width)
    const nextY = clamp((element.y || 0) + deltaY, 0, SHEET_HEIGHT - height)
    if (nextX !== element.x) {
      element.x = nextX
      changed = true
    }
    if (nextY !== element.y) {
      element.y = nextY
      changed = true
    }
  })
  if (changed) {
    saveState()
  }
}

function getElementStyle(element) {
  const connectedStyle = getConnectedLineStyle(element)
  if (connectedStyle) {
    return connectedStyle
  }
  const style = {
    left: `${(element.x / SHEET_WIDTH) * 100}%`,
    top: `${(element.y / SHEET_HEIGHT) * 100}%`,
  }
  if (element.width) {
    style.width = `${(element.width / SHEET_WIDTH) * 100}%`
  }
  if (element.height) {
    style.height = `${(element.height / SHEET_HEIGHT) * 100}%`
  }
  return style
}

function getConnectedLineStyle(element) {
  const previewPoints = getPreviewPointsForLine(element)
  if (previewPoints) {
    return buildLineStyleFromPoints(previewPoints.start, previewPoints.end, element.height)
  }
  if (!hasAnyLineConnection(element)) {
    return null
  }
  const points = getLineConnectionPoints(element)
  if (!points) {
    return null
  }
  return buildLineStyleFromPoints(points.start, points.end, element.height)
}

function shapeStyle(element) {
  return {
    '--shape-color': element.color || defaultShapeColor,
  }
}

function textStyle(element) {
  if (!element || !element.color) {
    return {}
  }
  return {
    color: element.color,
  }
}

function formatText(text) {
  return (text || '').replace(/\n/g, '<br>')
}

function startInlineEditing(element) {
  if (!supportsInlineEditing(element)) {
    return
  }
  closeContextMenu()
  inlineEditor.id = element.id
  inlineEditor.text = element.text || ''
  inlineEditor.original = element.text || ''
  selectElement(element)
  nextTick(() => {
    if (inlineEditorRef.value) {
      inlineEditorRef.value.focus()
      inlineEditorRef.value.select()
    }
  })
}

function commitInlineEditing() {
  if (!inlineEditor.id) {
    return
  }
  const element = elements.value.find((el) => el.id === inlineEditor.id)
  if (element) {
    if (element.text !== inlineEditor.text) {
      element.text = inlineEditor.text
      saveState()
    }
  }
  inlineEditor.id = null
  inlineEditor.text = ''
  inlineEditor.original = ''
}

function cancelInlineEditing() {
  if (!inlineEditor.id) {
    return
  }
  const element = elements.value.find((el) => el.id === inlineEditor.id)
  if (element) {
    element.text = inlineEditor.original
  }
  inlineEditor.id = null
  inlineEditor.text = ''
  inlineEditor.original = ''
}

function handleInlineEditorKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelInlineEditing()
    return
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    commitInlineEditing()
  }
}

function setInlineEditorRef(el) {
  inlineEditorRef.value = el
}

function resetCloneDragState() {
  cloneDragState.intent = false
  cloneDragState.performed = false
  cloneDragState.sourceElementId = null
}

function prepareCloneDrag(elementId, intent) {
  cloneDragState.intent = intent
  cloneDragState.performed = false
  cloneDragState.sourceElementId = intent ? elementId : null
}

function activateCloneDragForSelection() {
  const clones = cloneSelectionForDrag()
  if (!clones.length) {
    resetCloneDragState()
    return null
  }
  cloneDragState.performed = true
  const sourceId = cloneDragState.sourceElementId
  const match = sourceId ? clones.find((entry) => entry.originalId === sourceId) : null
  return (match && match.clone.id) || clones[0].clone.id
}

function startElementDrag(event, element) {
  event.stopPropagation()
  if (event.button && event.button !== 0) {
    return
  }
  if (event.detail === 2 || isInlineEditing(element)) {
    return
  }
  if (connectorBinding.active) {
    event.preventDefault()
    return
  }
  if (inlineEditor.id) {
    commitInlineEditing()
  }
  closeContextMenu()
  resetCloneDragState()
  const additive = event && (event.shiftKey || event.ctrlKey || event.metaKey)
  if (!isElementSelected(element) && !additive) {
    selectElement(element)
  }
  const shouldCloneOnDrag = Boolean(event && (event.ctrlKey || event.metaKey))
  dragOperationHadEffect = false
  if (multiSelectMode.value && !shouldCloneOnDrag) {
    return
  }
  prepareCloneDrag(element.id, shouldCloneOnDrag)
  let activeElement = element
  if (isLineConnector(activeElement) && hasCompleteLineConnection(activeElement)) {
    event.preventDefault()
    resetCloneDragState()
    return
  }
  event.preventDefault()
  draggingElementId.value = activeElement.id
  dragStartPoint.value = getPoint(event)
  dragSelectionState.value.snapshots = getSelectedElements().map((selectedElement) => ({
    id: selectedElement.id,
    x: selectedElement.x,
    y: selectedElement.y,
    width: selectedElement.width || 40,
    height: selectedElement.height || 40,
  }))
  dragSelectionState.value.shiftLock = event.shiftKey
  dragSelectionState.value.axis = null
  window.addEventListener('pointermove', handleElementDrag)
  window.addEventListener('pointerup', stopElementDrag)
}

function handleElementDrag(event) {
  if (!draggingElementId.value) {
    return
  }
  const state = dragSelectionState.value
  const point = getPoint(event)
  const deltaX = point.x - dragStartPoint.value.x
  const deltaY = point.y - dragStartPoint.value.y
  const movedEnough = Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5
  let effectiveDeltaX = deltaX
  let effectiveDeltaY = deltaY
  if (state.shiftLock && movedEnough) {
    if (!state.axis) {
      state.axis = Math.abs(deltaX) >= Math.abs(deltaY) ? 'x' : 'y'
    }
    if (state.axis === 'x') {
      effectiveDeltaY = 0
    } else {
      effectiveDeltaX = 0
    }
  }
  if (cloneDragState.intent && !cloneDragState.performed) {
    if (!movedEnough) {
      return
    }
    const newActiveId = activateCloneDragForSelection()
    if (!newActiveId) {
      return
    }
    draggingElementId.value = newActiveId
    state.snapshots = getSelectedElements().map((selectedElement) => ({
      id: selectedElement.id,
      x: selectedElement.x,
      y: selectedElement.y,
      width: selectedElement.width || 40,
      height: selectedElement.height || 40,
    }))
    dragOperationHadEffect = true
  }
  if (movedEnough) {
    dragOperationHadEffect = true
  }
  state.snapshots.forEach((snapshot) => {
    const element = elements.value.find((el) => el.id === snapshot.id)
    if (!element) {
      return
    }
    element.x = clamp(snapshot.x + effectiveDeltaX, 0, SHEET_WIDTH - snapshot.width)
    element.y = clamp(snapshot.y + effectiveDeltaY, 0, SHEET_HEIGHT - snapshot.height)
  })
}

function stopElementDrag() {
  if (!draggingElementId.value) {
    return
  }
  draggingElementId.value = null
  dragSelectionState.value.snapshots = []
  dragSelectionState.value.shiftLock = false
  dragSelectionState.value.axis = null
  window.removeEventListener('pointermove', handleElementDrag)
  window.removeEventListener('pointerup', stopElementDrag)
  if (dragOperationHadEffect) {
    saveState()
  }
  dragOperationHadEffect = false
  resetCloneDragState()
}

function initCanvas() {
  const canvas = sheetCanvas.value
  if (!canvas) {
    return
  }
  canvas.width = SHEET_WIDTH
  canvas.height = SHEET_HEIGHT
  ctx.value = canvas.getContext('2d', { willReadFrequently: true })
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  updateBrush()
  saveState({ captureCanvas: true })
}

function updateBrush() {
  if (!ctx.value) {
    return
  }
  const tool = activeDrawTool.value
  if (tool === 'eraser') {
    ctx.value.globalCompositeOperation = 'destination-out'
    ctx.value.strokeStyle = '#000000'
    ctx.value.lineWidth = brushSize.value * 1.6
  } else {
    ctx.value.globalCompositeOperation = 'source-over'
    ctx.value.strokeStyle = brushColor.value
    ctx.value.lineWidth = brushSize.value
  }
}

function getPoint(event) {
  const canvas = sheetCanvas.value
  const rect = canvas.getBoundingClientRect()
  const scaleX = SHEET_WIDTH / rect.width
  const scaleY = SHEET_HEIGHT / rect.height
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

function getSheetCoordinatesFromClient(clientX, clientY) {
  const surface = sheetSurfaceRef.value
  if (!surface) {
    return null
  }
  const rect = surface.getBoundingClientRect()
  if (!rect.width || !rect.height) {
    return null
  }
  const x = ((clientX - rect.left) / rect.width) * SHEET_WIDTH
  const y = ((clientY - rect.top) / rect.height) * SHEET_HEIGHT
  return {
    x: clamp(x, 0, SHEET_WIDTH),
    y: clamp(y, 0, SHEET_HEIGHT),
  }
}

function showEraserPreview(point) {
  if (!point) {
    return
  }
  eraserPreview.visible = true
  eraserPreview.x = point.x
  eraserPreview.y = point.y
}

function hideEraserPreview() {
  eraserPreview.visible = false
}

function startDrawing(event) {
  if (!ctx.value) {
    return
  }
  if (activeDrawTool.value === 'none') {
    return
  }
  if (multiSelectMode.value) {
    event.preventDefault()
    return
  }
  if (inlineEditor.id) {
    commitInlineEditing()
  }
  event.preventDefault()
  isDrawing.value = true
  ctx.value.beginPath()
  const { x, y } = getPoint(event)
  ctx.value.moveTo(x, y)
  if (activeDrawTool.value === 'eraser') {
    showEraserPreview({ x, y })
  }
}

function draw(event) {
  if (!isDrawing.value || !ctx.value) {
    return
  }
  if (activeDrawTool.value === 'none') {
    return
  }
  event.preventDefault()
  const { x, y } = getPoint(event)
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
  if (activeDrawTool.value === 'eraser') {
    showEraserPreview({ x, y })
  }
}

function stopDrawing() {
  if (!isDrawing.value || !ctx.value) {
    return
  }
  isDrawing.value = false
  ctx.value.closePath()
  saveState({ captureCanvas: true })
  hideEraserPreview()
}

function cancelDrawing(event) {
  if (!isDrawing.value) {
    return
  }
  event.preventDefault()
  stopDrawing()
}

function cloneElementsState() {
  return JSON.parse(JSON.stringify(elements.value))
}

function restoreState(entry) {
  if (!entry) {
    return
  }
  if (ctx.value && entry.canvas) {
    ctx.value.putImageData(entry.canvas, 0, 0)
    canvasSnapshot.value = entry.canvas
  }
  if (entry.elements) {
    elements.value = JSON.parse(JSON.stringify(entry.elements))
  }
}

function saveState(options = {}) {
  const { captureCanvas = false } = options
  let canvasData = canvasSnapshot.value
  if (ctx.value && (captureCanvas || !canvasData)) {
    canvasData = ctx.value.getImageData(0, 0, SHEET_WIDTH, SHEET_HEIGHT)
    canvasSnapshot.value = canvasData
  }
  const snapshot = {
    canvas: canvasData,
    elements: cloneElementsState(),
  }
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(snapshot)
  if (history.value.length > maxHistory) {
    history.value.shift()
    historyIndex.value = Math.max(historyIndex.value - 1, -1)
  }
  historyIndex.value = history.value.length - 1
}

function undo() {
  if (historyIndex.value <= 0) {
    return
  }
  historyIndex.value -= 1
  restoreState(history.value[historyIndex.value])
}

function redo() {
  if (historyIndex.value >= history.value.length - 1) {
    return
  }
  historyIndex.value += 1
  restoreState(history.value[historyIndex.value])
}

function clearCanvas() {
  if (!ctx.value) {
    return
  }
  ctx.value.clearRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT)
  history.value = []
  historyIndex.value = -1
  saveState({ captureCanvas: true })
}

async function downloadSheet() {
  const surface = sheetSurfaceRef.value
  if (surface) {
    const exportCanvas = await html2canvas(surface, {
      backgroundColor: '#ffffff',
      scale: window.devicePixelRatio > 1 ? 2 : 1.5,
    })
    const link = document.createElement('a')
    link.href = exportCanvas.toDataURL('image/png')
    link.download = 'croqui-a4.png'
    link.click()
    return
  }

  const canvas = sheetCanvas.value
  if (!canvas) {
    return
  }
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = 'croqui-a4.png'
  link.click()
}

function clamp(value, min, max) {
  if (max <= min) {
    return min
  }
  return Math.min(Math.max(value, min), max)
}

function handleKeyboardShortcuts(event) {
  if (event.key === 'Control' || event.key === 'Meta') {
    multiSelectMode.value = true
  }
  if (event.key === 'Escape') {
    if (connectorBinding.active) {
      event.preventDefault()
      cancelConnectionBinding()
      return
    }
    if (contextMenu.visible) {
      event.preventDefault()
      closeContextMenu()
      return
    }
    if (!inlineEditor.id) {
      event.preventDefault()
      clearSelection()
    }
    return
  }
  if (inlineEditor.id) {
    return
  }
  const isAccelKey = event.ctrlKey || event.metaKey
  const key = event.key.toLowerCase()
  if (!isAccelKey && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    if (selectedElementCount.value > 0) {
      event.preventDefault()
      const step = event.shiftKey ? 10 : 1
      switch (key) {
        case 'arrowup':
          nudgeSelection(0, -step)
          break
        case 'arrowdown':
          nudgeSelection(0, step)
          break
        case 'arrowleft':
          nudgeSelection(-step, 0)
          break
        case 'arrowright':
          nudgeSelection(step, 0)
          break
        default:
          break
      }
    }
    return
  }
  if (!isAccelKey && (key === 'delete' || key === 'backspace')) {
    if (selectedElementCount.value > 0) {
      event.preventDefault()
      deleteSelectedElements()
      closeContextMenu()
    }
    return
  }
  if (isAccelKey && !event.shiftKey && key === 'c') {
    event.preventDefault()
    copySelectedElements()
    closeContextMenu()
    return
  }
  if (isAccelKey && !event.shiftKey && key === 'v') {
    event.preventDefault()
    pasteClipboardElements()
    closeContextMenu()
    return
  }
  if (isAccelKey && !event.shiftKey && key === 'd') {
    event.preventDefault()
    duplicateSelectedElements()
    closeContextMenu()
    return
  }
  if (isAccelKey && !event.shiftKey && key === 'a') {
    event.preventDefault()
    selectAllElements()
    closeContextMenu()
    return
  }
  if (isAccelKey && !event.shiftKey && key === 'z') {
    event.preventDefault()
    undo()
    closeContextMenu()
    return
  }
  if (
    (isAccelKey && !event.shiftKey && key === 'y') ||
    (isAccelKey && event.shiftKey && key === 'z')
  ) {
    event.preventDefault()
    redo()
    closeContextMenu()
    return
  }
  if (isAccelKey && key === 's') {
    event.preventDefault()
    downloadSheet()
    closeContextMenu()
    return
  }
  if (isAccelKey && event.shiftKey && key === 'c') {
    event.preventDefault()
    clearCanvas()
    closeContextMenu()
  }
}

function handleKeyup(event) {
  if (event.key === 'Control' || event.key === 'Meta') {
    multiSelectMode.value = false
    cancelMarqueeSelection()
  }
}

function updateSheetSize() {
  const hasMeasuredStage = Boolean(sheetStageRef.value)
  const marginX = hasMeasuredStage ? 0 : SAFE_MARGIN_X * 2
  const marginY = hasMeasuredStage ? 0 : SAFE_MARGIN_Y
  const { width: measuredWidth, height: measuredHeight } = getMeasuredViewport()
  const viewportWidth = Math.max(measuredWidth - marginX, 320)
  const viewportHeight = Math.max(measuredHeight - marginY, 320)

  const usableWidth = viewportWidth
  const usableHeight = viewportHeight

  const baseWidth = Math.min(usableWidth, usableHeight * SHEET_RATIO)
  const baseHeight = baseWidth / SHEET_RATIO
  const width = baseWidth
  const height = baseHeight

  sheetSize.value = { width, height }
}

function getMeasuredViewport() {
  const stageEl = sheetStageRef.value
  if (stageEl) {
    const rect = stageEl.getBoundingClientRect()
    const computed = window.getComputedStyle(stageEl)
    const horizontalPadding =
      parseFloat(computed.paddingLeft || '0') + parseFloat(computed.paddingRight || '0')
    const verticalPadding =
      parseFloat(computed.paddingTop || '0') + parseFloat(computed.paddingBottom || '0')
    const width = rect.width - horizontalPadding
    const height = rect.height - verticalPadding
    if (width > 0 && height > 0) {
      return { width, height }
    }
  }
  return { width: window.innerWidth, height: window.innerHeight }
}

onMounted(() => {
  initCanvas()
  updateSheetSize()
  window.addEventListener('pointerup', stopDrawing)
  window.addEventListener('keydown', handleKeyboardShortcuts)
  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('resize', updateSheetSize)
  window.addEventListener('pointerdown', handleGlobalPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerup', stopDrawing)
  window.removeEventListener('pointermove', handleElementDrag)
  window.removeEventListener('pointerup', stopElementDrag)
  window.removeEventListener('keydown', handleKeyboardShortcuts)
  window.removeEventListener('keyup', handleKeyup)
  window.removeEventListener('resize', updateSheetSize)
  window.removeEventListener('pointerdown', handleGlobalPointerDown)
  window.removeEventListener('pointerup', finishConnectorHandleDrag)
  window.removeEventListener('pointermove', handleConnectorHandleMove)
})

watch([brushColor, brushSize, activeDrawTool], updateBrush)
watch(activeDrawTool, (tool) => {
  if (tool !== 'eraser') {
    hideEraserPreview()
  }
})
</script>

<style scoped>
.croqui-page {
  margin-top: 0;
  min-height: 100vh;
  padding: 18px 0 32px;
  background: linear-gradient(135deg, #dfe9ff, #f4f7ff);
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  justify-content: flex-start;
  overflow: auto;
}

.drawing-toolbar {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 10px 18px;
  box-shadow: 0 12px 30px rgba(13, 31, 60, 0.12);
}

.drawing-toolbar__button {
  border: 1px solid rgba(13, 31, 60, 0.18);
  background: transparent;
  color: #0d1f3c;
  border-radius: 999px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 600;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.drawing-toolbar__button:hover {
  background: rgba(13, 31, 60, 0.08);
  transform: translateY(-1px);
}

.drawing-toolbar__button--active {
  background: #1a5fb4;
  color: #fff;
  border-color: #1a5fb4;
  box-shadow: 0 8px 18px rgba(26, 95, 180, 0.35);
}

.sheet-stage {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px 16px;
  gap: 18px;
}

.selection-toolbar {
  width: min(720px, 100%);
  background: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(13, 30, 73, 0.18);
  padding: 14px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.selection-toolbar--fixed {
  position: sticky;
  top: 12px;
  align-self: center;
  margin-bottom: 0;
  z-index: 60;
}

.selection-toolbar__title {
  font-weight: 700;
  color: #0d1f3c;
}

.selection-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.selection-toolbar__actions button {
  border: 1px solid rgba(13, 31, 60, 0.2);
  background: #f4f7ff;
  color: #0d1f3c;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.selection-toolbar__actions button:hover:not(:disabled) {
  background: #e0edff;
  transform: translateY(-1px);
}

.selection-toolbar__actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.selection-toolbar__divider {
  width: 1px;
  height: 28px;
  background: rgba(13, 31, 60, 0.15);
}

.selection-marquee {
  position: absolute;
  z-index: 5;
  border: 2px dashed rgba(15, 82, 186, 0.7);
  background: rgba(15, 82, 186, 0.15);
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  pointer-events: none;
}

.eraser-preview {
  position: absolute;
  z-index: 6;
  border: 2px dashed rgba(13, 31, 60, 0.6);
  border-radius: 50%;
  background: rgba(13, 31, 60, 0.08);
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(13, 31, 60, 0.25);
}

.connector-preview-line {
  position: absolute;
  z-index: 4;
  border-radius: 999px;
  background-image: linear-gradient(
    90deg,
    var(--connector-preview-color, #0d1f3c) 0 50%,
    rgba(13, 31, 60, 0) 50% 100%
  );
  background-size: 18px 6px;
  opacity: 0.9;
  pointer-events: none;
  animation: connector-preview-dash 0.45s linear infinite;
  box-shadow: 0 6px 16px rgba(13, 31, 60, 0.25);
}

@keyframes connector-preview-dash {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 18px 0;
  }
}

.context-menu {
  position: fixed;
  z-index: 50;
  min-width: 220px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(13, 31, 60, 0.12);
  box-shadow: 0 24px 50px rgba(13, 31, 60, 0.2);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.context-menu__section {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.context-menu__section + .context-menu__section {
  padding-top: 8px;
  border-top: 1px solid rgba(13, 31, 60, 0.08);
}

.context-menu__section--connector {
  flex-direction: column;
  align-items: stretch;
}

.context-menu__connector-row {
  width: 100%;
  display: flex;
  gap: 6px;
}

.context-menu__connector-row button {
  flex: 1;
}

.context-menu__button,
.context-menu__inline-group button {
  border: 1px solid rgba(13, 31, 60, 0.18);
  background: #f9fbff;
  color: #0d1f3c;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.context-menu__button:hover:not(:disabled),
.context-menu__inline-group button:hover:not(:disabled) {
  background: #e0edff;
  transform: translateY(-1px);
}

.context-menu__button:disabled,
.context-menu__inline-group button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.context-menu__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5a6580;
}

.context-menu__inline-group {
  display: grid;
  grid-template-columns: repeat(6, minmax(32px, auto));
  gap: 4px;
}

.context-menu__color-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.context-menu__color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 2px solid rgba(13, 31, 60, 0.15);
  background: var(--swatch-color, #0d1f3c);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.context-menu__color-swatch:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.05);
  border-color: rgba(13, 31, 60, 0.35);
}

.context-menu__color-swatch:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.context-menu__color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #5a6580;
}

.context-menu__color-picker input[type='color'] {
  width: 36px;
  height: 24px;
  border: none;
  padding: 0;
  background: none;
}

.context-menu__color-picker input[type='color']:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.selection-toolbar-fade-enter-active,
.selection-toolbar-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.selection-toolbar-fade-enter-from,
.selection-toolbar-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.sheet-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 0;
}

.sheet-surface {
  position: relative;
  width: auto;
  height: auto;
  background: #fff;
  border: none;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  transition:
    width 0.25s ease,
    height 0.25s ease;
}

.sheet-surface::before {
  content: '';
  position: absolute;
  inset: 16px;
  border: none;
  pointer-events: none;
}

.sheet-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(transparent 97%, rgba(0, 0, 0, 0.04) 97%),
    linear-gradient(90deg, transparent 97%, rgba(0, 0, 0, 0.04) 97%);
  background-size: 32px 32px;
  pointer-events: none;
}

.drawing-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
}

.elements-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: 'Roboto', 'Segoe UI', sans-serif;
  color: #0d1f3c;
}

.sheet-element {
  position: absolute;
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.sheet-element--text {
  justify-content: flex-start;
  align-items: flex-start;
}

.sheet-element--card {
  align-items: stretch;
}

.sheet-element--selected {
  outline: 2px dashed #1e88e5;
  outline-offset: 3px;
}

.sheet-element--editing {
  cursor: text;
  user-select: text;
}

.shape-render {
  width: 100%;
  height: 100%;
  border: 1.5px solid var(--shape-color);
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--shape-color);
  position: relative;
}

.shape-render--rect-solid {
  background: var(--shape-color);
}

.shape-render--rect-outline {
  background: #fff;
}

.shape-render--rect-split-left {
  background: linear-gradient(90deg, var(--shape-color) 0 50%, #fff 50% 100%);
}

.shape-render--rect-split-right {
  background: linear-gradient(270deg, var(--shape-color) 0 50%, #fff 50% 100%);
}

.shape-render--circle-outline,
.shape-render--circle-solid,
.shape-render--circle-half,
.shape-render--dot {
  border-radius: 999px;
}

.shape-render--circle-solid {
  background: var(--shape-color);
}

.shape-render--circle-half {
  background: linear-gradient(90deg, var(--shape-color) 0 50%, transparent 50% 100%);
}

.shape-render--dot {
  background: var(--shape-color);
  width: 40%;
  height: 40%;
}

.shape-render--triangle-up,
.shape-render--triangle-down,
.shape-render--diamond {
  border: none;
  background: var(--shape-color);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}

.shape-render--triangle-up {
  clip-path: polygon(50% 0, 0 100%, 100% 100%);
}

.shape-render--triangle-down {
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.shape-render--plus,
.shape-render--xmark {
  border: none;
  background: transparent;
}

.shape-render--plus::before,
.shape-render--plus::after,
.shape-render--xmark::before,
.shape-render--xmark::after {
  content: '';
  position: absolute;
  background: var(--shape-color);
  border-radius: 2px;
}

.shape-render--plus::before,
.shape-render--plus::after {
  width: 20%;
  height: 70%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.shape-render--plus::after {
  width: 70%;
  height: 20%;
}

.shape-render--xmark::before,
.shape-render--xmark::after {
  width: 20%;
  height: 90%;
  left: 50%;
  top: 50%;
}

.shape-render--xmark::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.shape-render--xmark::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.shape-render--badge {
  background: transparent;
  border-radius: 6px;
  padding: 2px 4px;
}

.shape-render__text {
  font-size: 0.75rem;
}

.shape-render--antenna-solid,
.shape-render--antenna-hollow {
  border-radius: 20px;
  background: var(--shape-color);
  position: relative;
}

.shape-render--antenna-hollow {
  background: transparent;
}

.shape-render--antenna-solid::after,
.shape-render--antenna-hollow::after {
  content: '';
  position: absolute;
  width: 40%;
  height: 40%;
  border-radius: 999px;
  border: 1.5px solid var(--shape-color);
  background: var(--shape-color);
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
}

.shape-render--antenna-hollow::after {
  background: transparent;
}

.shape-render--line-solid,
.shape-render--line-dashed {
  height: 4px;
  border: none;
  border-radius: 999px;
}

.shape-render--line-solid {
  background: var(--shape-color);
}

.shape-render--line-dashed {
  background-image: linear-gradient(
    90deg,
    var(--shape-color) 0 40%,
    transparent 40% 60%,
    var(--shape-color) 60% 100%
  );
  background-size: 18px 4px;
}

.connector-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--shape-color, #0d1f3c);
  background: #fff;
  box-shadow: 0 2px 6px rgba(13, 31, 60, 0.25);
  pointer-events: auto;
  cursor: grab;
  z-index: 2;
}

.connector-handle:active {
  cursor: grabbing;
}

.connector-handle--start {
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
}

.connector-handle--end {
  top: 50%;
  left: 100%;
  transform: translate(-50%, -50%);
}

.text-render {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  line-height: 1.3;
  width: 100%;
  height: 100%;
}

.card-render {
  width: 100%;
  height: 100%;
  border: 1.4px solid #0d1f3c;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.85rem;
  background: rgba(244, 247, 255, 0.95);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.card-render--highlight {
  border-color: #d6a300;
  background: rgba(255, 247, 213, 0.92);
}

.tower-render {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(0, 0, 0, 0.25));
  background-color: var(--tower-color, #6f7891);
  border: 1px solid #1b2438;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  box-shadow: inset -4px 0 4px rgba(0, 0, 0, 0.25);
  position: relative;
}

.tower-render::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 20px;
  width: 36px;
  height: 2px;
  background: linear-gradient(90deg, #6fa8dc, var(--tower-color, #0d1f3c));
  transform: rotate(-12deg);
}

.tower-render__label {
  padding-bottom: 6px;
  font-size: 0.85rem;
}

.meta-render {
  width: 100%;
  height: 100%;
  border: 1.5px solid #0d1f3c;
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
}

.meta-render__title {
  text-align: center;
  text-transform: uppercase;
  font-weight: 700;
  padding: 6px;
  border-bottom: 1px solid #0d1f3c;
  letter-spacing: 1px;
}

.meta-render__row {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  gap: 6px;
  padding: 4px 8px;
  border-top: 1px solid #0d1f3c;
  align-items: center;
}

.meta-render__row--single {
  grid-template-columns: auto 1fr;
}

.meta-render__line {
  min-height: 14px;
  border-bottom: 1px solid #0d1f3c;
}

.inline-editor {
  width: 100%;
  height: 100%;
  border: 2px dashed #1e88e5;
  border-radius: 8px;
  padding: 6px 8px;
  font: inherit;
  color: inherit;
  background: rgba(255, 255, 255, 0.95);
  resize: none;
  outline: none;
  line-height: 1.3;
  box-shadow: inset 0 1px 2px rgba(13, 30, 73, 0.12);
  user-select: text;
}

.inline-editor--badge {
  text-align: center;
  padding: 0 4px;
  height: auto;
}

@media (max-width: 700px) {
  .sheet-surface {
    width: 100vw;
    border-radius: 0;
    border-width: 0;
  }
}
</style>
