<template>
  <div class="recommend" ref="recommend">
    <base-scroll
      class="recommend-content"
      ref="scroll"
      :data="discList"
    >
      <!--轮播区域-->
      <div>
        <div
        v-if="swiperSliders.length"
        class="slider-wrapper"
        >
          <base-slider>
            <div
              v-for="(item, index) of swiperSliders"
              :key="index"
            >
              <a :href="item.linkUrl">
                <img @load="loadImg" :src="item.picUrl">
              </a>
            </div>
          </base-slider>
        </div>
        <!--歌单推荐列表-->
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              @click="selectItem(item)"
              class="item"
              v-for="(item,index) in discList"
              :key="index"
            >
              <!--封面-->
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl" />
              </div>
              <div class="text">
                <h2 class="title" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="showLoading">
        <base-loading></base-loading>
      </div>
    </base-scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import BaseScroll from 'base/scroll/scroll'
import BaseSlider from 'base/slider/slider'
import BaseLoading from 'base/loading/loading'
import { getRecommend, getDiscList } from 'api/recommend'
import { playlistMixin } from 'common/js/mixin'
import { ERR_OK } from 'api/config'

export default {
  name: 'Recommend',
  mixins: [playlistMixin],
  data() {
    return {
      swiperSliders: [],
      discList: []
    }
  },
  computed: {
    showLoading() {
      return !this.discList.length
    }
  },
  created() {
    this._getRecommend()
    this._getDiscList()
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    selectItem(item) {
      // console.log(item)
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDisc(item)
    },
    loadImg() {
      if (!this.checkLoaded) {
        this.checkLoaded = true
        setTimeout(() => {
          this.$refs.scroll.refresh()
        }, 20)
      }
    },
    _getRecommend() {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.swiperSliders = res.data.slider
        }
      })
    },
    _getDiscList() {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
          // console.log(this.discList)
        }
      })
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  components: {
    BaseSlider,
    BaseScroll,
    BaseLoading
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  .recommend
    position: fixed
    width: 100%
    top: 88px // 44+44
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        overflow: hidden
        width: 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 10px 20px 10px 20px
          .icon
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex: 1
            flex-direction: column
            justify-content: center
            line-height: 20px
            font-size: $font-size-medium
            .title
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
</style>
