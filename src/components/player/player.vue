<template>
  <div class="player" v-show="playlist.length">
    <!--普通播放模式-->
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <!--背景图-->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <!--顶部栏-->
        <div class="top">
          <!--回退按钮-->
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>

        <!--中间播放器栏-->
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
        </div>

        <!--底部控制栏-->
        <div class="bottom">
          <div class="operators">
            <!--左一：播放模式按钮-->
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <!--左二： 前一首按钮-->
            <div class="icon i-left">
              <i class="icon-prev"></i>
            </div>
            <!--中间：播放暂停键-->
            <div class="icon i-center">
              <i class="icon-play"></i>
            </div>
            <!--右二： 下一首按钮 -->
            <div class="icon i-right">
              <i class="icon-next"></i>
            </div>
            <!--右一： 收藏按钮-->
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!--迷你播放模式-->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img
              width="40" height="40"
              :src="currentSong.image"
            >
          </div>
        </div>

        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>

        <div class="control"></div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'

const transform = prefixStyle('transform')

export default {
  name: 'Player',
  computed: {
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong'
    ])
  },
  methods: {
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    enter(el, done) {
      // done执行时跳入另一个hook function
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1.0)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = `all 0.4s`
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        done()
      })
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    _getPosAndScale() {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 85
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    })
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position: absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 85px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          position: relative
          vertical-align: top
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            top: 0
            width: 80%
            height: 100%
            left: 10%
            box-sizing: border-box
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%
                border: 10px solid rgba(255,255,255,0.1)
                box-sizing: border-box
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86,0.18,0.82,1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0) //初始时上方偏移100像素，实现掉下来的效果
        .bottom
          transform: translate3d(0, 100px, 0) // 初始时下方偏移100px，实现往上浮出来效果
    .mini-player
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      position: fixed
      display: flex
      align-items: center
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      .icon
        width: 40px
        height: 40px
        flex: 0 0 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
      .text
        display: flex
        flex: 1
        flex-direction: column
        justify-content: center
        line-height: 20px
        overflow hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-playlist
          font-size: 30px
          color: $color-theme
</style>
