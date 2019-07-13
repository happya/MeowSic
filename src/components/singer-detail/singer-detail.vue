<template>
  <transition appear name="slide">
    <music-list
      :songs="songs"
      :title="title"
      :bgImage="bgImage"
    ></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import { getSingerDetail } from 'api/singer'
import { processSongsUrl, isValidMusic, createSong } from 'common/js/song'
import { ERR_OK } from 'api/config'
import { mapGetters } from 'vuex'

export default {
  name: 'SingerDetail',
  data() {
    return {
      songs: []
    }
  },
  computed: {
    title() {
      return this.singer.name
    },
    bgImage() {
      return this.singer.avatar
    },
    ...mapGetters([
      'singer'
    ])
  },
  created() {
    this._getDetail()
  },
  methods: {
    _getDetail() {
      if (!this.singer.id) {
        this.$route.push('/singer')
        return
      }
      // 通过歌手id，爬取到歌曲的信息 getSingerDetail
      // 从歌曲信息中提取到我们需要的信息并存入数组： _normalizeSongs
      // 利用每首歌曲的信息，处理成我们需要的信息songs: processSongsUrl
      // songs将交给子组件去渲染页面
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    // 通过爬取到的list创建一个存有所以song对象的数组：songs
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let { musicData } = item
        if (isValidMusic) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },

  components: {
    MusicList
  }
}
</script>

<style lang="stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform : translate3d(100%, 0, 0)
</style>
