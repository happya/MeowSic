import { commonParams, ERR_OK } from './config'
import axios from 'axios'
import { getUid } from 'common/js/uid'

const debug = process.env.NODE_ENV !== 'production'
// 由爬取到的歌曲的mid值，和type值，生成可用的mid
function genUrlMid(mids, types) {
  // 实时获取id值
  const guid = getUid()
  return {
    module: 'vkey.GetVkeyServer',
    method: 'CgiGetVkey',
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23'
    }
  }
}

// 从songs的songmid生成新的urlmid
// 并通过这个Urlmid和post方法去请求数据
// 如果拿回来的数据有效，则建立一个映射，将原来的Mid和真实的Url映射起来
export function getSongsUrl(songs) {
  const url = debug ? '/api/getPurlUrl' : 'http://ustbhuangyi.com/music/api/getPurlUrl'
  let mids = []
  let types = []

  songs.forEach((song) => {
    mids.push(song.mid)
    types.push(0)
  })

  const urlMid = genUrlMid(mids, types)
  const data = Object.assign({}, commonParams, {
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  })

  return new Promise((resolve, reject) => {
    let tryTime = 3
    function request() {
      return axios.post(url, {
        comm: data,
        req_0: urlMid
      }).then((response) => {
        const res = response.data
        if (res.code === ERR_OK) {
          let urlMid = res.req_0
          if (urlMid && urlMid.code === ERR_OK) {
            const purlMap = {}
            urlMid.data.midurlinfo.forEach((item) => {
              if (item.purl) {
                purlMap[item.songmid] = item.purl
              }
            })
            // 如果拿取到了映射值，返回
            if (Object.keys(purlMap).length > 0) {
              resolve(purlMap)
            } else {
              // 拿不到映射值，重新请求
              retry()
            }
          } else {
            // 对应if (urlMid && urlMid.code === ERR_OK)
            retry()
          }
        } else {
          // 对应res.code !== ERR_OK的情况，即返回异常
          retry()
        }
      })
    }
    function retry() {
      if (--tryTime >= 0) {
        request()
      } else {
        reject(new Error('Not able to get the songs url'))
      }
    }
    request()
  })
}
