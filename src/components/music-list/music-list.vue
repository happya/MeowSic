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
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <!--随机播放按钮-->
      <div class="play-wrapper">
        <div class="play" v-show="songs.length" ref="playBtn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <!-- 图片蒙版层 -->
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 滚动时的遮挡层-->
    <div class="bg-layer" ref="layer"></div>
    <!-- 歌曲列表组件 -->
    <base-scroll
      class="list"
      ref="list"
      :data="songs"
      :probe-type="probeType"
      :listen-scroll="listenScroll"
      @scroll="scroll"
    >
        <!-- 歌曲列表 -->
      <div class="song-list-wrapper">

        <song-list
          :rank="rank"
          :songs="songs"
          @select="selectItem">
        </song-list>
      </div>

        <!-- 懒加载 -->
      <div class="loading-container" v-show="!songs.length">
        <base-loading></base-loading>
      </div>
    </base-scroll>
  </div>
</template>

<script>
import BaseScroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import BaseLoading from 'base/loading/loading'
import { prefixStyle } from 'common/js/dom'
import { playlistMixin } from 'common/js/mixin'
import { mapActions } from 'vuex'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')

export default {
  name: 'MusicList',
  mixins: [playlistMixin],
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
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollY: 0
    }
  },
  computed: {
    bgStyle() {
      return `background-image: url(${this.bgImage})`
    }
  },
  mounted() {
    this.imageHeight = this.$refs.bgImage.clientHeight
    // layer 最远滚动的距离为图片的高度，因为是向上滚，取负值
    // RESERVED_HEIGHT为顶部预留高度
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '30px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    selectItem(item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random() {
      this.randomPlay({
        list: this.songs
      })
    },
    back() {
      this.$router.back()
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    scrollY(newY) {
      // newY是在y方向滑动的像素值，因为是向上滑动，newY为负值
      // translateY最远滑动距离限制在图片的高度，可以将标题留出来
      let translateY = Math.max(newY, this.minTranslateY)
      let styleLayer = this.$refs.layer.style
      let styleImage = this.$refs.bgImage.style
      let styleFilter = this.$refs.filter.style
      let styleBtn = this.$refs.playBtn.style
      let zIndex = 0
      let scale = 1 // 向下拉时放大倍数
      let blur = 0 // 向上滑动时高斯模糊值

      styleLayer[transform] = `translate3d(0, ${translateY}px,0)`
      const percent = Math.abs(newY / this.imageHeight)
      // 往下滑动时，计算放大比例
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        // 向上滑动时计算模糊值，越靠近顶部越模糊，最大值为20
        blur = Math.min(20 * percent, 20)
      }
      // 实现高斯模糊， backdrop-filter是ios特有的渐进增强实现高斯模糊的
      styleFilter[backdrop] = `blur(${blur}px)`
      // 滑动到顶部标题区域
      if (newY < this.minTranslateY) {
        zIndex = 10
        styleImage.paddingTop = 0
        styleImage.height = `${RESERVED_HEIGHT}px`
        styleBtn.display = 'none'
      } else {
        // 不在顶部标题区域
        styleImage.paddingTop = `70%`
        styleImage.height = 0
        styleBtn.display = ''
      }
      // 按滑动位置更新图片z-index
      styleImage.zIndex = zIndex
      // 放大图片
      styleImage[transform] = `scale(${scale})`
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
    position: fixed // 包含better-scroll子组件，父容器需要fixed
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
      transform-origin: center //放大时从顶部开始
      background-size: cover
      .play-wrapper
        position: absolute
        z-index: 50
        bottom: 20px
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          border-radius: 100px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: absolute
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
