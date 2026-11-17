<template>
  <main class="klh-page dp">
    <div v-if="!item" class="klh-empty">
      未找到该资源，请从矩阵页重新选择。
      <router-link to="/kelihua/subject" class="klh-btn klh-btn--sm">返回学科应用矩阵</router-link>
    </div>
    <template v-else>
      <div class="dp-top">
        <nav class="dp-crumb" aria-label="当前位置">
          <router-link to="/kelihua/home">首页</router-link>
          <klh-icon name="chevronRight" :size="14" />
          <router-link :to="matrix.to">{{ matrix.label }}</router-link>
          <klh-icon name="chevronRight" :size="14" />
          <span>{{ groupLabel }}</span>
          <klh-icon name="chevronRight" :size="14" />
          <span aria-current="page">{{ item.name }}</span>
        </nav>
        <button type="button" class="dp-back" @click="back">
          <klh-icon name="chevronLeft" :size="16" />返回
        </button>
      </div>

      <header class="dp-head">
        <div class="dp-head__text">
          <div class="dp-tags">
            <span :class="['dp-tag', isTool ? 'dp-tag--orange' : 'dp-tag--blue']">
              <klh-icon :name="isTool ? 'tool' : item.type === 'prompt' ? 'prompt' : 'bot'" :size="12" :stroke="2.2" />{{ typeLabel }}
            </span>
            <span class="dp-tag">{{ groupLabel }}</span>
            <span v-for="g in item.grades || []" :key="g" class="dp-tag">{{ g }}</span>
          </div>
          <h1 class="dp-title">{{ item.name }}</h1>
          <p v-if="item.desc" class="dp-sub">{{ item.desc }}</p>
        </div>
        <div v-if="item.type !== 'prompt'" class="dp-cta">
          <button type="button" :class="['dp-cta__btn', { 'dp-cta__btn--orange': isTool }]" @click="use">
            {{ isTool ? '打开工具' : '进入使用' }}
            <klh-icon name="arrowRight" :size="18" :stroke="2.2" />
          </button>
          <small>{{ url ? item.availability || '在新窗口中打开' : '使用地址待补充' }}</small>
        </div>
      </header>

      <div class="dp-bar">
        <div class="dp-bar__meta">
          <span><klh-icon name="user" :size="16" />建设者：{{ item.author }}{{ item.dept && item.dept !== item.author ? ` · ${item.dept}` : '' }}</span>
          <span v-if="item.code"><klh-icon name="hash" :size="16" />{{ item.code }}</span>
        </div>
        <div class="dp-bar__acts">
          <button type="button" :aria-pressed="String(starred)" @click="starred = !starred">
            <klh-icon name="star" :size="16" />{{ starred ? '已收藏' : '收藏' }}
          </button>
          <button type="button" :aria-pressed="String(liked)" @click="liked = !liked">
            <klh-icon name="thumbsUp" :size="16" />{{ liked ? '已点赞' : '点赞' }}
          </button>
        </div>
      </div>

      <section class="dp-stage" aria-label="资源展示">
        <button type="button" :class="['dp-preview', 'preview-hit', { 'dp-preview--paper': !shot }]" :aria-label="`${isTool ? '打开' : '使用'} ${item.name}`" @click="use">
          <img v-if="shot" :src="shot" :alt="`${item.name} 界面截图`" width="1200" height="750" />
          <span v-else class="preview-cover" aria-hidden="true">
            <span class="preview-cover__badge"><klh-icon :name="isTool ? 'tool' : 'bot'" :size="48" :stroke="1.6" /></span>
            <strong>{{ item.name }}</strong>
            <small>{{ isTool ? '点击打开工具' : '点击进入智能体' }}</small>
          </span>
          <span v-if="shot" class="preview-play" aria-hidden="true"><klh-icon name="arrowRight" :size="26" :stroke="2.4" /></span>
        </button>
        <aside class="dp-side" aria-label="资源内容">
          <h2 class="dp-side__head">
            <span class="dp-side__badge"><klh-icon name="layers" :size="16" :stroke="2.2" /></span>
            资源内容
          </h2>
          <ul class="dp-list">
            <li class="dp-item is-active">
              <klh-icon class="dp-item__icon" :name="isTool ? 'tool' : 'bot'" :size="18" />
              <span class="dp-item__label">{{ isTool ? '在线工具' : '智能体问答' }}</span>
              <span v-if="!url" class="dp-item__state">待接入</span>
              <button v-else type="button" class="dp-item__btn" :aria-label="`打开 ${item.name}`" @click="use">
                <klh-icon name="arrowRight" :size="15" />
              </button>
            </li>
            <li class="dp-item" style="--c: var(--klh-orange)">
              <klh-icon class="dp-item__icon" name="prompt" :size="18" />
              <span class="dp-item__label">{{ item.type === 'agent' ? '人设与回复' : '提示词' }}</span>
              <span v-if="!copyValue" class="dp-item__state">待补充</span>
              <button v-else type="button" class="dp-item__btn" aria-label="复制" @click="copy">
                <klh-icon name="copy" :size="15" />
              </button>
            </li>
            <li class="dp-item" style="--c: var(--klh-teal)">
              <klh-icon class="dp-item__icon" name="clipboard" :size="18" />
              <span class="dp-item__label">使用方法</span>
              <span class="dp-item__state">{{ steps.length ? `${steps.length} 步` : '待补充' }}</span>
            </li>
            <li v-if="item.sourceName" class="dp-item" style="--c: var(--klh-ink)">
              <klh-icon class="dp-item__icon" name="file" :size="18" />
              <span class="dp-item__label">{{ item.sourceName }}</span>
              <span class="dp-item__state">来源</span>
            </li>
          </ul>
          <p class="dp-side__foot">{{ item.sourceNote || '人设与提示词可直接复制，迁移到其他大模型中复用或改写。' }}</p>
        </aside>
      </section>

      <div class="dp-lower">
        <div>
          <section class="dp-card">
            <h2 class="dp-card__title">资源简介</h2>
            <p class="dp-card__text">{{ item.desc || '建设者暂未填写简介。' }}</p>
            <ol v-if="steps.length" class="dp-points">
              <li v-for="(s, i) in steps" :key="i">{{ s }}</li>
            </ol>
          </section>
          <section v-if="copyValue" class="dp-card">
            <h2 class="dp-card__title">{{ item.type === 'agent' ? '人设与回复' : '提示词内容' }}</h2>
            <div class="prompt-wrap">
              <prompt-block :text="copyValue" :title="item.type === 'agent' ? 'SYSTEM PROMPT' : 'PROMPT'" />
            </div>
          </section>
        </div>
        <aside>
          <section class="dp-card">
            <h2 class="dp-card__title">建设者</h2>
            <p class="dp-quote">{{ item.author }}{{ item.dept && item.dept !== item.author ? `（${item.dept}）` : '' }}建设的{{ groupLabel }}{{ typeLabel }}，欢迎在教学中试用并反馈建议。</p>
          </section>
          <nav v-if="related.length" class="dp-card" aria-label="同类推荐">
            <h2 class="dp-card__title">同类推荐</h2>
            <ul class="dp-links">
              <li v-for="r in related" :key="r.id">
                <router-link :to="`/kelihua/resource/${r.id}`">
                  <type-badge :type="r.type" />
                  <span>{{ r.name }}</span>
                  <klh-icon name="arrowRight" :size="14" />
                </router-link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </template>
  </main>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import TypeBadge from '../components/TypeBadge.vue';
import PromptBlock, { copyText } from '../components/prompt-block.vue';
import { getters, groupKey } from '../store';
import { assetUrl, copyContent, resourceUrl } from '../utils/resources';

const MATRIX = {
  subject: { to: '/kelihua/subject', label: '学科应用矩阵' },
  education: { to: '/kelihua/education', label: '育人管理矩阵' }
};

export default {
  name: 'KlhResourceDetail',
  components: { KlhIcon, TypeBadge, PromptBlock },
  data() {
    return { starred: false, liked: false };
  },
  computed: {
    item() { return getters.findById(this.$route.params.id) || null; },
    isTool() { return this.item.type === 'tool'; },
    typeLabel() { return { agent: '智能体', tool: '工具', prompt: '提示词' }[this.item.type] || '资源'; },
    url() { return resourceUrl(this.item); },
    shot() { return assetUrl(this.item.shot); },
    copyValue() { return copyContent(this.item); },
    steps() { return this.item.steps || []; },
    matrix() { return MATRIX[this.item.matrix] || { to: '/kelihua/prompts', label: '提示词库' }; },
    groupLabel() {
      const r = this.item;
      if (r.matrix === 'subject') return [getters.subjectLabel(r.subject), getters.sceneLabel(r.scene)].filter(Boolean).join(' · ');
      if (r.matrix === 'education') return getters.domainLabel(r.domain);
      return r.category || '通用';
    },
    related() {
      const key = groupKey(this.item);
      return getters.published((r) => r.id !== this.item.id && groupKey(r) === key).slice(0, 5);
    }
  },
  methods: {
    back() {
      if (window.history.length > 1) this.$router.back();
      else this.$router.push(this.matrix.to);
    },
    use() {
      if (this.url) {
        window.open(this.url, '_blank', 'noopener,noreferrer');
        return;
      }
      this.$message({ message: `「${this.item.name}」使用地址待补充`, customClass: 'klh-popper' });
    },
    async copy() {
      try {
        await copyText(this.copyValue);
        this.$message({ message: '已复制', type: 'success', customClass: 'klh-popper' });
      } catch {
        this.$message({ message: '复制失败，请在下方手动复制', type: 'warning', customClass: 'klh-popper' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/detail.scss';

.preview-hit {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  font: inherit;
  cursor: pointer;

  img { transition: transform 0.4s; }
  &:hover img { transform: scale(1.02); }
}

.preview-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  min-height: 520px;
  color: var(--klh-ink);
  background: radial-gradient(circle at 50% 45%, var(--klh-white) 0, var(--klh-paper) 70%);

  strong { font-size: 22px; font-weight: 800; }
  small { font-size: 13px; color: var(--klh-muted); }
}

.preview-cover__badge {
  display: grid;
  place-items: center;
  width: 108px;
  height: 108px;
  margin-bottom: 6px;
  border-radius: 28px;
  background: var(--klh-blue);
  color: var(--klh-white);
  box-shadow: 0 18px 36px -16px var(--klh-blue);
  transition: transform 0.25s;

  .preview-hit:hover & { transform: translateY(-3px) scale(1.04); }
}

.preview-play {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  color: var(--klh-blue);
  box-shadow: 0 12px 30px -10px rgba(14, 22, 48, 0.5);
  transform: translate(-50%, -50%);
  transition: transform 0.2s;

  .preview-hit:hover & { transform: translate(-50%, -50%) scale(1.08); }
}

.prompt-wrap { margin-top: 14px; }

@media (max-width: 1000px) {
  .preview-cover { min-height: 380px; }
}
</style>
