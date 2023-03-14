

const API_KEY   = 'AIzaSyBG5YxMTiBdvxD5-xxVp0LA1M8IXz8Xtbo'  
const CLI_ID    = '764306262696-esbdj8daoee741d44fdhrh5fehjtjjm5.apps.googleusercontent.com'  
const SCOPES    = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly'
const DISCOVERY = ['https://sheets.googleapis.com/$discovery/rest?version=v4', 
                  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
                  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

/**
 * The google libraries are loaded, and ready for action!
 */
function proceedAsLoaded() {
  if (Goth.recognize()) {
    Goth.onetap();
  } else {
    gotoTab('Auth')
    forceSignin();
  }
}

/**
 * They have to correctly get through the button click / sign up flow to proceed.
 */
function forceSignin() {
  Goth.button('signin', {type: 'standard', size: 'large', text: 'signup_with'});
}

function signoutEvent() {
  document.getElementById('signin').style.display = 'block';
  gotoTab('Auth')
  forceSignin();
}

function revokeEvent() {
  document.getElementById('signin').style.display = 'block';
  Goth.revoke()
  gotoTab('Auth')
  forceSignin();
}

function proceedAsSignedIn() {
  document.getElementById('signin').style.display = 'none';
  runApp();
}

/**
 * Handle the lifecycle of authenticated status
 */
function gothWatch(event) {
  switch (event) {
    case 'signin':
      proceedAsSignedIn();
      break;
    case 'revoke':
    case 'signout': 
      signoutEvent();
      break;
    case 'loaded':
      proceedAsLoaded();
      break;
    case 'onetap_suppressed':
      forceSignin();  // If a user bypasses onetap flows, we land them with a button.
      break;
    default: 
      console.log("Well, this is a surprise!");
      console.log(event);
  }
}

/**
 * Wire up the main ux machinery.
 */
function authorize() {
  Goth.observe(gothWatch);
  Goth.load(CLI_ID, API_KEY, SCOPES, DISCOVERY);
}

async function runApp() {

  user = Goth.user()

  var rtn = await getSSId("Golfers Companion");

  if (rtn.fileId) {spreadsheetId = rtn.fileId}
  else {
    await confirm('getSSId error: ' + rtn.msg);
    window.close()
  }
  await initialUI();

  goHome()
    
}

async function initialUI() {
  timerStart = new Date()

    arrShts = await openShts(
      [
        { title: 'Settings', type: "all" },
        { title: 'My Courses', type: "all" },
      ])
    

  console.log('initialUI', arrShts)

  arrOptions    = toObject(arrShts.Settings.vals)
  optionsIdx    = toObjectIdx(arrShts.Settings.vals)

  loadCoursesPlayedDropDown('hpSelectCourse')

};
