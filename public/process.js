if(!window.console) window.console={};
if(!window.console.log) window.console.log=function(){};

var chapterData = [];
var pauseHashChangeDetection = false;

function loadedPage() {
	console.log("Loading chapters " + chapters.length);

	var numLoaded = 0;
	for(var i=0; i<chapters.length; i++) {
		var chapter = chapters[i];

		loadHtml(chapter, function(chapter, i) {
			return function(data) {
                numLoaded++;
                chapterData[i] = data;
                
				console.log("Loaded chapter:", chapter, numLoaded + "/" + chapters.length);
				
				if(numLoaded == chapters.length) {
					console.log("Loaded all html files.");
					renderChapters();
				}
			}
		}(chapter, i));
	}
}

var h1Template;
var h2Template;

function renderChapters() {
    var toc1 = $(".toc1");
    var tocParent = toc1.parent();
    
    h1Template = $("h1").first();
    h2Template = $("h2").first();
    
    tocParent.empty();
    
    var contentDiv = $("#content-div");
    contentDiv.empty();
    
    var srcAlt = "data-source";
    //assumes div.center|left
	for(var i=0; i<chapterData.length; i++) {
 
        var chapterFile = $(chapterData[i].replace(new RegExp("(<div\\s+class=\"(?:center|left)\"\\s*>\\s*)(<img[^>]*src *= *[\"']?)([^\"']*)","g"),"$1<img "+srcAlt+"=\"$3"));
        console.log("DATA: ",chapterData[i].replace(new RegExp("(<div\\s+class=\"(?:center|left)\"\\s*>\\s*)(<img[^>]*src *= *[\"']?)([^\"']*)","g"),"$1<img "+srcAlt+"=\"$3"));
        //var chapterFile = $(chapterData[i]);
        
        console.log("WHAT?",chapterFile);
        var h1Id = chapterFile.find("h1").attr("id");
        if(h1Id == null || h1Id == "") {
            h1Id = "chapter-" + (i+1);
        }
        
        
		var chapterTitle = chapterFile.find("h1").text();
		
        var newToc = toc1.clone();
        
        newToc.find(".accordionButton>a").attr("href", "#" + h1Id);
        newToc.find(".chap-text").text(chapterTitle);
        newToc.find(".chap-num").text(getChapNum(i));
        
        console.log("newToc", newToc);
        
        tocParent.append(newToc);
        
        
        var chapterContent = chapterFile.filter(".content");
        
        //resize images, assumes div.center, and div.left
        var chapterImages = chapterContent.find("div.center > img, div.left img");
        
        chapterImages.filter(function(index){
            return Number($(this).attr('width')) > 690;            
        }).height(function(index,oldHeight){
            var oldWidth = Number($(this).attr('width'));
            var oldHeight = Number($(this).attr('height'));
            return oldHeight*690/oldWidth;
        }).width(function(index,oldWidth){
            return 690;
        });
        
        chapterImages.replaceWith(function(){
            //console.log("ImageReplace", this, arguments);
            var img = $(this);
            
            var width = img.width() || Number(img.attr("width"));
            var height = img.height() || Number(img.attr("height"));
            
            var lazyDiv = $("<div></div>").addClass("lazy-image").height(height).width(width);
            
            //prevent loading of image
            img.attr(srcAlt,img.attr("src"));
            img.removeAttr("src");
            
            lazyDiv.data("img",img);
            
            lazyDiv.one("inview.QSManual", function(){
                console.log("REPLACE IMAGE",$(this),lazyDiv.data("img"));
                var img = lazyDiv.data("img");
                img.attr("src",img.attr(srcAlt));
                img.removeAttr(srcAlt);
                lazyDiv.replaceWith(img);
                lazyDiv.remove();
            })
            
            return lazyDiv;
        });
        
        console.log("chapterContent",chapterContent);
        
        contentDiv.append("<div class='anchor' id='" + h1Id + "'></div>");
        
        var section = $("<section></section>");
        section.append(chapterContent);
        
        
		contentDiv.append(section);
        
        processHeaders(h1Id, chapterContent, i, newToc);
	}
    
    $(window).on("scroll", function() {
        //console.log("Scroll", this,arguments);
        //chapter buckets
        $("section div.content").each(function(index,chapter) {
           // console.log("Scroll", index, chapter);
            if(isElementVisible(chapter)){
                $(chapter).find("div.lazy-image").each(function(index,lazyDiv){
                    //console.log("Scroll", index, lazyDiv);
                    if(isElementVisible(lazyDiv)){
                        $(lazyDiv).trigger("inview.QSManual");
                    }    
                });
            }
        });
    });
    
    finalSteps();
}

function processHeaders(h1Id, section, i, newToc) {
	var header = section.find("h1");

	var headerText = header.text();
    
    header.empty();
    var newH1 = h1Template.clone();
    newH1.find(".header-text").text(headerText);
    newH1.find(".header-num").text(getChapNum(i));
    
    newH1.find(".comment-icon").click(function() {
        window.open("./comments/" + h1Id + "/", "_blank");
    });
    
    header.append(newH1.children());
    
    var toc2Holder = newToc.find(".toc2Holder");
    var toc2 = newToc.find(".toc2");
    toc2.detach();
    
    var h2s = section.find("h2");
    
    for(var j=0; j<h2s.length; j++) {
        var h2 = $(h2s[j]);
        var h2Text = h2.text();
        var h2Id = h2.attr("id");
        if(h2Id == null || h2Id == "") {
            h2Id = "chapter-" + (i+1) + "-" + (j+1);
        }
        
        h2.empty();
        var newH2 = h2Template.clone();
        newH2.find(".header-text").text(h2Text);
        newH2.find(".header-num").text(getSubNum(i, j));
        h2.append(newH2.children());
        
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

function finalSteps() {
    $(".initial-load").hide();
    $(".post-load").show();
    
    processAnchors();
    ready2();
    
    // Process initial hash
    var hash = window.location.hash;
    if(hash != null && hash != "") {
        console.log("Initial scrollto:", hash);
        var anchor = $("a[href=" + hash +"]").first()
        scrollToSection(anchor, false);
    }
    
    $(window).hashchange(function(event) {
        if(!pauseHashChangeDetection) {
            console.log("Triggering hash change:", location.hash);
            
            var anchor = $("a[href=" + location.hash +"]");
            console.log("Anchor is ", anchor);
            
            scrollToSection(anchor, false);
        }
    });
    
    console.log("Href: " + window.location.href);
    if(window.location.href.indexOf("qsadmin") >= 0) {
        console.log("Found qsadmin");
        debugger;
        turnOnSection("system-admin");
    } else {
        console.log("No qsadmin");
    }
}

function filterPath(string) {
    return string.replace(/^\//, '').replace(/(index|default).[a-zA-Z]{3,4}$/, '').replace(/\/$/, '');
}

// use the first element that is "scrollable"
function scrollableElement(els) {
    for (var i = 0, argLength = arguments.length; i < argLength; i++) {
        
        var el = arguments[i];
        var $scrollElement = $(el);
        
        if ($scrollElement.scrollTop() > 0) {
            return el;
        }
        else {
            $scrollElement.scrollTop(1);
            var isScrollable = $scrollElement.scrollTop() > 0;
            $scrollElement.scrollTop(0);
            if (isScrollable) {
                return el;
            }
        }
    }
    return [];
}

var scrollElem = scrollableElement('html', 'body');
console.log("Scroll elem:", scrollElem);

function processAnchors() {
    var locationPath = filterPath(location.pathname);

    var anchors = $('a[href*=#]');
    
    for(var i=0; i<anchors.length; i++) {
        var anchor = anchors[i];
        
        var thisPath = filterPath(anchor.pathname) || locationPath;
        if (locationPath == thisPath && (location.hostname == anchor.hostname || !anchor.hostname) && anchor.hash.replace(/#/, '')) {
            var $target = $(anchor.hash);
            var target = anchor.hash;
            
            if (target && $target.length > 0) {
                $(anchor).click(function(anchor, $target, target) {
                    return function(event) {
                        event.preventDefault();
    
                        var targetOffset = $target.offset().top;
                        console.log("Anchor: ", anchor, "Target:", $target, targetOffset);
    
                        scrollToSection($(anchor), true);
                    }
                }(anchor, $target, target));
            }
        }
    }
}

function scrollToSection($anchor, isFromClick) {
    var target = $anchor[0].hash;
    var $target = $(target);
        
    var offset = $target.offset().top;
        
    $('html, body').stop().animate({
        scrollTop: offset
    }, 500, function() {// We need to check again because pictures may still be loading.
        var offset = $target.offset().top;
        $('html, body').stop().animate({
            scrollTop: offset
        }, 100, function() {
            console.log("Done scrolling");
            if(isFromClick) {
                console.log("Setting location.hash now");
                pauseHashChangeDetection = true;
                
                location.hash = target;
                
                setTimeout(function() {
                    pauseHashChangeDetection = false;
                }, 500);
            }
        });
    });
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

// To turn on specific manual sections
function turnOnSection(sectionId) {
    $("." + sectionId).show();
}

function isElementVisible(elem){
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();
    return elemBottom > docViewTop && docViewBottom > elemTop;
}