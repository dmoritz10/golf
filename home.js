

async function goHome() {

  var signinStatus = await gapi.auth2.getAuthInstance().isSignedIn.get()
  console.log('signinStatus')
  console.log(signinStatus)
   if (!signinStatus) {
     gotoTab('Auth')
     return
   }
  
  var hcpObj = readOption('handicapObj')

  $('#hmCurrHandicap').html(hcpObj.currHandicap.toFixed(1))
  $('#hmNbrRounds').html(hcpObj.nbrRounds)

  gotoTab('Home')

}
