<template>
  <div
    class="singer"
    ref="singer"
  >
    <list-view
      :singerList="singers"
      @select="selectSinger"
      ref="list"
    ></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import Singer from 'common/js/singer'
import { playlistMixin } from 'common/js/mixin'
import ListView from 'base/listview/listview'
import { getSingerList } from 'api/singer'
import { ERR_OK } from 'api/config'
import { mapMutations } from 'vuex'

const HOT_NAME = '热门'
const HOT_SINGER_LENGTH = 10

export default {
  name: 'Singer',
  mixins: [playlistMixin],
  data() {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      this.setSinger(singer)
    },
    _getSingerList() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
          // console.log(this.singers)
        }
      })
    },
    _normalizeSinger(list) {
      // map存储热门歌手，和按字母排序的歌手
      // 每个元素包含一个key: 热门或者字母，item是一组歌手对象
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      // 使同一字母开头的歌手聚类
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LENGTH) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // 得到有序的map
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 对列表进行排序
      ret.sort((a, b) => {
        // 升序排列
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 将hot 和 ret拼接后返回
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style lang="stylus" scoped>
  .singer
    position: fixed // 为了和better-scroll, 固定父容器高度
    top: 88px
    bottom: 0
    width: 100%
</style>
