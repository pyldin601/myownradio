/**
 * Merges attributes of two objects
 *
 * @param {Object} source First object
 * @param {Object} destination Second object
 * @returns {Object} Resulting object
 */
window.merge = function (source, destination) {
    var obj3 = {};
    var attr;
    for (attr in source) if (source.hasOwnProperty(attr)) {
            obj3[attr] = source[attr];
    }
    for (attr in destination) if (destination.hasOwnProperty(attr)) {
            obj3[attr] = destination[attr];
    }
    return obj3;
};

/**
 * Escapes string for using in html document
 *
 * @param source
 * @returns {string}
 */
window.htmlEscape = function (source) {
    if (typeof source == "undefined" || source === null) return "";
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&#034;',
        '\'': '&#039;'
    };
    return source.toString().replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

/**
 * Delete items from array filtered by predicate
 *
 * @param {Array} arr Target array
 * @param {Function} predicate Predicate function
 */
window.deleteMatching = function (arr, predicate) {
    var len = arr.length;
    for (var i = len - 1; i >= 0; i--) {
        if (predicate(arr[i]) === true) {
            arr.splice(i, 1);
        }
    }
};

/**
 * Truncates array length
 *
 * @param arr Target array
 */
window.truncateArray = function (arr) {
    arr.splice(0, arr.length);
};

window.initHelpers = function () {

    /*
        Image/Element fade plugin
    */

    var subs = {
        animatedFadeIn: function (arg) { $(arg).animate({ opacity: 1 }, 300) }
    };

    $("[fadein]").livequery(function () {
        if (this.tagName == "IMG") {
            $(this).one('load', function () {
                subs.animatedFadeIn(this);
            }).each(function () {
                if (this.complete) $(this).load();
            });
        } else {
            subs.animatedFadeIn(this);
        }
    });

};

/**
 * Overwrite attributes from one object into another
 *
 * @param {Object} $source Source object
 * @param {Object} $destination Destination object
 * @param {Boolean} $clear Delete attribute from destination if source one does not exist
 */

window.copyObjectValues = function copyObjectValues($source, $destination, $clear) {

    var k;

    $clear = $clear || false;

    /* Remove all undefined keys */
    if ($clear === true) for (k in $destination) if ($destination.hasOwnProperty(k)) {

        if (!$source.hasOwnProperty(k)) {
            delete $destination[k];
        }

    }

    /* Enumerate all keys */
    for (k in $source) if ($source.hasOwnProperty(k)) {
        if (angular.isArray($source[k]) && angular.isArray($destination[k])) {
            /* If source's attribute is array */
            copyArrayValues($source[k], $destination[k]);
        } else if (angular.isObject($source[k]) && angular.isObject($destination[k])) {
            /* If source's attribute is object */
            copyObjectValues($source[k], $destination[k], true);
        } else if ($destination[k] !== $source[k]) {
            /* Otherwise */
            $destination[k] = $source[k];
        }

    }


}

/**
 * Overwrite values from one array into another
 *
 * @param {Array} $source Source array
 * @param {Array} $destination Destination array
 */
window.copyArrayValues = function copyArrayValues($source, $destination) {
    var i = 0;
    for (; i < $source.length; i += 1) {
        if (angular.isArray($source[i]) && angular.isArray($destination[i])) {
            /* If source's attribute is array */
            copyArrayValues($source[i], $destination[i]);
        } else if (angular.isObject($source[i]) && angular.isObject($destination[i])) {
            /* If source's attribute is object */
            copyObjectValues($source[i], $destination[i], true);
        } else if ($destination[i] !== $source[i]) {
            /* Otherwise */
            $destination[i] = $source[i];
        }
    }
    if ($destination.length > $source.length) {
        console.log($destination.length, ">", $source.length);
        $destination.splice($source.length, $destination.length - $source.length);
    }
}

/**
 * Inserts HTML line breaks before all newlines in a string
 * @param str
 * @returns {*|XML|string|angular.ILocationService|void}
 */
window.nl2br = function nl2br( str ) {
    return str.replace(/([^>])\n/g, '$1<br/>');
}


window.Of = {
    megabytes: function (mb) { return Of.kilobytes(mb) * 1024 },
    kilobytes: function (kb) { return kb * 1024 },
    gigabytes: function (gb) { return Of.megabytes(gb) * 1024 }
};

window.mobileCheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

$.fn.extend({
    addIfEmpty: function (selector) {
        if (this.length == 0) {
            return $(this).add(selector);
        }
        return this;
    }
});