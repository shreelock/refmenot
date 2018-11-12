(function(win) {
	doc = win.document;
	listeners = [];
	MutationObserver = win.MutationObserver || win.WebKitMutationObserver;

	function ready(selector, fn) {
		listeners.push({
			selector:selector,
			fn:fn
		});
		observer = new MutationObserver(checkFn);
		observer.observe(doc.documentElement, {
            childList: true,
            subtree: true
        });
        console.log("clean check called first time");
		checkFn();
	}

	function checkFn() {
        console.log("clean check called")
		for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
            listener = listeners[i];
            // Query for elements matching the specified selector
            elements = doc.querySelectorAll(listener.selector);
            for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                element = elements[j];
                // Make sure the callback isn't invoked with the
                // same element more than once
                if (!element.ready) {
                    element.ready = true;
                    // Invoke the callback with the element
                    listener.fn.call(element, element);
                }
            }
        }
	}

	doc.ready = ready;
	ready('a', function(element) {
// Second level more aggressive
        let updateElement = function() {
            let uri = cleanup();
            var clean = true;
            
            // Strip all the parameters in URL
            uri = new URL(uri);
            var domainfilter= ['facebook.com', 'facebookwww.onion'];
            domainfilter.forEach(function(element) {
                if (uri.hostname.toString().indexOf(element) === -1) {
                    clean = false;
                }
            });
            
            if (clean) {
                uri = uri.protocol + '//' + uri.hostname + uri.pathname;
                element.href = uri;
            }
        };

        // First level of cleanup
        let cleanup = function() {
            let uri = element.href;
            console.log("pre-cleaned-url ",uri);
            
            if (/^https?:\/\/lm?.facebook.com/i.test(uri)) {
                uri = uri.match(/u=([^&#$]+)/i)[1];
            }
            
            uri = decodeURIComponent(uri);
            uri = uri.replace(/&?fbclid=[^&#$/]*/gi, '');
            uri = uri.replace(/&?[a-zA-Z_]*?ref=[^&#$/]*/gi, '');
            uri = uri.replace(/&?ref_type=[^&#$/]*/gi, '');
            uri = uri.replace(/&?__xts__[^&#$]*/gi, '');
            uri = uri.replace(/&?__tn__[^&#$]*/gi, '');
            uri = uri.replace(/&?eid=[^&#$]*/gi, '');
            if (uri[uri.length -1] === '?') {
                uri = uri.substr(0, uri.length-1);
            }
            
            element.href = uri;
            element.setAttribute("data-lynx-uri", "");
            console.log("cleaned-url ",element.href);
            return uri;
        }
        
        var url = element.href.toString();
        var whitelist = ['#', '/profile.php', '/photo/download', '/groups', '/ad_campaign', '/pages'];
        var filter = true;
        whitelist.forEach(function(element) {
            if (url.indexOf(element) !== -1) {
                filter = false;
            }
        });

        if (filter) {
            element.onmousedown = updateElement;
            element.contextmenu = updateElement;
            element.ontouchstart = updateElement;
        } else {
            element.onmousedown = cleanup;
            element.contextmenu = cleanup;
            element.ontouchstart = cleanup;
        }
	});

})(this);
