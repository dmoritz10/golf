
async function getRounds(prmExcludeSmall, prmSelectCourse) {

    var str = new Date()

    var hcpSelectOptions = readOption('hcpFilter')
    var hcpExcludeSmall = prmExcludeSmall === undefined ? hcpSelectOptions.hcpExcludeSmall : prmExcludeSmall
    var selectCourse = prmSelectCourse === undefined ? false : prmSelectCourse

    if (!suSht) {            // everytime (only endRound.scorecards so far) scorecards are altered, suSht is set to null

        suSht = await openShts(
            [
            { title: 'Scorecard Upload', type: "all"
            }
            ])
    }

    if (suSht['Scorecard Upload'].rowCount < 1) {
        
        return []

    }

    var cols            = suSht['Scorecard Upload'].colHdrs
    var rounds          = [...suSht['Scorecard Upload'].vals]
    var arrRounds       = []
    
    var parCol          = cols.indexOf('par')
    var scoreCardCol    = cols.indexOf('scoreCard')
    var courseNameCol   = cols.indexOf('courseName')

    for (var j = 0; j < rounds.length; j++) {
        if (hcpExcludeSmall) {
        
          var sc = JSON.parse(rounds[j][scoreCardCol])
          var nbrHolesCorrection = 18 / sc.scores.filter(Boolean).length

          if (nbrHolesCorrection !== 1 || rounds[j][parCol]*1 < 69) 
            continue;
        }

        if (selectCourse) {
            if (shortCourseName(rounds[j][courseNameCol]) != selectCourse) 
                continue
        }

        arrRounds.push([rounds[j], j])
    }

    if (arrRounds.length == 0) {
        bootbox.alert('There are no rounds.')
        return []
    }
    
    var objRounds = []
    var prevRndHandicap = 0 
    var hcpNbrRounds =  8
    
    for (var r = 0; r < arrRounds.length; r++) {

        var roundObj = makeObj(arrRounds[r][0], cols)

        roundObj.rowIdx = arrRounds[r][1]
        
        roundObj.objHandicap = {

            handicap: '',
            handicapDiff: '',
            courseHandicap: '',
            escCorrections: '',
            handicapScore: '',
            courseAdjustedScore: '',
            mostRecent20: [],
            netAdj: {},
            targetScore: {}
        }
        
        objRounds.push(roundObj)
        
        if (r<3) continue;
         
        var rndHcp = objRounds[objRounds.length-1].objHandicap

        var sc = JSON.parse(roundObj.scoreCard)
        var ci = JSON.parse(roundObj.courseInfo)

        var slopeRating = ci.courseInfo['Slope Rating']*1
        var courseRating = ci.courseInfo['USGA Course Rating']*1
        var par = ci.courseInfo['Par']*1
        var courseHandicap = Math.round((slopeRating * prevRndHandicap) / 113) + courseRating - ci.courseInfo['Par']*1
        var courseRatingFront9 = ci.courseInfo['Front 9 Rating']

        var round = sc.scores
        var nbrHolesCorrection = 18 / sc.scores.filter(Boolean).length

        var rtnHcpDiff = calcHandicapDifferential(sc, slopeRating, courseRating, courseHandicap, ci.holeDetail)

        rndHcp.handicapDiff = rtnHcpDiff.hcpDiff
        rndHcp.escCorrections = rtnHcpDiff.escCorrections

        var mostRecent20 = []
        for (var i = 0; i <= r; i++) {
            var j = r - i

            let objHcp = objRounds[j].objHandicap

            if (mostRecent20.length < 20 && objHcp !== '') {
                mostRecent20.push(objHcp.handicapDiff)
            }
            else { break;
            }
        }

        var nbrToUse = calcNbrToUse(mostRecent20)

        var lowScores = []

        var mostRecent20 = mostRecent20.filter(Boolean); // remove rounds with no hcpdiff (ie first 5 rounds)

        var mostRecent20Chron = JSON.parse(JSON.stringify(mostRecent20))
        
        var mostRecent19 = JSON.parse(JSON.stringify(mostRecent20))
        mostRecent19.pop()
        
        nbrToUse = Math.min(nbrToUse, hcpNbrRounds)

        if (nbrToUse > 0) {
            mostRecent20.sort(compareNumbers)
            var cnt = 0
            var sum = 0
            for (var i = 0; i < nbrToUse; i++) {
                cnt++
                sum = sum + mostRecent20[i] * 1.0
                lowScores.push(mostRecent20[i])
            }

            var handicap = parseInt(sum * 10 / cnt) / 10
        } else {
            var handicap = ''
        }

        var courseHandicap = prevRndHandicap == '' ? '' : calcCourseHandicap(courseRating, slopeRating, par, prevRndHandicap)

        if (handicap !== '') {
            var handicapScore = ($.sum(sc.scores, 'score') * nbrHolesCorrection) - courseHandicap
        } else {
            var handicapScore = ''
        }

        if (courseRating > 0) {
            var courseAdjustedScore = courseRating + (($.sum(sc.scores, 'score') - courseRating) * 113 / slopeRating)
        } else {
            var courseAdjustedScore = ''
        }

        var netAdj = calcHcpAdj(courseHandicap, ci.holeDetail)
        
        var lowScores = []
        
        if (nbrToUse > 0 && mostRecent19.length > 0) {
            mostRecent19.sort(compareNumbers)
            var cnt = 0
            var sum = 0
            for (var i = 0; i < nbrToUse - 1; i++) {
                cnt++
                sum = sum + mostRecent19[i] * 1.0
                lowScores.push(mostRecent19[i])
            }
            //  handicap = (sum * 0.96  / cnt)
            //  (handicap - .1) = ((sum + thd) * .96) / (cnt + 1)
            //  ((sum + thd) * .96) = (handicap - .1) * (cnt + 1)
            //  thd = (((handicap - .1) * (cnt + 1)) / .96 ) - sum)
          
          var targetHandicapDiff = ((prevRndHandicap - .1) * (cnt + 1)) - sum
        } else {
          
          var targetHandicapDiff = ''
        }

        var targetScore = calcRoundsTargetScore(targetHandicapDiff, courseRating, slopeRating, courseRatingFront9) 


        rndHcp.handicap = handicap == '' ? handicap : handicap
        rndHcp.courseHandicap = courseHandicap
        rndHcp.handicapScore = handicapScore
        rndHcp.courseAdjustedScore = courseAdjustedScore
        rndHcp.mostRecent20 = mostRecent20Chron
        rndHcp.netAdj = netAdj
        rndHcp.targetScore = targetScore
            
        var prevRndHandicap = handicap

    }
    
    // console.log((new Date() - str)/1000)
    
    // console.log( objRounds)
    
//    await updateTarScr(JSON.parse(JSON.stringify(objRounds)), cols)
    
    return objRounds
}

function calcCourseHandicap (courseRating, slopeRating, par, handicap) {

    return Math.round(((slopeRating*1) * (handicap*1) / 113) + (courseRating*1) - (par*1))
}

function calcHandicapDifferential(sc, slopeRating, courseRating, courseHandicap, holeDetail) {   

    var nbrHolesCorrection = 18 / sc.scores.filter(Boolean).length
    
    var equitableScoreControl = 0
    
    var netParAdj = calcHcpAdj(courseHandicap, holeDetail)
    
    for (var i=0;i<sc.scores.length;i++) {
    
      if (!sc.scores[i]) continue; 
    
      equitableScoreControl += Math.min(sc.scores[i].score*1,sc.scores[i].par*1 + 2 - netParAdj[i][2])
  
    } 
    
    var escCorrections = $.sum (sc.scores, 'score') - equitableScoreControl
     
    equitableScoreControl = equitableScoreControl * nbrHolesCorrection
    
    if (slopeRating !== '') {
      var result = Math.round((equitableScoreControl - courseRating) * 113 * 10 /  slopeRating) / 10
    } else {
      var result = ''
    } 
      return {hcpDiff:result, escCorrections: escCorrections}
  
  }
  
  function calcEcsMax(courseHandicap) {
  
    var ecsMax = 0
    switch (true) {
      case courseHandicap < 10:
        ecsMax = 0
        break;
      case courseHandicap < 20:
        ecsMax = 7
        break;
      case courseHandicap < 30:
        ecsMax = 8
        break;
      case courseHandicap < 40:
        ecsMax = 9
        break;
      default:
        ecsMax = 10
        break;
    }
    return ecsMax
  }
  
function compareNumbers(a, b) { return a - b}

function median(a, b, c) { return a < b ? b < c ? b : a < c ? c : a : b < c ? a < c ? a : c : b;}
  
function calcRoundsTargetScore(targetHandCapDiff, courseRating, slopeRating, courseRatingFront9) {

  var targetScore = ((targetHandCapDiff * slopeRating /  113) + courseRating * 1.0)
  var courseRatingFront = courseRatingFront9.split(' / ')[0]
  var slopeRatingFront = courseRatingFront9.split(' / ')[1]
  var targetScoreFront = Math.round(((targetHandCapDiff * slopeRatingFront /  113) + courseRatingFront * 2.0) / 2)
  var targetScoreBack = Math.round(targetScore) - targetScoreFront

  return {
  
    score: Math.round(targetScore),
    front: targetScoreFront,
    back:targetScoreBack,
    hcpDiff:targetHandCapDiff
    }
}

function calcNbrToUse(mostRecent20) {
    var nbrToUse = 10
    switch (true) {
        case mostRecent20.length <= 4:
            nbrToUse = 0
            break;
        case mostRecent20.length <= 6:
            nbrToUse = 1
            break;
        case mostRecent20.length <= 8:
            nbrToUse = 2
            break;
        case mostRecent20.length <= 10:
            nbrToUse = 3
            break;
        case mostRecent20.length <= 12:
            nbrToUse = 4
            break;
        case mostRecent20.length <= 14:
            nbrToUse = 5
            break;
        case mostRecent20.length <= 16:
            nbrToUse = 6
            break;
        case mostRecent20.length <= 17:
            nbrToUse = 7
            break;
        case mostRecent20.length <= 18:
            nbrToUse = 8
            break;
        case mostRecent20.length <= 19:
            nbrToUse = 9
            break;
    }

    return nbrToUse
}

async function updateTarScr(objRounds, cols) {

var arrCi = []

for (var j = 0; j < objRounds.length; j++) {
  
    var roundObj = objRounds[j]

    var ts = roundObj.objHandicap.targetScore
    var targetScore = ts.score + ' ... ' + ts.front + ' / ' + ts.back
    var ci = JSON.parse(roundObj.courseInfo)

    console.log(JSON.parse(JSON.stringify(ci.courseInfo)))

    ci.courseInfo['Target Score'] = targetScore
    ci.courseInfo['Course Handicap'] = Math.round(roundObj.objHandicap.courseHandicap)
    ci.courseInfo['Course Equivalent Score'] = Math.round(roundObj.objHandicap.courseAdjustedScore)

    console.log(roundObj.objHandicap.courseAdjustedScore)
    console.log( Math.round(roundObj.objHandicap.courseAdjustedScore))
    console.log(ci.courseInfo['Course Equivalent Score'])
    console.log(ci.courseInfo)

    arrCi.push([JSON.stringify(ci)])
}
  
  console.log(arrCi)
  
  var ciCol = cols.indexOf('courseInfo') 
  var rng = calcRngA1(2, ciCol + 1, arrCi.length, 1)  
  
  var params = {
  spreadsheetId: spreadsheetId,
  resource: { data: [
                {
        range: "'Scorecard Upload'!" + rng,
        values: arrCi
                    
                }
            ], 
  valueInputOption: "RAW"
        }
    };

  await checkAuth()
  await gapi.client.sheets.spreadsheets.values.batchUpdate(params)
    .then(function(response) { console.log('"Scorecard Upload Test" update successful')
    console.log(response)
    }, function(reason) {
      console.error('error updating option "' + '' + '": ' + reason.result.error.message);
      alert('error updating option "' + '' + '": ' + reason.result.error.message);
    });
}
