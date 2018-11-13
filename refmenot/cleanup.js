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

        if (localStorage.__trackerCounter) {
            console.log("found existing counter");
        } 
        else {
            console.log("didnt found existing counter");
            localStorage.__trackerCounter = 0;
        }
        // localStorage.setItem("filteredUrls",JSON.stringify([]))
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
    chrome.extension.sendMessage({'count': 0})
	ready('a', function(element) {

        let cleanup = function() {
            let uri = element.href;
            console.log("pre-cleaned-url ",uri);
            
            if (/^https?:\/\/lm?.facebook.com/i.test(uri)) {
                uri = uri.match(/u=([^&#$]+)/i)[1];
            }
            
            olduri = decodeURIComponent(uri);
            uri = olduri.replace(/&?fbclid=[^&#$/]*/gi, '');
            uri = uri.replace(/&?[a-zA-Z_]*?ref=[^&#$/]*/gi, '');
            uri = uri.replace(/&?ref_type=[^&#$/]*/gi, '');
            uri = uri.replace(/&?__xts__[^&#$]*/gi, '');
            uri = uri.replace(/&?__tn__[^&#$]*/gi, '');
            uri = uri.replace(/&?eid=[^&#$]*/gi, '');
            if (uri[uri.length -1] === '?') {
                uri = uri.substr(0, uri.length-1);
            }
            if (uri!=olduri && olduri.length > uri.length + 10) {
                    // Send message to background.js so we can set the badge text
                    if (localStorage.__trackerCounter) {
                        localStorage.__trackerCounter = Number(localStorage.__trackerCounter)+1
                    } 
                    else {
                        localStorage.__trackerCounter = 0;
                    }
                    // var savedUrls = JSON.parse(localStorage.getItem("filteredUrls"))
                    // savedUrls.push(olduri)
                    // localStorage.setItem("filteredUrls", JSON.stringify(savedUrls))
                    // console.log("urls saved :", savedUrls)
                    console.log("sending counter :", localStorage.__trackerCounter)
                    chrome.extension.sendMessage({'count': localStorage.__trackerCounter})
            }
            element.href = uri;
            element.setAttribute("data-lynx-uri", "");
            console.log("cleaned-url ",element.href);
            return uri;
        }
        element.onmousedown = cleanup;
        element.contextmenu = cleanup;
        element.ontouchstart = cleanup;
	});

})(this);
