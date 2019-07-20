<template>
  <transition name="list-fade">
    <!--蒙版层-->
    <div class="playlist" v-show="showFlag" @click="hide">
      <!--弹出窗口层-->
      <div class="list-wrapper" @click.stop>
        <!--播放模式的Icon和标题，垃圾桶-->
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <!--播放列表-->
        <base-scroll ref="listContent"
                     class="list-content"
                     :data="sequenceList"
                     :refreshDelay="refreshDelay"
        >
          <!--歌曲列表-->
          <transition-group  name="list" tag="ul">
            <li class="item"
                ref="listItem"
                v-for="(item, index) in sequenceList"
                :key="item.id"
                @click="selectItem(item, index)"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text" v-html="getDisplayName(item)"></span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </base-scroll>
        <!--添加到队列操作，点击弹出新的页面-->
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <!--关闭-->
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <!--confirm弹窗-->
      <confirm ref="confirm"
               text="是否清空播放列表"
               confirmBtnText="清空"
               @confirm="confirmClear"
      ></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex'
import BaseScroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import AddSong from 'components/add-song/add-song'
import { playMode } from 'common/js/config'
import { playerMixin } from 'common/js/mixin'

export default {
  name: 'Playlist',
  mixins: [playerMixin],
  data() {
    return {
      showFlag: false,
      refreshDelay: 100
    }
  },
  computed: {
    modeText() {
      if (this.mode === playMode.sequence) {
        return '顺序播放'
      } else if (this.mode === playMode.random) {
        return '随机播放'
      } else {
        return '单曲循环'
      }
    }
  },
  methods: {
    selectItem(item, index) {
      if (this.mode === playMode.random) {
        index = this.playlist.findIndex((song) => {
          return song.id === item.id
        })
      }
      this.setCurrentIndex(index)
      this.setPlayingState(true)
    },
    getCurrentIcon(item) {
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      } else {
        return ''
      }
    },
    scrollToCurrent(current) {
      const index = this.sequenceList.findIndex((song) => {
        return song.id === current.id
      })
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    deleteOne(item) {
      this.deleteSong(item)
      if (!this.playlist.length) {
        this.hide()
      }
    },
    addSong() {
      this.$refs.addSong.show()
    },
    show() {
      this.showFlag = true
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    showConfirm() {
      this.$refs.confirm.show()
    },
    confirmClear() {
      this.deleteSongList()
      this.hide()
    },
    getDisplayName(item) {
      return `${item.name}`
    },
    ...mapActions([
      'deleteSong',
      'deleteSongList'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!this.showFlag || newSong.id === oldSong.id) {
        return
      }
      this.scrollToCurrent(newSong)
    }
  },
  components: {
    BaseScroll,
    Confirm,
    AddSong
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'
  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          font-size: $font-size-medium
          .icon
            font-size: 30px
            margin-right: 10px
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          padding-right: 30px
          padding-left: 20px
          height: 40px
          overflow: hidden
          &.list-enter-active,&.list-leave-active
            transition: all 0.1s linear
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            line-height: 20px
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            padding: 0 15px
            color: $color-theme
            font-size: $font-size-small
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-large
        color: $color-text-l
</style>
