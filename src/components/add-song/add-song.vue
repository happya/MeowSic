<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!--搜索框-->
      <div class="search-box-wrapper">
        <search-box @query="onQueryChange" ref="searchBox" placeholder="搜索歌曲"></search-box>
      </div>
      <!--快捷入口-->
      <div class="shortcut" v-show="!query">
        <!--开关菜单选择-->
        <switches :switches="switches"
                  :currentIndex="currentIndex"
                  @switch="switchItem"
        >
        </switches>
        <div class="list-wrapper">
          <!--最近播放-->
          <base-scroll v-if="currentIndex === 0"
                       :data="playHistory"
                       ref="songList"
                       class="list-scroll"
                       :refreshDelay="refreshDelay"
          >
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </base-scroll>
          <!--搜索历史-->
          <base-scroll class="list-scroll"
                       ref="searchList"
                       v-if="currentIndex === 1"
                       :data="searchHistory"
                       :refreshDelay="refreshDelay"
          >
            <div class="list-inner">
              <search-list @delete="deleteSearchHistory"
                           @select="addQuery"
                           :searches="searchHistory">
              </search-list>
            </div>
          </base-scroll>
        </div>
      </div>
      <!--搜索结果-->
      <div class="search-result" v-show="query">
        <suggest :query="query"
                 :showSinger="showSinger"
                 @select="selectSuggest"
                 @listScroll="blurInput"
        ></suggest>
      </div>
      <!--顶部对话框-->
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">已添加一首歌曲到队列！</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SearchBox from 'base/search-box/search-box'
import SongList from 'base/song-list/song-list'
import SearchList from 'base/search-list/search-list'
import BaseScroll from 'base/scroll/scroll'
import TopTip from 'base/top-tip/top-tip'
import Switches from 'base/switches/switches'
import Suggest from 'components/suggest/suggest'
import { searchMixin } from 'common/js/mixin'
import Song from 'common/js/song'
export default {
  name: 'AddSong',
  mixins: [searchMixin],
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  data() {
    return {
      showFlag: false,
      showSinger: false,
      currentIndex: 0,
      switches: [
        {
          name: '最近播放'
        },
        {
          name: '搜索历史'
        }
      ]
    }
  },
  methods: {
    show() {
      this.showFlag = true
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    showTip() {
      this.$refs.topTip.show()
    },
    hideTip() {
      this.$refs.topTip.hide()
    },
    selectSuggest() {
      this.saveSearch()
      this.showTip()
    },
    selectSong(song, index) {
      if (index !== 0) {
        this.insertSong(new Song(song))
        this.showTip()
      }
    },
    switchItem(index) {
      this.currentIndex = index
    },
    ...mapActions([
      'insertSong'
    ])
  },
  components: {
    SearchBox,
    SongList,
    SearchList,
    BaseScroll,
    Suggest,
    Switches,
    TopTip
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'
  .add-song
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme
    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          overflow: hidden
          height: 100%
        .list-inner
          padding: 20px 20px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      padding: 18px 0
      text-align: center
      font-size: 0
      .icon-ok
        margin-right: 4px
        vertical-align: middle
        font-size: $font-size-medium
        color: $color-theme
      .text
        vertical-align: middle
        color: $color-text
        font-size: $font-size-medium
</style>
