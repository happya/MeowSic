<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span
        class="dot"
        v-for="(item,index) in dots"
        :key="index"
        :class="{active: currentIndex===index}"
      ></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import { addClass } from 'common/js/dom'
export default {
  name: 'BaseSlider',
  data() {
    return {
      dots: [],
      currentIndex: 0
    }
  },
  // 功能
  props: {
    // 是否循环轮播
    loop: {
      type: Boolean,
      default: true
    },
    // 是否自动播放
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 间隔时间
    interval: {
      type: Number,
      default: 1000
    },
    snapSpeed: {
      type: Number,
      default: 400
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()

      if (this.autoPlay) {
        this._play()
      }
    }, 20)

    window.addEventListener('resize', () => {
      if (!this.slider) {
        return
      }
      this._setSliderWidth(true)
      this.slider.refresh()
      // console.log('refresh')
    })
  },
  methods: {
    _setSliderWidth(isResize) {
      // 获得列表元素
      this.children = this.$refs.sliderGroup.children

      let width = 0
      // 获得父容器，即slider的宽度，它被特别撑开，应该有一个宽度
      let sliderWidth = this.$refs.slider.clientWidth

      for (let i = 0; i < this.children.length; i++) {
        // child为每个列表元素
        let child = this.children[i]
        // 为每个轮播元素添加 'slider-item'样式
        addClass(child, 'slider-item')

        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots() {
      this.dots = new Array(this.children.length)
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3
        }
      })
      // 给slider绑定事件
      this.slider.on('scrollEnd', () => {
        // 获得当前PageIndex, getCurrentPage()是bscroll提供的接口
        let pageIndex = this.slider.getCurrentPage().pageX
        this.currentIndex = pageIndex

        if (this.autoPlay) {
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play() {
      // let pageIndex = this.currentIndex
      // pageIndex = (pageIndex + 1) % this.pageNumber
      this.timer = setTimeout(() => {
        // goToPage是bscroll提供的接口
        this.slider.next(2000)
      }, this.interval)
    }
  },
  destroyed () {
    // 在组件销毁，比如切换到其他路由的时候，做资源清理
    clearTimeout(this.timer)
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        overflow: hidden
        text-align: center
        box-sizing: border-box
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
          img
            display: block
            width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        height: 8px
        width: 8px
        border-radius: 4px
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
