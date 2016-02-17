var MinceAppDispatcher = require('../dispatcher/MinceAppDispatcher');
var MinceConstants = require('../constants/MinceConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = MinceConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _currentLayer = {};
var _targetLayer = {};
var _ruler = [];

var MeasureStore = assign({}, EventEmitter.prototype, {

    init: function(layer) {
        _currentLayer = layer ;
    },

    initRuler: function(layer) {
        _targetLayer = layer ;

        _ruler = [];
        var coord = {
            cx1: _currentLayer.x,
            cx2: _currentLayer.x + _currentLayer.width,
            cy1: _currentLayer.y,
            cy2: _currentLayer.y + _currentLayer.height,
            tx1: _targetLayer.x,
            tx2: _targetLayer.x + _targetLayer.width,
            ty1: _targetLayer.y,
            ty2: _targetLayer.y + _targetLayer.height
        };


        // TOP RULER
        if (coord.ty1 > coord.cy2) {
            _ruler.push({
                type:'top',
                top:coord.cy2,
                left:(coord.tx1+coord.tx2)/2,
                height:(coord.ty1-coord.cy2)
            })
        } else {
            if (coord.ty1 < coord.cy2) {
                if (coord.ty1 > coord.cy1) {
                    _ruler.push({
                        type:'top',
                        top:coord.cy1,
                        left:(coord.tx1+coord.tx2)/2,
                        height:(coord.ty1-coord.cy1)
                    })
                }

                if (coord.ty1 < coord.cy1) {
                    _ruler.push({
                        type:'top',
                        top:coord.ty1,
                        left:(coord.cx1+coord.cx2)/2,
                        height:(coord.cy1-coord.ty1)
                    })
                }
            }
        }

        // BOTTOM RULER

        // LEFT RULER

        // RIGHT RULER
    },

    destroyRuler: function(layer) {
        _targetLayer = _targetLayer.id == layer.id ? null : _targetLayer;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
    * @param {function} callback
    */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
    * @param {function} callback
    */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    /**
    * @param {string} id
    */
    get: function(id) {
        return _curentLayer[id];
    },

    getRuler: function() {
        return _ruler;
    },

    getCurrentLayer: function() {
        return _currentLayer;
    }
});

MeasureStore.dispatchToken = MinceAppDispatcher.register(function(action) {
    switch(action.type) {
        case ActionTypes.CLICK_NAV_ARTBOARD:
            _currentLayer = {};
            MeasureStore.emitChange();
            break;

        case ActionTypes.CLICK_ARTBOARD_LAYER:
            MeasureStore.init(action.layer);
            MeasureStore.emitChange();
            break;

        case ActionTypes.ENTER_ARTBOARD_LAYER:
            MeasureStore.initRuler(action.layer);
            MeasureStore.emitChange();
            break;

        case ActionTypes.LEAVE_ARTBOARD_LAYER:
            MeasureStore.destroyRuler(action.layer);
            MeasureStore.emitChange();
            break;

        default:
        // do nothing
    }
});

module.exports = MeasureStore;
