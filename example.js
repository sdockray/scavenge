const scavenge = require('./index.js')

// Loads an external JSON file with scavenging instructions
function scavengeJsonFile (name) {
  var instructions
  try {
    instructions = require(name)
  } catch (e) {
    console.log('Cannot require', name)
  }
  if (instructions) {
    scavenge(instructions)
  } else {
    console.warn('Could not load JSON configuration', name)
  }
}

// Testing entry point
scavengeJsonFile('./examples/libcom.json')

// var download = require('./plugins/download')
// download.onData(
//   { pdf: 'http://ro.uow.edu.au/cgi/viewcontent.cgi?article=1004&context=ozsydney' },
//   { url: "${pdf}",
//     filepath: "OZ/issue.pdf"
//   }).then(()=> {
//     console.log('fdsfdsfsdf');
//   })

/*
var download = require('./plugins/download')
download.onData(
  { pdf: 'http://ro.uow.edu.au/cgi/viewcontent.cgi?article=1004&context=ozsydney' },
  { url: "${pdf}",
    directory: "OZ/"
``  })
  {
    year: '2017',
    yearUrl: '/hansard/daily-hansard/3389-council-2017',
    pdf: '/images/stories/daily-hansard/Council_2017/Council_Daily_Extract_Friday_20_October_2017_from_Book_17.pdf' },
  {
    url: "https://www.parliament.vic.gov.au/${pdf}",
    directory: "${year}"
  })
*/
