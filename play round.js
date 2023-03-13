
async function btnPlayRoundHtml() {

  if (arrShts['My Courses'].vals.length == 0)  {
    bootbox.alert('You must set up a Course before playing a round')
    return null
  }

  console.log('btnPlayRoundHtml')
    
  transitionPlayRoundTab()

  $('#rsGoTo')[0].setAttribute("onclick", `gotoTab('Scorecard')`);
  
  var resumeRound = await checkForIncompleteRound()
  
  if (resumeRound) return

  var hcpObj = readOption('handicapObj')

  $('#hpCurrHandicap').html(hcpObj.currHandicap)
  $('#hpNbrRounds').html(hcpObj.nbrRounds)
  
  $("#hpTargetHandicap").val( Math.round((hcpObj.currHandicap*1 - .1)*10)/10)

  var e = {}; e.data = {};
  e.data.useDefaultTee = true
  await loadCourseInfo(e)

  gotoTab('PlayRound')

}


function checkForIncompleteRound () {

  return new Promise(async function(resolve) {
  
//    var prevRound = await promiseRun('readLog')
    var prevScordCard = readOption('currScoreCard')
    var prevCourseInfo = readOption('currCourseInfo')
    
    console.log(prevScordCard)

    console.log('this and that')
    
//    if (prevRound.scoreCard && prevRound.courseInfo) {
    if (prevScordCard && prevCourseInfo) {
    
//      prScore = JSON.parse(prevRound.scoreCard)
      prScore = prevScordCard
      
      var confirmResume = await confirm("Resume previous round at " + 
                                          prScore.courseName +
                                          " at hole " +
                                          (prScore.lastHoleScored > 17 ? 1 : prScore.lastHoleScored + 1) +
                                          " ?")
      
      if (confirmResume) {
      
//        prCourse = JSON.parse(prevRound.courseInfo)
        prCourse = prevCourseInfo
        prClubs = readOption('Clubs', [])
        
        console.log(prCourse)
        
        recoverScorecard()
        
        if (canUseGeo) startGeoLoc()
        
        resolve(true)
        
      } else {
      
//        promiseRun('clearRound')
        await updateOption('currScoreCard', '')                  
        await updateOption('currCourseInfo', '')  

        resolve(false)
    
      }
    } else {
    
      resolve(false)
    }
  });
}

async function recoverScorecard() {

  $('#prCourseName').html(shortCourseName(prCourse.courseInfo['Course Name']))
  
  $('#prTrackDistance').html(0)
  $('#prPrevTrackDistance').html(0)
  $('#prDistance').html(0)
  $('#prDistanceBack').html('&nbsp')
  $('#prDistanceFront').html('&nbsp') 
  $('#prClubRec').html('') 
  
  var course = findCourse(prCourse.courseInfo['Course Name'])
  var idxCol = arrShts['My Courses'].colHdrs.indexOf('Uweather StationId')
  prCourse.courseInfo["Weather Url"] = course[idxCol]
    
  setWeatherHref({
      
        stationId:prCourse.courseInfo['Uweather StationId'],
        city:prCourse.courseInfo['City'],
        state:prCourse.courseInfo['State'],
        country:'US',
        type:'hourly',
        element:$('#btnSCWeather')
        
  })
    
  gotoTab('Scorecard')

  await new Promise(resolve => setTimeout(resolve, 150)); // Didn't have to do this before 2021-11-16_04-08-09_PM initialization release

  var e = {}; e.data={};  e.data.offset = {}
  e.data.offset.goto = prScore.lastHoleScored > 17 ? 1 : prScore.lastHoleScored + 1
  btnChangeHoleHtml(e)

}

async function loadCourseInfo(e) {

  var useDefaultTee = e ? e.data.useDefaultTee : false
  
  var teeInfoIdx = {
  
    teeName:1,
    gender:2,
    par:3,
    courseRating:4,
    slope:5,
    bogeyRating:6,
    front9Rating:7,
    back9Rating:8,
    yardage:9
  
  }
  
  var selectedCourseIdx = document.getElementById("hpSelectCourse").selectedIndex;

      var cols = arrShts['My Courses'].colHdrs
      courseInfo = makeObj(arrShts['My Courses'].vals[selectedCourseIdx], cols)
      delete courseInfo['SxS Hole Detail']
      
      var selectedTees = document.getElementById("hpSelectTees"); 
      
      var teeInfo = JSON.parse(courseInfo['Tee Info'])
      
      teePlayed = useDefaultTee ? courseInfo['Tee Name'] 
                                : selectedTees.options[selectedTees.selectedIndex].value;
                                         
      var st = document.getElementById('hpSelectTees')
      $('option', st).remove();
      
      var hcpObj = readOption('handicapObj')
   
      for (var i=0;i<teeInfo.length;i++) {
  
        if (teeInfo[i][teeInfoIdx.gender] == courseInfo['Gender']) {
  
          $('<option/>').val(teeInfo[i][teeInfoIdx.teeName]).html(teeInfo[i][teeInfoIdx.teeName]).appendTo(st)
      
          if (teeInfo[i][teeInfoIdx.teeName] == teePlayed) {
        
            $('#hpSelectTees').prop('selectedIndex', i);
            
            courseInfo['Tee Name']           = teeInfo[i][teeInfoIdx.teeName]
            courseInfo['Gender']             = teeInfo[i][teeInfoIdx.gender]
            courseInfo['Par']                = teeInfo[i][teeInfoIdx.par]
            courseInfo['USGA Course Rating'] = teeInfo[i][teeInfoIdx.courseRating]
            courseInfo['Slope Rating']       = teeInfo[i][teeInfoIdx.slope]
            courseInfo['Bogey Rating']       = teeInfo[i][teeInfoIdx.bogeyRating]
            courseInfo['Front 9 Rating']     = teeInfo[i][teeInfoIdx.front9Rating]
            courseInfo['Back 9 Rating']      = teeInfo[i][teeInfoIdx.back9Rating]
            courseInfo['Yardage']            = teeInfo[i][teeInfoIdx.yardage]

            $('#hpCourse_Rating')          .html ( courseInfo['USGA Course Rating'])
            $('#hpBogey_Rating')           .html ( courseInfo['Bogey Rating'])
            $('#hpSlope_Rating')           .html ( courseInfo['Slope Rating'])
            $('#hpFront_9_Rating')         .html ( courseInfo['Front 9 Rating'])
            $('#hpBack_9_Rating')          .html ( courseInfo['Back 9 Rating'])
            $('#hpYardage')                .html ( formatNumber(courseInfo['Yardage']))
            $('#hpPar')                    .html ( courseInfo['Par'])
                        
          }
        }
      }

      $('#hpPar').html ( courseInfo['Par'])
      $('#hpNbr_Times_Played').html ( courseInfo['Nbr Times Played'])
      $('#hpAvg_Play_Time').html ( courseInfo['Avg Play Time'])
      
      courseInfo['Course Handicap'] = calcCourseHandicap (courseInfo['USGA Course Rating'], 
                                                          courseInfo['Slope Rating'], 
                                                          courseInfo['Par'],  
                                                          hcpObj.currHandicap)
      
      $('#hpCourseHandicap').html (courseInfo['Course Handicap'])

      var tsObj = calcTargetScoreDan(hcpObj.mostRecent20HcpDiff, $('#hpTargetHandicap').val(), courseInfo['USGA Course Rating'], courseInfo['Slope Rating'], courseInfo['Front 9 Rating'])
      
      courseInfo['Target Score'] = tsObj.scoreFmt
      
      $('#hpTargetScore').html (tsObj.scoreFmt)

} 

