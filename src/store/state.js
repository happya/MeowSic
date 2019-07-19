import { playMode } from 'common/js/config'
import { localSearch } from 'common/js/cache'
const state = {
  singer: {},
  disc: {},
  topList: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  searchHistory: localSearch(),
  mode: playMode.sequence,
  currentIndex: -1
}
export default state
