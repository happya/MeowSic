<template>
  <div class="recommend">
    <div class="recommend-content">
      <!--轮播区域-->
      <div
        v-if="swiperSliders.length"
        class="slider-wrapper"
      >
        <base-slider>
          <div
            v-for="(item, index) of swiperSliders"
            :key="index"
          >
            <a href="item.linkUrl">
              <img :src="item.picUrl">
            </a>
          </div>
        </base-slider>
      </div>
      <!--歌单推荐列表-->
      <div class="recommend-list">
        <h1 class="list-title">热门歌单推荐</h1>
        <ul>

        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import BaseSlider from 'base/slider/slider'
import { getRecommend } from 'api/recommend'
import { ERR_OK } from 'api/config'

export default {
  data() {
    return {
      swiperSliders: []
    }
  },
  created() {
    this._getRecommend()
  },
  methods: {
    _getRecommend() {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.swiperSliders = res.data.slider
        }
      })
    }
  },
  components: {
    BaseSlider
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
</style>
