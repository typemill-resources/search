<?php

namespace Plugins\search;

use \Typemill\Plugin;
use \Typemill\Models\Write;
use \Typemill\Models\WriteCache;

class Index extends Plugin
{
    public static function getSubscribedEvents(){}	

    public function index()
    {
		$write = new Write();

		$index = $write->getFile('cache', 'index.json');
		if(!$index)
		{
			$this->createIndex();
			$index = $write->getFile('cache', 'index.json');
		}
	
		return $this->returnJson($index);
    }

    private function createIndex()
    {
    	$write = new WriteCache();

    	# get content structure
    	$structure = $write->getCache('cache', 'structure.txt');

    	# get data for search-index
    	$index = $this->getAllContent($structure, $write);

    	# store the index file here
    	$write->writeFile('cache', 'index.json', json_encode($index, JSON_UNESCAPED_SLASHES));
    }

    private function getAllContent($structure, $write, $index = NULL)
    {
    	foreach($structure as $item)
    	{
    		if($item->elementType == "folder")
    		{
    			if($item->fileType == 'md')
    			{
 		   			$page = $write->getFileWithPath('content' . $item->path . DIRECTORY_SEPARATOR . 'index.md');
 		   			$pageArray = $this->getPageContentArray($page, $item->urlAbs); 
    				$index[$pageArray['url']] = $pageArray;
    			}

	    		$index = $this->getAllContent($item->folderContent, $write, $index);
    		}
    		else
    		{
    			$page = $write->getFileWithPath('content' . $item->path);
 		   		$pageArray = $this->getPageContentArray($page, $item->urlAbs); 
    			$index[$pageArray['url']] = $pageArray;
    		}
    	}
    	return $index;
    }

    private function getPageContentArray($page, $url)
    {
    	$parts = explode("\n", $page, 2);

	    # get the title / headline
    	$title = trim($parts[0], '# ');
    	$title = str_replace(["\r\n", "\n", "\r"],' ', $title);

    	# get and cleanup the content
    	$content = $parts[1];
    	$content = str_replace(["\r\n", "\n", "\r"],' ', $content);
    	$content = $this->strip_markdown($content);

    	$pageContent = [
    		'title' 	=> $title,
    		'content' 	=> $content,
    		'url'		=> $url
    	];

    	return $pageContent;
    }

    # see https://github.com/stiang/remove-markdown/blob/master/index.js
    private function strip_markdown($content)
    {
        # Remove TOC
        $content = str_replace('[TOC]', '', $content);

	# Remove Shortcodes
        $content = preg_replace('/\[:.*:\]/m', '', $content);
		
        # Remove horizontal rules
        $content = preg_replace('/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/m', '', $content);

        # Lists
        $content = preg_replace('/^([\s\t]*)([\*\-\+]|\d+\.)\s+/', '', $content);

  		# fenced codeblock
  		$content = preg_replace('/~{3}.*\n/', '', $content);

  		# strikethrough
  		$content = preg_replace('/~~/', '', $content);

        # attributes
        $content = preg_replace('/\{.*?\}/', '', $content);

  		# fenced codeblocks
  		$content = preg_replace('/`{3}.*\n/', '', $content);

  		# html tags
  		$content = preg_replace('/<[^>]*>/', '', $content);

  		# setext headers
  		$content = preg_replace('/^[=\-]{2,}\s*$/', '', $content);

  		# atx headers
        $content = preg_replace('/#{1,6}/', '', $content);
 		$content = preg_replace('/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/', '$1$2$3', $content);

  		# footnotes
  		$content = preg_replace('/\[\^.+?\](\: .*?$)?/', '', $content);
  		$content = preg_replace('/\s{0,2}\[.*?\]: .*?$/', '', $content);

  		# images
  		$content = preg_replace('/\!\[(.*?)\][\[\(].*?[\]\)]/', '', $content);

  		# inline links
  		$content = preg_replace('/\[(.*?)\][\[\(].*?[\]\)]/', '$1', $content);

  		# referenced style links 
        #  $content = preg_replace('/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/', '$1', $content);

  		# blockquotes
  		$content = preg_replace('/\s{0,3}>\s?/', '', $content);

  		# emphasis
  		$content = preg_replace('/([\*_]{1,3})(\S.*?\S{0,1})\1/', '$2', $content);

  		# codeblocks
  		$content = preg_replace('/(`{3,})(.*?)\1/', '$2', $content);

  		# inlinecode
  		$content = preg_replace('/`(.+?)`/', '$1', $content);

  		return $content;
    }
}
