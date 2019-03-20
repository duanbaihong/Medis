import {handleActions} from 'Utils'
import {
  setFullScreen
} from 'Redux/actions'

export const windowAction = handleActions(Object.assign({fullscreen: false}), {
  [setFullScreen](state) {
    return {fullscreen: !state.fullscreen };
  }
})