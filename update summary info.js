
function madeTargetScore(targetScore, finalScore) {

  if (isNaN(targetScore)) return false

  if (finalScore*1 <= targetScore*1) return true
  
  return false

}

function calcTargetScoreDan(mostRecent20HcpDiff, targetHandicap, courseRating, slopeRating, courseRatingFront9) {

  var hcpSelectOptions = readOption('hcpFilter')

  var mostRecent19 = JSON.parse(JSON.stringify(mostRecent20HcpDiff))
  
  mostRecent19.pop()

  var nbrToUse = calcNbrToUse(mostRecent20HcpDiff)
  
  var hcpNbrRounds =  8
  
  nbrToUse = Math.min(nbrToUse, hcpNbrRounds)

  if (nbrToUse > 0 && mostRecent19.length > 0) {
      mostRecent19.sort(compareNumbers)

      var lowScores = []
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
    
    var targetHandicapDiff = (targetHandicap * (cnt + 1)) - sum
  
  } else {
    
    var targetHandicapDiff = ''
  }

  var tsObj = calcRoundsTargetScore(targetHandicapDiff, courseRating, slopeRating, courseRatingFront9) 

  return {
        score           : tsObj.score,
        scoreFront      : tsObj.front,
        scoreBack       : tsObj.back,
        scoreFmt        : tsObj.score + ' ... ' + tsObj.front + ' / ' + tsObj.back
	}

}

// async function updateSummaryInfo() {

//     var hcpSelectOptions = readOption('hcpFilter')
//     // var hcpMethod = hcpSelectOptions.hcpMethod
  
//     var rounds = await getRounds()

//     if (!rounds) return


//     var hcpArr = []
//     var nbrRounds = 0
    
//     for (var j = rounds.length - 1; j > -1; j--) {
    
//       var roundObj = rounds[j]
        
//       // var sc = JSON.parse(roundObj.scoreCard)
//       var ci = JSON.parse(roundObj.courseInfo)
//       var objHandicap = roundObj.objHandicap      
//       var objTargetScore = objHandicap.targetScore
              
//       var dtPlayed = new Date(roundObj.startTime).toString().substring(0,15)
     
//       hcpArr.push({
        
//         shortCourseName: shortCourseName(roundObj.courseName.toString()),
//         datePlayed: dtPlayed,
//         teePlayed: roundObj.tee,
//         score: roundObj.finalScore.toString(),
//         targetScore: objTargetScore.score,
//         courseRating: ci.courseInfo['USGA Course Rating'],
//         slopeRating: ci.courseInfo['Slope Rating'],
//         courseHandicap: objHandicap.courseHandicap,
//         hcpDiff: objHandicap.handicapDiff,
//         escCorrections: objHandicap.escCorrections,
//         rowIdx: j,
//         arrIdx: nbrRounds,
//         hcp: objHandicap.handicap
        
//       })
        
//       nbrRounds++
        
//     }
      
  




// }
