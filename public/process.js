var chapterData = [];

function loadedPage() {
	console.log("Loading chapters " + chapters.length);

	var numLoaded = 0;
	for(var i=0; i<chapters.length; i++) {
		var chapter = chapters[i];

		loadHtml(chapter, function(chapter, i) {
			return function(data) {
				console.log("Loaded chapter:", chapter);
				chapterData[i] = data;
				numLoaded++;

				if(numLoaded == chapters.length) {
					console.log("Loaded all html files.");
					renderChapters();
				}
			}
		}(chapter, i));
	}
}

function renderChapters() {
	var toc = $("#toc");
	var contentDiv = $("#contentDiv");

	for(var i=0; i<chapterData.length; i++) {

		var chapterTitle = $(chapterData[i]).filter("h1").text();
		
		toc.append("<div>" + chapterTitle + "</div>");

        var body = $(chapterData[i]);
		contentDiv.append(body);
	}

	processHeaders();
}

function processHeaders() {
	var body = $("html");
	var headers = body.find("h1");

	console.log("Found headers: ", headers.length);

	for(var i=0; i<headers.length; i++) {
		var h = $(headers[i]);
		var headerText = h.text();
		h.text("Chapter " + (i+1) + " - " + headerText);

		var chNodes = getNodes(h, "h1");
	}
}

function getNodes(firstNode, endTag) {
	console.log("First:", firstNode);

	var chNodes = [];

	var nextNode = firstNode.next();
	for(var i=0; i<10; i++) {

		if(nextNode.length == 0) break;

		//console.log("Next node:", nextNode);
		chNodes[chNodes.length] = nextNode[0];

		nextNode = nextNode.next();
	}

	console.log("Next:", chNodes);
}

function loadHtml(htmlFile, successFunction) {
	var nocache = Math.floor(Math.random()*1000);
	$.ajax({
      url: htmlFile + "?" + nocache,
      success: successFunction,
      error: function(a,b,c) {
              log.error("Error loading HTML: " + htmlFile);
      },
      dataType: "html"
    });
}