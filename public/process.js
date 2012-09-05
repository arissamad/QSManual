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
    var toc1 = $(".toc1");
    var tocParent = toc1.parent();
    
    tocParent.empty();
    
    var contentDiv = $("#content-div");
    contentDiv.empty();
    
	for(var i=0; i<chapterData.length; i++) {

        var h1Id = $(chapterData[i]).find("h1").attr("id");
        if(h1Id == null || h1Id == "") {
            h1Id = "chapter-" + i;
        }
        
        
		var chapterTitle = $(chapterData[i]).find("h1").text();
		
        var newToc = toc1.clone();
        
        newToc.find(".accordionButton>a").attr("href", "#" + h1Id);
        newToc.find(".chap-text").text(chapterTitle);
        newToc.find(".chap-num").text(getChapNum(i));
        
        console.log("newToc", newToc);
        
        tocParent.append(newToc);
        
        var chapterFile = $(chapterData[i]);
        var chapterContent = chapterFile.filter(".content");
        
        contentDiv.append("<div class='anchor' id='" + h1Id + "'></div>");
        
        var section = $("<section></section>");
        section.append(chapterContent);
        
        
		contentDiv.append(section);
        
        processHeaders(h1Id, chapterContent, i, newToc);
	}
    
    ready1();
    ready2();
}

function processHeaders(h1Id, section, i, newToc) {
	var header = section.find("h1");

	var headerText = header.text();
    
    header.empty();
    header.append("<span class='header-text'>" + headerText+ "</span><span class='header-num'>" + getChapNum(i) + "</span>");
    
    var toc2Holder = newToc.find(".toc2Holder");
    var toc2 = newToc.find(".toc2");
    toc2.detach();
    
    var h2s = section.find("h2");
    
    for(var j=0; j<h2s.length; j++) {
        var h2 = $(h2s[j]);
        var h2Text = h2.text();
        var h2Id = h2.attr("id");
        if(h2Id == null || h2Id == "") {
            h2Id = "chapter-" + i + "-" + j;
        }
        
        h2.empty();
        h2.append("<span id='" + h2Id + "' class='header-text'>" + h2Text + "</span><span class='header-num'>" + getSubNum(i, j) + "</span>");
        
        var newToc2 = toc2.clone();
        newToc2.attr("href", "#" + h2Id);
        newToc2.find(".header-text").text(h2Text);
        newToc2.find(".header-num").text(getSubNum(i, j));
        toc2Holder.append(newToc2);
    }
    
    if(h2s.length == 0) {
        toc2Holder.detach();
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

function getChapNum(index) {
    var chapNum = index+1;
    return "Ch. " + chapNum;
}

function getSubNum(index1, index2) {
    return (index1+1) +"." + (index2+1);
}