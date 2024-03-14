
	// Global variables

    var scriptVersion = "Version 193 on Mar 17, 12:05 PM"

    var spreadsheetId

    var currUser = {}

    var Goth
  
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

	var App = {

		init: function () {

			this.serviceWorker()
                console.log('serviceworker')

            authorize()
                console.log('authorize')

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

      chrome.storage.local.set({
        "disableMemorySaver": "true"
      });

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
          
            // $('#btnAuth')                   .button().click(btnAuthHtml);
            // $('#btnSignout')                .button().click(btnSignoutHtml);
          
          
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
          
            // $('#prHole').popover()

            // console.log('popover xxx', $('[data-toggle="popover"]'))

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
            $('#btnSRSelect')             .click(btnSRSelectHtml);
            $('#btnSRReset')              .click(btnSRResetHtml);
            
            $('#srSelectDropDown').on('show.bs.dropdown', function () {
                btnSRMoreVertHtml()
            })

            $("#srSearch").on("input", function() {
                var value = $(this).val().toLowerCase();

                $("#srContainer #srCourseName").filter(function() {
                  $(this).parent().parent().parent().toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });

                var nbr = $("#srContainer").children().not(":hidden").length

                $("#srNbrRounds").text(formatNumber(nbr))

            });


          
            // Show Handicap
            $('#btnShowHandicap')         .click(btnShowHandicapHtml);
            $('#btnHCPSelect')            .click(btnHCPSelectHtml);
            $('#btnHCPReset')             .click(btnHCPResetHtml);
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
            $('#btnStatReset')          .click(btnStatResetHtml);
            $('#statSelectDropDown').on('show.bs.dropdown', function () {
              btnStatsMoreVertHtml()
            })
          
            // Show Teetimes
            $('#btnTeetimes')           .click(btnTeetimesHtml);
            $('#btnAddTeetime')         .click(btnAddTeetimeHtml);
            $('#btnSubmitTeetime')      .click(btnSubmitTeetimeHtml);
            $('#btnDeleteTeetime')      .click(btnDeleteTeetimeHtml);
            $('#ttmSelectCourse')       .change(ttmSelectCourseChangeHtml);
          
                   
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
            $('#btnShowCourses')          .click(btnShowCoursesHtml);
            $('#btnSCSelect')             .click(btnSCSelectHtml);
            $('#btnSCSaveSxSCourseInfo')  .click(btnSCSaveSxSCourseInfoHtml);

            
            // $('#btnHPHoleDetail')         .button().click(btnHPHoleDetailHtml);
            $('#btnSCMFetchSxs')          .click(btnSCMFetchSxsHtml);
            $('#btnSCMSubmitCourse')      .click(btnSCMSubmitCourseHtml);
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

});
