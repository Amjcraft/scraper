const axios = require('axios');
const cheerio = require('cheerio');
var setCookie = require('set-cookie-parser');
var parseString = require('xml2js').parseString;
const qs = require('querystring');
const markerMapping = require('./mappings/marker');
const reservationMapping = require('./mappings/reservation');

const mongo = require('./../mongo/queries/index');

const PARKS_BASE_URI = 'https://texasstateparks.reserveamerica.com/'

const parksAxiosInstance = axios.create({
  baseURL: PARKS_BASE_URI,
});

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

parksAxiosInstance.interceptors.response.use(function (response) {
  var cookies = setCookie.parse(response.headers['set-cookie'], {
    decodeValues: true  // default: true
  });


  parsedCookies = cookies.map((cookie) => {
    return `${cookie.name}=${cookie.value}`;
  });

  if(!parksAxiosInstance.defaults.headers.common['Cookie']) {
    parksAxiosInstance.defaults.headers.common['Cookie'] = parsedCookies.join(';');
  }
  
  //parksAxiosInstance.defaults.headers.common['Host'] = 'texasstateparks.reserveamerica.com';
  return response;
}, function (error) {
  return Promise.reject(error);
});

parksAxiosInstance.interceptors.request.use(function (request) {
  //console.log(request)
  return request;
}, function (error) {
  return Promise.reject(error);
});

const parksSearchResults = () => {
  return parksAxiosInstance.get('unifSearchResults.do')
      .then(function (response) {
        // handle success
        //console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
    });
}

const parksSearch = (searchTerm) => {

  const requestBody = {
    locationCriteria: searchTerm || 'TEXAS',
    locationPosition: '%3A%3A-99.5%3A31.7%3ATX%3A',
    interest: 'select',
    currentMaximumWindow: 5,
    contractDefaultMaxWindow: 'MS%3A24%2CLARC%3A24%2CGA%3A24%2CSC%3A13%2CPA%3A24%2CLA%3A13%2CTX%3A5%2CNY%3A24',
    stateDefaultMaxWindow: 'TX%3A5',
    defaultMaximumWindow: 5,
    lookingFor: '',
    camping_2001_3012:'',
    camping_2001_3013:'',
    camping_2001_218:'',
    camping_2003_3012:'',
    camping_2003_3013:'',
    camping_2003_218:'',
    camping_10001_3012:'',
    camping_10001_3013:'',
    camping_10001_218:'',
    camping_9002_3012:'',
    camping_9002_3013:'',
    camping_9002_218:'',
    camping_3001_3012:'',
    camping_3001_3013:'',
    camping_3001_218:'',
    camping_10004_3012:'',
    camping_10004_3013:'',
    camping_10004_218:'',
    campingDate:'',
    campingDateFlex:'',
    lengthOfStay:'',
    dayPassDate:'',
    dayPassFlex:'',
    dayPassLengthOfStay:'',
    dayuse_9001_3012:'',
    dayuse_9001_218:'',
    dayUseDate:'',
    dayUseFlex:'',
    dayUseLengthOfStay: ''
  }
  return parksAxiosInstance.post('unifSearch.do', qs.stringify(requestBody))
    .then(function (response) {
     
      //console.log(response.headers)
    })
    .catch(function (error) {
      // handle error
      //console.log(error);
    })
    .then(function () {
      // always executed
  });
}


// Calls The Get Parks Map in order to get base park data include Name, Id, and Location Info
// Base Data should really only be called when creating init DB entires
// Parks Search is Used to get Cookies needed for Get Parks call
const fetchAllParksBaseData = () => {
  parksSearch().then(() => {
    parksSearchResults().then(() => {
      parksAxiosInstance.get('getParksForMap.do?start=uSearchResults&minX=-112.29636319999999&minY=20.8155470543117&maxX=-85.92917569999999&maxY=38.28809430475681&long=-98.8&lat=39.5',
      {
        responseType: 'xml'
      })
        .then(function (response) {
          // handle success
          parseString(response.data, function (err, result) {
            if(result.markers.marker && result.markers.marker.length) {
              markerDocuments = result.markers.marker.map(marker => {
                return markerMapping(marker['$']);
              });
              mongo.insertParks(markerDocuments);
            }
          });
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          // always executed
      });
    });
  });
}

const parseReservationCalendar = (html) => {
  let $ = cheerio.load(html);

  let $table = $('#calendar');
  
  let $headCol = $table.find('.thead .th');

  for(const [key, value] of Object.entries($headCol)){
    let $headCol = $table.find('.thead .th');
  }

  console.log($headCol.calendar);
}

const getReservationInfo = (parkId) => {
  parksAxiosInstance.get('camping/enchanted-rock-state-natural-area/r/campgroundDetails.do?contractCode=TX&parkId=' + parkId,
      {
        responseType: 'html'
      })
        .then(function (response) {
          // handle success
          //console.log(response.data);
          parseReservationCalendar(response.data)
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          // always executed
      });

  
}

const updateParkReservationInfo = (parkId) => {
  const reservationInfo = getReservationInfo(parkId);
  const reservationInfoDocument = reservationMapping(reservationInfo);
  mongo.updateReservation(reservationInfoDocument)
}

const fetchAllParkReservationInfo = () => {
  mongo.getParks().then( (parks) => {
    parks.forEach(park => {
      updateParkReservationInfo(park.id);
    });
  });
}

exports.fetchAllParksBaseData = fetchAllParksBaseData;
exports.getReservationInfo = getReservationInfo;

