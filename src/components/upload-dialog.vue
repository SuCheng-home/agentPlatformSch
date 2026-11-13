<template>
  <el-dialog
    :title="isEdit ? '编辑智能体/工具' : '上传智能体/工具'"
    custom-class="upload-dialog"
    width="850px"
    :visible="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:visible="onVisibleChange"
    @closed="handleClosed"
  >
    <!-- 步骤条：基础信息 → 接入配置 → 分类信息 -->
    <div class="wizard-steps">
      <div
        v-for="(label, index) in stepLabels"
        :key="label"
        class="wz-step"
        :class="{ active: step === index + 1, done: step > index + 1 }"
      >
        <span class="wz-num">{{ index + 1 }}</span>{{ label }}
      </div>
    </div>

    <el-form ref="uploadForm" :model="form" :rules="formRules" label-position="top" class="upload-form">

      <!-- 第一步：基础信息 + 选择类型 -->
      <div v-show="step === 1" class="up-step">
        <div class="form-section">
          <div class="form-section-title">
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.info" />
            </svg>
            基础信息
          </div>
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入智能体/工具名称" maxlength="50" />
          </el-form-item>
        </div>
        <div class="form-section">
          <div class="form-section-title">
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.folder" />
            </svg>
            选择类型
            <span class="form-section-hint">决定下一步的接入方式</span>
          </div>
          <el-form-item prop="agentType" class="type-form-item">
            <div class="type-selector">
              <button
                v-for="item in agentTypeOptions"
                :key="item.value"
                type="button"
                class="type-option"
                :class="{ selected: form.agentType === item.value }"
                @click="selectAgentType(item.value)"
              >
                <span class="type-option-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="icons[item.icon]" />
                  </svg>
                </span>
                <span class="type-option-title">{{ item.title }}</span>
                <span class="type-option-desc">{{ item.desc }}</span>
                <span class="type-option-hint">{{ item.hint }}</span>
              </button>
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- 第二步：接入配置（按智能体类型展示对应的接入方式） -->
      <div v-show="step === 2" class="up-step">
        <!-- 智能体：接入类型可选 扣子智能体 / 扣子编程 / URL 链接 -->
        <div v-if="form.agentType === 'agent'" class="form-section">
          <div class="form-section-title">
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.agents" />
            </svg>
            智能体接入
          </div>
          <div class="sub-tabs">
            <button
              v-for="item in agentAccessOptions"
              :key="item.value"
              type="button"
              class="sub-tab"
              :class="{ active: form.accessType === item.value }"
              @click="selectAccessType(item.value)"
            >{{ item.label }}</button>
          </div>

          <div v-if="form.accessType === 'coze'" class="form-grid form-grid2">
            <el-form-item label="Bot ID" prop="kouzi.botId">
              <el-input v-model="form.kouzi.botId" placeholder="例如：7301234567890123456" maxlength="50" />
              <small class="form-hint">扣子平台 → 智能体 → 开发设置中查看</small>
            </el-form-item>
            <el-form-item label="Access Token" prop="kouzi.token">
              <el-input v-model="form.kouzi.token" type="password" show-password placeholder="pat_xxxxxxxxxxxxxxxx" maxlength="100" />
              <small class="form-hint">扣子平台 → 系统设置 → API 中创建</small>
            </el-form-item>
          </div>

          <div v-else-if="form.accessType === 'cozeCoding'" class="form-grid form-grid2">
            <el-form-item label="项目 ID" prop="coding.projectId">
              <el-input v-model="form.coding.projectId" placeholder="例如：7681142016050511935" maxlength="30" />
              <small class="form-hint">扣子编程 → 项目设置中查看项目 ID</small>
            </el-form-item>
            <el-form-item label="Access Token" prop="coding.token">
              <el-input v-model="form.coding.token" type="password" show-password placeholder="pat_xxxxxxxxxxxxxxxx" maxlength="100" />
              <small class="form-hint">扣子编程平台 → 系统设置 → API 中创建</small>
            </el-form-item>
          </div>

          <el-form-item v-else-if="form.accessType === 'url'" label="URL 地址" prop="accessUrl">
            <el-input v-model="form.accessUrl" placeholder="https://your-agent.com/xxxx" maxlength="200" />
            <small class="form-hint">智能体部署后的在线访问地址，仅支持可公网访问的 URL</small>
          </el-form-item>
        </div>

        <!-- 实用工具：接入类型可选 单个 HTML 文件 / URL 链接 -->
        <div v-else-if="form.agentType === 'tool'" class="form-section">
          <div class="form-section-title">
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.tools" />
            </svg>
            实用工具接入
          </div>
          <div class="sub-tabs">
            <button
              v-for="item in toolAccessOptions"
              :key="item.value"
              type="button"
              class="sub-tab"
              :class="{ active: form.accessType === item.value }"
              @click="selectAccessType(item.value)"
            >{{ item.label }}</button>
          </div>

          <el-form-item v-if="form.accessType === 'html'" prop="htmlFiles">
            <ImageUploader
              v-model="form.htmlFiles"
              mode="attachment"
              :accept="['.html', '.htm']"
              :max-size="50"
              :max-count="1"
              tip="选择一个完整的 HTML 文件，最大 50MB"
              @change="handleHtmlFilesChange"
              @success="handleHtmlUploaded"
            >
              <div class="file-upload">
                <div class="file-upload-emoji">📄</div>
                <div class="file-upload-text">{{ form.htmlFiles.length ? '已上传 HTML 文件，点击可重新选择' : '点击上传 HTML 单文件' }}</div>
              </div>
            </ImageUploader>
          </el-form-item>

          <el-form-item v-else label="URL 地址" prop="accessUrl">
            <el-input v-model="form.accessUrl" placeholder="https://your-tool.com/xxxx" maxlength="200" />
            <small class="form-hint">工具部署后的在线访问地址，仅支持可公网访问的 URL</small>
          </el-form-item>
        </div>

        <!-- 教学资源：接入类型固定为其他文件 -->
        <div v-else-if="form.agentType === 'resource'" class="form-section">
          <div class="form-section-title">
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.book" />
            </svg>
            教学资源文件
            <span class="form-section-hint">接入类型：其他文件</span>
          </div>
          <el-form-item prop="otherFiles">
            <ImageUploader
              v-model="form.otherFiles"
              mode="attachment"
              :accept="['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf']"
              :max-size="200"
              :max-count="1"
              tip="支持 Word、Excel、PPT、PDF 格式，最大 200MB"
              @change="handleOtherFilesChange"
            >
              <div class="file-upload">
                <div class="file-upload-emoji">📚</div>
                <div class="file-upload-text">{{ form.otherFiles.length ? '已上传文件，点击可重新选择' : '点击上传文件' }}</div>
              </div>
            </ImageUploader>
          </el-form-item>
        </div>
      </div>

      <!-- 第三步：分类信息 + 展示信息 -->
      <div v-show="step === 3" class="up-step">
        <div class="form-section">
          <div class="form-section-title">
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.tag" />
            </svg>
            分类信息
          </div>
          <div class="form-grid form-grid2">
            <el-form-item label="学科" prop="subjectCodes">
              <el-select filterable
                v-model="form.subjectCodes"
                placeholder="请选择"
                @change="handleSubjectChange"
              >
                <el-option label="不限（跨学科通用）" :value="''" />
                <el-option v-for="item in subjectOptions" :key="item.id" :label="item.atlasName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="期次" prop="materialIds">
              <el-select filterable
                v-model="form.materialIds"
                :disabled="!form.subjectCodes"
                placeholder="请选择"
                @change="handleMaterialsChange"
              >
                <el-option label="不限（全年级·全册）" :value="''" />
                <el-option v-for="item in materialList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="章节" prop="chapterIds">
              <el-select v-model="form.chapterIds" placeholder="请选择"
                :disabled="!form.materialIds">
                <el-option label="不限（全章节适用）" :value="''" />
                <el-option v-for="item in unitOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </div>
        </div>
        <div class="form-section">
          <div class="form-section-title">
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.image" />
            </svg>
            展示信息
          </div>
          <div class="form-grid">
            <el-form-item label="截图">
              <ImageUploader
                ref="screenshotUploader"
                v-model="form.screenshotFiles"
                mode="image"
                layout="horizontal"
                :max-size="10"
                :max-count="5"
                :multiple="true"
                tip="展示运行界面，JPG/PNG，最多 5 张"
              >
                <div class="file-upload">
                  <div class="file-upload-emoji">🖼️</div>
                  <div class="file-upload-text">{{ form.screenshotFiles.length ? `已选择 ${form.screenshotFiles.length} 张截图` : '点击上传功能截图' }}</div>
                </div>
              </ImageUploader>
            </el-form-item>
            <el-form-item label="简介" prop="desc">
              <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="请简要描述功能特点" maxlength="200" />
            </el-form-item>
            <el-form-item label="制作者" prop="creator">
              <el-input v-model="form.creator" placeholder="请输入制作者姓名" maxlength="30" />
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>

    <!-- 隐藏 iframe：用于加载上传的 HTML 供 html2canvas 截图（离屏渲染，保持尺寸以正确出图） -->
    <iframe ref="htmlSnapIframe" class="html-snap-iframe" title="html-snapshot" scrolling="no"></iframe>

    <div slot="footer" class="upload-actions">
      <button class="btn btn-secondary" type="button" @click="prevStep">{{ step === 1 ? '取消' : '上一步' }}</button>
      <button class="btn btn-primary" type="button" @click="nextStep">{{ step === stepLabels.length ? '提交' : '下一步' }}</button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { store as authStore } from 'auth-layout-wxj';
import html2canvas from 'html2canvas';
import { ICONS } from '@/constants/icons';
import ImageUploader from './image-uploader.vue';
import { pageByOrg, materialChapterTree } from '@/api/common';
import { addAgent, getAgentDetail, updateAgent } from '@/api/agent';
import { APPROVAL_STATUS_PENDING, APPROVAL_STATUS_MANAGE } from '@/constants/agentStatus';

// 智能体类型选项（第一步选择，决定第二步的接入方式）
const AGENT_TYPE_OPTIONS = [
  { value: 'agent', icon: 'agents', title: '智能体', desc: '对话式 AI 应用', hint: '主要来源于扣子（Coze）平台' },
  { value: 'tool', icon: 'tools', title: '实用工具', desc: '即开即用的互动应用', hint: 'HTML 互动课件、交互小游戏等' },
  { value: 'resource', icon: 'book', title: '教学资源', desc: '教学文档与课件', hint: 'Word、PPT、Excel 等格式' }
];

// 智能体的接入类型选项（第二步切换）
const AGENT_ACCESS_OPTIONS = [
  { value: 'coze', label: '🔧 扣子智能体 ' },
  { value: 'cozeCoding', label: '🚀 扣子编程' },
  { value: 'url', label: '🔗 URL 链接' }
];

// 实用工具的接入类型选项（第二步切换）
const TOOL_ACCESS_OPTIONS = [
  { value: 'html', label: '📄 单个 HTML 文件' },
  { value: 'url', label: '🔗 URL 链接' }
];

// 智能体类型 → 接入类型：智能体固定扣子平台，教学资源固定其他文件，实用工具默认单个 HTML
const AGENT_TYPE_ACCESS_MAP = { agent: 'coze', tool: 'html', resource: 'other' };

// 接入类型 → 智能体类型：兼容历史数据未带 agentType 的回填场景
const ACCESS_AGENT_TYPE_MAP = { coze: 'agent', cozeCoding: 'agent', html: 'tool', url: 'tool', other: 'resource' };

// 各接入类型第二步需校验的表单字段
const ACCESS_FORM_FIELDS = {
  html: ['htmlFiles'],
  coze: ['kouzi.botId', 'kouzi.token'],
  cozeCoding: ['coding.token', 'coding.projectId'],
  url: ['accessUrl'],
  other: ['otherFiles']
};

// 接入方式编码映射：与后端 accessType 约定一致
const ACCESS_TYPE_MAP = {
  html: 1001,
  coze: 1003,
  other: 1005,
  url: 1006,
  cozeCoding: 1007
};
const ACCESS_TYPE_VALUE_MAP = { 1001: 'html', 1003: 'coze', 1005: 'other', 1006: 'url', 1007: 'cozeCoding' };

// 智能体类型编码：与后端 agentType 约定一致（1 智能体，2 实用工具，3 教学资源）
const AGENT_TYPE_CODE_MAP = { agent: 1, tool: 2, resource: 3 };
const AGENT_TYPE_VALUE_MAP = { 1: 'agent', 2: 'tool', 3: 'resource' };

function createEmptyForm() {
  return {
    // agentType 第一步所选类型；accessType 第二步实际接入方式
    agentType: '',
    accessType: '',
    name: '',
    desc: '',
    creator: '',
    subjectCodes: '',
    materialIds: '',
    chapterIds: '',
    accessUrl: '',
    kouzi: {
      botId: '',
      token: '',
      baseUrl: 'https://api.coze.cn'
    },
    // 扣子编程接入配置：token、项目 ID、部署域名
    coding: {
      token: '',
      projectId: '',
      baseUrl: ''
    },
    // 已上传文件（FileJson 数组），分别对应截图、HTML 单文件、其他文件
    screenshotFiles: [],
    htmlFiles: [],
    otherFiles: []
  };
}
export default {
  name: 'UploadDialog',
  components: {
    ImageUploader
  },
  data() {
    // 接入配置校验仅对当前接入类型生效，其余类型直接通过
    const requireTextWhen = (accessType, message) => (rule, value, callback) => {
      if (this.form.accessType !== accessType || (value && String(value).trim())) {
        callback();
        return;
      }
      callback(new Error(message));
    };
    const requireFilesWhen = (accessType, message) => (rule, value, callback) => {
      if (this.form.accessType !== accessType || (value && value.length)) {
        callback();
        return;
      }
      callback(new Error(message));
    };
    // URL 格式校验：仅对当前接入类型生效，须为合法的 http(s) 公网地址
    const URL_PATTERN = /^https?:\/\/(([\w-]+\.)+[a-zA-Z]{2,}|((\d{1,3}\.){3}\d{1,3})|localhost)(:\d{2,5})?(\/\S*)?$/;
    const validateUrlWhen = (accessType) => (rule, value, callback) => {
      if (this.form.accessType !== accessType || !String(value || '').trim()) {
        callback();
        return;
      }
      if (!URL_PATTERN.test(String(value).trim())) {
        callback(new Error('请输入正确的 URL 地址，需以 http:// 或 https:// 开头'));
        return;
      }
      callback();
    };
    return {
      icons: ICONS,
      agentTypeOptions: AGENT_TYPE_OPTIONS,
      agentAccessOptions: AGENT_ACCESS_OPTIONS,
      toolAccessOptions: TOOL_ACCESS_OPTIONS,
      form: createEmptyForm(),
      isEdit: false,
      // 向导当前步骤：1 基础信息 / 2 接入配置 / 3 分类信息
      step: 1,
      stepLabels: ['基础信息', '接入配置', '分类信息'],
      // 接口数据源：教材列表、章节树
      materialList: [],
      unitOptions: [],
      formRules: {
        agentType: [{ required: true, message: '请选择类型', trigger: 'change' }],
        'kouzi.botId': [{ required: true, validator: requireTextWhen('coze', '请填写 Bot ID'), trigger: 'blur' }],
        'kouzi.token': [{ required: true, validator: requireTextWhen('coze', '请填写 Access Token'), trigger: 'blur' }],
        'coding.token': [{ required: true, validator: requireTextWhen('cozeCoding', '请填写 Access Token'), trigger: 'blur' }],
        'coding.projectId': [{ required: true, validator: requireTextWhen('cozeCoding', '请填写项目 ID'), trigger: 'blur' }],
        accessUrl: [
          { required: true, validator: requireTextWhen('url', '请填写 URL 地址'), trigger: 'blur' },
          { validator: validateUrlWhen('url'), trigger: ['blur', 'change'] }
        ],
        htmlFiles: [{ required: true, validator: requireFilesWhen('html', '请上传 HTML 单文件'), trigger: 'change' }],
        otherFiles: [{ required: true, validator: requireFilesWhen('other', '请上传文件'), trigger: 'change' }],
        name: [{ required: true, message: '请输入智能体/工具名称', trigger: 'blur' }],
        desc: [{ required: true, message: '请简要描述功能特点', trigger: 'blur' }],
        creator: [{ required: true, message: '请输入制作者姓名', trigger: 'blur' }],
        // subjectCodes: [{ required: true, message: '请选择学科', trigger: 'change' }],
        // materialIds: [{ required: true, message: '请选择期次', trigger: 'change' }]
      }
    };
  },
  computed: {
    ...mapGetters([
      'agent/subjectList',
      'agent/materialTree'
    ]),
    materialTree() {
      return this['agent/materialTree'];
    },
    visible() {
      return this.$store.state.agent.uploadVisible;
    },
    // 学科候选：接口全量学科
    subjectOptions() {
      return this['agent/subjectList'];
    },
    // 各步需校验的表单字段；接入配置步随所选接入类型动态确定
    stepFormFields() {
      return {
        1: ['name', 'agentType'],
        2: ACCESS_FORM_FIELDS[this.form.accessType] || [],
        3: ['subjectCodes', 'materialIds', 'desc', 'creator']
      };
    }
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.$store.state.agent.editAgent) {
          this.isEdit = true;
          this.populateFormFromAgent(this.$store.state.agent.editAgent);
          this.$store.commit('agent/SET_EDIT_AGENT', null);
        } else {
          this.isEdit = false;
          // 新建时制作者默认当前登录人姓名，可编辑修改
          this.form.creator = authStore.getters.name || '';
        }
        this.step = 1;
      }
    }
  },
  methods: {
    onVisibleChange(value) {
      this.$store.commit('agent/SET_UPLOAD_VISIBLE', value);
    },
    close() {
      this.$store.commit('agent/SET_UPLOAD_VISIBLE', false);
    },
    // 上一步：第一步时作为取消关闭弹窗
    prevStep() {
      if (this.step > 1) {
        this.step -= 1;
        return;
      }
      this.close();
    },
    // 下一步：先校验当前步字段，最后一步触发提交
    async nextStep() {
      const passed = await this.validateStep();
      if (!passed) {
        return;
      }
      if (this.step < this.stepLabels.length) {
        this.step += 1;
        return;
      }
      this.submit();
    },
    // 仅校验当前步涉及的表单项，全部通过才允许翻页
    validateStep() {
      const fields = this.stepFormFields[this.step] || [];
      if (!fields.length) {
        return Promise.resolve(true);
      }
      return new Promise((resolve) => {
        let done = 0;
        let passed = true;
        fields.forEach((prop) => {
          this.$refs.uploadForm.validateField(prop, (error) => {
            if (error) {
              passed = false;
            }
            done += 1;
            if (done === fields.length) {
              resolve(passed);
            }
          });
        });
      });
    },
    // 选择智能体类型：同步对应接入类型（实用工具默认单个 HTML 文件）
    selectAgentType(agentType) {
      this.form.agentType = agentType;
      this.form.accessType = AGENT_TYPE_ACCESS_MAP[agentType] || '';
      this.$nextTick(() => this.validateFormField('agentType'));
    },
    // 切换接入类型（智能体：扣子参数/URL；实用工具：HTML/URL）
    selectAccessType(accessType) {
      this.form.accessType = accessType;
    },
    // 获取教材列表：学校维度全量拉取，期次候选在前端按学科过滤
    loadMaterials() {
      if (!this.form.subjectCodes) {
        this.materialList = []
        return
      }
      pageByOrg(this.form.subjectCodes)
        .then((res) => {
          this.materialList = res.data || [];
        })
        .catch((error) => {
          console.warn('[UploadDialog] 获取教材列表失败：', error);
        });
    },
    // 获取教材章节树：初始化不传教材 ID，直接拉取全量章节
    loadUnitTree() {
      if (!this.form.materialIds) {
        this.unitOptions = []
        return
      };
      materialChapterTree(this.form.materialIds)
        .then((res) => {
          const materialObj = res.data[0] || {};
          this.unitOptions = materialObj.childrenList || [];
        })
        .catch((error) => {
          console.warn('[UploadDialog] 获取教材章节树失败：', error);
        });
    },
    // 依据所选接入类型构建接入配置 JSON 字符串
    buildAccessConfig() {
      switch (this.form.accessType) {
        case 'html':
          return JSON.stringify(this.form.htmlFiles);
        case 'coze':
          return JSON.stringify(this.form.kouzi);
        case 'cozeCoding':
          return JSON.stringify(this.form.coding);
        case 'url':
          return JSON.stringify({ url: this.form.accessUrl });
        case 'other':
          return JSON.stringify(this.form.otherFiles);
        default:
          return '';
      }
    },
    // 触发表单项校验，用于自定义控件变化后刷新校验状态
    validateFormField(prop) {
      if (this.$refs.uploadForm) {
        this.$refs.uploadForm.validateField(prop);
      }
    },
    handleHtmlFilesChange() {
      this.validateFormField('htmlFiles');
    },
    // HTML 上传成功：拿到本地原始文件后自动渲染截图并回填到“展示信息-截图”
    handleHtmlUploaded(fileJson, list, rawFile) {
      this.validateFormField('htmlFiles');
      if (rawFile) {
        this.captureHtmlScreenshot(rawFile);
      }
    },
    // 读取 HTML 文本写入同源 iframe（srcdoc），加载完成后截图
    captureHtmlScreenshot(file) {
      const reader = new FileReader();
      reader.onload = () => {
        const iframe = this.$refs.htmlSnapIframe;
        if (!iframe) {
          return;
        }
        // 截图视口对齐浏览器屏幕尺寸，避免响应式 HTML 因窄视口触发断点导致样式异常
        const snapWidth = window.innerWidth || document.documentElement.clientWidth || 1280;
        const snapHeight = window.innerHeight || document.documentElement.clientHeight || 800;
        iframe.style.width = `${snapWidth}px`;
        iframe.style.height = `${snapHeight}px`;
        iframe.onload = () => {
          this.renderIframeToScreenshot(iframe);
        };
        iframe.onerror = () => {
          console.warn('[UploadDialog] HTML 预览加载失败，已跳过自动截图');
        };
        iframe.srcdoc = String(reader.result || '');
      };
      reader.onerror = () => {
        console.warn('[UploadDialog] 读取 HTML 文件失败，已跳过自动截图');
      };
      reader.readAsText(file);
    },
    // 使用 html2canvas 将 iframe 内渲染结果截为 PNG，上传后追加到 screenshotFiles
    async renderIframeToScreenshot(iframe) {
      // 以 iframe 实际尺寸（已对齐屏幕视口）作为截图与虚拟窗口尺寸
      const snapWidth = iframe.clientWidth || window.innerWidth || 1280;
      const snapHeight = iframe.clientHeight || window.innerHeight || 800;
      // 延迟 2s，确保 iframe 内容完成布局与绘制后再截图
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (!doc || !doc.documentElement) {
          return;
        }
        const canvas = await html2canvas(doc.documentElement, {
          backgroundColor: '#ffffff',
          scale: 1,
          useCORS: true,
          logging: false,
          width: snapWidth,
          height: snapHeight,
          windowWidth: snapWidth,
          windowHeight: snapHeight
        });
        canvas.toBlob((blob) => {
          if (!blob) {
            return;
          }
          const snapshotFile = new File([blob], 'html-preview.png', { type: 'image/png' });
          const uploader = this.$refs.screenshotUploader;
          if (uploader && typeof uploader.uploadFile === 'function') {
            uploader.uploadFile(snapshotFile);
          }
        }, 'image/png');
      } catch (error) {
        console.warn('[UploadDialog] HTML 截图生成失败：', error);
      }
    },
    handleOtherFilesChange() {
      this.validateFormField('otherFiles');
    },
    // 学科变化：重置期次联动候选
    handleSubjectChange() {
      this.form.materialIds = ''
      this.form.chapterIds = ''
      this.loadMaterials();
    },
    handleMaterialsChange() {
      this.form.chapterIds = ''
      this.loadUnitTree();
    },
    handleClosed() {
      this.form = createEmptyForm();
      this.isEdit = false;
      this.step = 1;
      this.$store.commit('agent/SET_ADMIN_EDIT', false);
      this.$nextTick(() => {
        if (this.$refs.uploadForm) {
          this.$refs.uploadForm.clearValidate();
        }
      });
    },
    /** 根据智能体数据回填表单（编辑模式） */
    populateFormFromAgent(agent) {
      const formAccessType = ACCESS_TYPE_VALUE_MAP[agent.accessType] || 'html';
      // 优先取接口返回的 agentType，缺失时由接入类型反推
      const agentType = AGENT_TYPE_VALUE_MAP[agent.agentType] || ACCESS_AGENT_TYPE_MAP[formAccessType];
      // 实用工具仅支持单个 HTML / URL 两种接入方式，历史脏数据回退为 HTML
      const accessType = agentType === 'tool' && formAccessType !== 'html' && formAccessType !== 'url'
        ? 'html'
        : formAccessType;
      let accessData = {};
      try {
        accessData = JSON.parse(agent.accessConfig || '{}');
      } catch (e) {
        accessData = {};
      }
      let screenshots = [];
      try {
        const raw = agent.coverImg || agent.screenshotFiles || '[]';
        screenshots = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
      } catch (e) {
        screenshots = [];
      }
      this.form = {
        agentType,
        accessType,
        name: agent.name || '',
        desc: agent.description || '',
        creator: agent.authorName || '',
        subjectCodes: agent.subjectCodes === '-1' ? '' : agent.subjectCodes,
        materialIds: agent.materialIds === '-1' ? '' : agent.materialIds,
        chapterIds: agent.chapterIds === '-1' ? '' : agent.chapterIds,
        accessUrl: accessData.url || '',
        kouzi: {
          botId: accessData.botId || '',
          token: accessData.token || '',
          baseUrl: accessData.baseUrl || 'https://api.coze.cn'
        },
        coding: {
          token: accessData.token || '',
          projectId: accessData.projectId || '',
          baseUrl: accessData.baseUrl || ''
        },
        screenshotFiles: screenshots,
        htmlFiles: accessType === 'html' && Array.isArray(accessData) ? accessData : [],
        otherFiles: accessType === 'other' && Array.isArray(accessData) ? accessData : [],
        _agentId: agent.id
      };
      // 触发级联加载
      this.$nextTick(() => {
        this.loadMaterials();
        this.loadUnitTree();
      });
    },
    submit() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          this.previewSubmit();
        }
      });
    },
    // 组装提交数据并提交
    async previewSubmit() {
      const { agentType, accessType, name, desc, creator, subjectCodes, materialIds, chapterIds } = this.form;
      const payload = {
        // 管理员编辑已审批智能体时保持 approvalStatus=1，其余场景（新建/用户编辑）为 0=待审批
        approvalStatus: this.isEdit && this.$store.state.agent.adminEdit
          ? APPROVAL_STATUS_MANAGE
          : APPROVAL_STATUS_PENDING,
        name: name.trim(),
        description: desc.trim(),
        authorName: creator.trim(),
        // 智能体类型（1 智能体 / 2 实用工具 / 3 教学资源）与实际接入方式
        agentType: AGENT_TYPE_CODE_MAP[agentType],
        accessType: ACCESS_TYPE_MAP[accessType],
        accessConfig: this.buildAccessConfig(),
        subjectCodes: subjectCodes || '-1',
        materialIds: materialIds || '-1',
        chapterIds: chapterIds || '-1',
        coverImg: JSON.stringify(this.form.screenshotFiles)
      };
      if (subjectCodes) {
        payload.subjectNames = this.subjectOptions.find((item) => subjectCodes === item.id).atlasName;
      }
      if (materialIds) {
        payload.materialNames = this.materialList.find((item) => materialIds === item.id).name;
      }
      if (chapterIds) {
        payload.chapterNames = this.unitOptions.find((item) => chapterIds === item.id).name;
      }

      try {
        if (this.isEdit) {
          payload.id = this.form._agentId;
          await updateAgent(payload);
          this.$message({ type: 'success', message: '修改成功' });
        } else {
          await addAgent(payload);
          this.$message({ type: 'success', message: '上传成功' });
        }
        this.close();
        this.$store.dispatch('agent/reloadAgents');
        // 通知管理列表等使用本地数据的页面同步刷新
        this.$root.$emit('agent-saved');
      } catch (err) {
        console.warn('[UploadDialog] 提交失败：', err);
      }
    }
  }
};
</script>

<style scoped>
/* 向导步骤条 */
.wizard-steps {
  display: flex;
  margin-bottom: 22px;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  background: var(--canvas);
}

.wz-step {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 6px;
  font-size: 13px;
  color: var(--muted);
  border-right: 1px solid var(--line);
  transition: all .2s;
}

.wz-step:last-child {
  border-right: 0;
}

.wz-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #c3cede;
  background: #fff;
  color: var(--muted);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.wz-step.active {
  background: var(--soft);
  color: var(--primary);
  font-weight: 600;
}

.wz-step.active .wz-num {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.wz-step.done {
  color: var(--primary);
}

.wz-step.done .wz-num {
  background: #dce8ff;
  border-color: #dce8ff;
  color: var(--primary);
}

/* 分步内容区：限定最小高度，避免翻页时弹窗高度抖动 */
.up-step {
  min-height: 330px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section-hint {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
  margin-left: 6px;
}

.form-grid {
  display: grid;
  gap: 0;
}

.form-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;
}

.form-hint {
  color: var(--muted);
  font-size: 12px;
  margin-top: 4px;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.type-option {
  border: 2px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font: inherit;
  color: var(--ink);
  transition: border-color .15s, background .15s;
}

.type-option:hover {
  border-color: var(--primary);
  background: var(--soft);
}

.type-option.selected {
  border-color: var(--primary);
  background: var(--soft);
}

.type-option-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 10px;
  background: var(--soft);
  color: var(--primary);
  transition: background .15s, color .15s;
}

.type-option:hover .type-option-icon,
.type-option.selected .type-option-icon {
  background: var(--primary);
  color: #fff;
}

.type-option-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 4px;
  color: var(--ink);
}

.type-option:hover .type-option-title,
.type-option.selected .type-option-title {
  color: var(--primary);
}

.type-option-desc {
  font-size: 12px;
  line-height: 1.4;
  color: var(--muted);
}

/* 类型补充说明：来源与格式提示 */
.type-option-hint {
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.5;
  color: #8a96aa;
}

/* 实用工具的接入类型切换 */
.sub-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.sub-tab {
  flex: 1;
  padding: 9px;
  border: 1.5px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  cursor: pointer;
  font-size: 13px;
  text-align: center;
  color: var(--muted);
  font-family: inherit;
  transition: all .2s;
}

.sub-tab.active {
  border-color: var(--primary);
  background: var(--soft);
  color: var(--primary);
  font-weight: 600;
}

.file-upload {
  border: 2px dashed var(--line);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all .2s;
}

.file-upload:hover {
  border-color: var(--primary);
  background: var(--soft);
}

.file-upload-emoji {
  font-size: 22px;
}

.file-upload-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--muted);
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 隐藏截图 iframe：离屏定位但保留实际尺寸（默认铺满视口，截图前 JS 会按屏幕尺寸显式覆盖），
   避免 display:none/visibility:hidden 导致 html2canvas 渲染空白或响应式断点异常 */
.html-snap-iframe {
  position: absolute;
  left: -99999px;
  top: 0;
  width: 100vw;
  height: 100vh;
  border: 0;
  pointer-events: none;
}

.btn {
  border: 0;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all .2s;
}

.btn-secondary {
  background: var(--canvas);
  color: var(--ink);
}

.btn-secondary:hover {
  background: var(--line);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

/* el-form 表单项间距与标签样式：对齐原有自定义表单观感 */
.upload-form ::v-deep .el-form-item {
  margin-bottom: 18px;
}

.upload-form ::v-deep .type-form-item {
  margin-bottom: 0;
}

.upload-form ::v-deep .el-form-item__label {
  padding: 0 0 6px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--ink);
}

.upload-form ::v-deep .el-select {
  width: 100%;
}

::v-deep .upload-dialog {
  border-radius: 16px;
}

::v-deep .upload-dialog .el-dialog__body {
  padding: 20px 28px;
}

@media (max-width: 768px) {
  .type-selector {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .form-grid2 {
    grid-template-columns: 1fr;
  }
}
</style>
