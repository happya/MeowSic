<template>
  <base-scroll
    class="listview"
    ref="listview"
    :data="singerList"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
    :click="true"
  >
    <ul>
      <!-- 歌手分类的list -->
      <li
        v-for="(group,index) of singerList"
        :key="index"
        class="list-group"
        ref="listgroup"
      >
        <h2 class="list-group-title">{{group.title}}</h2>
        <!-- 某一类下歌手的list -->
        <ul>
          <li
            @click="selectItem(singer)"
            class="list-group-item"
            v-for="singer of group.items"
            :key="singer.id"
          >
            <img class="avatar" v-lazy="singer.avatar">
            <span class="name">{{singer.name}}</span>
          </li>
        </ul>
        </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          class="shortcut-item"
          :class="{'current':currentIndex===index}"
          v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index"
        >{{item}}</li>
      </ul>
    </div>

    <div
      ref="fixed"
      class="list-fixed"
      v-show="fixedTitle">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>

    <div
      class="loading-container"
      v-show="!singerList.length"
      >
        <base-loading></base-loading>
      </div>
  </base-scroll>
</template>

<script>
import BaseScroll from 'base/scroll/scroll'
import BaseLoading from 'base/loading/loading'
import { getData } from 'common/js/dom'

const archorHeight = 18
const titleHeight = 30

export default {
  name: 'ListView',
  props: {
    singerList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    shortcutList() {
      return this.singerList.map((group) => {
        return group.title.substring(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.singerList[this.currentIndex] ? this.singerList[this.currentIndex].title : ''
    }
  },
  created() {
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  },
  data() {
    return {
      // 用来观测实时滚动的位置
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item)
    },
    onShortcutTouchStart(e) {
      // 获取data-index的值，也就是index
      let archorIndex = getData(e.target, 'index')
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.archorIndex = archorIndex
      this._scrollTo(archorIndex)
    },
    onShortcutTouchMove(e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // delta = Math.floor((y2-y1) / anchorHeight)
      let delta = (this.touch.y2 - this.touch.y1) / archorHeight | 0
      let archorIndex = parseInt(this.touch.archorIndex) + delta
      // console.log(archorIndex)
      this._scrollTo(archorIndex)
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    refresh() {
      this.$refs.listview.refresh()
    },
    _scrollTo(index) {
      // 当点击到选择的外部边缘区域时，index为null
      // 满足!index==true，且排除了index===0的情形
      if (index !== 0 && !index) {
        return
      }
      // 处理边界情况
      index = (index < 0) ? 0 : index
      index = (index > this.listHeight.length - 2) ? this.listHeight.length - 2 : index
      this.scrollY = -this.listHeight[index]
      // console.log(this.$refs.listgroup)
      this.$refs.listview.scrollToElement(this.$refs.listgroup[index], 0)
    },
    _calculateHeight() {
      this.listHeight = []
      const list = this.$refs.listgroup
      // listHeight比所有列表元素多1个
      // 第n个元素的start值为listHeight[i],end值为listHeight[i+1]
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    // 传给list-view的数据发送变化时
    // dom渲染好后触发高度的计算
    singerList() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(newY) {
      let listHeight = this.listHeight
      // 滚动到顶部， newY > 0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动 即第0个元素和第listHeight.length-1个元素间
      for (let i = 0; i < listHeight.length - 1; i++) {
        let start = listHeight[i]
        let end = listHeight[i + 1]
        if (-newY >= start && -newY < end) {
          this.currentIndex = i
          // diff是指当前位置，距离其所在列表块底部的距离
          // 其实也就是距离下一个fixed-title的距离
          // 当diff开始小于titleHeight时，两个区域开始重叠
          this.diff = end + newY
          return
        }
      }
      // 滚动到底部，-newY > listHeight的最后一个元素
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      // 当diff开始小于titleHeight时，两个区域开始重叠
      // 当前fixedtitle向上偏移的距离，即是这个重叠的高度，为titleHeight - diff
      // 这里设置为负值， diff - titleHeight
      let fixedTop = (newVal > 0 && newVal < titleHeight) ? newVal - titleHeight : 0
      if (this.fixedTop === fixedTop) {
        // 不处于重叠区间没必要修改
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px)`
    }
  },
  components: {
    BaseScroll,
    BaseLoading
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .shortcut-item
        padding: 3px
        line-height: 100%
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background:$color-highlight-background
    .loading-container
      position: absolute
      top: 50%
      width: 100%
      transform: translateY(-50%)
</style>
