'use strict';

import {combineReducers} from 'redux';
import {activeInstanceKey} from './activeInstanceKey'
import {instances} from './instances'
import {favorites} from './favorites'
import {patterns} from './patterns'
import {sizes} from './sizes'
import {windowAction} from './windows'

export default combineReducers({
  patterns,
  favorites,
  instances,
  activeInstanceKey,
  sizes,
  windowAction
});
