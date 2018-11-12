chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.count) {
      chrome.browserAction.setBadgeText({'text': request.count.toString()})
    }
  }
);