
	// Global variables

    var scriptVersion = "Version 193 on Mar 17, 12:05 PM"

    var spreadsheetId
  
    var arrShts = []
    var suSht = null
    var arrOptions
    var optionsIdx
  
    var courseInfo
    var teePlayed
  
    var prCourse = { }
    var prScore = { }
    var prClubs
    var clubsThisHole = []
  
    var canUseGeo = true
    var geoWatchId
    var prLat
    var prLng
    var courseCoords = { }
    var nearByUweatherStations = null
  
    var geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
  };
  
    var timerStart
  
    var puttsOriginalState
    var driveOriginalState
    var pnltyOriginalState
    var sandOriginalState
  
    var weatherUrlMask = 'https://www.wunderground.com/*type*/*country*/*state*/*city*/*stationId*'
    


/*global jQuery */
jQuery(function ($) {
	// 'use strict';


    var signin =  {

        currUser : {},

        API_KEY : 'AIzaSyBG5YxMTiBdvxD5-xxVp0LA1M8IXz8Xtbo',  // TODO: Update placeholder with desired API key.

        CLIENT_ID : '764306262696-esbdj8daoee741d44fdhrh5fehjtjjm5.apps.googleusercontent.com',  // TODO: Update placeholder with desired client ID.

        SCOPES : "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly",

        DISCOVERY_DOCS : ["https://sheets.googleapis.com/$discovery/rest?version=v4", 
                           "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                           "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],

        /**
         *  On load, called to load the auth2 library and API client library.
         */
        handleClientLoad: function() {
            gapi.load('client:auth2', this.initClient);
            console.log('initClient')
        },


        /**
         *  Initializes the API client library and sets up sign-in state
         *  listeners.
         */
        initClient: async function () {

            console.log('initClient start')

            1 == 1
        
            await gapi.client.init({
                apiKey:                 signin.API_KEY,
                clientId:               signin.CLIENT_ID,
                discoveryDocs:          signin.DISCOVERY_DOCS,
                fetch_basic_profile:    true,
                scope:                  signin.SCOPES

            }).then(function () {
                // Listen for sign-in state changes.

                console.log('initClient then')
                console.log(this)

                gapi.auth2.getAuthInstance().isSignedIn.listen(signin.updateSigninStatus);

                // Handle the initial sign-in state.
                signin.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

            }, function(error) {
                console.log(JSON.stringify(error, null, 2));
            });

            console.log("initClient end")
        
        },

        /**
         *  Called when the signed in status changes, to update the UI
         *  appropriately. After a sign-in, the API is called.
         */
        updateSigninStatus: async function  (isSignedIn) {

            if (isSignedIn) { 

                console.log('signed in')

                var currUserObj = await gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();

                signin.currUser['email']     = currUserObj.getEmail()
                signin.currUser['firstName'] = currUserObj.getGivenName()
                signin.currUser['lastName']  = currUserObj.getFamilyName()
                signin.currUser['fullName']  = currUserObj.getName()
                signin.currUser['emailName'] = signin.currUser['email'].split('@')[0]

                if (signin.currUser.firstName) {
                    $('#authSigninStatus').html('Hi ' + signin.currUser.firstName + '.<br>You are signed in.')
                } else {
                    $('#authSigninStatus').html('Hi ' + signin.currUser.emailName + '.<br>You are signed in.')
                }

                var rtn = await getSSId(signin.currUser);

                if (rtn.fileId) {spreadsheetId = rtn.fileId}
                else {$('#authSigninStatus').html(rtn.msg);return}
                
                await initialUI();

                goHome()

            } else {

                console.log('NOT signed in')

                $('#authSigninStatus').html('You are signed out.  Authorization is required.')

                signin.currUser = {}

                gotoTab('Auth')
            }
        },

        /**
         *  Sign in the user upon button click.
         */
        handleAuthClick: function (event) {
        
            gapi.auth2.getAuthInstance().signIn();
        },

        /**
         *  Sign out the user upon button click.
         */
        handleSignoutClick: function (event) {
        
            gapi.auth2.getAuthInstance().signOut();
        }

    }


	var App = {

		init: function () {

			this.serviceWorker()
                console.log('serviceworker')

			signin.handleClientLoad()
                console.log('signin')

			this.bindEvents();
                console.log('bindEvents')

		},
        serviceWorker: function () {

            if ("serviceWorker" in navigator) {
                if (navigator.serviceWorker.controller) {
                  console.log("[PWA Builder] active service worker found, no need to register");
                } else {
                  // Register the service worker
                  navigator.serviceWorker
                    .register("pwabuilder-sw.js", {
                      scope: "./"
                    })
                    .then(function (reg) {
                      console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
                    })
                    .catch(function (err) {
                      console.log("[PWA Builder] Service worker registration failed: ", err)
                    });
                }
              }


        },

		bindEvents: function () {

            $('.score a').on('shown.bs.tab', function (event) {

                var selId = $(event.target)[0].parentElement.parentElement.id
          
                $('#' + selId).find("*").removeClass("sel");
                $(event.target).addClass('sel')
          
            });
          
            $('.score').on('shown.bs.tab', function(event){
            
                var selId = $(event.target)[0].parentElement.parentElement.parentElement.id
                $('#' + selId).find(".vis").addClass("hid");
            
                var event =  $(event.target).children().eq(0);
                event.removeClass('hid')
          
            });
          
          
            // Auth tab
          
            $('#btnAuth')                   .button().click(btnAuthHtml);
            $('#btnSignout')                .button().click(btnSignoutHtml);
          
          
            // Home tab
          
          
            // Play Round tab
            $('#btnPlayRound')            .button().click(btnPlayRoundHtml);
            $('#btnStartRound')           .button().click(btnStartRoundHtml);
            $( "#hpSelectCourse")         .change({useDefaultTee:true},  loadCourseInfo);
            $( "#hpSelectTees")           .change({useDefaultTee:false}, loadCourseInfo);
            $("#hpTargetHandicap")        .change({useDefaultTee:false}, loadCourseInfo);
          
          
            $("#hpTargetHandicap")
            .TouchSpin({
                min: 0,
                max: 50,
                step: 0.1,
                decimals: 1,
                boostat: 5,
                maxboostedstep: 10,
                verticalbuttons: true
              });
          
          
          
            // Scorecard tab
            $('#btnPrevHole')            .button().click({offset: -1}, btnChangeHoleHtml);
            $('#btnNextHole')            .button().click({offset: +1}, btnChangeHoleHtml);
            $('#btnCurrHole')            .button().click({offset: 0},  btnChangeHoleHtml);
            $('#btnHoleHist')            .button().click(btnHoleHistHtml);
            $('#btnSaveScore')           .button().click(btnSaveScoreHtml);
            $('#btnEndRound')            .button().click(btnEndRoundHtml);
            $('#btnCancelRound')         .button().click(btnCancelRoundHtml);
            $('#btnPauseRound')          .button().click(btnPauseRoundHtml);
            $('#btnGolfers')             .button().click(btnGolfersHtml);
            
            $('#btnUweatherComp')             .button().click(btnUweatherCompHtml);
          
            $('#btnTestAPIStatus')       .button().click(btnTestAPIStatusHtml);
            $('#btnTestGASStatus')       .button().click(btnTestGASStatusHtml);
          
          
          
            //  $('#btnChangeTee')           .button().click(btnChangeTeeHtml);
          
            $('#btnRoundStats')          .button().click(btnRoundStatsHtml);
            $('#btnClearScore')          .button().click(btnClearScoreHtml);
            $('#prDistance')             .click({pinLocn: 'center'}, btnShowLocationHtml);
            $('#prDistanceFront')        .click({pinLocn: 'front'}, btnShowLocationHtml);
            $('#prDistanceBack')         .click({pinLocn: 'back'}, btnShowLocationHtml);
            $('#prTrackDistance')        .click(btnTrackDistanceHtml);
            $('#btnTrackClub')           .click(btnTrackClubHtml);
          
            // Round Stats tab
            $('#btnRSScorecard')         .button().click(btnRSScorecard);
          
            $('[data-toggle="popover"]').popover({
          
                html: true,
                sanitize: false,
                container: 'body',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div>' +
                '<h4 class="popover-header"></h4>' +
                '<h5 class="popover-body"></h5>' +
                '</div>'
            });
          
            // Show Rounds tab
            $('#btnShowRounds')           .click(btnShowRoundsHtml);
            $('#btnSRSelect')            .click(btnSRSelectHtml);
            $('#btnSRReset')            .click(btnSRResetHtml);
            
            $('#srSelectDropDown').on('show.bs.dropdown', function () {
                btnSRMoreVertHtml()
            })

            $("#srSearch").on("input", function() {
                var value = $(this).val().toLowerCase();

                $("#srContainer #srCourseName").filter(function() {
                  $(this).parent().parent().parent().toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });

                var nbr = $("#srContainer").children().not(":hidden").length

                $("#srNbrRounds").text(nbr)

            });


          
            // Show Handicap
            $('#btnShowHandicap')         .click(btnShowHandicapHtml);
            $('#btnHCPSelect')            .click(btnHCPSelectHtml);
            $('#btnHCPReset')            .click(btnHCPResetHtml);
            $('#hcpSelectDropDown').on('show.bs.dropdown', function () {
                btnHCPMoreVertHtml()
            })
          
            // Show Clubs
            $('#btnShowClubs')          .click(btnShowClubsHtml);
            $('#btnSubmitClub')         .click(btnSubmitClubHtml);
            $('#btnDeleteClub')         .click(btnDeleteClubHtml);
            $('#btnAddClub')            .click(btnAddClubHtml);
            $('#clbmLaunch')            .change({p: 'launch'},   adjustClubParmsHtml);
            $('#clbmSpeed')             .change({p: 'speed'},    adjustClubParmsHtml);
            $('#clbmDistance')          .change({p: 'distance'}, adjustClubParmsHtml);
                   
            // Show Stats
            $('#btnShowStats')          .click(btnShowStatsHtml);
            $('#btnStatSelect')         .click(btnStatSelectHtml);
            $('#btnStatReset')              .click(btnStatResetHtml);
            $('#statSelectDropDown').on('show.bs.dropdown', function () {
              btnStatsMoreVertHtml()
            })
          
            // Show Teetimes
            $('#btnTeetimes')          .click(btnTeetimesHtml);
            $('#btnAddTeetime')        .click(btnAddTeetimeHtml);
            $('#btnSubmitTeetime')     .click(btnSubmitTeetimeHtml);
            $('#btnDeleteTeetime')     .click(btnDeleteTeetimeHtml);
            $('#ttmSelectCourse')      .change(ttmSelectCourseChangeHtml);
          
                   
            puttsOriginalState = $("#divPutts").clone(true);
            driveOriginalState = $("#divDrive").clone(true);
            pnltyOriginalState = $("#divPnlty").clone(true);
            sandOriginalState  = $("#divSand").clone(true);

            console.log('puttsOriginalState')
            console.log(puttsOriginalState)
          
            $('body').on('click', function (e) {
              $('[data-toggle="popover"]').each(function () {
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                  $(this).popover('hide');
                }
              });
            });
          
          
            // Courses
            $('#btnShowCourses')         .click(btnShowCoursesHtml);
            $('#btnSCSelect')            .click(btnSCSelectHtml);
            $('#btnHPHoleDetail')         .button().click(btnHPHoleDetailHtml);
            $('#btnSCMFetchSxs')         .click(btnSCMFetchSxsHtml);
            $('#btnSCMSubmitCourse')         .click(btnSCMSubmitCourseHtml);
            $('#btnAddCourse')            .click(btnAddCourseHtml);        
            $('#scSelectDropDown').on('show.bs.dropdown', function () {
                btnSCMoreVertHtml()
            })

            $("#scSearch").on("input", function() {
                var value = $(this).val().toLowerCase();

                $("#scContainer #scCourseName").filter(function() {
                  $(this).parent().parent().parent().toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });

                var nbrCourses = $("#scContainer").children().not(":hidden").length

                // $("#scNbrCourses")[0].innerHTML = nbrCourses
                $("#scNbrCourses").text(nbrCourses)

            });

          
            // Golfers
            $('#btnShowGolfers')          .click(btnShowGolfersHtml);
            $('#btnSubmitGolfer')         .click(btnSubmitGolferHtml);
            $('#btnDeleteGolfer')         .click(btnDeleteGolferHtml);
            $('#btnAddGolfer')            .click(btnAddGolferHtml);
          
            // All tabs
            $('.divfullscreen').click(function(){
              document.documentElement.requestFullscreen();
            });
          
            var whiteList = $.fn.tooltip.Constructor.Default.whiteList
          
                whiteList.table = []
                whiteList.td = []
                whiteList.th = []
                whiteList.thead = []
                whiteList.tr = []
                whiteList.tbody = []
                whiteList.button = []
          
            setupFormValidation()
          
            setupSumFunctions()
          
            $("#myToast").on("show.bs.toast", function() {
              $(this).removeClass("d-none");
                  })
          
            $("#myToast").on("hidden.bs.toast", function() {
              $(this).addClass("d-none");
                  })
          
          
            Date.prototype.toLocaleISOString = function() {
                const zOffsetMs = this.getTimezoneOffset() * 60 * 1000;
                const localTimeMs = this - zOffsetMs;
                const date = new Date(localTimeMs);
                const utcOffsetHr = this.getTimezoneOffset() / 60;
                const utcOffsetSign = utcOffsetHr <= 0 ? '+' : '-';
                const utcOffsetString = utcOffsetSign + (utcOffsetHr.toString.length == 1 ? `0${utcOffsetHr}` : `${utcOffsetHr}`) + ':00';
                return date.toISOString().replace('Z', utcOffsetString);
            };
                    
		}
	};

    App.init();

    console.log('version 2')

});
