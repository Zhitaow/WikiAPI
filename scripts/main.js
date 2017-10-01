(function() {

	/**
	 * Initialize some global parameters
	 */
	var title; 	// search article title
	var items;	// search article items;
	function init() {
		// Register event listeners
		loadSearchItems();
		$('search-box').addEventListener('keyup', searchItems);
	}

	// -----------------------------------
	// Helper Functions
	// -----------------------------------

	/**
	 * A helper function that makes a navigation button active
	 * 
	 * @param btnId -
	 *            The id of the navigation button
	 */
	function activeBtn(btnId) {
		var btns = document.getElementsByClassName('main-nav-btn');

		// deactivate all navigation buttons
		for (var i = 0; i < btns.length; i++) {
			btns[i].className = btns[i].className.replace(/\bactive\b/, '');
		}

		// active the one that has id = btnId
		var btn = $(btnId);
		btn.className += ' active';
	}

	function showLoadingMessage(msg) {
		var itemList = $('item-list');
		itemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i> '
				+ msg + '</p>';
	}

	function showWarningMessage(msg) {
		var itemList = $('item-list');
		itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i> '
				+ msg + '</p>';
	}

	function showErrorMessage(msg) {
		var itemList = $('item-list');
		itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-circle"></i> '
				+ msg + '</p>';
	}

	/**
	 * A helper function that creates a DOM element <tag options...>
	 * 
	 * @param tag
	 * @param options
	 * @returns
	 */
	function $(tag, options) {
		if (!options) {
			return document.getElementById(tag);
		}

		var element = document.createElement(tag);

		for ( var option in options) {
			if (options.hasOwnProperty(option)) {
				element[option] = options[option];
			}
		}

		return element;
	}

	/**
	 * AJAX helper
	 * 
	 * @param method -
	 *            GET|POST|PUT|DELETE
	 * @param url -
	 *            API end point
	 * @param callback -
	 *            This the successful callback
	 * @param errorHandler -
	 *            This is the failed callback
	 */
	function ajax(method, url, data, callback, errorHandler) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);

		xhr.onload = function() {
			switch (xhr.status) {
			case 200:
				callback(xhr.responseText);
				break;
			case 403:
				onSessionInvalid();
				break;
			case 401:
				errorHandler();
				break;
			case 500:
				errorHandler();
				break;
			}
		};

		xhr.onerror = function() {
			console.error("The request couldn't be completed.");
			errorHandler();
		};

		if (data === null) {
			xhr.send();
		} else {
			xhr.setRequestHeader("Content-Type",
					"application/json;charset=utf-8");
			xhr.send(data);
		}
	}

	function loadSearchItems() {
		activeBtn('search-btn');
		clearItems();
		showSearchBar(true);
	}

	// -------------------------------------
	// AJAX call server-side APIs
	// -------------------------------------

	function searchItems(){
		var key = event.which || event.keyCode;
		if (key === 13) {
			var titles = document.getElementById("search-box").value;
			readMoreFromAPI(titles);
		} else {
			// The request parameters
			var keywords = document.getElementById("search-box").value;
			getListFromAPI(keywords);
		}
	}

	function readMoreFromAPI(titles) {
		// https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cinfo%7Cimages%7Cimageinfo&titles=Albert+Einstein&exsentences=20&explaintext=1&inprop=url&iiprop=timestamp%7Cuser%7Curl
		// // The request parameters
		var url = 'https://en.wikipedia.org/w/api.php';
		var action = 'query';
		var exsentences = '50';
		var explaintext = '2';
		var inprop = 'url';
		var iiprop = 'timestamp%7Cuser%7Curl';
		var prop = 'extracts%7Cinfo%7Cimages%7Cimageinfo';
		var format = 'json'; 
		var params = 'action=' + action + '&format=' + format + '&prop=' + prop + '&titles=' + titles + '&exsentences=' + exsentences + '&explaintext=' + exsentences
			+ '&inprop=' + inprop + '&iiprop=' + iiprop + '&origin=*';
		var req = JSON.stringify({});
		console.log(url + '?' + params);

		// display loading message
		console.log('Loading details...');
		// make AJAX call: method, url, data, callback, errorHandler
		ajax('GET', url + '?' + params, req, function(res) {
			var result = JSON.parse(res).query;
			// console.log(result);
			if (result != undefined && result.hasOwnProperty("pages")) {
				item = result.pages;
				if (!item || item.length === 0) {
					console.log('No Search Item found.');
				} else {
					var index = [];
					index = dereferenceObj(item);
					item0 = item[index[0]];
					console.log(item0);

					// load items and display them in a pop-up window
					popModal(item0);
				}
			} else {
				console.log('Cannot find page.');
			}
		}, function() {
			console.log('Fail to load details.');
		});
	}

	function getListFromAPI(keywords) {
			var url = 'https://en.wikipedia.org/w/api.php';
			var action = 'query';
			var formatversion = '2';
			var generator = 'prefixsearch';
			var gpssearch = keywords.replace(' ','').replace(',', '+');
			console.log(keywords);
			var gpslimit = '10';
			var prop = 'pageimages%7Cpageterms';
			var piprop = 'thumbnail';
			var pithumbsize = '100';
			var pilimit = '10';
			var redirects = '';
			var wbptterms = 'description';
			var format = 'json'; 
			var params = 'action=' + action + '&formatversion=' + formatversion + '&generator=' + generator + '&gpssearch=' + gpssearch + '&gpslimit=' + gpslimit + '&prop=' + prop
				+ '&piprop=' + piprop + '&pithumbsize=' + pithumbsize + '&pilimit=' + pilimit + '&redirects=' + redirects + '&wbptterms=' + wbptterms + '&format=' + format +'&origin=*';
			var req = JSON.stringify({});
			console.log(url + '?' + params);
			// post-processing
			if (keywords != undefined && keywords.length > 0) {
				// display loading message
				showLoadingMessage('Getting Search Items...');
				// make AJAX call: method, url, data, callback, errorHandler
				ajax('GET', url + '?' + params, req, function(res) {
					var result = JSON.parse(res).query;
					console.log(result);
					if (result != undefined && result.hasOwnProperty("pages")) {
						items = result.pages;
						if (!items || items.length === 0) {
							showWarningMessage('No Search Item found.');
						} else {
							console.log("executed"); // debug 
							console.log(items);
							listItems(items);
						}
					} else {
						showWarningMessage('Cannot find page.');
					}
				}, function() {
					showErrorMessage('Fail to Get Search Items.');
				});
			}
	}
	// pop up modal
	function popModal(item) {
		// fetch fields from json obj
		var title = item.title;
		var extract = item.extract;
		var fullurl = item.fullurl;

		// Get the modal
		var modal = document.getElementById('myModal');
		var modalTitle = document.getElementById('modal-title');
		var modalBody = document.getElementById('modal-body');
		var modalLink = document.getElementById('external-url');
		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// display modal
		modal.style.display = "block";
		modalTitle.innerHTML = title;
		modalBody.innerHTML = extract;
		modalLink.href = fullurl;
		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
		    modal.style.display = "none";
		}
		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
		    if (event.target == modal) {
		        modal.style.display = "none";
		    }
		}
	}
	// https://stackoverflow.com/questions/4044845/retrieving-a-property-of-a-json-object-by-index
	function dereferenceObj(item) {
		// build the index
		var index = [];
		for (var x in item) {
		   index.push(x);
		}
		// sort the index
		index.sort(function (a, b) {    
		   return a == b ? 0 : (a > b ? 1 : -1); 
		}); 
		// console.log(item[index[0]]);
		return index;
	}
	
	// -------------------------------------
	// Create item list
	// -------------------------------------

	/**
	 * List items
	 * 
	 * @param items -
	 *            An array of item JSON objects
	 */
	function clearItems() {
		var itemList = $('item-list');
		itemList.innerHTML = '';
	}

	function showSearchBar(isShown) {
		myElement = $('search-box');
		if (isShown === true) {
			myElement.type = "text";
			myElement.value = "";
		} else {
			myElement.type = "hidden";
		}
	}

	function listItems(items) {
		// Clear the current results
		var itemList = $('item-list');
		itemList.innerHTML = '';
		for (var i = 0; i < items.length; i++) {
			addItem(itemList, items[i], i);
		}
	}

	/**
	 * Add item to the list
	 * 
	 * @param itemList -
	 *            The
	 *            <ul id="item-list">
	 *            tag
	 * @param item -
	 *            The item data (JSON object)
	 */
	function addItem(itemList, item, itemIndex) {
		var item_title = item.title;
		if (item.hasOwnProperty('thumbnail') && item.thumbnail.hasOwnProperty('source')) {
			var item_imgurl = item.thumbnail.source;
		} else {
			var item_imgurl = undefined;
		}
		if (item.hasOwnProperty('terms') && item.terms.hasOwnProperty('description')) {
			var item_description = item.terms.description[0];
		} else {
			var item_description = undefined;
		}
		// create the <li> tag and specify the id and class attributes
		var li = $('li', {
			id : 'item-' + itemIndex,
			className : 'item',
		});
		// item image
		if (item_imgurl != undefined) {
			li.appendChild($('img', {
				src : item_imgurl
			}));
		} else {
			li.appendChild($('img', {
				src : 'https://www.wikipedia.org/static/apple-touch/wikipedia.png'
			}))
		}
		// section
		var section = $('div', {});

		// title
		var title = $('p', {
			className : 'item-name'
		});
		console.log(title);
		title.innerHTML = item.title;
		section.appendChild(title);

		li.appendChild(section);

		// description
		var description = $('p', {
			className : 'item-description'
		});

		description.innerHTML = item_description + '<br/>';
		li.appendChild(description);
		li.addEventListener('click', function(){
			readMoreFromAPI(item_title);
		});
		itemList.appendChild(li);
	}

	init();

})();

$("#item-nav").scroll(function() {
    HandlingScrollingStuff();
}); 

// fix sidebar on scroll
var elementPosition = $('#item-nav').offset();
$(window).scroll(function(){
        if($(window).scrollTop() >= elementPosition.top){
              $('#item-nav').css('position','fixed').css('top','0').css('margin-top','60px');
              $('#top-link-block').css('width','80').css('height','80');
        } else {
            $('#item-nav').css('position','static').css('top','0').css('margin-top','0');
            $('#top-link-block').css('width','0').css('height','0');
        }    
});

// END