<template>
  <transition name="slide">
    <div class="user-center">
      <!--返回按钮-->
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <!--切换开关：我喜欢/最近歌曲中切换-->
      <div class="switches-wrapper">
        <switches ref="switches"
                  :switches="switches"
                  :currentIndex="currentIndex"
                  @switch="switchItem"
        ></switches>
      </div>
      <!--随机播放全部按钮-->
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <!--歌曲列表-->
      <div class="list-wrapper" ref="listWrapper">
        <!--我喜欢的-->
        <base-scroll class="list-scroll"
                      ref="favoriteList"
                      v-if="currentIndex === 0"
                      :data="favoriteList"
        >
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong">
            </song-list>
          </div>
        </base-scroll>
        <!--最近播放-->
        <base-scroll class="list-scroll"
                     ref="playList"
                     v-if="currentIndex === 1"
                     :data="playHistory"
        >
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </base-scroll>
      </div>
      <!--无结果-->
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Switches from 'base/switches/switches'
import SongList from 'base/song-list/song-list'
import BaseScroll from 'base/scroll/scroll'
import NoResult from 'base/no-result/no-result'
import Song from 'common/js/song'
import { playlistMixin } from 'common/js/mixin'
export default {
  name: 'UserCenter',
  mixins: [playlistMixin],
  computed: {
    noResult() {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else {
        return !this.playHistory.length
      }
    },
    noResultDesc() {
      if (this.currentIndex === 0) {
        return '暂无收藏歌曲'
      } else {
        return '你还没有听过歌曲'
      }
    },
    ...mapGetters([
      'favoriteList',
      'playHistory'
    ])
  },
  data() {
    return {
      switches: [
        { name: '我喜欢' },
        { name: '最近播放' }
      ],
      currentIndex: 0
    }
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      this.$refs.favoriteList && this.$refs.favoriteList.refresh()
      this.$refs.playList && this.$refs.playList.refresh()
    },
    back() {
      this.$router.back()
    },
    switchItem(index) {
      this.currentIndex = index
    },
    selectSong(song) {
      this.insertSong(new Song(song))
    },
    random() {
      let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
      if (!list.length) {
        return
      }
      list = list.map((song) => {
        return new Song(song)
      })
      this.randomPlay({
        list
      })
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  components: {
    Switches,
    SongList,
    BaseScroll,
    NoResult
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  .user-center
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 100
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position: absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 12px
        font-size: $font-size-large
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      width: 135px
      margin: 0 auto
      padding: 7px 0
      text-align: center
      border-radius: 100px
      box-sizing: border-box
      border: 1px solid $color-text-l
      color: $color-text-l
      .icon-play
        display: inline-block
        vertical-align: middle
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
