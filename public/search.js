var searchField 		= document.getElementById("searchField");
var searchButton 		= document.getElementById("searchButton");
var resultcontainer = document.getElementById("searchresult");
var language				= resultcontainer.dataset.language;
var resulttext			= resultcontainer.dataset.resulttext;
var noresulttext		= resultcontainer.dataset.noresulttext;
var closetext				= resultcontainer.dataset.closetext;
var contentwrapper 	= false;
var holdcontent 		= false;

function runSearch(event) {
	event.preventDefault();

	if(!holdcontent)
	{
		contentwrapper 		= resultcontainer.parentNode;
		holdcontent 		= contentwrapper.innerHTML;
	}

	var term = document.getElementById('searchField').value;
    
  if (term.length < 2)
  {
    return;
  }
	
	var results = searchIndex.search(term);

	var resultPages = results.map(function (match)
	{
		var singleResult 			= documents[match.ref];
		singleResult.snippet 	=  singleResult.content.substring(0, 200) 

		/* lunr might return a different term thant the original search term depending what was found */
		var lunrterm = Object.keys(match.matchData.metadata)[0];

		if( match.matchData.metadata[lunrterm].content !== undefined )
		{
			var positionStart 	= match.matchData.metadata[lunrterm].content.position[0][0];
			var positionLength 	= match.matchData.metadata[lunrterm].content.position[0][1];
			var positionEnd 		= positionStart + positionLength;

			if(positionStart > 99)
			{
				var snippet 			= singleResult.content.slice(positionStart-100,positionEnd+100);
				positionStart 		= 100;
				positionEnd 			= 100+positionLength;
			}
			else
			{
				var snippet				= singleResult.content.slice(0, positionEnd+200-positionStart);
			}
			
			snippet 						= snippet.slice(0, positionStart) + '<span class="lunr-hl">' + snippet.slice(positionStart,positionEnd) + '</span>' + snippet.slice(positionEnd,snippet.length) + '...';

			if(positionStart > 99)
			{
				snippet						= '...' + snippet;
			}

			singleResult.snippet = snippet;
		}

		singleResult.hltitle 	= singleResult.title;

		if( match.matchData.metadata[lunrterm].title !== undefined )
		{

			var positionStart 	= match.matchData.metadata[lunrterm].title.position[0][0];
			var positionLength 	= match.matchData.metadata[lunrterm].title.position[0][1];
			var positionEnd 		= positionStart + positionLength;

			singleResult.hltitle 	= singleResult.title.slice(0, positionStart) + '<span class="lunr-hl">' + singleResult.title.slice(positionStart,positionEnd) + '</span>' + singleResult.title.slice(positionEnd,singleResult.title.length);
		}

		return singleResult;
	});

	resultsString = "<div class='resultwrapper'>";
	resultsString += "<button id='closeSearchResult'>" + closetext + "</button>";
	resultsString += "<h1>" + resulttext + " \"" + term + "\"</h1>";
	resultsString += "<ul class='resultlist'>";
	if (resultPages === undefined || resultPages.length == 0)
	{
		resultsString += "<p>" + noresulttext + "</p>";
	}
	else
	{
		resultPages.forEach(function (r)
		{
		    resultsString += "<li class='resultitem'>";
		    resultsString +=   "<a class='resultheader' href='" + r.url + "?q=" + term + "'><h3>" + r.hltitle + "</h3></a>";
		    resultsString +=   "<div class='resultsnippet'>" + r.snippet + "</div>";
		    resultsString += "</li>"
		});
	}
	resultsString += "</ul></div>";

	contentwrapper.innerHTML = resultsString;

	document.getElementById("closeSearchResult").addEventListener("click", function(event){
		contentwrapper.innerHTML = holdcontent;
	});
}

if(searchField && searchButton)
{
	var searchIndex = false;
	var documents = false;
	var holdcontent = false;
	var contentwrapper = false;

	searchField.addEventListener("focus", function(event){

		if(!searchIndex)
		{
	    myaxios.get('/indexrs51gfe2o2')
	    .then(function (response){
	      documents = JSON.parse(response.data);

				searchIndex = lunr(function(){

					/* language support */
					if(language && language !== 'en')
					{
						this.use(lunr[language]);						
					}

					this.ref("id");
				  this.field("title", { boost: 10 });
				  this.field("content");

					/* This is required to provide the position of terms in
   					 in the index. Currently position data is opt-in due
 						 to the increase in index size required to store all
						 the positions. This is currently not well documented
						 and a better interface may be required to expose this
						 to consumers. */
    			this.metadataWhitelist = ['position']
				    
				  for (var key in documents){
				    this.add({
				      "id": documents[key].url,
				      "title": documents[key].title,
				      "content": documents[key].content
				    });
				  }
				});
	    }).catch(function (error) {});			
		}
	});

	searchButton.addEventListener("click", function(event){
		runSearch(event);
	}, false);

	searchField.addEventListener("keypress", function(event){
		if (event.key === 'Enter') {
			runSearch(event);
		}
	}, false);
}