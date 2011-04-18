YUI.add('slideshow', function (Y) {

Y.Slideshow = Y.Base.create('slides', Y.Widget, [], {
    initializer: function (config) {
        config || (config = {});

        this._items = config.items || config.slides || [];
        if (Y.Lang.isString(this._items)) {
            this._items = Y.all(this._items)._nodes;
        }

        Y.Attribute.apply(this, config);

        this._index = this.indexOf(this.get('current'));

        this.bindUI();
}

Y.extend(Slideshow, Y.Attribute, {
    _index: 0,

    _item: function (i) {
        var node = this._items[i] || null;

        if (node) {
            node = Y.Node._instances[node._yuid] ||
                   Y.NodeList._getTempNode(node);
        }

        return node;
    },

    item: function (i) {
        return Y.one(this._items[i]);
    },

    indexOf: function (slide) {
        return Y.Array.indexOf(this._items, slide._node);
    },

    start: function () {
        this._syncSlideCSS();
        this._uiSetCurrentSlide(this.get('current'));
    },

    bindUI: function () {
        this.after('currentChange', this._afterCurrentChange);

        if (this.get('fullscreen')) {
            Y.on(['resize','orientationchange'], this._afterResize, Y.config.win, this);
        }
    },

    goto: function (i) {
        this.set('current', this.item(i));
    },

    next: function () {
        this.goto(Math.min((this._index + 1), (this._items.length - 1)));
    },

    previous: function () {
        this.goto(Math.max((this._index - 1), 0));
    },

    _afterCurrentChange: function (e) {
        this._index = this.indexOf(e.newVal);
        this._uiSetCurrentSlide(e.newVal, e.prevVal);
    },

    _afterResize: function () {
        this._syncSlideCSS();
    },

    _syncSlideCSS: function () {
        var container, height, width;

        if (this.get('fullscreen')) {
            height = Y.DOM.winHeight();
            width  = Y.DOM.winWidth();
        } else {
            container = this.get('container');
            height = container.get('offsetHeight');
            width  = container.get('offsetWidth');
        }

        Y.all(this._items.concat(this.get('boundingBox')._node)).setStyles({
            height: height + 'px',
            width : width  + 'px'
        });
    },

    _uiSetCurrentSlide: function (current, prev) {
        if (prev) {
            prev.removeClass('yui3-slide-current');
        }
        current.addClass('yui3-slide-current');
    }
}, {
    ATTRS: {
        current: {},

        fullscreen: {
            value: true
        },

        render: {
            value: true
        }
    }
});

Y.augment(Y.Slideshow, Y.ArrayList);

}, '0.1', { requires: ['widget', 'arraylist', 'base-build'] });
