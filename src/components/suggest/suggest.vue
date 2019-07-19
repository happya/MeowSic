<template>
  <base-scroll  ref="suggest"
                class="suggest"
                :data="result"
                :pullup="pullup"
                :beforeScroll="beforeScroll"
                @scrollToEnd="searchMore"
                @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li class="suggest-item"
          @click="selectItem(item)"
          v-for="(item, index) in result"
          :key="index"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <base-loading v-show="hasMore"></base-loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </base-scroll>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import BaseScroll from 'base/scroll/scroll'
import BaseLoading from 'base/loading/loading'
import NoResult from 'base/no-result/no-result'
import Singer from 'common/js/singer'
import { ERR_OK } from 'api/config'
import { isValidMusic, processSongsUrl, createSong } from 'common/js/song'
import { search } from 'api/search'

const perpage = 20
const TYPE_SINGER = 'singer'

export default {
  name: 'Suggest',
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      pullup: true,
      hasMore: true,
      result: [],
      beforeScroll: true
    }
  },
  methods: {
    refresh() {
      this.$refs.suggest.refresh()
    },
    search() {
      this.page = 1
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = result
            this._checkMore(res.data)
          })
        }
      })
    },
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = this.result.concat(result)
          })
          this._checkMore(res.data)
        }
      })
    },
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    listScroll() {
      this.$emit('listScroll')
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    _genResult(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        // ...为对象扩展运算符
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
      }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs)
        return ret
      })
    },
    // normalizeSongs返回一个数组，其每个元素为song对象
    _normalizeSongs(list) {
      let ret = []
      // 这里传入的list的关键字主要有albumid, albumid, songid, songmid, songname
      // 和一个 singer(id, name,mid)
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    _checkMore(data) {
      const song = data.song
      if (!song.list.length || song.curnum + song.curage * perpage >= song.totalnum) {
        this.hasMore = false
      }
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query() {
      this.search()
    }
  },
  components: {
    BaseScroll,
    BaseLoading,
    NoResult
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'
  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
        .icon
          flex: 0 0 30px
          width: 30px
          [class^="icon-"]
            font-size: 14px
            color: $color-text-d
        .name
          flex: 1
          font-size: $font-size-medium
          color: $color-text-d
          overflow: hidden
          .text
            no-wrap()
    .no-result-wrapper
      position: fixed
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
