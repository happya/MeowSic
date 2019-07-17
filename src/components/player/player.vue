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
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <!--左栏，cd和当前播放歌词-->
          <div class="middle-l" ref="middleL">
            <!--旋转cd图像-->
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <!--当前播放歌词-->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!--歌词-->
          <base-scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  class="text"
                  ref="lyricLine"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                  :class="{'current' : currentLineNum === index}"
                > {{line.txt}}
                </p>
              </div>
            </div>
          </base-scroll>
        </div>

        <!--底部控制栏-->
        <div class="bottom">
          <!--选择显示cd或者Lyric-->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <!--进度控制-->
          <div class="progress-wrapper">
            <!--当前播放时间-->
            <span class="time time-l">{{format(currentTime)}}</span>
            <!--进度条-->
            <div class="progress-bar-wrapper">
              <progress-bar
                :percent="percent"
                @percentChange="onProgressBarChange"
              ></progress-bar>
            </div>
            <!--总时长-->
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <!--左一：播放模式按钮-->
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <!--左二： 前一首按钮-->
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <!--中间：播放暂停键-->
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <!--右二： 下一首按钮 -->
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
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
        <!-- 唱片图标 -->
        <div class="icon">
          <div class="imgWrapper">
            <img
              width="40" height="40"
              :src="currentSong.image"
              :class="cdCls"
            >
          </div>
        </div>
        <!-- 文字 -->
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <!--控制钮-->
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" :class="miniIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>

    <!--播放音频-->
    <audio
      :src="currentSong.url"
      ref="audio"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import animations from 'create-keyframe-animation'
import Lyric from 'lyric-parser'
import { prefixStyle } from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import BaseScroll from 'base/scroll/scroll'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
const windowWidth = window.innerWidth

export default {
  name: 'Player',
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdCls() {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    iconMode() {
      if (this.mode === playMode.sequence) {
        return 'icon-sequence'
      } else if (this.mode === playMode.loop) {
        return 'icon-loop'
      } else {
        return 'icon-random'
      }
    },
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList'
    ])
  },
  created() {
    this.touch = {}
  },
  methods: {
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    prev() {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.songReady = false
      }
    },
    next() {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = (this.currentIndex + 1) % this.playlist.length
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.songReady = false
      }
    },
    loop() {
      let refAudio = this.$refs.audio
      refAudio.currentTime = 0
      refAudio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    ready() {
      this.songReady = true
    },
    error() {
      this.songReady = true
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    end() {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    format(interval) {
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60, 2)
      return `${minute}:${second}`
    },
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (this.mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
      // console.log(this.mode)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getLyric() {
      this.currentSong.getLyric().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // Lyric对象创建时的回调函数
    // 在每次歌词line发送变化时调用
    handleLyric({lineNum, txt}) {
      if (!this.$refs.lyricLine) {
        return
      }
      this.currentLineNum = lineNum
      let domLyricList = this.$refs.lyricList
      let domLyricLine = this.$refs.lyricLine
      if (lineNum > 5) {
        let lineEl = domLyricLine[lineNum - 5]
        domLyricList.scrollToElement(lineEl, 1000)
      } else {
        domLyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart(e) {
      const touches = this.touch
      const touch = e.touches[0]
      touches.initiated = true
      touches.startX = touch.pageX
      touches.startY = touch.pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const touches = this.touch
      const deltaX = touch.pageX - touches.startX
      const deltaY = touch.pageY - touches.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      // left为lyric页面左边界距离屏幕右边距的距离，在左为负
      const left = this.currentShow === 'cd' ? 0 : -windowWidth
      // deltaX: 往右滑动为正，往左滑动为负
      // offsetWidth: lyric页面左边距离右边屏幕边界的距离
      const offsetWidth = Math.min(0, Math.max(left + deltaX, -windowWidth))
      touches.percent = Math.abs(offsetWidth / windowWidth)
      let domScrollLyric = this.$refs.lyricList.$el
      let domMiddleL = this.$refs.middleL
      domScrollLyric.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      domScrollLyric.style[transitionDuration] = 0
      domMiddleL.style.opacity = 1 - touches.percent
      domMiddleL.style[transitionDuration] = 0
    },
    middleTouchEnd(e) {
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -windowWidth
          this.currentShow = 'lyric'
          opacity = 0
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 从lyric往cd页面滑动
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -windowWidth
          opacity = 0
        }
      }
      let domScrollLyric = this.$refs.lyricList.$el
      let domMiddleL = this.$refs.middleL
      const time = 300
      domScrollLyric.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      domScrollLyric[transitionDuration] = `${time}ms`
      domMiddleL.style.opacity = opacity
      domMiddleL.style[transitionDuration] = `${time}ms`
    },
    enter(el, done) {
      // done执行时跳入另一个hook function
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: { // 初始位置为(x, y, 0)处，倍数为scale
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
    _pad(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
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
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    })
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return
      }
      // this.songReady = false
      // this.canLyricPlay = false
      if (this.currentLyric) {
        this.currentLyric.stop()
        // this.currentLyric = null
        // this.currentTime = 0
        // this.playingLyric = ''
        // this.currentLineNum = 0
      }
      // 为了不在请求播放的Url的同时调用play,这里加个延时
      this.$nextTick(() => {
        this.$refs.audio.play()
      })
      this.getLyric()
    },
    playing(newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    BaseScroll
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
        top: 80px
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
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%
                border: 10px solid rgba(255,255,255,0.1)
                box-sizing: border-box
          .playing-lyric-wrapper
            width: 80%
            text-align: center
            margin: 30px auto 0 auto
            overflow: hidden
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              text-align: center
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          .dot
            display: inline-block
            vertical-align: middle
            width: 8px
            height: 8px
            border-radius: 50%
            margin: 0 4px
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          margin: 0 auto
          width: 80%
          padding: 10px 0
          align-items: center
          .time
            line-height: 30px
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
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
            &.play
              animation: rotate 20s linear infinite
            &.pause
              animation-play-state: paused
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
        .icon-playlist, .icon-play-mini, .icon-pause-mini
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          position: absolute
          top: 0
          left: 0
          font-size: 32px
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
