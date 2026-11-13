<template>
  <section class="filters">
    <div class="filter-title">
      <div class="filter-title-head">
        <svg class="icon filter-title-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.filter" />
        </svg>
        <b class="filter-title-text">筛选</b>
        <span class="filter-title-count">{{ resultCount }} 项内容</span>
      </div>
      <div class="filter-title-right">
        <!-- 最近使用页按使用时间倒序，不提供排序切换 -->
        <div v-if="!isRecentPage" class="sort-tags">
          <button
            v-for="item in sortOptions"
            :key="item.value"
            type="button"
            class="sort-tag"
            :class="{ active: sortType === item.value }"
            @click="toggleSort(item.value)"
          >{{ item.label }}</button>
        </div>
        <button class="filter-title-reset" type="button" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <div class="filter-group-label">学科：</div>
        <div class="filter-tags">
          <div class="filter-tag"
            :class="{ active: !filters.subjectCode }"
            @click="setFilter('subjectCode', '')"
          >全部</div>
          <div
            v-for="item in subjectOptions"
            :key="item.id"
            class="filter-tag"
            :class="{ active: filters.subjectCode === item.id }"
            @click="setFilter('subjectCode', item.id)"
          >{{ item.atlasName }}</div>
        </div>
      </div>

      <div class="filter-group" v-if="filters.subjectCode">
        <div class="filter-group-label">教材：</div>
        <div class="filter-tags">
          <div class="filter-tag"
            :class="{ active: !filters.materialId }"
            @click="setFilter('materialId', '')"
          >不限</div>
          <div
            v-for="item in materialList"
            :key="item.id"
            class="filter-tag"
            :class="{ active: filters.materialId === item.id }"
            @click="setFilter('materialId', item.id)"
          >{{ item.name }}</div>
        </div>
      </div>

      <div class="filter-group" v-if="filters.materialId">
        <div class="filter-group-label">章节：</div>
        <div class="filter-tags">
          <div class="filter-tag"
            :class="{ active: !filters.chapterId }"
            @click="setFilter('chapterId', '')"
          >不限</div>
          <div
            v-for="item in unitOptions"
            :key="item.id"
            class="filter-tag"
            :class="{ active: filters.chapterId === item.id }"
            @click="setFilter('chapterId', item.id)"
          >{{ item.name }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ICONS } from '@/constants/icons';
import { mapGetters, mapState } from 'vuex';
import { pageByOrg, materialChapterTree } from '@/api/common';

export default {
  name: 'AgentFilter',
  data() {
    return {
      icons: ICONS,
      // 排序标签：与 store 中 agent/sortType 取值对应
      sortOptions: [
        { label: '按收藏次数排序', value: 'favoriteCount' },
        { label: '按使用次数排序', value: 'useCount' }
      ],
      // 接口数据源：教材列表、章节树
      materialList: [],
      unitOptions: []
    };
  },
  computed: {
    ...mapGetters([
      'agent/subjectList',
      'agent/materialTree'
    ]),
    ...mapState('agent', ['page', 'filters', 'sortType']),
    ...mapGetters('agent', ['resultCount']),
    subjectOptions() {
      const subjectList = this['agent/subjectList'];
      return subjectList || [];
    },
    isRecentPage() {
      return this.page === 'recent';
    },
  },
  methods: {
    // 获取教材列表：按所选学科（ atlasId ）拉取
    loadMaterials() {
      if (!this.filters.subjectCode) {
        this.materialList = []
        return
      }
      pageByOrg(this.filters.subjectCode)
        .then((res) => {
          this.materialList = res.data || [];
        })
        .catch((error) => {
          console.warn('[AgentFilter] 获取教材列表失败：', error);
        });
    },
    // 获取教材章节树：取首个教材的子节点
    loadUnitTree() {
      if (!this.filters.materialId) {
        this.unitOptions = []
        return
      }
      materialChapterTree(this.filters.materialId)
        .then((res) => {
          const materialObj = res.data[0] || {};
          this.unitOptions = materialObj.childrenList || [];
        })
        .catch((error) => {
          console.warn('[AgentFilter] 获取教材章节树失败：', error);
        });
    },
    setFilter(type, value) {
      this.$store.commit('agent/SET_FILTER', { type, value });
      // 学科变化：重置期次/章节并重新加载教材列表
      if (type === 'subjectCode') {
        this.$store.commit('agent/SET_FILTER', { type: 'materialId', value: '' });
        this.$store.commit('agent/SET_FILTER', { type: 'chapterId', value: '' });
        this.loadMaterials();
      }
      // 期次变化：重置章节并重新加载章节树
      if (type === 'materialId') {
        this.$store.commit('agent/SET_FILTER', { type: 'chapterId', value: '' });
        this.loadUnitTree();
      }
      this.$store.dispatch('agent/searchAgents');
    },
    // 排序切换：两个排序互斥，二次点击同一项取消排序恢复默认列表
    toggleSort(type) {
      this.$store.commit('agent/SET_SORT_TYPE', this.sortType === type ? '' : type);
      this.$store.dispatch('agent/searchAgents');
    },
    // 重置筛选：清空筛选条件与排序标签后重新拉取列表
    resetFilters() {
      this.$store.commit('agent/RESET_FILTERS');
      this.$store.dispatch('agent/searchAgents');
    }
  }
};
</script>

<style scoped>
.filters {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 24px;
}

.filter-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-title-head {
  display: flex;
  align-items: center;
  gap: 9px;
}

.filter-title-icon {
  color: var(--primary);
}

.filter-title-text {
  font-size: 14px;
  font-weight: 600;
}

.filter-title-count {
  font-size: 11px;
  color: var(--muted);
  background: var(--canvas);
  padding: 3px 8px;
  border-radius: 10px;
}

.filter-title-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 排序项：纯文字 + 下划线选中态，与下方胶囊形筛选标签区分 */
.sort-tags {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sort-tag {
  position: relative;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: color .2s;
}

.sort-tag:hover {
  color: var(--primary);
}

.sort-tag.active {
  color: var(--primary);
  font-weight: 600;
}

.sort-tag.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5px;
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background: var(--primary);
  transform: translateX(-50%);
}

.filter-title-reset {
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 12px;
  cursor: pointer;
  font: inherit;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-group-label {
  font-size: 14px;
  color: var(--ink);
  font-weight: 500;
  min-width: 60px;
  line-height: 35px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  padding: 6px 16px;
  border-radius: 20px;
  background: var(--canvas);
  color: var(--muted);
  font-size: 13px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all .2s;
}

.filter-tag:hover {
  background: var(--soft);
  border-color: var(--line);
}

.filter-tag.active {
  background: var(--soft);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: 600;
}
</style>
