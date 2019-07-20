import { playMode } from 'common/js/config'
import { localSearch, loadPlay, loadFavorite } from 'common/js/cache'
const state = {
  singer: {},
  disc: {},
  topList: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  searchHistory: localSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite(),
  mode: playMode.sequence,
  currentIndex: -1
}
export default state
