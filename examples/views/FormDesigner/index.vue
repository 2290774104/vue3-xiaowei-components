<template>
  <div class="designer-page">
    <div class="designer-header">
      <span class="title">表单设计器</span>
      <div class="header-actions">
        <el-button type="success" size="small" @click="exportConfig">
          导出配置
        </el-button>
      </div>
    </div>

    <div class="designer-body">
      <!-- 左侧：组件面板 -->
      <aside class="palette">
        <div class="panel-title">表单控件</div>
        <div
          v-for="ctrl in controlList"
          :key="ctrl.type"
          class="palette-item"
          draggable="true"
          @dragstart="onPaletteDragStart($event, ctrl.type)"
        >
          <el-icon><component :is="ctrl.icon" /></el-icon>
          <span>{{ ctrl.label }}</span>
        </div>
      </aside>

      <!-- 中间：画布（直接渲染真实表单项） -->
      <main
        class="canvas"
        @dragover.prevent
        @drop.prevent="onDropToCanvas"
      >
        <el-form
          v-if="fields.length"
          :model="previewModel"
          :label-width="config.labelWidth"
          :label-position="config.labelPosition"
          :size="config.size"
        >
          <el-row :gutter="config.gutter">
            <el-col
              v-for="(field, index) in fields"
              :key="field.prop"
              :span="field.span ?? 12"
            >
              <div
                class="field-wrapper"
                :class="{ active: field.prop === selectedProp }"
                draggable="true"
                @click="selectField(field)"
                @dragstart="onFieldDragStart($event, index)"
                @dragover.prevent="onFieldDragOver($event, index)"
                @drop.prevent="onDropToField($event, index)"
              >
                <el-icon class="drag-icon"><Rank /></el-icon>
                <el-form-item
                  :label="field.label"
                  :prop="field.prop"
                  :required="field.required"
                  class="field-form-item"
                >
                  <form-field
                    v-model="previewModel[field.prop]"
                    :item="field"
                  />
                </el-form-item>
                <el-icon
                  class="delete-icon"
                  @click.stop="removeField(index)"
                >
                  <Delete />
                </el-icon>
              </div>
            </el-col>
          </el-row>
        </el-form>
        <div v-else class="empty-tip">
          从左侧拖拽控件到此处，直接生成表单项
        </div>
      </main>

      <!-- 右侧：属性配置 -->
      <aside class="props-panel">
        <div class="panel-title">属性配置</div>
        <template v-if="selected">
          <el-form label-width="72px" size="small">
            <el-form-item label="标题">
              <el-input v-model="selected.label" />
            </el-form-item>
            <el-form-item label="字段名">
              <el-input v-model="selected.prop" />
            </el-form-item>
            <el-form-item label="栅格占位">
              <el-input-number
                v-model="selected.span"
                :min="1"
                :max="24"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="占位符">
              <el-input v-model="selected.placeholder" />
            </el-form-item>
            <el-form-item label="必填">
              <el-switch v-model="selected.required" />
            </el-form-item>
            <el-form-item label="可清空">
              <el-switch v-model="selected.clearable" />
            </el-form-item>
            <el-form-item label="禁用">
              <el-switch v-model="selected.disabled" />
            </el-form-item>
          </el-form>

          <template v-if="hasOptions(selected.type)">
            <div class="options-header">
              <span>选项配置</span>
              <el-button
                size="small"
                type="primary"
                text
                @click="addOption"
              >
                + 添加
              </el-button>
            </div>
            <div
              v-for="(opt, idx) in selected.options"
              :key="idx"
              class="option-row"
            >
              <el-input v-model="opt.label" placeholder="标签" />
              <el-input v-model="opt.value" placeholder="值" />
              <el-icon class="delete-icon" @click="removeOption(idx)">
                <Delete />
              </el-icon>
            </div>
          </template>
        </template>
        <div v-else class="empty-tip">点击画布中的表单项进行配置</div>
      </aside>
    </div>

    <!-- 导出弹窗 -->
    <el-dialog v-model="exportVisible" title="导出配置项" width="640px">
      <div class="export-toolbar">
        <el-button size="small" @click="copyConfig">复制配置</el-button>
        <el-button size="small" type="primary" @click="downloadConfig">
          下载 JSON
        </el-button>
      </div>
      <pre class="export-json">{{ exportJson }}</pre>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Rank,
  Delete,
  EditPen,
  Document,
  Calendar,
  Switch,
  Checked,
  Star,
  Timer,
} from '@element-plus/icons-vue';
import FormField from 'component/Form/modules/FormField.vue';
import type { IFormItem, IFormConfig, FormItemType } from 'component/Form/types';

// 左侧可拖拽控件列表
const controlList: { type: FormItemType; label: string; icon: any }[] = [
  { type: 'input', label: '输入框', icon: EditPen },
  { type: 'textarea', label: '文本域', icon: Document },
  { type: 'number', label: '数字', icon: Document },
  { type: 'select', label: '下拉选择', icon: Document },
  { type: 'radio', label: '单选框', icon: Checked },
  { type: 'checkbox', label: '多选框', icon: Checked },
  { type: 'switch', label: '开关', icon: Switch },
  { type: 'date', label: '日期', icon: Calendar },
  { type: 'datetime', label: '日期时间', icon: Timer },
  { type: 'rate', label: '评分', icon: Star },
  { type: 'slider', label: '滑块', icon: Rank },
];

// 各控件类型是否有选项
const hasOptions = (type?: FormItemType) =>
  ['select', 'radio', 'checkbox'].includes(type || '');

// 默认值生成
const getDefaultValue = (type?: FormItemType): any => {
  switch (type) {
    case 'checkbox':
      return [];
    case 'switch':
      return false;
    case 'number':
      return undefined;
    case 'rate':
    case 'slider':
      return 0;
    default:
      return '';
  }
};

// 表单整体配置
const config = reactive<IFormConfig>({
  labelWidth: '80px',
  labelPosition: 'right',
  size: 'default',
  inline: false,
  gutter: 0,
  items: [],
  model: {},
});

// 设计中的字段列表
const fields = reactive<IFormItem[]>([]);
const selectedProp = ref<string | null>(null);
const selected = computed<IFormItem | null>(
  () => fields.find((f) => f.prop === selectedProp.value) || null,
);

const exportVisible = ref(false);
const exportJson = ref('');
const previewModel = reactive<Record<string, any>>({});

// 同步 config.items 与 fields
watch(
  fields,
  () => {
    config.items = [...fields];
    syncPreviewModel();
  },
  { deep: true },
);

const syncPreviewModel = () => {
  Object.keys(previewModel).forEach((k) => delete previewModel[k]);
  fields.forEach((f) => {
    previewModel[f.prop] = getDefaultValue(f.type);
  });
};

// 新建一个字段
const createField = (type: FormItemType): IFormItem => {
  const field: IFormItem = {
    type,
    label: `${controlList.find((c) => c.type === type)?.label}${fields.length + 1}`,
    prop: `${type}${fields.length + 1}`,
    span: 12,
    required: false,
    clearable: true,
    placeholder: '',
  };
  if (hasOptions(type)) {
    field.options = [
      { label: '选项一', value: '1' },
      { label: '选项二', value: '2' },
    ];
  }
  return field;
};

const addField = (type: FormItemType, index?: number) => {
  const field = createField(type);
  if (index === undefined) {
    fields.push(field);
  } else {
    fields.splice(index, 0, field);
  }
  selectedProp.value = field.prop;
};

// 拖拽状态
let dragType: FormItemType | null = null;
let dragIndex: number | null = null;

const onPaletteDragStart = (e: DragEvent, type: FormItemType) => {
  dragType = type;
  dragIndex = null;
  e.dataTransfer?.setData('text/plain', type);
};

const onFieldDragStart = (e: DragEvent, index: number) => {
  dragIndex = index;
  dragType = null;
  e.dataTransfer?.setData('text/plain', String(index));
};

const onDropToCanvas = () => {
  if (dragType) {
    addField(dragType);
  }
  dragType = null;
  dragIndex = null;
};

const onFieldDragOver = (_e: DragEvent, index: number) => {
  if (dragIndex !== null && dragIndex !== index) {
    const moved = fields.splice(dragIndex, 1)[0];
    if (moved) {
      fields.splice(index, 0, moved);
      dragIndex = index;
    }
  }
};

const onDropToField = (_e: DragEvent, index: number) => {
  if (dragType) {
    addField(dragType, index);
  }
  dragType = null;
  dragIndex = null;
};

const selectField = (field: IFormItem) => {
  selectedProp.value = field.prop;
};

const removeField = (index: number) => {
  fields.splice(index, 1);
  if (selectedProp.value && !fields.some((f) => f.prop === selectedProp.value)) {
    selectedProp.value = null;
  }
};

const addOption = () => {
  if (selected.value) {
    selected.value.options?.push({ label: '新选项', value: String(Date.now()) });
  }
};

const removeOption = (idx: number) => {
  selected.value?.options?.splice(idx, 1);
};

// 导出
const buildExportConfig = (): IFormConfig => {
  const model: Record<string, any> = {};
  fields.forEach((f) => {
    model[f.prop] = getDefaultValue(f.type);
  });
  return {
    labelWidth: config.labelWidth,
    labelPosition: config.labelPosition,
    size: config.size,
    inline: config.inline,
    gutter: config.gutter,
    items: JSON.parse(JSON.stringify(fields)),
    model,
  };
};

const exportConfig = () => {
  exportJson.value = JSON.stringify(buildExportConfig(), null, 2);
  exportVisible.value = true;
};

const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(exportJson.value);
    ElMessage.success('已复制到剪贴板');
  } catch {
    ElMessage.error('复制失败，请手动复制');
  }
};

const downloadConfig = () => {
  const blob = new Blob([exportJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'form-config.json';
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<style lang="scss" scoped>
.designer-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 16px);
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.designer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;

  .title {
    font-weight: 600;
  }
}

.designer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.palette,
.props-panel {
  width: 220px;
  flex-shrink: 0;
  background: #fafafa;
  overflow-y: auto;
  padding: 12px;
}

.panel-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: grab;
  user-select: none;

  &:hover {
    border-color: #409eff;
    color: #409eff;
  }
}

.canvas {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f6f8;
  min-height: 300px;
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
}

.field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  margin-bottom: 8px;
  border: 1px dashed transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
  }

  &.active {
    border-color: #409eff;
    background: #ecf5ff;
  }

  .drag-icon {
    flex-shrink: 0;
    color: #c0c4cc;
    cursor: move;
  }

  .field-form-item {
    flex: 1;
    margin-bottom: 0;
  }

  .delete-icon {
    flex-shrink: 0;
    color: #f56c6c;
    cursor: pointer;
    visibility: hidden;
  }

  &:hover .delete-icon,
  &.active .delete-icon {
    visibility: visible;
  }
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 60px 0;
}

.props-panel {
  border-left: 1px solid #e4e7ed;
}

.options-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
  font-weight: 600;
}

.option-row {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;

  .delete-icon {
    color: #f56c6c;
    cursor: pointer;
    align-self: center;
  }
}

.export-toolbar {
  margin-bottom: 12px;
}

.export-json {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow: auto;
  max-height: 400px;
  font-size: 12px;
}
</style>
