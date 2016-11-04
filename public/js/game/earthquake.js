class Earthquake {
    static start () {
        const $ele = $('#enchant-stage');
        const duration = 20;

        $ele.animate({left: -20}, {duration: duration / 2})
            .animate({left:  20}, {duration})
            .animate({left: -20}, {duration})
            .animate({left:  20}, {duration})
            .animate({left: -10}, {duration})
            .animate({left:  10}, {duration})
            .animate({left: -5}, {duration})
            .animate({left:  5}, {duration})
            .animate({left:  0}, {duration: duration / 2})
    }
}
