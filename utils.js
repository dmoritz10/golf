

function dupIds () {
    var ids = { };
    var found = false;
    $('[id]').each(function(key,val) {


    if (this.id && ids[this.id]) {
      found = true;
      console.warn('Duplicate ID #'+this.id);
      }
    ids[this.id] =+ 1;
    });
    if (!found) console.log('No duplicate IDs found');
}

function loadCoursesPlayedDropDown(selectCourse) {

    removeOldTeetimes()
    
    var teetimes = readOption('teetimes', null)

    var nextCourseName = teetimes ? teetimes[0].courseName : null

    courses =  arrShts['My Courses'].vals

    var s = document.getElementById(selectCourse)
    $('option', s).remove();
    var courseIdx

    for (var j = 0; j < courses.length; ++j) {
    
      var courseName = courses[j][0].toString()
      var shortName = shortCourseName(courseName)

      if (shortName == nextCourseName) courseIdx = j

      $('<option />').val(courses[j][2]).text(shortName).appendTo(s)
            
    }

    if (courseIdx) s.selectedIndex = courseIdx; 

}

function searchTeeTimes() {

  if (!arrOptions.teetimes) return null

  var teetimes = JSON.parse(arrOptions.teetimes)

  var td = new Date().setHours(0,0,0,0)
  
  teetimes.forEach((val) => {
  
    if (new Date(val.date) == td) { return val }
  
  })

  return null

}

function removeOldTeetimes() {

  var teetimes = readOption('teetimes', null)

  if (!teetimes) return

  var td = new Date()
  td.setHours(0,0,0,0);  // midnight of today

  var arrTeetimes = []
    
  teetimes.forEach ((val) => { if (parseDateISOString(val.date) >= td)  {arrTeetimes.push(val)} })

  if (teetimes.length == arrTeetimes.length) return
    
    arrOptions.teetimes = arrTeetimes.length > 0 ? JSON.stringify(arrTeetimes) : ''

    updateTeetimesOption()

}

function calcTS(targetHandCapDiff) {

  var courseRating = $('#hpCourse_Rating').html()
  var slopeRating = $('#hpSlope_Rating').html()
  var courseRatingFront9 = $('#hpFront_9_Rating').html()
  var courseRatingBack9 = $('#hpBack_9_Rating').html()

  var targetScore = ((targetHandCapDiff * slopeRating /  113) + courseRating * 1.0)
  var courseRatingFront = courseRatingFront9.split(' / ')[0]
  var slopeRatingFront = courseRatingFront9.split(' / ')[1]
  var targetScoreFront = Math.round(((targetHandCapDiff * slopeRatingFront /  113) + courseRatingFront * 2.0) / 2)
  var targetScoreBack = Math.round(targetScore) - targetScoreFront

  return Math.round(targetScore) + ' ... ' + targetScoreFront + ' / ' + targetScoreBack
}

function shortCourseName(longName) {
  var wrk = longName.replace(/golf/gi,'')
  wrk = wrk.replace(/course/gi, "")
  wrk = wrk.replace(/country/gi, "")
  wrk = wrk.replace(/club/gi, "")
  wrk = wrk.replace(/&/gi, "")
  wrk = wrk.replace(/ \)/g, ")")
  wrk = wrk.replace( /  +/g, ' ' )
  wrk = wrk.replace(/^\s+|\s+$/g, "")
  return wrk
}

function stdDev(arr){
  // Creating the mean with Array.reduce
  let mean = arr.reduce((acc, curr)=>{
    return acc + curr
  }, 0) / arr.length;
   
  // Assigning (value - mean) ^ 2 to every array item
  arr = arr.map((k)=>{
    return (k - mean) ** 2
  })
   
  // Calculating the sum of updated array
 let sum = arr.reduce((acc, curr)=> acc + curr, 0);
  
 // Calculating the variance
 let variance = sum / arr.length
  
 // Returning the Standered deviation
 return {
    mean: Math.round(mean * 10) / 10, 
    stdDev: Math.round(Math.sqrt(sum / arr.length) * 10) / 10
  }
  
}

function setupSumFunctions() {

    $.fairwaysHit = function (arr) {

      var fairways = 0;
      var fairwaysHit = 0;

      $.each(arr, function (i, v) {

        if (v) {

          if (v['drive'] == 'Str8' && parseInt(v['par']) > 3) {
            fairwaysHit++
          }

          if (parseInt(v['par']) > 3) {
            fairways++
          }
        }
      });

      return fairwaysHit + ' / ' + fairways

    }

    $.sum = function(arr, ele) {

      var r = 0;
      $.each(arr, function(i, v) {
            if(v) r += +v[ele]; 
      });
      return r;
    }

}

function setWeatherHref(e) {

  const isURL = (str) => {
  var pattern = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi); // fragment locator
  return pattern.test(str);
    }

console.log(e.stationId)
console.log(isURL(e.stationId))

  if (e.stationId && isURL(e.stationId)) {
  
    var weatherUrl = e.type !== 'weather' ? e.stationId.replace(/weather/g, e.type) : e.stationId
  
  } else {
  
    var weatherCity = e.city ? e.city.replace(/ /g,'-').toLowerCase() : ''
    var weatherState = e.state ? e.state.toLowerCase() : ''
    var weatherCountry = e.country ? e.country.toLowerCase() : ''
    var weatherType = e.type ? e.type : ''
    var weatherStationId = e.stationId ? e.stationId : ''


    var weatherUrl = weatherUrlMask
    .replace('*state*',weatherState)
    .replace('*city*',weatherCity)
    .replace('*country*',weatherCountry)
    .replace('*type*',weatherType)
    .replace('*stationId*',weatherStationId)
  //        .replace('https:/', 'https://')
  //        .toLowerCase()
        
  }

  if (e.date) weatherUrl += "/date/" + e.date

  var weatherUrl = weatherUrl.replace(/\/+/g,'/').replace('https:/', 'https://')

  if (e.element !== null) {

    e.element.prop('disabled', false)
      .prop('href', weatherUrl)

  }
//  else  {
    // console.log(weatherUrl)
   
    return weatherUrl
   
//  }
                        
}

function setPhoneHref(d) {

      if (d.phone) {

    d.element.prop('disabled', false).prop('href', 'tel:' + d.phone)

  } else {

    d.element.removeAttr('href');
      
      }

}

function setPhoneHref(d) {

      if (d.phone) {

    d.element.prop('disabled', false).prop('href', 'tel:' + d.phone)

  } else {

    d.element.removeAttr('href');
      
      }

}

async function setSmsHref(d) {

  if (d.cellNbrs) {
      
    var course = findCourse(d.courseName)
    var coursesObj = makeObj(course, arrShts['My Courses'].colHdrs)

    var weatherUrl = setWeatherHref({
      stationId:coursesObj['Uweather StationId'],
      city:coursesObj['City'],
      state:coursesObj['State'],
      country:'US',
      type:'hourly',
      date:d.date,
      element:null
    })

    var w = await getWeather(weatherUrl)

    var txtWeather = parseWeatherText(w)

    console.log(weatherUrl)
    
    console.log(txtWeather)

    var dt = formatsmsDateTime (d.date, d.time)

    var txtBody = d.courseName + '%0a' + dt.date + '%0a' + dt.time

    d.element.prop('disabled', false)
    d.element.prop('href', 'sms:' + d.cellNbrs + "?body=" + txtBody  + "%0a%0a" + txtWeather )
          
  } else {

    d.element.removeAttr('href');
      
  }

}

function setWebSiteHref(d) {

  if (d.url) {

    d.element.prop('disabled', false).prop('href', d.url)

  } else {

    d.element.removeAttr('href');
      
  }

}

function setSwingUHref(d) {

  if (d.url) {

    d.element.prop('disabled', false).prop('href', d.url)

  } else {

    d.element.removeAttr('href');
      
  }

}

function setAddTeeTimeClick(d) {

  var objVal = {

    idx: d.idx,
    courseName: shortCourseName(d.courseName),
    date: '',
    time: '',
    golfers: ''
          
  }

  var x = JSON.stringify(objVal)

  d.element.setAttribute("onclick", "editTeetime(" + x + ");gotoTab('Teetimes')");
      
}

function parseWeatherText(wRptHtml) {

  var end = wRptHtml.indexOf("</p></div></div></div>")
  var str = wRptHtml.lastIndexOf(">", end) + 1

  var wText = wRptHtml.substring(str, end)
  
  if (str < 0 || end < 0) console.log("Can't parse uweather report")  

  return wText

}

async function btnTestAPIStatusHtml() {

  var timer = new Date()
  await updateOption('gapi test', JSON.stringify(prScore))
  var optionTimer = new Date() - timer

  alert('Update Option successful - ' + optionTimer + 'ms')


}

async function btnTestGASStatusHtml() {

  var timer = new Date()
  //  await promiseRun('logRound', 'currScoreCard', JSON.stringify(prScore))
  var optionTimer = new Date() - timer

  alert('Update Properties successful - ' + optionTimer + 'ms')


}
// uweather comparison of gps coords vs course coords vs hand selected station id

async function btnUweatherCompHtml() {

  if (!nearByUweatherStations) {

    var nearByUweatherStations = await getNearByUweatherStations()

  }

  var bearing = await getBearing()

  console.log('getBearing', bearing)

  var uweatherComp = await getUWeather(nearByUweatherStations, bearing.bearingToHole)

  if (uweatherComp === null) return

  var title = "UWeather Station Comparison" + (bearing.winddirCardinal ? "<br><small>Bearing " + bearing.winddirCardinal + "</small>" : "")

  var wPrompt = bootbox.alert({

    title: title,
    message: uweatherComp

  });

  wPrompt.init(function () {

  });

}

async function getBearing() {

  return await getPosition()
  .then ( geoLoc => {

    const calcWindDirectionCardinal = (winddir) => (winddir ? ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"][(Math.round((winddir)/ 22.5,0))] : '')

    console.log('geoLoc', geoLoc)
    console.log('prCourse.holeDetail', prScore.currHole - 1, prCourse.holeDetail)
      var bearingToHole = calcBearingToHole(
                          geoLoc.coords.latitude, 
                          geoLoc.coords.longitude, 
                          prCourse.holeDetail[prScore.currHole - 1].greenLocation.lat,
                          prCourse.holeDetail[prScore.currHole - 1].greenLocation.lng )
      
console.log('getbearing internal', bearingToHole, calcWindDirectionCardinal(bearingToHole))
      return {
        winddirCardinal: calcWindDirectionCardinal(bearingToHole),
        bearingToHole: bearingToHole
      }
    })

  .catch (rej => {

    console.log('rej', rej)
      return null
  })

}

function getPosition() {
  // Simple wrapper
  return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, geolocationOptions);
  });
}

async function getUWeather(stationIds, bearingToHole) {

  var removeDup = stationIds.indexOf(prCourse.courseInfo["Uweather StationId"])

  if (removeDup > -1) stationIds.splice(removeDup, 1)

  const wRtn = await Promise.all([
    getWeatherByStationId(prCourse.courseInfo["Uweather StationId"], bearingToHole),
    getWeatherByStationId(stationIds[0], bearingToHole),
    getWeatherByStationId(stationIds[1], bearingToHole),
    getWeatherByStationId(stationIds[2], bearingToHole),
    getWeatherByStationId(stationIds[3], bearingToHole),
    getWeatherByStationId(stationIds[4], bearingToHole),
    getWeatherByStationId(stationIds[5], bearingToHole),
    getWeatherByStationId(stationIds[6], bearingToHole),
    getWeatherByStationId(stationIds[7], bearingToHole),
    getWeatherByStationId(stationIds[8], bearingToHole),
    getWeatherByStationId(stationIds[9], bearingToHole)
  ]);


  console.log(wRtn)

  var w = wRtn.filter(x => x !== null)

  if (w.length < 3) {

    toast('Weather reports not available.<br><br>Try again later.')
    return null

  }

  const pressure = pressure => (29.92 * Math.exp(-0.0000366 * pressure)).toFixed(2)
  const dist = coords => (distance(prCourse.courseInfo.courseCoords.lat, prCourse.courseInfo.courseCoords.lng, coords.lat, coords.lon, 'M').toFixed(1))
  const setBtn = stationId => '<button  class="btn btn-outline-primary btn-sm py-0 my-0" onclick="setStationId(\'' + stationId + '\')">Set</button>'
  const currentStation = prCourse.courseInfo['Uweather StationId'] ? prCourse.courseInfo['Uweather StationId'] : 'default'

  var arr = []

  arr.push(['stationId', ...(w.map(({ stationID }) => '<small>' + stationID))])
  arr.push(['obs', ...(w.map(({ obs }) => obs))])
  arr.push(['distance', ...(w.map(({ coords }) => dist(coords)))])
  arr.push(['elev', ...(w.map(({ elev }) => elev))])
  arr.push(['temp', ...(w.map(({ temp }) => temp))])
  arr.push(['humidity', ...(w.map(({ humidity }) => humidity))])
  arr.push(['dewpt', ...(w.map(({ dewpt }) => dewpt))])
  arr.push(['bPressure', ...(w.map(({ pressure }) => pressure))])
  arr.push(['aPressure', ...(w.map(({ elev }) => pressure(elev)))])
  arr.push(['windSpeed', ...(w.map(({ windSpeed }) => windSpeed))])
  arr.push(['winddir', ...(w.map(({ winddir }) => winddir))])
  arr.push(['windHole', ...(w.map(({ windRelToHole }) => windRelToHole))])
  arr.push(['set', ...(w.map(({ stationID }) => setBtn(stationID)))])
  arr.push(['current', '<small>' + '<input  class="col-12 px-0 text-right" type="text" id="manualStationId" value=\'' + currentStation + '\'>',
    '<button class="btn btn-outline-primary btn-sm py-0 my-0" onclick="setStationId(\'' + currentStation + '\')">Set</button>', ''])
  console.log(arr)

  var tbl = new Table();

  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0')
    .build();

  return tbl.html

}

async function getWeatherByStationId(stationId, bearingToHole) {

  console.log('getWeatherByStationId')
  var weatherUrl = setWeatherHref({

    stationId: stationId,
    city: prCourse.courseInfo['City'],
    state: prCourse.courseInfo['State'],
    country: 'US',
    type: 'weather',
    element: null

  })

  var w =  await xhr('https://cors.bridged.cc/' + weatherUrl)
    
    .then( response => {
      
      // console.log(response.xhr);  // full response
      // console.log(response.data)

      return response.data

	  })

	  .catch( error => {
      console.log(error.status); // xhr.status
      console.log(error.statusText); // xhr.statusText
	  });

  var rtn = parseUweather(w, bearingToHole)

  return rtn

}

async function getNearByUweatherStations() {
  console.log('getNearByUweatherStations')

  var weatherUrl = 'https://www.wunderground.com/weather/' + prCourse.courseInfo.courseCoords.lat + ',' + prCourse.courseInfo.courseCoords.lng

  var w =  await xhr('https://cors.bridged.cc/' + weatherUrl)
    
  .then( response => {
    
    // console.log(response.xhr);  // full response
    // console.log(response.data)

    return response.data

  })

  .catch( error => {
    console.log(error.status); // xhr.status
    console.log(error.statusText); // xhr.statusText
  });

  var rtn = parseNearByUweatherStations(w)

  return rtn

}

function parseNearByUweatherStations(wRptHtml) {

  var str = wRptHtml.indexOf('{&q;value&q;:{&q;location&q;:{&q;stationName&q;:')
  var end = wRptHtml.indexOf(',&q;expiresAt&q;:', str)

  console.log(str)
  console.log(end)

  if (str < 0) return null

  var current = wRptHtml.substring(str, end).replace(/&q;/g, '"') + '}'

  console.log(current)

  var w = JSON.parse(current).value.location.stationId

  console.log(w)

  return w

}

async function setStationId(stationId) {

  /*
  
  0. Calculate Weather Url
  1. update prCourse.courseInfo['Uweather StationId']
  2. update Courses (arrShts and sheet)
  3. update btnSCWeather
  */

  console.log(stationId)
  if (stationId == 'default') return

  prCourse.courseInfo['Uweather StationId'] = stationId

  var idxRow = findCourseIdx(prCourse.courseInfo['Course Name'])
  var idxCol = arrShts['My Courses'].colHdrs.indexOf('Uweather StationId')

  arrShts['My Courses'].vals[idxRow][idxCol] = stationId

  await updateCourse(arrShts['My Courses'].vals[idxRow], idxRow)
  updateOption('currCourseInfo', JSON.stringify(prCourse))                  

  var x = setWeatherHref({

    stationId: stationId,
    city: prCourse.courseInfo['City'],
    state: prCourse.courseInfo['State'],
    country: 'US',
    type: 'hourly',
    element: $('#btnSCWeather')

  })

}

function findCourseIdx(courseName) {

  var courseKey = calcCourseKey(courseName)

  var keyCol = arrShts['My Courses'].colHdrs.indexOf('Key')

  return arrShts['My Courses'].vals.findIndex(row => row[keyCol] === courseKey);

}

function parseUweather(wRptHtml, bearingToHole) {

  //console.log(wRptHtml)

  var str = wRptHtml.indexOf('{&q;value&q;:{&q;observations&q;:[{&q;stationID&q;:&q;')
  var end = wRptHtml.indexOf(',&q;expiresAt&q;:', str)

  console.log(str)
  console.log(end)

  if (str < 0) return null

  var current = wRptHtml.substring(str, end).replace(/&q;/g, '"') + '}'

  //  console.log(current)

  var w = JSON.parse(current).value.observations[0]
  var windSpeed = w.imperial.windSpeed ? w.imperial.windSpeed : 0
  var windGust = w.imperial.windGust ? w.imperial.windGust : 0

  console.log(JSON.parse(current).value.observations[0])

  const calcWindDirectionCardinal = (winddir) => (winddir ? ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"][(Math.round((winddir) / 22.5, 0))] : '')
  var windDirectionCardinal = calcWindDirectionCardinal(w.winddir)

  var now = new Date()
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  var ms = new Date() - new Date(w.obsTimeUtc)
  var obs = msToHHMMSS(ms)

  return {

    stationID: w.stationID,
    temp: w.imperial.temp,
    humidity: w.humidity,
    winddir: windDirectionCardinal,
    dewpt: w.imperial.dewpt,
    elev: w.imperial.elev,
    windSpeed: windSpeed + ' | ' + windGust,
    pressure: w.imperial.pressure,
    coords: { lat: w.lat, lon: w.lon },
    obs: obs,
    windRelToHole: w.winddir - bearingToHole + 180


  }

}
