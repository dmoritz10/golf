
async function btnStartRoundHtml() {

  prCourse.courseInfo = courseInfo
  if (!prClubs) prClubs = readOption('Clubs', [])
  
  
  var gender = prCourse.courseInfo["Gender"].toLowerCase()
  var tee = teePlayed
  // var tee = teePlayed.toLowerCase()

  prCourse.holeDetail = await getHoleDetail(prCourse.courseInfo['SxS Course Id'], tee, gender)
  
  if (prCourse.holeDetail.length == 0) {
  
    bootbox.alert ('Hole detail cannot be found')
  
    return
  
  }

  $('#prCourseName').html(shortCourseName(prCourse.courseInfo['Course Name']))
  
  $('#prTrackDistance').html(0)
  $('#prPrevTrackDistance').html(0)
  $('#prDistance').html(0)
  $('#prDistanceBack').html('-')
  $('#prDistanceFront').html('-')  
  
  gotoTab('Scorecard')  

  initScorecardUpload(tee, gender)

  // loadHoleDetail(0)  
  await new Promise(resolve => setTimeout(resolve, 150)); // Didn't have to do this before 2021-11-16_04-08-09_PM initialization release

  var e = {}; e.data={};  e.data.offset = 0
  btnChangeHoleHtml(e)

  console.log("done")
  
  if (canUseGeo) {var position = await initDistance()  }
  
  setWeatherHref({
      
        stationId:prCourse.courseInfo['Uweather StationId'],
        city:prCourse.courseInfo['City'],
        state:prCourse.courseInfo['State'],
        country:'US',
        type:'hourly',
        element:$('#btnSCWeather')
        
  })  
  
}

async function initDistance() {
  
  var position = await getGeoLocation()
  
  if (position) {
  
    prLat = position.coords.latitude
    prLng = position.coords.longitude
    
  }
  
  startGeoLoc()
  
  return position

}


function startGeoLoc() {
  
  navigator.geolocation.watchPosition(displayDist, geoErr, geolocationOptions);

}

function displayDist(position) {

  if (prLat) {

    var dist = Math.round(distance(prLat, prLng, position.coords.latitude, position.coords.longitude, 'M') * 1760)
  
    document.getElementById("prPrevTrackDistance").innerHTML = dist 
    
  }

}

function geoErr(err) {

console.log('geoErr')
console.log(err)

  
//  alert(err)

}


async function getGeoLocation() {
    
    return new Promise((res, rej) => {
      
      if (navigator.geolocation) {
      
        navigator.geolocation.getCurrentPosition(
          function (position) {res (position);}, 
          function (err) {res (null);}, 
          geolocationOptions);
        
      } else { 
        
        bootbox.alert("Geolocation is not supported by this browser.");
      
      }

    });
}


async function initScorecardUpload(tee, gender) {

  prScore = {}
  prScore.courseName = prCourse.courseInfo['Course Name']
  prScore.startTime = new Date()
  prScore.scorecardId = prCourse.courseInfo.Key.replace(/\s/g, "") + prScore.startTime.toISOString().substr(0, 19)
  prScore.status = 'initialize'
  prScore.endTime = null
  prScore.currHole = 1
  prScore.lastHoleScored = null
  prScore.gender = gender
  prScore.tee = tee
  prScore.par = prCourse.courseInfo['Par']
  prScore.scores = []
  prScore.golfers = useGolfersFromTeetimes( prScore.courseName )    
  prScore.targetScoreHcpAdj = calcHcpAdj(parseInt(prCourse.courseInfo['Target Score'].split(' ')[0]) 
                                          - parseInt(prCourse.courseInfo['Par']), prCourse.holeDetail)
  
//    await promiseRun('logRound', ['currScoreCard','currCourseInfo'], 
//                                 [JSON.stringify(prScore), JSON.stringify(prCourse)]
//                    )
                  
  await updateOption('currScoreCard', JSON.stringify(prScore))                  
  await updateOption('currCourseInfo', JSON.stringify(prCourse))                  

}

function btnChangeHoleHtml(e) {

  console.log('btnChangeHoleHtml', arguments)

  $("#divPutts").replaceWith(puttsOriginalState.clone(true));  
  $("#divDrive").replaceWith(driveOriginalState.clone(true));  
  $("#divPnlty").replaceWith(pnltyOriginalState.clone(true));  
  $("#divSand").replaceWith(sandOriginalState.clone(true));  

  var offset = e.data.offset
  
  loadHoleDetail(offset)
    
}


function loadHoleDetail(offset) {

  console.log('loadHoleDetail', arguments)


  if (typeof offset === 'object') {
  
    var hole = offset.goto - 1

  } else if (offset != 0) {

    var hole = prScore.currHole + offset - 1
  
    if (hole > prCourse.holeDetail.length - 1) {
      hole = 0
    }
  
    if (hole < 0) {
      hole = prCourse.holeDetail.length - 1
    }
  
  } else {
  
    var hole = prScore.lastHoleScored ? prScore.lastHoleScored : 0

  }
  
  prScore.currHole = hole + 1
  
  var tsAdj = ' ' + '-'.repeat(Math.abs(prScore.targetScoreHcpAdj[hole][2]))
  
  $('#prHole').html(prCourse.holeDetail[hole].hole)
  $('#prPar').html(prCourse.holeDetail[hole].par)
  $('#prHCP').html(prCourse.holeDetail[hole].hcp + tsAdj)
  $('#prYardage').html(prCourse.holeDetail[hole].yardage)
  
  $('#prClubRec').html('&nbsp')
  $('#prDistanceFront').html('Front').css('opacity', .5)
  $('#prDistance').html('Center').css('opacity', .5)
  $('#prDistanceBack').html('Back').css('opacity', .5)
  
  
  $('#prHole')   .attr('data-content', scorecard());  
  
  setScoreDescriptions(prCourse.holeDetail[hole].par)
  
  setScoreIfPlayed()
  
}

function setScoreIfPlayed() {

  var sc = prScore.scores;
  var holeScore;
  
  for (var i=0;i<sc.length;i++) {
  
    if (sc[i] && sc[i].holeNbr == prScore.currHole) {
      var holeScore =  sc[i]
      break;
    }
  }
  
  if (holeScore) {

    console.log('holeScore')
    console.log(holeScore)

    setScoreComp('Score', holeScore.score)
    setScoreComp('Putts', holeScore.putts)
    setScoreComp('Pnlty', holeScore.pnlty)
    setScoreComp('Drive', holeScore.drive)
    setScoreComp('Sand',  holeScore.sand)
    
    $('.scoreComp').addClass('hdrScored');

    $('.puttsDesc').not('.hid').addClass('selScored')
    $('.pnltyDesc').not('.hid').addClass('selScored')
    $('.driveDesc').not('.hid').addClass('selScored')
    $('.sandDesc') .not('.hid').addClass('selScored')
    
  } else {

    console.log('not holeScore zaaazz')
    console.log(holeScore)
  
    $('.puttsDesc')[2].scrollIntoView();
    $('.pnltyDesc')[0].scrollIntoView();
    $('.driveDesc')[1].scrollIntoView();
    $('.sandDesc')[0].scrollIntoView();

    $('.scoreComp').removeClass('hdrScored');
    $('.puttsDesc').not('.hid').removeClass('selScored')
    $('.pnltyDesc').not('.hid').removeClass('selScored')
    $('.driveDesc').not('.hid').removeClass('selScored')
    $('.sandDesc') .not('.hid').removeClass('selScored')
 

  }
  
  document.getElementById("divScore").scrollTop -= 12;
  document.getElementById("divPutts").scrollTop -= 12;  
  document.getElementById("divPnlty").scrollTop -= 12; 
  document.getElementById("divDrive").scrollTop -= 12;  
  document.getElementById("divSand").scrollTop  -= 12;  
  
}


function setScoreComp(scoreComp, compVal) {

  var selector = '#sel' + scoreComp.charAt(0).toUpperCase() + scoreComp.slice(1) + '.nav li'
  var find = "." + scoreComp.toLowerCase() + "Nbr"
  
  $(selector).find(find).each(function(index, element) {

    if ($(this)[0].textContent == compVal) {

      console.log($(this))
      
      var selector = '.' + scoreComp.toLowerCase() + 'Desc'
      
      $(selector)[index].scrollIntoView();
      
      $(this).click()
      return false;                   // break
  
    }
  
  });       

}

function adjustScrolls() {

  document.getElementById("divScore").scrollTop -= 12;
   
  document.getElementById("divPutts").scrollTop -= 12;  

  document.getElementById("divPnlty").scrollTop -= 12;

  document.getElementById("divDrive").scrollTop -= 12;  

  document.getElementById("divSand").scrollTop  -= 12;  

}

function setScoreDescriptions(par) {

  switch (par) {
  
    case 3:
      var scoreDescriptors = [
        'eagle',
        'birdie',
        'par',
        'bogey',
        'double',
        'triple',
        '4 over',
        '5 over',
        '6 over',
        '7 over',
        '8 over',
        '9 over',
        '10 over',
        '11 over',
        '12 over'
      ]
      break;
    
    case 4:
      var scoreDescriptors = [
        'double',
        'eagle',
        'birdie',
        'par',
        'bogey',
        'double',
        'triple',
        '4 over',
        '5 over',
        '6 over',
        '7 over',
        '8 over',
        '9 over',
        '10 over',
        '11 over'
      ]
      break;
    
    case 5:
      var scoreDescriptors = [
        'triple',
        'double',
        'eagle',
        'birdie',
        'par',
        'bogey',
        'double',
        'triple',
        '4 over',
        '5 over',
        '6 over',
        '7 over',
        '8 over',
        '9 over',
        '10 over'
      ]
      
      break;
  }
      
  $('.scoreDesc').each(function(index, element) {
    
    $(this).html(scoreDescriptors[index])

    if (scoreDescriptors[index] == 'par') {
    
      $(this).click()
      element.scrollIntoView();
  
    }
  });       
}

async function getHoleDetail(sxsCourseId, tee, gender) {

  return await xhr('https://cors.bridged.cc/' + sxsCourseId)
    
    .then( response => {
      
      // console.log(response.xhr);  // full response
      // console.log(response.data)

      return assembleHoleDetail(response.data, tee, gender) 

	  })

	  .catch( error => {
      console.log(error.status); // xhr.status
      console.log(error.statusText); // xhr.statusText
	  });

}

function assembleHoleDetail(sxsCourseInfo, tee, gender) {

  console.log('hi dan')

  var d = sxsCourseInfo.split('bootstrapData(').pop().split('}}});')[0] + '}}}'
  
  var p = JSON.parse(d)
  
  var holes = p.model.data.holes
  
  var data = p.model.data

  if (prCourse.courseInfo) {
  
    prCourse.courseInfo.courseCoords = {
    
      lat: data.lat,
      lng: data.lng
      
    }
  } 
  var holeDetail = []
  
  holes.forEach(hole => {
  
   for (let teeBox of hole.teeBoxes) {
   
      var teeColor = teeBox.teeColorType.toLowerCase()
      var teeGender = teeBox.teeType == "women" ? "f" : "m"
      
      // if (teeColor == tee && teeGender == gender) {
      if (teeColor == tee.toLowerCase() ) {
        
        var dtl = {
        
          hole: hole.hole,
          yardage: teeBox.yards ? teeBox.yards : '-',
          hcp: teeBox.hcp ? teeBox.hcp : '-',
          par: teeBox.par ? teeBox.par : '-',
          greenLocation: {lat: hole.greenLat, lng: hole.greenLng},
          greenFront:    {lat: hole.frontLat, lng: hole.frontLng},
          greenBack:     {lat: hole.backLat,  lng: hole.backLng},
          teeLocation:   {lat: teeBox.lat,  lng: teeBox.lng}  
          
          
        }
      
        holeDetail.push(dtl)
        
        break;
    
      } 
    }
  })
  
  return holeDetail
  
}

async function btnSaveScoreHtml() {

  $('#btnSaveScore').prop('disabled', true)
  
  $("#Scorecard").css('opacity', '0.2');  

  if (!prScore.scores[prScore.currHole - 1]) prScore.lastHoleScored = prScore.currHole

  prScore.scores[prScore.currHole - 1] = {

    holeNbr: prScore.currHole,
    holeFinishTime: new Date(),
    score: $("#selScore.nav li a.active").find('.scoreNbr')[0].textContent,
    putts: $("#selPutts.nav li a.active").find('.puttsNbr')[0].textContent,
    pnlty: $("#selPnlty.nav li a.active").find('.pnltyNbr')[0].textContent,
    sand:  $("#selSand.nav li a.active") .find('.sandNbr' )[0].textContent,
    drive: $("#selDrive.nav li a.active").find('.driveNbr')[0].textContent,
 
    par:   $('#prPar').html (),
    hcp:   $('#prHCP').html (),
    clubs: clubsThisHole

  }
  
  clubsThisHole = []
  prScore.status = 'in process'

  await updateOption('currScoreCard', JSON.stringify(prScore))                  
//  await promiseRun('logRound', 'currScoreCard', JSON.stringify(prScore))
  
  var e = {}; e.data = {};e.data.offset = 1

  btnChangeHoleHtml(e)
  
  $("#Scorecard").animate({ opacity: 1.0,}, "slow");

  $('#btnSaveScore').prop('disabled', false) 
  
}

async function btnHoleHistHtml(e, prevHoleNbr) {

  var rounds = await getRounds()

  if (!rounds) return

  var s = {
   
    Eagles: {nbr: 0, rcnt: new Date('1/1/1900')},
    Birdies:{nbr: 0, rcnt: new Date('1/1/1900')},
    Pars:{nbr: 0, rcnt: new Date('1/1/1900')},
    Bogeys:{nbr: 0, rcnt: new Date('1/1/1900')},
    'Dbl Bogeys':{nbr: 0, rcnt: new Date('1/1/1900')},
    '> Dbl Bogeys':{nbr: 0, rcnt: new Date('1/1/1900')}

  }
  
   var curHoleNbr = prevHoleNbr ? prevHoleNbr : $('#prHole').text() * 1

  if (typeof e === 'object') {
    var holeNbr = curHoleNbr
  } else {
    var holeNbr = e == 'prev' ? curHoleNbr - 1 : curHoleNbr + 1
    if (holeNbr < 1)  holeNbr = 18
    if (holeNbr > 18) holeNbr = 1
  }
  
  var nbrTimesPlayed = 0 

  var par
  var arrScores = []

  rounds.forEach((rnd) => {

    var scorecard = JSON.parse(rnd.scoreCard)

    scorecard.scores.forEach( val => {

      if (val) {
        
        if (rnd['courseName'] == prScore.courseName && holeNbr == val.holeNbr) {

          par = val.par
          arrScores.push(val.score*1)

          nbrTimesPlayed++
          var wrtp = val.score - val.par

          switch(true) {

            case wrtp < -1:
              s.Eagles.nbr++
              s.Eagles.rcnt = new Date(rnd.date) > s.Eagles.rcnt ? new Date(rnd.date) : s.Eagles.rcnt
              break;
            case wrtp < 0:
              s.Birdies.nbr++
              s.Birdies.rcnt = new Date(rnd.date) > s.Birdies.rcnt ? new Date(rnd.date) : s.Birdies.rcnt
              break;
            case wrtp < 1:
              s.Pars.nbr++
              s.Pars.rcnt = new Date(rnd.date) > s.Pars.rcnt ? new Date(rnd.date) : s.Pars.rcnt
              break;
            case wrtp < 2:
              s.Bogeys.nbr++
              s.Bogeys.rcnt = new Date(rnd.date) > s.Bogeys.rcnt ? new Date(rnd.date) : s.Bogeys.rcnt
              break;
            case wrtp < 3:
              s['Dbl Bogeys'].nbr++
              s['Dbl Bogeys'].rcnt = new Date(rnd.date) > s['Dbl Bogeys'].rcnt ? new Date(rnd.date) : s['Dbl Bogeys'].rcnt
              break;
            default:
              s['> Dbl Bogeys'].nbr++
              s['> Dbl Bogeys'].rcnt = new Date(rnd.date) > s['> Dbl Bogeys'].rcnt ? new Date(rnd.date) : s['> Dbl Bogeys'].rcnt
              break;

          }
        }
      } 
    })
    
  })

  var arr = []

  for (const sType in s) {
    if (s[sType].nbr) 
      arr.push([
        sType, 
        formatNumber(s[sType].nbr), 
        formatPercent(s[sType].nbr / nbrTimesPlayed, 0),
        formatDate(s[sType].rcnt)
      ])
  }

  arr.push(['', nbrTimesPlayed, '', ''])

  var tbl = new Table();

  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right', 'text-right', 'text-left'])
    .setTdClass('pb-1 pt-1 border-0')
    .build();

  var dev = stdDev(arrScores)

  var title = "Hole " + holeNbr + " - " + 
              "Hcp " + prCourse.holeDetail[holeNbr - 1].hcp + " - " +
              "Par " + par + " - " + 
              "Avg " + formatNumber(dev.mean)

  var wPrompt = bootbox.dialog({

    title: title,
    message: tbl.html,    
    className: 'holeHistoryCSS',
    closeButton: false,
    buttons: 
      {
      prevHole: 
        {
          label: "prev hole",
          className: 'btn-outline-primary',
          callback: function(result){
          
            btnHoleHistHtml('prev', holeNbr)

          }
        },

        nextHole: 
          {
            label: "next hole",
            className: 'btn-outline-primary',
            callback: function(result){
            
              btnHoleHistHtml('next', holeNbr)
  
            }
          },

        cancel:
          {
            label: "close",
            className: 'btn-outline-primary'
          }
      }

  });

  wPrompt.init(function () {

  });

}

async function btnClearScoreHtml() {

  if (!prScore.scores[prScore.currHole - 1]) return

  $('#btnClearScore').prop('disabled', true)
  
//  if (prScore.scores[prScore.currHole - 1]) prScore.scores.splice(prScore.currHole - 1, 1);
  if (prScore.scores[prScore.currHole - 1]) prScore.scores[prScore.currHole - 1] = null;


  clubsThisHole = []
  
 await updateOption('currScoreCard', JSON.stringify(prScore))                  
//   await promiseRun('logRound', 'currScoreCard', JSON.stringify(prScore))
  
  var e = {}; e.data = {};e.data.offset = 0
  btnChangeHoleHtml(e)

  $('#btnClearScore').prop('disabled', false) 
   
}

async function btnEndRoundHtml() {

  var confirmOK = await confirm("Are you sure you want to save the round ?")

  if (!confirmOK) return
  
 
  $('#btnEndRound').prop('disabled', true)
  
  navigator.geolocation.clearWatch(geoWatchId);  
 
  btnRoundStatsHtml()
  
  gotoTab('RoundStats')  

  prScore.status = 'complete'
  prScore.endTime = new Date()
  prScore.finalScore = $.sum (prScore.scores, 'score')

  await updateOption('currScoreCard', JSON.stringify(prScore))                  

  var resource = {
    "majorDimension": "ROWS",
    "values": [[
        prScore.courseName,
        prScore.startTime,
        prScore.endTime,
        'downloaded',
        new Date(),
        prScore.gender,
        prScore.tee,
        prScore.par,
        prScore.finalScore,
        JSON.stringify(prScore),
        JSON.stringify(prCourse)
    ]]
  }
  
  var params = {
    spreadsheetId: spreadsheetId,
    range: "'Scorecard Upload'!A2:J2",
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS'
  };

  await checkAuth()
  await gapi.client.sheets.spreadsheets.values.append(params, resource)
    .then(async function(response) {
      
      console.log('round posted')

      await updateOption('currScoreCard', '')                  
      await updateOption('currCourseInfo', '')   
      suSht = null                               // causes getRounds to refresh suSht next time its called   
   
    }, 
    
    function(reason) {
      
      console.error('error appending scorecard "' + prScore.courseName + '": ' + reason.result.error.message);      
      bootbox.alert('error appending scorecard "' + prScore.courseName + '": ' + reason.result.error.message);
    
    });

  
  

//  temporary to debug end round issues
//  await promiseRun('clearRound')
  
  

  $('#btnEndRound').prop('disabled', false) 
  
  toast('Round saved.  Calculating new Handicap.')


  btnShowHandicapHtml()
  
}

async function btnCancelRoundHtml() {

  var confirmOK = await confirm("Are you sure you want to cancel the round ?")

  if (!confirmOK) return

  $('#btnCancelRound').prop('disabled', true)
  
  navigator.geolocation.clearWatch(geoWatchId);  

//  await promiseRun('clearRound')
  await updateOption('currScoreCard', '')                  
  await updateOption('currCourseInfo', '')                  


  $('#btnCancelRound').prop('disabled', false) 
  
  toast('Round canceled')
  
  gotoTab('Home')  
  
}

function btnPauseRoundHtml() {
  
  gotoTab('Home')
  
  navigator.geolocation.clearWatch(geoWatchId);    
  
}


function gotoHole() {
  
  var e = {}; e.data={};  e.data.offset = {}
  e.data.offset.goto = this.textContent
    
  btnChangeHoleHtml(e)
  
  $('[data-original-title]').popover('hide');  

}

function btnTrackClubHtml() {
  
  if (canUseGeo) $('#btnTrackClub')   .attr('data-content', clubList());  

}

function clubList() {

  var cl = prClubs
    
  var btnHtml = '<button class="btn btn-outline btn-primary btn-circle pl-0 ml-0 h6" onclick="updateClub.call(this)">'
  var colHtml = '<h6 class="pt-2">'
  var arr = []
  
  cl.forEach((val,idx) => {
  
    arr.push([btnHtml + val.club + '</button>', 
              colHtml + val.long + '</h6>', 
              colHtml + val.avg + '</h6>', 
              colHtml + val.short + '</h6>', 
              colHtml + val.nbr + '</h6>'
              ])
    
  })

  var tbl = new Table();
  
  tbl
    .setHeader(['', 'lng', 'avg', 'sht', 'nbr'])
    .setData(arr)
    .setTableClass('table')
    .setTrClass('no-border')
    .setTcClass(['pl-0', 'text-right', 'text-right', 'text-right', 'text-right'])
    .setTdClass('pb-0 pt-1')
    .setTableHeaderClass('thead-light')
    .build();
    
  return tbl.html
    
}

function updateClub() {
  
  var club = this.textContent
    
  for (var i=0;i<prClubs.length;i++) {
    if (prClubs[i].club == club) {
      break;
    }
  }
  
//var dist = parseInt(prompt("enter distance"));

  var dist = Math.round($('#prTrackDistance').html() * 1)
  
  if (!isNaN(dist) && dist > 0) {

    if (dist > prClubs[i].long)                           prClubs[i].long  = dist
    if (dist < prClubs[i].short || prClubs[i].short == 0) prClubs[i].short = dist
    
    prClubs[i].avg = Math.round(((prClubs[i].avg * prClubs[i].nbr) + dist) / (prClubs[i].nbr*1 + 1))
  
    prClubs[i].nbr = Math.min(10, prClubs[i].nbr*1 + 1)
    
    clubsThisHole.push(club + ' - ' + dist )
  
    updateOption('Clubs', prClubs)  
  
  }
  
  $('[data-original-title]').popover('hide'); 
  
  
//  google.script.run.logRound('currClubs', JSON.stringify(prClubs))
  
}

function useGolfersFromTeetimes( courseName ) {

  var arrTeetimes = readOption('teetimes', [])
  var arrTeetime = arrTeetimes ? arrTeetimes[0] : null

  var rtn = []
  
  if (arrTeetime) {

    var nextTeetimeName = arrTeetime.courseName
    var shortName = shortCourseName(courseName)
  
    if (shortName == nextTeetimeName) {
  
      var glfrs = arrTeetime.golfers

      glfrs.forEach( val => {

        if (val.state == "maybe" || val.state == 'yes') {

          rtn.push({"name": val.name})

        }

      })
      
    } 
    
  }

  return rtn
  
}


async function btnShowLocationHtml(e) {

/*
var position = {};position.coords = {}
//position.coords.latitude = 33.0  33.68488201955337, -118.02790414065095
position.coords.latitude = 33.4630007572838
position.coords.longitude = -117.595169842243
position.coords.latitude =  33.68488201955337
position.coords.longitude = -118.02790414065095
showPosition(position, e.data.pinLocn)
return
*/
  if (!canUseGeo) return
  
  var timer = new Date()

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
//        alert(new Date() - timer);
        showPosition(position, e.data.pinLocn);
      }, 
      function (err) { 
        bootbox.alert('geoposition error - ' +  err)
        // on error
        var position = {};position.coords = {}
        position.coords.latitude = 33.4630007572838
        position.coords.longitude = -117.595169842243
        position.coords.latitude =  33.68488201955337
        position.coords.longitude = -118.02790414065095
        position.coords.altitude = 10
        showPosition(position, e.data.pinLocn)
      }, 
      geolocationOptions);    
  } else { 
    bootbox.alert("Geolocation is not supported by this browser.");
  }
  
}

function btnTrackDistanceHtml() {
  
  if (!canUseGeo) return
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showDistance, geoErr, geolocationOptions);
  } else { 
    bootbox.alert("Geolocation is not supported by this browser.");
  }

}

async function showPosition(position, pinLocn, strTimer) {

  var currLat = position.coords.latitude
  var currLng = position.coords.longitude
  var altitude = position.coords.altitude
  
  var lat = prCourse.holeDetail[prScore.currHole - 1].greenLocation.lat
  var lng = prCourse.holeDetail[prScore.currHole - 1].greenLocation.lng
  var dist = distance(lat, lng, currLat, currLng, 'M')  
  $('#prDistance').html(Math.round(dist * 1760)).css('opacity', 1.0)
  
  var lat = prCourse.holeDetail[prScore.currHole - 1].greenBack.lat
  var lng = prCourse.holeDetail[prScore.currHole - 1].greenBack.lng
  var dist = distance(lat, lng, currLat, currLng, 'M')
  $('#prDistanceBack').html(Math.round(dist * 1760)).css('opacity', 1.0)
  
  var lat = prCourse.holeDetail[prScore.currHole - 1].greenFront.lat
  var lng = prCourse.holeDetail[prScore.currHole - 1].greenFront.lng
  var dist = distance(lat, lng, currLat, currLng, 'M')
  $('#prDistanceFront').html(Math.round(dist * 1760)).css('opacity', 1.0)
  
  var lat = prCourse.holeDetail[prScore.currHole - 1].teeLocation.lat
  var lng = prCourse.holeDetail[prScore.currHole - 1].teeLocation.lng
  var distToTee = distance(lat, lng, currLat, currLng, 'M') * 1760
  
  $('#prClubRec').html('&nbsp')
  
  var weatherRpt = await getCurrWeather() 
  
  var timer = new Date()
  
  var bearingToHole = calcBearingToHole(currLat, 
                                    currLng, 
                                    prCourse.holeDetail[prScore.currHole - 1].greenLocation.lat,
                                    prCourse.holeDetail[prScore.currHole - 1].greenLocation.lng )

  var distToPin 
  
  switch (pinLocn) {
  case 'center':
    distToPin = $('#prDistance').text()
    break;
  case 'front':
    distToPin = $('#prDistanceFront').text()
    break;
  case 'back':
    distToPin = $('#prDistanceBack').text()
    break;
  default:
    distToPin = $('#prDistance').text()
  }
  
  distToPin = distToPin*1 
  
  var rtn = parseWeather(weatherRpt, bearingToHole, distToPin, distToTee, altitude)
  
  var cr = rtn.clubRec
  var w = rtn.currWeather
  
  var disp = w.imperial.windSpeed + ' ' + rtn.windDirection + ' | ' 
           + rtn.effectiveWindSpeed + '  ' + rtn.bearingToHole + ' | ' 
//           + (distToPin -cr.club1Distance + cr.club1Dist.distance)
           + distToPin

  if (cr) {
  
    disp += '  ' + (-(cr.club1Distance - cr.club1Dist.distance) > 0 ? '&#43;' : '' ) +  (-cr.club1Distance + cr.club1Dist.distance)
    $('#prClubRec').attr('data-content', calcDistDetails(rtn, distToPin, altitude));
  
  } else {
  
    $('#prClubRec').attr('data-content', 'A club could not be selected');
  
  }
  
  $('#prClubRec').html(disp)
  
  
  
//  alert('timer - ' + (new Date() - timer))
  
}

function calcDistDetails(rtn, distToPin, altitude) {

  var cr = rtn.clubRec
  var w = rtn.currWeather
  var arr = []
  
  var ms = new Date() - new Date(w.obsTimeUtc)
  var obs = msToHHMMSS(ms)
  var disp = obs
  arr.push(['Obs', disp])

  
  var disp = w.imperial.temp + '<small>&deg;</small>' + ' | ' + w.humidity  + '<small>&#37;</small>'               // <span>&#8457;</span>
  arr.push(['Weather', disp])
  
  var disp = w.imperial.pressure
  arr.push(['Pressure', disp])
  
  var disp = w.imperial.dewpt + '<small>&deg;</small>'
  arr.push(['Dew Pnt', disp])
  
  var disp = '<u>' + w.imperial.elev + ' | ' + Math.round(altitude) + '</u>' 
  arr.push(['<u>Altitude</u>', disp])
  
  29.92*Math.exp(-0.0000366 * w.imperial.elev)
  
  var disp = (cr.airDensity*1).toFixed(2)
  arr.push(['Air Den', disp])
  
  var disp = w.imperial.windSpeed + ' | ' 
             + (w.imperial.windGust ? w.imperial.windGust : w.imperial.windSpeed) + ' ' + rtn.windDirection
  arr.push(['Wind', disp])

  var disp = '<u>' + rtn.effectiveWindSpeed + '  '  + rtn.bearingToHole  + '</u>'
  arr.push(['<u>Eff Wind</u>', disp])

  var yardageAdj = (cr.club1Dist.distance - cr.club1Distance)*1
  
  var disp = yardageAdj
  arr.push(['Yardage Adj', (disp > 0 ? '&#43;' : '') +  disp])

  var disp = distToPin + yardageAdj
  arr.push(['Adj Distance', disp])
  
  var disp = distToPin  + yardageAdj - cr.club1Dist.distance
  arr.push(['Rem Distance', disp])
  
  var disp = '<br>'
  arr.push(['', disp])
  
  var disp = cr.club1 + ' ' + cr.club1Dist.distance + '<br>' +
                    cr.club2 + ' ' + cr.club2Dist.distance
  arr.push(['Clubs', disp])
  

  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0')
    .build();
    
  return tbl.html
  
  
}


function calcBearingToHole(startLat,startLng, destLat,destLng ) {
 
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);
 
  var y = Math.sin(destLng - startLng) * Math.cos(destLat);
  var x = Math.cos(startLat)*Math.sin(destLat) -
          Math.sin(startLat)*Math.cos(destLat)*Math.cos(destLng - startLng);
  var brng = Math.atan2(y, x) * 180 / Math.PI;
  
  return (brng + 360) % 360;

}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

async function getCurrWeather(bearingToHole) {

  var weatherUrl = setWeatherHref({
      
        stationId:prCourse.courseInfo['Uweather StationId'],
        city:prCourse.courseInfo['City'],
        state:prCourse.courseInfo['State'],
        country:'US',
        type:'weather',
        element:null
        
  })
  
  var weatherRpt = await getWeather(weatherUrl)
  
  return weatherRpt

}

async function getWeather(weatherUrl) {

  return await xhr('https://cors.bridged.cc/' + weatherUrl)
    
    .then( response => {
      
      // console.log(response.xhr);  // full response
      // console.log(response.data)

      return response.data

	  })

	  .catch( error => {
      console.log(error.status); // xhr.status
      console.log(error.statusText); // xhr.statusText
	  });

}

function parseWeather(wRptHtml, bearingToHole, distToPin, distToTee) {

  var str = wRptHtml.indexOf('{&q;value&q;:{&q;observations&q;:[{&q;stationID&q;:&q;')
  var end = wRptHtml.indexOf(',&q;expiresAt&q;:', str)  
  
// console.log(str)
// console.log(end)

  if (str < 0) return null  
  
  var current = wRptHtml.substring(str, end).replace(/&q;/g, '"') + '}'  
  var w = JSON.parse(current).value.observations[0]
  var windSpeed = w.imperial.windSpeed ? w.imperial.windSpeed : 0
    
  var effectiveWindSpeed = -Math.round(windSpeed * Math.cos(toRadians(bearingToHole - w.winddir)))
  
  // console.log(JSON.parse(current).value.observations[0])
  
  const calcWindDirectionCardinal = (winddir) => (winddir ? ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"][(Math.round((winddir)/ 22.5,0))] : '')
  var windDirectionCardinal = calcWindDirectionCardinal(w.winddir)
  var bearingToHoleCardinal = calcWindDirectionCardinal(bearingToHole)
  
  var clubRec = calcAdjDist(effectiveWindSpeed, distToPin, distToTee, w)
  
  return {
  
    currWeather:        w,
    bearingToHole:      bearingToHoleCardinal,
    effectiveWindSpeed: effectiveWindSpeed,
    windDirection:      windDirectionCardinal,
    clubRec:            clubRec
   
  }
  
/* hourly arrays from /hourly/
  var str = html.indexOf('{&q;value&q;:{&q;cloudCover&q;', 0)
  var end = html.indexOf(',&q;expiresAt&q;:', str)  
  var hourly = html.substring(str, end).replace(/&q;/g, '"') + '}'  
  var w = JSON.parse(hourly).value
  console.log(JSON.parse(hourly).value)
  
  var wDescr = w.windSpeed[0] + ' | ' 
             + (w.windGust[0] ? w.windGust[0] : w.windSpeed[0]) + '  ' 
             + w.windDirectionCardinal[0] + '  ' 
             + w.temperature[0] + ' | ' 
             + w.temperatureFeelsLike[0] 
*/  
  
}

function calcAdjDist(effectiveWindSpeed, distToPin, distToTee, w) {

  var clubDist = chooseClub(effectiveWindSpeed, distToPin, distToTee, w)

  return clubDist

}

function chooseClub(effectiveWindSpeed, distToPin, distToTee, w) {

  var arr = readOption('Clubs', [])
  
  var clubs = []

  arr.forEach((val,idx) => {
  
    if (val.calcDist)
      clubs.push({
        club:        val.club,
        launchAngle: val.launchAngle,
        ballSpeed:   val.ballSpeed
      })
  })
    
  var arrClubs = []
  
  var distance = distToPin
  
  if (distance < 110) var distance = 0
  
  var wind = effectiveWindSpeed
  var  p   = calcAirDensity(w)                                      
  
  for (var i=0;i<clubs.length;i++) {  
    
    var club = clubs[i]

    if (club.club == '1W' && distToTee > 50) continue;  // only include driver if on the tee

    var clubDist = calcClubDistance(wind, p, club.launchAngle, club.ballSpeed)
    
    arrClubs.push({
  
      club:        club.club, 
      launchAngle: club.launchAngle,  
      ballSpeed:   club.ballSpeed, 
      distance:    clubDist.distance, 
      apex:        clubDist.apex,
      initVx:      clubDist.initVx,
      endVx:       clubDist.endVx
  
    })
  
  }
  
  arrClubs.sort(function (a, b) {return b.distance - a.distance;}); 
  
  for (j = 0; j < arrClubs.length;j++) {
  
    var club = arrClubs[j]    

    if (club.distance < distance) break;  
  
  } 
  
  if (j>arrClubs.length) return null
  if (j==arrClubs.length) return null
  
  if (j == 0) {
    idx1 = 0
    idx2 = 1
  } else {
    idx1 = j-1
    idx2 = j
  }
   
  var club1 = arrClubs[idx1]  
  var club1Dist = calcClubDistance(0, 1.225, club1.launchAngle, club1.ballSpeed)
  
  var club2 = arrClubs[idx2]  
  var club2Dist = calcClubDistance(0, 1.225, club2.launchAngle, club2.ballSpeed)

  return {
  
    club1:         club1.club,
    club1Distance: club1.distance,
    club1Dist:     club1Dist,
    club2:         club2.club,
    club2Dist:     club2Dist,
    club2Distance: club2.distance,
    airDensity:    p

  }

}

function calcAirDensity(w) {
  const InchesToHpa = (inches) => inches * 33.863886666667;
  const FToC = (degreesF) => (degreesF - 32) / 1.8
  
  var T  = FToC(w.imperial.temp)
  var Dp = FToC(w.imperial.dewpt)
//  var P  = InchesToHpa(w.imperial.pressure - w.imperial.elev / 1000)
  var P  = InchesToHpa(29.92*Math.exp(-0.0000366 * w.imperial.elev))

// (T, P, Dp, Rh) 
	// (air temp in C, station pressure, dew point in C, humidity)
	// var d = (P * 100) / (287.05 * (T + 273.15));
	T = parseFloat(T);
	P = parseFloat(P);
	Dp = parseFloat(Dp)
	var Es = _calcVaporPressureE(Dp),
		Rv = 461.4964,
		Rd = 287.0531,
		tk = T + 273.15,
		pv = Es * 100,
		pd = (P - Es) * 100,
		d = (pv / (Rv * tk) ) + (pd / (Rd * tk) );
        
	return d.toFixed(5);
}

function _calcVaporPressureE(Dp) {
    // (dew point  in C)
    Dp = parseFloat(Dp);
    let a = (7.5 * Dp) / (237.3 + Dp);
    let E = 6.11 * Math.pow(10, a);

    return E;
}	

function calcClubDistance(wind, airDensity, launchAngle, ballSpeed) {

  if (launchAngle <= 0 || ballSpeed <= 0) return

  var p = airDensity
  var Cd = 0.275     
  var r = .04267/2                                  // m 
  var pi = 3.1415926535897932384626433832795
  var A = pi*r*r
  var m = .04593                                    // kg 

  var ms_to_mph = 2.237                             // meters per second to miles per hour
  var m_to_yd = 3.281/3                             // meters to feet

  var tdiv = 1000

  var v = ballSpeed
  var angle = (launchAngle)*pi/180
  var vx = v*Math.cos(angle)
  var vy = v*Math.sin(angle)
  var mwind = wind / ms_to_mph                      // convert to m/s
  var x = 0
  var y = 0
  var t = 0
  var apex = null
  
  var initVx = vx
  
  while (y >= 3 || x < 100) {
    
    var wvx = vx - mwind
    vx += -(Cd*p*wvx*wvx*A/2)/m/tdiv
    var aay = (Cd*p*vy*vy*A/2)/m/tdiv
    if (vy > 0) {
      vy += -aay - (9.8/tdiv)
    } else {
      if (!apex) apex = y
      vy += aay - (9.8/tdiv)
    }
    
    x += vx/tdiv
    y += vy/tdiv
    
    t =+ 1 / tdiv
    
    var z=1
  
  }

  return {distance:Math.round(x*m_to_yd), 
          apex:Math.round(apex*m_to_yd*3),
          initVx:initVx,
          endVx:vx
           
          }

}


function showDistance(position) {

  if ( prLat == position.coords.latitude && prLng == position.coords.longitude) {
  
    $('#prTrackDistance').html(0)
    return
  
  }
  
  if (!prLat) {
  
    prLat = position.coords.latitude
    prLng = position.coords.longitude
    
    $('#prTrackDistance').html(0)
  
  } else {
  
    var dist = distance(prLat, prLng, position.coords.latitude, position.coords.longitude, 'M')
    
//    if ($('#prTrackDistance').html() != 0) $('#prPrevTrackDistance').html($('#prTrackDistance').html())
    $('#prTrackDistance').html(Math.round(dist * 1760))

    prLat = position.coords.latitude
    prLng = position.coords.longitude
  }

}

function accumDist(position) {
    
  var dist = distance(prScore.distance.lat, prScore.distance.lng, position.coords.latitude, position.coords.longitude, 'M')

  prScore.distance.counter++
  prScore.distance.cumDist += dist
  prScore.distance.lat = position.coords.latitude
  prScore.distance.lng = position.coords.longitude
      
}

function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}


function btnGolfersHtml() {
  
  var inputOptions = getGolfers()
  console.log('inputOptions')
  console.log(inputOptions)
  console.log(prScore.golfers.map(a => JSON.stringify(a)))

  if (inputOptions.length == 0) return
  
  var golferPrompt = bootbox.prompt({
    
    title: "Select Golfers",
    value: prScore.golfers ? prScore.golfers.map(a => a.name) : [],
    inputType: 'checkbox',
    className: 'golfersCSS',
    closeButton: false,
    size: 'extra-large',
    inputOptions: inputOptions,
    callback: function (result) {prScore.golfers = result ? result.map(a => {return {"name": a}}) : [] }
    
  });


  golferPrompt.init(function(){
  
  });

}

function getGolfers() {

  var golfers = readOption('Golfers', [])

  console.log(golfers)
  
  var arr = []

  golfers.forEach((val,idx) => {
    arr.push({
      text: val.name,
      value: val.name
    })
  })
  
/*
    arr.push({
      text: 'Other',
      value: 'Other'
    })
*/  
  return arr

}


async function courseSummary(rounds) {

  console.log('courseSummary')

  // var rounds = await getRounds()

  var cols = arrShts['My Courses'].colHdrs
  var courses = arrShts['My Courses'].vals

  var keyCol = cols.indexOf("Key")
  var nbrPlayedCol = cols.indexOf("Nbr Times Played")
  var avgPlayTimeCol = cols.indexOf("Avg Play Time")
  
  const getCol = (arr, n) => courses.map(x => x[keyCol]);
  var courseKeys = getCol(courses.keyCol)

  var nbrArr = Array(courses.length).fill(0)
  var sumArr = Array(courses.length).fill(0)
  var avgArr = Array(courses.length).fill(0)

  var golfersArr = readOption('Golfers', [])
  golfersArr.map(a=>a.nbr=0);
  const findGolfer = (obj, key, value)=> obj.find(v => v[key] === value);

  rounds.forEach( (val, idx, arr) => {
    
    var sc = JSON.parse(val.scoreCard)

    var key = calcCourseKey(val.courseName)
    var courseIdx = courseKeys.indexOf(key)
    if (courseIdx > -1) {

      var tm = new Date(val.endTime).getTime() - new Date(val.startTime).getTime()

      if (tm < 1000 * 60 * 60) {

        tm = sc.scores.length * 15 * 60 * 1000              // estimate 15 minutes per hole

      }

      nbrArr[courseIdx]++
      sumArr[courseIdx] += tm

    } 
    // else  console.log('course key - ' + val.courseName + ' - ' + val.startTime )

    var golfers = sc.golfers

    if (sc.golfers) {
      golfers.forEach(val => {

      var glfr = findGolfer(golfersArr, 'name', val.name)
      if (glfr) glfr.nbr++

    })
    }
  })

  arrOptions['Golfers'] = JSON.stringify(golfersArr)
  
  updateGolfersOption()

  nbrArr.forEach((val, idx, arr) => {

    var avgTime = nbrArr[idx] > 0 ? (sumArr[idx] / (1000 * 60)) / nbrArr[idx] : ''

    if (avgTime) {

      var hours   = (Math.floor(avgTime / 60));
      var minutes = ('0' + Math.floor(avgTime % 60)).slice(-2);

      avgArr[idx] = [hours + ':' + minutes]

    } else {

      avgArr[idx] = ['']

    }

    nbrArr[idx] = nbrArr[idx] ? [nbrArr[idx]] : ['']
    

  })
  
  var data =     [
    { 
      range: "'My Courses'!" + calcRngA1(2, nbrPlayedCol + 1, nbrArr.length, 1),   
      values: nbrArr
    },
    {
      range: "'My Courses'!" + calcRngA1(2, avgPlayTimeCol + 1, avgArr.length, 1),   
      values: avgArr
    }
  ]

  var resource = {
    valueInputOption: 'USER_ENTERED',
    data
  }

  await gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: resource
  })
    .then(function(response) { 
      console.log('My Courses update successful')
      console.log('gapiResult batchUpdate')
      console.log(response)


    }, function(reason) {
      console.error('error updating courses "Nbr Times Played" : ' + reason.result.error.message);
      alert('error updating courses "Nbr Times Played" : ' + reason.result.error.message);
      return null
    });
  
    
    return rounds
}
