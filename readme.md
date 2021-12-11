# Search Plugin

This plugin integrates a full-text search for your website. It is based on lunr.js. The development of the first version has been sponsored by [vodaris](https://www.vodaris.de/).

Just activate the plugin and it will add a search field to your website (depending on your theme). The plugin does not require any third-party-software like Google Search or Algolia. Instead it includes the JavaScript search library [lunr.js](https://lunrjs.com/) and generate a full-text search index on the fly.

![Screenshot of Search Results](media/live/typemill-search.png){.center}

## GitHub

Found a bug? Or do you want to contribute some improvements? You can find the repository on https://github.com/typemill-resources/search . Create a pull request or open a new issue if you found a bug.

## Hire Us

We are available for hiring of your next Typemill project. Visit us at [trendschau.net](http://trendschau.net/).

## Updates

### Version 1.1.2

* Removed shortcodes from search index

### Version 1.1.1

* Fixed icon in search button

### Version 1.1.0

* updated lunr.js to version 2.3.9.
* Added search icon instead of "GO".
* Added translations in the plugin settings.
* Close button is now fixed to the searchresult-container.
* Markdown tags are stripped out from search index now (as far as possible).
* The snippets in the search results now contain the first occurency of the search term. 
* The found search terms are now highlighted in the title and the snippets.
* Optimization for other languages are now implemented.

### Version 1.0.1

* Search starts with return key.
