<template>
  <div class="music-list">
    <!-- 返回按钮 -->
    <div
      class="back"
      @click="back"
    >
      <i class="icon-back"></i>
    </div>
    <!-- 歌手名字 -->
    <h1 class="title" v-html="title"></h1>
    <!-- 歌手图片 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage"></div>
    <!-- 滚动时的遮挡层-->
    <div class="bg-layer"></div>
    <!-- 歌曲列表组件 -->
    <base-scroll
      class="list"
      ref="list"
      :data="songs"
      :probe-type="probeType"
      :listen-scroll="listenScroll"
    >
      <div class="song-list-wrapper">
        <!-- 歌曲列表 -->
        <song-list
          :songs="songs"
        ></song-list>

        <!-- 懒加载 -->
        <!-- <div class="loading-container">
          <base-loading></base-loading>
        </div> -->
      </div>
    </base-scroll>
  </div>
</template>

<script>
import BaseScroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import BaseLoading from 'base/loading/loading'

// const RESERVED_HEIGHT = 40
export default {
  name: 'MusicList',
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default() {
        return []
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  computed: {
    bgStyle() {
      return `background-image: url(${this.bgImage})`
    }
  },
  mounted() {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  methods: {
    back() {
      this.$router.back()
    }
  },
  components: {
    BaseScroll,
    SongList,
    BaseLoading
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'
  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position: absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      width: 80%
      z-index: 40
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      background-size: cover
    .list
      position: absolute
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
</style>
