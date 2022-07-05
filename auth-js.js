
function btnAuthHtml(event) {

    // handleAuthClick();
    gapi.auth2.getAuthInstance().signIn();
    
}
    
function btnSignoutHtml(event) {
  gapi.auth2.getAuthInstance().signOut();
    // signin.handleSignoutClick();
    gotoTab('Auth')
}
      