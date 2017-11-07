# Scavenge

## Install

```
npm install -g scavenge
```

## Usage

Scavenge can be used as a module or as command line program

```
scavenge ./path/to/json/configuration.json
```

or see [an example](./example.js)

## Editing configuration files

In both cases, you'll need to create a JSON configuration file to define the scraping job and the actions to take with the data. This documentation is coming, but for now just look at [some examples](./examples)

```
{
  "origin": URL, # the entry point url of the scraper
  "find": selector, # what elements do you want to find?
  "set": variable name, # save the value of the found element innerHTML to a variable
  "variables": { # save multiple variables. relative to the found element
    variable name: selector,
    ...
  },
  "filter": { # filters the data object by one of its properties
    [variable]: "regexp"
    # variable name, one of the variables defined above, it cannot be an array
    # a regular expression. If the variable doesn't match the regex that element is tossed
  },
  "next": { # there is a recursive operation starting... next implies a link is about to be followed
    "follow": selector, # the url of the link
    ...
    find, set, variables, filter, and next are all allowed here
    ...
  }
}
```

## Design Thoughts

This is a tool for making archives from (well-defined sections of) websites.

It conceptualizes link depth within the website like:

```
Entry URL (Level 0) --> Level 1 --> Level 2 --> ... --> Level n
```

And in the end, the directory structure of the library will be like (files always go in the lowest directory)

```
Root Dir
|-- 2nd level
   |-- nth level
      |-- File 1
      |-- File 2, etc.
```

There is no necessary correlation between link depth and directory depth. The mapping happens through configuration, parsing HTML, etc.

## Some Examples

### OZ Magazine

Thanks to the University of Wollongong, there is [an archive of OZ Magazine](http://ro.uow.edu.au/ozsydney/). I want to be able to download every issue along with some of the other metadata that's provided, and I want to store it in a specific way on my filesystem. (I want to ultimately make a [Dat](http://dat.land) archive of it.)

Here is what I know:

**Starting url:** `http://ro.uow.edu.au/ozsydney/`

**Format of links to follow on Level 0:** `http://ro.uow.edu.au/ozsydney/(\d+)`

**Format of links to download on Level 1:** `http://ro.uow.edu.au/cgi/viewcontent.cgi?article=(\d+)&context=ozsydney`

** Thumbnail image:** `http://ro.uow.edu.au/ozsydney/(\d+)/thumbnail.jpg`

There is some metadata on the starting url, or also on each of the detail pages. I'd like to use some of it so that in the end, I store the following information:

```
OZ
|-- OZ 1 (April 1963)
   |-- issue.pdf
   |-- cover.jpg
   |-- info.md
|-- OZ n (Month YYYY)
```

1. The code would always begin by loading the starting url
2. It might turn `$('#gallery_items .content_block')` into a list
3. It might map certain things into variables within this scope (`$('h2 a').text() --> issue title` and `$('#mag_pubdate').text() --> issue date`)
4. The `next` link would be `$('h2 a').attr('href')`
5. In the next page, it would find cover and download url, maybe this time by matching on pattern.

It may have been, however, that there was no metadata on the start page and so the issue title and date were only fetched on the second page. Perhaps the thumbnail was on the first page but not the detail page. At any rate, since the variables might not be known until getting all the way down, this script doesn't create the directories and do the downloading until after it has crawled down as far as it needs to. It will build a JSON array to describe the directory names, the file names, and the download URLs.

```
{
  "start": "http://ro.uow.edu.au/ozsydney/",
  "list": {
    "type": "jquery",
    "value": "#gallery_items .content_block",
    "variables": [
      "title": "h2 a",
      "date": "#mag_pubdate"
    ],
    "link": "h2 a"
  }
}
```

```
dir 0: OZ
dir 1: `${title} (${date})`
files: [
  "issue.pdf": http://ro.uow.edu.au/cgi/viewcontent.cgi?article=(\d+)&context=ozsydney
  "cover.jpg": http://ro.uow.edu.au/ozsydney/(\d+)/thumbnail.jpg
  "info.md": http://ro.uow.edu.au/ozsydney/(\d+)
]
```

```
{
  "dir_0": {
    "name": "OZ"
  },
  "dir_1": {
    "name": "${title} (${date})"
  },
  "files": [
    {
      "name": "issue.pdf",
      "source": "file",
      "url": "${pdf}"
    },
    {
      "name": "cover.jpg",
      "source": "file",
      "url": "${cover}"
    },
    {
      "name": "info.md",
      "source": "url2md",
      "url": "${info}"
    },
  ],
  "variables": [

  ]
}
```
