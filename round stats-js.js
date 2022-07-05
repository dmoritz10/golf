

function btnRoundStatsHtml() {

  gotoTab('RoundStats')

  if (prScore.status == 'in process' || prScore.status == 'initialize')  {    // called from scorecard
    var datePlayed = estimateCompletion()
  } else {                                                                    // called from handicap, rounds
    var datePlayed = new Date(prScore.startTime).toString().substring(0,15)
  }

  $('#rsCourseName').html(shortCourseName(prCourse.courseInfo['Course Name']))
  $('#rsStartDate').html(datePlayed)
  $('#rsTees').html(prScore.tee)
  $('#rsCourseHandicap').html(prCourse.courseInfo['Course Handicap'])
  $('#rsTargetScore').html(prCourse.courseInfo['Target Score'])
  
  $('#rsHoles')   .html ( prScore.scores.filter(function(value) { return value != undefined}).length);
  $('#rsScore')   .html ( $.sum (prScore.scores, 'score'))
  $('#rsPutts')   .html ( $.sum (prScore.scores, 'putts'))
  $('#rsFairways').html ( $.fairwaysHit(prScore.scores))

  // $('#rsHoles')   .attr('data-content', calcHoleSummary(RSCalledFrom));
  $('#rsHoles')   .attr('data-content', calcHoleSummary());
  $('#rsScore')   .attr('data-content', calcScoreSummary());
  $('#rsPutts')   .attr('data-content', calcPuttSummary());
  $('#rsFairways').attr('data-content', calcDriveSummary());
  
  console.log(calcScoreSummary())
  
  $('#rsTees').attr('data-content', calcCourseSummary());

  var scoreAnal = []
  
  
  var grossScore = calcGrossScore()
  scoreAnal.push(grossScore)
  
  var netParAdj = calcHcpAdj(prCourse.courseInfo['Course Handicap'], prCourse.holeDetail)
  var netScore = calcNetScore(netParAdj)
  scoreAnal.push(netScore)
  
  var base = parseInt(prCourse.courseInfo['Target Score'].split(' ')[0]) - parseInt(prCourse.courseInfo['Par'])
  var netParAdj = calcHcpAdj(base, prCourse.holeDetail)
  var targetScore = calcTargetScore(netParAdj)
  scoreAnal.push(targetScore)
  
  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass('thead-light')
    .setData(scoreAnal)
    .setTableClass('table text-center')
    .setTrClass('no-border')
    .setTcClass(['', 'text-right', 'text-right', 'text-right', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0 text-success text-center h3')
    .build('#tblRoundStats');
        
} 


function btnRSScorecard() {
  
  $('#btnRSScorecard')   .attr('data-content', scorecard('RoundStats'));  

}


function scorecard(e) {

  console.log('scorecard')

  console.log(e)

  var ci = prCourse.holeDetail
  var sc = prScore.scores
  
  var btnHtml     = '<button class="btn btn-outline btn-primary btn-circle h6" onclick="gotoHole.call(this)">'
  var btnHtmlCurr = '<button class="btn btn-outline btn-primary btn-circle active" onclick="gotoHole.call(this)">'
  var scoreHtml   = '<h5 class="pt-2 font-weight-bold">'
  var totHtml     = '<h5 class="pt-2 font-weight-bold text-success">'
  var arr = []
  
  var front9     = {}
  front9.par     = $.sum (prCourse.holeDetail.slice(0, 9), 'par')
  front9.parPlayed = 0
  front9.score   = 0
  front9.putts   = 0
  front9.adj     = 0
  front9.pnlty   = 0
  front9.drive   = 0
  front9.sand    = 0
  front9.yardage = $.sum (prCourse.holeDetail.slice(0, 9), 'yardage')
  
  var back9     = {}
  back9.par     = $.sum (prCourse.holeDetail.slice(9, 18), 'par')
  back9.parPlayed = 0
  back9.score   = 0
  back9.putts   = 0
  back9.adj     = 0
  back9.pnlty   = 0
  back9.drive   = 0
  back9.sand    = 0
  back9.yardage = $.sum (prCourse.holeDetail.slice(9, 18), 'yardage')
  
  var arrHcpAdj = calcHcpAdj(parseInt(prCourse.courseInfo['Target Score'].split(' ')[0]) 
                                          - parseInt(prCourse.courseInfo['Par']), prCourse.holeDetail)

                                          
  ci.forEach((val,idx) => {
  
    
    var adj = arrHcpAdj[val.hole - 1][2]
                                          
    var hcpAdj = adj != 0 ? '-'.repeat(Math.abs(adj)) : '\u00a0'    // : non-printing space to improve right just

    if (sc[idx]) {
        
      if (idx < 9) {
        
        front9.parPlayed += parseInt(sc[idx].par)
        front9.score += parseInt(sc[idx].score)
        front9.putts += parseInt(sc[idx].putts)
        front9.adj   += parseInt(adj)
        front9.pnlty += parseInt(sc[idx].pnlty)
        front9.drive += sc[idx].drive == 'Str8' ? 1 : 0
        front9.sand  += sc[idx].sand.toLowerCase() == 'yes' ? 1 : 0
      
      } else {
  
        back9.parPlayed += parseInt(sc[idx].par)
        back9.score += parseInt(sc[idx].score)
        back9.putts += parseInt(sc[idx].putts)
        back9.adj   += parseInt(adj)
        back9.pnlty += parseInt(sc[idx].pnlty)
        back9.drive += sc[idx].drive == 'Str8' ? 1 : 0
        back9.sand  += sc[idx].sand.toLowerCase() == 'yes' ? 1 : 0
       
      }
    }
    
    if (sc[idx]) {
    
      var score = annotateScore(sc[idx])
      var cadj  = (front9.score + back9.score) - (front9.parPlayed + back9.parPlayed) + (front9.adj + back9.adj)
      var putts = sc[idx].putts
      var pnlty = sc[idx].pnlty*1 ? sc[idx].pnlty : ''
      var drive = driveIcon(sc[idx].drive)
      var sand  = sc[idx].sand.toLowerCase() == 'yes' ? '<i class="material-icons font-weight-bold text-danger">check</i>' : ''
      var clubs = sc[idx].clubs ? sc[idx].clubs.join(' | ') : ''
    } else {
      var score = ''
      var cadj  = ''
      var putts = ''
      var pnlty = ''
      var drive = ''
      var sand  = ''
      var clubs = ''
    }
    
    var lhs = prScore.lastHoleScored + 1 <= ci.length ? prScore.lastHoleScored + 1 : 1
    if (e !== "RoundStats") lhs = null
  
    if (val.hole == lhs) {
   
      arr.push([btnHtmlCurr + val.hole    + '</button>', 
                scoreHtml   + val.hcp + hcpAdj    + '</h5>', 
                scoreHtml   + val.par     + '</h5>', 
                scoreHtml   + score       + '</h5>', 
                scoreHtml   + cadj        + '</h5>', 
                scoreHtml   + putts       + '</h5>', 
                scoreHtml   + pnlty       + '</h5>', 
                scoreHtml   + drive       + '</h5>', 
                scoreHtml   + sand        + '</h5>',
                scoreHtml   + val.yardage + '</h5>',
                scoreHtml   + clubs       + '</h5>'])
      
   
    } else {
  
      arr.push([btnHtml     + val.hole    + '</button>', 
                scoreHtml   + val.hcp + hcpAdj    + '</h5>', 
                scoreHtml   + val.par     + '</h5>', 
                scoreHtml   + score       + '</h5>', 
                scoreHtml   + cadj        + '</h5>', 
                scoreHtml   + putts       + '</h5>', 
                scoreHtml   + pnlty       + '</h5>', 
                scoreHtml   + drive       + '</h5>', 
                scoreHtml   + sand        + '</h5>',
                scoreHtml   + val.yardage + '</h5>',
                scoreHtml   + clubs       + '</h5>'])
    }
    
    if (idx == 8)  
      arr.push([totHtml + 'front'        + '</h5>', 
                totHtml + ''             + '</h5>', 
                totHtml + front9.par     + '</h5>', 
                totHtml + front9.score   + '</h5>', 
                totHtml + (front9.score - front9.parPlayed + front9.adj) + '</h5>', 
                totHtml + front9.putts   + '</h5>', 
                totHtml + front9.pnlty   + '</h5>', 
                totHtml + front9.drive   + '</h5>', 
                totHtml + front9.sand    + '</h5>',
                totHtml + front9.yardage + '</h5>'])
                              
                              
                              
    if (idx == 17)  
      arr.push([totHtml + 'back'        + '</h5>', 
                totHtml + ''            + '</h5>', 
                totHtml + back9.par     + '</h5>', 
                totHtml + back9.score   + '</h5>', 
                totHtml + (back9.score - back9.parPlayed + back9.adj) + '</h5>', 
                totHtml + back9.putts   + '</h5>', 
                totHtml + back9.pnlty   + '</h5>', 
                totHtml + back9.drive   + '</h5>', 
                totHtml + back9.sand    + '</h5>',
                totHtml + back9.yardage + '</h5>'])
    
    
  })
  
  arr.push([totHtml + 'total'                           + '</h5>', 
            totHtml + ''                                + '</h5>', 
            totHtml + (front9.par + back9.par)          + '</h5>', 
            totHtml + (front9.score + back9.score)      + '</h5>', 
            totHtml + ((front9.score + back9.score) - (front9.parPlayed + back9.parPlayed) + (front9.adj + back9.adj)) + '</h5>', 
            totHtml + (front9.putts + back9.putts)      + '</h5>', 
            totHtml + (front9.pnlty + back9.pnlty)      + '</h5>', 
            totHtml + (front9.drive + back9.drive)      + '</h5>',
            totHtml + (front9.sand  + back9.sand)       + '</h5>',
            totHtml + (front9.yardage  + back9.yardage) + '</h5>']) 

  var tbl = new Table();
  
  tbl
    .setHeader(['', 'hcp', 'par', 'scr', 'o/u', 'pts', 'pnlty', 'drive', 'sand', 'yard', 'clubs'])
    .setData(arr)
    .setTableClass('table')
    .setTrClass('no-border')
    .setTcClass(['pl-0', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right', 'text-right', 'text-center', 'text-right', 'text-right', 'text-nowrap'])
    .setTdClass('pb-0 pt-1')
    .setTableHeaderClass('thead-light')
    .build();
    
  return tbl.html
    
}

function driveIcon(drive) {

  var icon = drive
  
  switch (drive) {
      
      case 'Str8' :
        icon = '<i class="material-icons text-success font-weight-bold">arrow_upward</i>'
        break;
      case 'Left' :
        icon = '<i class="material-icons">redo</i>'
        break;
      case 'Right' :
        icon = '<i class="material-icons">undo</i>'
        break;
      case 'Chunk' :
        icon = 'Chk'
        break;
   }   
   
  return icon

}

function annotateScore(sc) {
  
  var rtn = sc.score
  var scoreVsPar = sc.par - sc.score
    
  if      (scoreVsPar ==  1)  {rtn = '<span style="border-style:solid;border-width:1px; border-radius: 50%;padding: 1px 4px">' + sc.score + '</span>'}
  else if (scoreVsPar == -1)  {rtn = '<span style="border-style:solid;border-width:1px;padding: 1px 4px">' + sc.score + '</span>'}
  else if (scoreVsPar ==  2)  {rtn = '<span style="border-style: double;border-width:3px;border-radius: 50%;padding: 1px 4px">' + sc.score + '</span>'}
  else if (scoreVsPar == -2)  {rtn = '<span style="border-style: double;border-width:3px;padding: 1px 4px">' + sc.score + '</span>'}
  else if (scoreVsPar <  -2)  {rtn = '<span style="border-style: double;border-width:3px;background-color: lightgrey;padding: 1px 4px">' + sc.score + '</span>'}
  else if (scoreVsPar >   2)  {rtn = '<span style="border-style: double;border-width:3px;border-radius: 50%;background-color: lightgreen;padding: 1px 4px">' + sc.score + '</span>'}

  return rtn
  
}


function calcHcpAdj(base, holeDetail) {

  const arrayColumn = (arr, n) => arr.map(x => x[n]);
  var arrHcp = arrayColumn(holeDetail, 'hcp');  

  var arrAdj = []
  arrHcp.forEach((val, idx, arr) => {arrAdj.push([idx, val, 0])})
  arrAdj.sort(function(a,b) { return a[1] > b[1] ? 1 : -1; });  
  
  var idx = 0
  while (base > 0) {
  
    arrAdj[idx][2]--
    idx++
    if (idx > holeDetail.length - 1) idx = 0
  
    base--
  
  }
  
  arrAdj.sort(function(a,b) { return a[0] > b[0] ? 1 : -1; });  
  
  return arrAdj

}

function calcGrossScore() {

  var rtn = [
    'gross',
    prCourse.courseInfo.Par,
    $.sum (prScore.scores, 'par'),
    $.sum (prScore.scores, 'score'),
    $.sum (prScore.scores, 'score') - $.sum (prScore.scores, 'par')
  ]
  
  return rtn
  
}

function calcNetScore(netParAdj) {

  var netScore = 0
  prScore.scores.forEach((val,idx) => {if (val) netScore += parseInt(prScore.scores[idx].score) + parseInt(netParAdj[idx][2]) })

  var rtn = [
    'net',
    prCourse.courseInfo.Par,
    $.sum (prScore.scores, 'par'),
    netScore,
    netScore - $.sum (prScore.scores, 'par')
  ]
  
  return rtn
}

function calcTargetScore(netParAdj) {

  var adjPar = 0
  prScore.scores.forEach((val,idx) => {if (val) adjPar += parseInt(prScore.scores[idx].par) - parseInt(netParAdj[idx][2]) })
  
  var targetScore = parseInt(prCourse.courseInfo['Target Score'].split(' ')[0])
  
  var calcEsc = calcHandicapDifferential(
                         prScore, 
                         prCourse.courseInfo['Slope Rating'], 
                         prCourse.courseInfo['USGA Course Rating'], 
                         prCourse.courseInfo['Course Handicap'], 
                         prCourse.holeDetail)


console.log('calcEsc')                                          
console.log(netParAdj)
console.log(calcEsc)
                         
  var rtn = [
    'target',
    targetScore,
    adjPar,
    calcEsc.escCorrections ? $.sum (prScore.scores, 'score') - calcEsc.escCorrections + '<sup>' + calcEsc.escCorrections + '</sup>': $.sum (prScore.scores, 'score'),
    $.sum (prScore.scores, 'score') - adjPar - calcEsc.escCorrections
  ]
  
  return rtn
  
}

function calcHoleSummary() {

  var sc = prScore.scores
  var arr = []
    
//  var d = getDateDiff(RSCalledFrom != "ShowRounds" ? new Date(prScore.endTime) : new Date(),  new Date(prScore.startTime))
  var d = getDateDiff(prScore.endTime ? new Date(prScore.endTime) : new Date(),  new Date(prScore.startTime))
  arr.push(["Play Time", d])
  
  var cntr = 0
  sc.map((val, idx) => {if (val) {if (val.score - val.putts <= val.par - 2) cntr++;}});
  arr.push(["GIR", cntr])
  
  var cntr = 0
  sc.map((val, idx) => {if (val) {if (val.score - val.putts <= val.par - 1) cntr++;}});
  arr.push(["GIR + 1", cntr])
  
  var cntr = 0
  sc.map((val, idx) => {if (val) {if (val.score - val.putts > val.par - 2 && val.putts <= 1) cntr++;}});
  arr.push(["Up and Down", cntr])
  
  var cntr = 0
  sc.map((val, idx) => {if (val) {if (val.score - val.putts > val.par - 2 && val.score <= val.par) cntr++;}});
  arr.push(["Scrambling", cntr])
  
  var cntr = 0
  sc.map((val, idx) => {if (val) {if (val.score <= val.par && val.sand.toLowerCase() == "yes") cntr++;}});
  arr.push(["Sand Saves", cntr])
  
  var cntr = 0
  sc.map((val, idx) => {if (val) {if (val.sand.toLowerCase() == "yes") cntr++;}});
  arr.push(["Bunkers Hit", cntr])
  
  arr.push(["Penalty Strokes", $.sum (prScore.scores, 'pnlty')])
  
  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0 h4')
    .build();
    
  return tbl.html
  
  
}

function calcScoreSummary() {

  var sc = prScore.scores
  var arr = [
    ['Eagles', 0],
    ['Birdies', 0],
    ['Pars', 0],
    ['Bogeys', 0],
    ['Dbl Bogeys', 0],
    ['Over Dbl Bogeys', 0],
    ['&nbsp;', '&nbsp;']
  ]
  
  var p3Cnt = 0
  var p3Sum = 0
  var p4Cnt = 0
  var p4Sum = 0
  var p5Cnt = 0
  var p5Sum = 0


  sc.map((val,idx) => {
  
    if (val) {
  
      var p = val.score - val.par
      
      switch (p) {
      
      case -2:
      case -3:
        arr[0][1]++
        break;
      case -1:
        arr[1][1]++
        break;
      case 0:
        arr[2][1]++
        break;
      case 1:
        arr[3][1]++
        break;
      case 2:
        arr[4][1]++
        break;
      default:
        arr[5][1]++
        break;
      }

      switch (val.par*1) {

        case 3:
          p3Cnt++
          p3Sum += val.score*1
          break;
        case 4:
          p4Cnt++
          p4Sum += val.score*1
          break;
        case 5:
          p5Cnt++
          p5Sum += val.score*1
          break;

      }

    }
  })

  if (p3Cnt) arr.push(['Par 3', (p3Sum/p3Cnt).toFixed(1)])
  if (p4Cnt) arr.push(['Par 4', (p4Sum/p4Cnt).toFixed(1)])
  if (p5Cnt) arr.push(['Par 5', (p5Sum/p5Cnt).toFixed(1)])
  
  for (var i=arr.length-1;i>-1;i--) {if (arr[i][1] == 0) arr.splice(i,1)}

  console.log(arr)

  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0 h4')
    .build();
    
  return tbl.html
     
  }

  function calcPuttSummary() {

    var sc = prScore.scores
    var arr = [
      ['0 Putt', 0],
      ['1 Putt', 0],
      ['2 Putt', 0],
      ['3 Putt', 0],
      ['>3 Putt', 0]
    ]
    
    sc.map((val,idx) => {
    
      if (val) {
    
      switch (parseInt(val.putts)) {
      
      case 0:
        arr[0][1]++
        break;
      case 1:
        arr[1][1]++
        break;
      case 2:
        arr[2][1]++
        break;
      case 3:
        arr[3][1]++
        break;
      default:
        arr[4][1]++
        break;
      }
    }
  })
  
  for (var i=arr.length-1;i>-1;i--) {if (arr[i][1] == 0) arr.splice(i,1)}
  
  var puttsPerHole = Math.round ($('#rsPutts').html() * 10 / $('#rsHoles').html()) / 10
  
  arr.push(['Putts per Hole', puttsPerHole])

  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0 h4')
    .build();
    
  return tbl.html
  
  
}

function calcDriveSummary() {

  var sc = prScore.scores
  var arr = [
    ['Straight', 0],
    ['Left', 0],
    ['Right', 0],
    ['Top', 0],
    ['Chunk', 0]
  ]
  
  sc.map((val,idx) => {
  
    if (val) {
  
    switch (val.drive) {
    
    case 'Str8':
      arr[0][1]++
      break;
    case 'Left':
      arr[1][1]++
      break;
    case 'Right':
      arr[2][1]++
      break;
    case 'Top':
      arr[3][1]++
      break;
    default:
      arr[4][1]++
      break;
    }
    }
  })
  
  for (var i=arr.length-1;i>-1;i--) {if (arr[i][1] == 0) arr.splice(i,1)}
  
  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0 h4')
    .build();
    
  return tbl.html
  

}


function calcCourseSummary() {

  var ci = prCourse.courseInfo
  var arr = [
    ['Crs Rating', ci['USGA Course Rating']],
    ['Bgy Rating', ci['Bogey Rating']],
    ['Slope', ci['Slope Rating']],
    ['Front 9', ci['Front 9 Rating']],
    ['Back 9', ci['Back 9 Rating']],
    ['Yardage', ci['Yardage']],
    ['Nbr Played', ci['Nbr Times Played']],
    ['Avg Time', ci['Avg Play Time']]
  ]
  
  if (prScore.golfers) {
    prScore.golfers.map((val, idx) => {
      arr.push([idx == 0 ? "Golfers" : '', val.name ? val.name : val])  // ': val' is to retro old rounds with array vs array of objects
    })
  }
  
    
  var tbl = new Table();
  
  tbl
    .setHeader()
    .setTableHeaderClass()
    .setData(arr)
    .setTableClass('table')
    .setTrClass()
    .setTcClass(['', 'text-right'])
    .setTdClass('pb-1 pt-1 border-0 h4')
    .build();
    
  return tbl.html
  
}

function getDateDiff(adate, bdate) {

  var diff = (adate.getTime() - bdate.getTime()) / (1000 * 60)
  var hours   = ('0' + Math.floor(diff / 60)).slice(-2);
  var minutes = ('0' + Math.floor(diff % 60)).slice(-2);
  
  return hours + ':' + minutes

}

function estimateCompletion() {

  var sc = prScore.scores
  var avgPlayTime = prCourse.courseInfo['Avg Play Time']
  var rndPlayTime = getDateDiff(prScore.endTime ? new Date(prScore.endTime) : new Date(),  new Date(prScore.startTime))

  if (sc.length < 5) {
    
    var hrmin = avgPlayTime.split(":")
    var minutesPlayed = hrmin[0]*60 + hrmin[1]*1
    var estPlayTimeMS = minutesPlayed

  } else {

    var hrmin = rndPlayTime.split(":")
    var minutesPlayed = hrmin[0]*60 + hrmin[1]*1
    var estPlayTimeMS = minutesPlayed * prCourse.holeDetail.length / sc.length

  }
  
  var hours = ('0' + Math.floor(estPlayTimeMS / 60)).slice(-2);
  var minutes = ('0' + Math.floor(estPlayTimeMS % 60)).slice(-2);
  var estPlayTime = hours + ':' + minutes

  var st = new Date(new Date(prScore.startTime).getTime() + (estPlayTimeMS * 1000 * 60))
 
  return rndPlayTime + ' | ' + estPlayTime + ' | ' + st.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

}

function shareRound() {

  var email = 'mailto:test@example.com?subject=subject&body=<div style="background-color:powderblue;color:red;">'


  var x = encodeURIComponent(email)


  window.open(x)


}