<template>
  <transition appear name="slide">
    <music-list
      :title="title"
      :bgImage="bgImage"
      :songs="songs"
    ></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex'
import { getSongList } from 'api/recommend'
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
import { ERR_OK } from 'api/config'

export default {
  name: 'DiscDetail',
  data() {
    return {
      songs: []
    }
  },
  computed: {
    title() {
      return this.disc.dissname
    },
    bgImage() {
      return this.disc.imgurl
    },
    ...mapGetters([
      'disc'
    ])
  },
  created() {
    this._getSongList()
  },
  methods: {
    _getSongList() {
      if (!this.disc.dissid) {
        this.$router.push(`/recommend`)
        return
      }
      getSongList(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          // console.log(res.cdlist[0].songlist)
          processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      // console.log(ret)
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
    transition: translate3d(100%, 0, 0)
</style>
