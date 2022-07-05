
async function btnShowHandicapHtml () {

  var hcpObj = readOption('handicapObj')
  var prevNbrRounds = hcpObj.nbrRounds*1

  var rounds = await getRounds()

  if (!rounds) return

  var hcpArr = []
  var nbrRounds = 0
  
  for (var j = rounds.length - 1; j > -1; j--) {
  
    var roundObj = rounds[j]
      
    // var sc = JSON.parse(roundObj.scoreCard)
    var ci = JSON.parse(roundObj.courseInfo)
    var objHandicap = roundObj.objHandicap      
    // var objTargetScore = objHandicap.targetScore


    if (j == rounds.length - 1) {                 //  handicap info from most recent round
      
      handicapObj = {
        'mostRecent20HcpDiff': objHandicap.mostRecent20,
        'currHandicap': objHandicap.handicap,
        'nbrRounds': rounds.length
      }

      updateOption('handicapObj', handicapObj)

      console.log(handicapObj)

    }      
    var dtPlayed = new Date(roundObj.startTime).toString().substring(0,15)
   
    hcpArr.push({
      
      shortCourseName: shortCourseName(roundObj.courseName.toString()),
      datePlayed: dtPlayed,
      teePlayed: roundObj.tee,
      score: roundObj.finalScore.toString(),
      targetScore: ci.courseInfo['Target Score'],
      courseRating: ci.courseInfo['USGA Course Rating'],
      slopeRating: ci.courseInfo['Slope Rating'],
      courseHandicap: ci.courseInfo['Course Handicap'],
      hcpDiff: objHandicap.handicapDiff,
      escCorrections: objHandicap.escCorrections,
      rowIdx: roundObj.rowIdx,
      arrIdx: nbrRounds,
      hcp: objHandicap.handicap
      
    })
      
    nbrRounds++
      
  }
    
    
  if (nbrRounds == 0) {
  
    bootbox.alert ('No rounds qualify for handicap.')  
    return
    
  }
  
  var hcpNbrRounds = 8

  var frstIdx = 0
  var lastIdx = Math.min(hcpArr.length - 1, 19)
  
  var workArr = hcpArr.filter((val, idx) => idx >= frstIdx && idx <= lastIdx)
  
  workArr.sort((a, b) => (a.hcpDiff > b.hcpDiff) ? 1 : -1)
  
  var sum = 0
  var cnt = 0
  var arrHcpIdxs = []
  
  for (var j=0;j<workArr.length;j++) {

    if (j < hcpNbrRounds) {
  
      sum += workArr[j].hcpDiff
      arrHcpIdxs.push(workArr[j].arrIdx)
      cnt++
    
    } else  break;
  
  }
    
  var hcpAlert

  if (arrHcpIdxs.indexOf(19) > -1) {                             // the 20th round was used to calc hcp
    
    hcpAlert = true;

    var idxOf11th = workArr[j].arrIdx                            // j is an artifact of the loop above
    var hcpDiffOf11th = workArr[j].hcpDiff
    var hcpDiffOf10th = hcpArr[19].hcpDiff

    sum -= hcpDiffOf10th                                         // the last round processed is the most recent round     
    sum += hcpDiffOf11th                                  

    var handicapAlert = parseInt(sum * 10 / cnt) / 10     // calc the hcp as if the 20th round was replaced with the 11th ranked by Hcp Diff
   
  }

  var $tblHcp = $("#hcpContainer > .d-none")

  var x = $tblHcp.clone();
  $("#hcpContainer").empty();
  x.appendTo("#hcpContainer");


  for (var j = 0; j < hcpArr.length; j++) {
  
    var val = hcpArr[j]

    val.hcpDiff = val.hcpDiff ? val.hcpDiff : '&nbsp;'
      
    var ele = $tblHcp.clone();

    ele.find('#hcpScore')[0].innerHTML = val.score
    ele.find('#hcpCourseName')[0].innerHTML = val.shortCourseName
    ele.find('#hcpDate')[0].innerHTML = val.datePlayed
    ele.find('#hcpTees')[0].innerHTML = val.teePlayed
    ele.find('#hcpTargetScore')[0].innerHTML = val.targetScore.split(' ')[0]
    ele.find('#hcpCourseRating')[0].innerHTML = (val.courseRating*1).toFixed(1)
    ele.find('#hcpSlopeRating')[0].innerHTML = val.slopeRating
    ele.find('#hcpHcpDiff')[0].innerHTML = val.escCorrections ? val.hcpDiff + '<sup>' + val.escCorrections + '</sup>' : val.hcpDiff
    ele.find('#hcpHcp')[0].innerHTML = val.hcp ? val.hcp : '&nbsp;'
  
    ele.find('#hcpFetchRound')[0].setAttribute("onclick", "showRoundDetail(" + val.rowIdx + ", 'ShowHCP')");
    
          
    if (arrHcpIdxs.indexOf(j) > -1) {       // highlight the rows that were used in the hcp of the most recent round
      ele.css( "background", "#f5edcb")
      ele.find('#hcpSeqNbr')[0].innerHTML = arrHcpIdxs.indexOf(j) + 1
    } else {
      ele.css( "background", "white")
      ele.find('#hcpSeqNbr')[0].innerHTML = ''
    }
    
    if (hcpAlert && j == idxOf11th) {
      ele.css( "background", "#acdb9e")      
      ele.find('#hcpSeqNbr')[0].innerHTML =  9
    }
    
    ele.removeClass('d-none')
    
    ele.appendTo("#hcpContainer");
    
    if (j>18) break;
  
  }
  
  displayHcpTrend(hcpArr, handicapAlert)

  $('#rsGoTo')[0].setAttribute("onclick", `gotoTab('ShowHCP')`);
  gotoTab('ShowHCP')


  var hcpForceRecalc = $('#hcpForceRecalc').prop('checked')
  if (rounds.length != prevNbrRounds || hcpForceRecalc)    courseSummary(rounds)

  $('#hcpContainer > div').click(function(e){         // highlight clicked row
    $('#hcpContainer > div').removeClass('sheet-focus');
    $(e.currentTarget).addClass('sheet-focus')
  });

}

function displayHcpTrend(hcpArr, handicapAlert) {

  var hcpAlertTxt = handicapAlert ? '<i class="material-icons">trending_up</i>' + handicapAlert.toFixed(1) : ''
  
  if (hcpArr.length > 0) {
    $ ('#hcpHcp1').html(hcpArr[0].hcp.toFixed(1) + hcpAlertTxt)
    $ ('#hcpHcpTime1').html('Current')
  }

  if (hcpArr.length > 9) {
    $ ('#hcpHcp2').html(hcpArr[9].hcp.toFixed(1))
    $ ('#hcpHcpTime2').html('Last 10 Rounds')
  }

  if (hcpArr.length > 19) {
    $ ('#hcpHcp3').html(hcpArr[19].hcp.toFixed(1))
    $ ('#hcpHcpTime3').html('Last 20 Rounds')
  }
  
}

function displayHcpHist(handicap) {                                                // replaced by displayHcpTrend

  var hcpOption = readOption('Course Adjusted Score').arrData
  
  $ ('#hcpHcp1').html(handicap)
  $ ('#hcpHcp2').html(hcpOption[2][2])
  $ ('#hcpHcp3').html(hcpOption[2][3])
  
  $ ('#hcpHcpTime1').html('Current')
  $ ('#hcpHcpTime2').html(hcpOption[0][2])
  $ ('#hcpHcpTime3').html(hcpOption[0][3])

}


async function btnHCPMoreVertHtml() {

  var hcpSelectOptions  = readOption('hcpFilter')
  var hcpExcludeSmall   = hcpSelectOptions.hcpExcludeSmall
  
  $('#hcpExcludeSmall').prop('checked',  hcpExcludeSmall )
  $('#hcpForceRecalc').prop('checked',  false )

}

function btnHCPResetHtml() {

  $('#hcpExcludeSmall').prop('checked',  true )

}


async function btnHCPSelectHtml(e) {
  
  var hcpExcludeSmallVal = $('#hcpExcludeSmall').prop('checked')

  await updateOption('hcpFilter', {
                                  'hcpExcludeSmall': hcpExcludeSmallVal
                                  })
                      
  $("#btnHCPMoreVert").click()
  
  btnShowHandicapHtml()

}

