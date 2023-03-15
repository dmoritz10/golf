

async function goHome() {

  var hcpObj = readOption('handicapObj')

  $('#hmCurrHandicap').html(hcpObj.currHandicap.toFixed(1))
  $('#hmNbrRounds').html(formatNumber(hcpObj.nbrRounds))


  gotoTab('Home')

}
