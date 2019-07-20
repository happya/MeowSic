import { playMode } from 'common/js/config'
import { localSearch, loadPlay } from 'common/js/cache'
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
  mode: playMode.sequence,
  currentIndex: -1
}
export default state
