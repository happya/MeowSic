<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" v-model="query" :placeholder="placeholder"/>
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script>
import { debounce } from 'common/js/util'
export default {
  name: 'SearchBox',
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲，歌手'
    }
  },
  data() {
    return {
      query: '' // 搜索词
    }
  },
  methods: {
    clear() {
      this.query = ''
    },
    setQuery(query) {
      this.query = query
    },
    blur() {
      this.$refs.query.blur()
    }
  },
  created() {
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 200))
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  .search-box
    display: flex
    align-items: center
    height: 40px
    width: 100%
    border-radius: 6px
    padding: 0 6px
    box-sizing: border-box
    background: $color-highlight-background
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      line-height: 18px
      outline: 0
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
