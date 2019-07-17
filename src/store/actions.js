import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const selectPlay = function({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 如果是随机播放，打乱当前列表，并找到当前播放歌曲在列表中的索引
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    // 找到当前点击歌曲，在随机播放列表中的索引
    index = findIndex(randomList, list[index])
  } else {
    // 如果不是随机播放，直接将list设为播放列表
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
