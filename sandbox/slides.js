Y.config.filter = 'raw';
Y.config.gallery = 'gallery-2011.02.02-21-07';
Y.use('slideshow', 'gallery-event-nav-keys', 'event-gestures', 'overlay', function () {
    var container = Y.one('#preso'),
        slideshow = new Y.Slideshow({
            srcNode: container,
            current: Y.one('#start')
        });

        slide    = Y.bind(slideshow.get, slideshow, 'current'),
        next     = Y.bind(slideshow.next, slideshow),
        previous = Y.bind(slideshow.previous, slideshow),
        overlay  = new Y.Overlay({
            bodyContent: '<p>Nothing to see here</p>',
            visible: false,
            centered: true,
            zIndex: 10
        }).render();

    overlay.on('click', overlay.hide);
    slideshow.after('currentChange', overlay.hide, overlay);

    function show(message) {
        if (overlay.get('visible')) {
            message = overlay.getStdModNode('body').getContent() + message;
        }
        overlay.set('bodyContent', message).syncUI();
        overlay.show();
    }

    Y.one('win').on({
        left: previous,
        right: next
    });

    Y.one('#dom1').on('click', function () {
        slideshow.next();
    });

    Y.one('#dom_bridge').on('click', function () { 
        //show('<img src="dom_ce_bridge.png">');
        //<img alt="One DOM subscription is made, and triggers a custom event. Subscriptions are made to the custom event" src="dom_ce_bridge.png">
    });

    Y.one('#notifications').on('click', function () {
        Y.once('hello', function () {
            show("<img src='hello.jpg' height='500'>");
        });

        Y.fire('hello');
    });

    Y.one('#payload1').on('click', function () {
        Y.once('hello', function (message) {
            show('<p>Hello?</p><p>' + message + '</p>');
        });

        Y.fire('hello', "It is me you're looking for?");
    });

    Y.one('#target1').on('click', function () {
        function Band(name) {
            this.name = name;
        }

        Y.augment(Band, Y.EventTarget);

        var mrT = new Band("Mr. T's bluegrass band");

        mrT.once('foo', function () {
            show("<p>I pity the foo!</p>");
        });

        mrT.fire('foo');
    });

    Y.one('#facade1').on('click', function () {
        var myCat = { name: 'Tank' };
        Y.augment(myCat, Y.EventTarget);
        myCat.publish('scratch', { emitFacade: true });

        myCat.once('scratch', function (e) {
            show("<p>Please don't " + e.type + "!</p>");
        });

        myCat.fire('scratch');
    });

    Y.one('#payload2').on('click', function () {
        var myCat = { name: 'Tank' };
        Y.augment(myCat, Y.EventTarget);
        myCat.publish('scratch', { emitFacade: true });

        myCat.once('scratch', function (e) {
            show("<p>Not the " + e.object + "!</p>");
        });

        myCat.fire('scratch', { object: 'couch' });
    });

    Y.one('#defaultFn').on('click', function () {
        var myCat = { name: 'Tank' };
        Y.augment(myCat, Y.EventTarget, true, null, {
            emitFacade: true
        });

        myCat.publish('hork', {
            defaultFn: function (e) {
                show(e.location + " is now stained.");
            }
        });

        myCat.once('hork', function (e) {
            e.preventDefault();
            show("<p>Oh no you don't!</p>");
        });

        myCat.fire('hork', { location: 'quilt' });
    });

    Y.one('#preventable').on('click', function () {
        overlay.set('bodyContent', '');
        var myCat = { name: 'Tank' };
        Y.augment(myCat, Y.EventTarget, true, null, {
            emitFacade: true
        });

        myCat.publish('hork', {
            defaultFn: function (e) {
                show(e.location + " is now stained.");
            },
            preventable: false
        });

        myCat.after('hork', function (e) {
            show("<p>My " + e.location + " is ruined!</p>");
        });

        myCat.once('hork', function (e) {
            e.preventDefault();
            show("<p>Oh no you don't!</p>");
        });

        myCat.fire('hork', { location: 'new shirt' });
    });

    Y.one('#preventedFn').on('click', function () {
        overlay.set('bodyContent', '');
        var myCat = { name: 'Tank' };
        Y.augment(myCat, Y.EventTarget, true, null, {
            emitFacade: true
        });

        myCat.publish('hork', {
            defaultFn: function (e) {
                show(e.location + " is now stained.");
            },
            preventedFn: function () {
                this.fire('scratch', {
                    object: 'hand'
                });
            }
        });

        myCat.on('scratch', function (e) {
            show("<p>Oww!  You scratched me!</p>");
        });

        myCat.after('hork', function (e) {
            show("<p>My " + e.location + " is ruined!</p>");
        });

        myCat.once('hork', function (e) {
            e.preventDefault();
        });

        myCat.fire('hork', { location: 'crib' });
    });





    /*
    container.delegate('gesturemovestart', function (e) {
        var pageWidth = Y.DOM.winWidth(),
            midpoint = pageWidth / 2,
            start    = { x: e.pageX, t: new Date() },
            current  = slideshow.get('current'),
            previous = current.previous('.yui3-slide');
        
        this.setData('gesture-nav', {
            pageWidth: pageWidth,
            triggerPrev: e.pageX + midpoint,
            triggerNext: e.pageX - midpoint,
            start: e.pageX,
            tracking: [ start, start ],
            slide: current,
            prevSlide: previous,
            nextSlide: current.next('.yui3-slide')
        });

        if (previous) {
            previous.setStyle('left', '-100%');
        }
    }, '.yui3-slide');

    container.delegate('gesturemove', function (e) {
        var data = this.getData('gesture-nav'),
            percent = -100 * ((data.start - e.pageX) / data.pageWidth);

        data.slide.setStyle('left', percent + '%');

        if (percent >= 0) {
            if (data.nextSlide) {
                data.nextSlide.setStyle('left', '-100%');
            }
            if (data.prevSlide) {
                data.prevSlide.setStyle('left', (-100 + percent) + '%');
            }
        } else {
            if (data.prevSlide) {
                data.prevSlide.setStyle('left', '100%');
            }
            if (data.nextSlide) {
                data.nextSlide.setStyle('left', (100 + percent) + '%');
            }
        }

        data.tracking.shift();
        data.tracking.push({ x: e.pageX, t: new Date() });
    }, '.yui3-slide');

    container.delegate('gesturemoveend', function (e) {
        var data = this.getData('gesture-nav'),
            start = data.tracking[0],
            end   = data.tracking[1],
            delta = end.x - start.x,
                    // trigger a transition either by dragging >50%
                    // page width, or by flicking faster than 100px/ms
                    // FIXME: figure out a decent trigger ratio
            go    = false;
            
        console.log(data);

        // slide moved >50% or flick with velocity > 100px/ms
        if (delta > 0 && end.x >= data.triggerPrev) {
            go = 100; // previous
        } else if (delta < 0 && end.x <= data.triggerNext) {
            go = -100; // next
        } else if (Math.abs(delta / end.t - start.t) > 100) {
            if (delta > 0 && data.prevSlide) {
                go = 100;
            } else if (delta < 0 && data.nextSlide) {
                go = -100;
            }
        }

        if (go) {
            data.slide.transition({
                left: go + '%'
            }, function () {
                this.setStyle('left', '');
                slideshow[(go > 0) ? 'previous' : 'next']();
            });

            if (go > 0) {
                if (data.prevSlide) {
                    data.prevSlide.transition({ left: 0 }, function () {
                        this.setStyle('left','');
                    });
                }
                if (data.nextSlide) {
                    data.nextSlide.setStyle('left','');
                }
            } else {
                if (data.nextSlide) {
                    data.nextSlide.transition({ left: 0 }, function () {
                        this.setStyle('left','');
                    });
                }
                if (data.prevSlide) {
                    data.prevSlide.setStyle('left','');
                }
            }
        } else {
            data.slide.transition({
                left: 0
            }, function () {
                this.setStyle('left', '');
                if (data.prevSlide) {
                    data.prevSlide.setStyle('left','');
                }
                if (data.nextSlide) {
                    data.nextSlide.setStyle('left','');
                }
                slideshow[(go > 0) ? 'previous' : 'next']();
            });

            if (e.pageX < data.start) {
                if (data.prevSlide) {
                    data.prevSlide.transition({ left: '-100%' }, function () {
                        this.setStyle('left','');
                    });
                }
                if (data.nextSlide) {
                    data.nextSlide.setStyle('left','');
                }
            } else {
                if (data.nextSlide) {
                    data.nextSlide.transition({ left: '100%' }, function () {
                        this.setStyle('left','');
                    });
                }
                if (data.prevSlide) {
                    data.prevSlide.setStyle('left','');
                }
            }
        }
    }, '.yui3-slide');
    */
});
