
var osmosis = require('osmosis');

// OZ Magazine
var instructions_oz = {
  "origin": "http://ro.uow.edu.au/ozsydney/",
  "find": "ul#gallery_items li .content_block",
  "variables": {
    "title": "h2 > a",
    "date": "#mag_pubdate",
    "cover": ".cover img@src",
    "info": ".cover@href"
  },
  "next": {
    "follow": ".cover@href",
    "find": "#alpha",
    "variables": {
      "pdf": "#alpha-pdf@href"
    }
  }
};

// State Parliament of Victoria Hansard documents
var instructions_victoria = {
  "origin": "https://www.parliament.vic.gov.au/hansard/daily-hansard",
  "find": "#middle article table tr:nth-child(2) td:nth-child(1)",
  "variables": {
    "year": "ul li a",
    "yearUrl": "ul li a@href"
  },
  "next": {
    "follow": "ul li a@href",
    "find": "table.dl-hansard tbody tr td a",
    "variables": {
      "pdf": "@href"
    }
  }
};


// 
function whatsHere(o, conf) {
  console.log('whatsHere()');
  if (conf.find) {
    o = o.find(conf.find);
  }
  if (conf.variables) {
    o = o.set(conf.variables);
  }
  if (conf.next) {
    if (conf.next.follow) {
      o = o.follow(conf.next.follow);
    }
    o = whatsHere(o, conf.next);
  }
  return o;
}

function go() {
  var instructions = instructions_victoria;
  console.log('Starting to scavenge:', instructions.origin);
  var o = osmosis.get(instructions.origin);
  o = whatsHere(o, instructions);
  o = o.data(function(listing) {
    console.log("listing", listing);
  });
  /*
  o.log(console.log)
  .error(console.log)
  .debug(console.log);
  */
}


go();