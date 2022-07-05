
function btnShowClubsHtml () {
    
    var clubs = readOption('Clubs', [])

    var $tblClubs = $("#clbContainer > .d-none")
    
    var x = $tblClubs.clone();
    $("#clbContainer").empty()
    x.appendTo("#clbContainer");
    
    $("#nbrClubs")[0].innerHTML = clubs.length
    
    for (var j = 0; j<clubs.length;j++) {
    
      var ele = $tblClubs.clone();
      
      var tt = clubs[j]
      
      var calcDistDisp = tt.calcDist ? 1 : .5
      
      ele.find('#clbClub')[0].innerHTML = tt.club
      ele.find('#clbLong')[0].innerHTML = tt.long ? tt.long : '&nbsp'
      ele.find('#clbAvg')[0].innerHTML = tt.avg ? tt.avg : '&nbsp'
      ele.find('#clbShort')[0].innerHTML = tt.short ? tt.short : '&nbsp'
      ele.find('#clbNbr')[0].innerHTML = tt.nbr ? tt.nbr : '&nbsp'
      ele.find('#clbLoft')[0].innerHTML = tt.loft ? tt.loft : '&nbsp'
      ele.find('#clbLaunchAngle')[0].innerHTML = tt.launchAngle ? tt.launchAngle : '&nbsp'
      ele.find('#clbBallSpeed')[0].innerHTML = tt.ballSpeed ? tt.ballSpeed : '&nbsp'
      ele.find('#clbDistance')[0].innerHTML = tt.distance ? tt.distance : '&nbsp'
      
     


      ele.find('#clbLoft').css('opacity', calcDistDisp)
      ele.find('#clbLaunchAngle').css('opacity', calcDistDisp)
      ele.find('#clbBallSpeed').css('opacity', calcDistDisp)
      ele.find('#clbDistance').css('opacity', calcDistDisp)
      
      var objVal = {
            
        idx:         j,
        club:        tt.club,
        mfg:         tt.mfg,
        model:       tt.model,
        loft:        tt.loft,
        date:        tt.date,
        long:        tt.long,
        short:       tt.short,
        avg:         tt.avg,
        nbr:         tt.nbr,
        calcDist:    tt.calcDist,
        launchAngle: tt.launchAngle ? tt.launchAngle : '&nbsp',
        ballSpeed:   tt.ballSpeed ? tt.ballSpeed : '&nbsp',
        distance:    tt.distance ? tt.distance : '&nbsp'
        
      }
      
      var x = JSON.stringify(objVal)      
      
      ele.find('#clbEditClub')[0].setAttribute("onclick", "editClub(" + x + ")");
      
      ele.show()
      ele.removeClass('d-none')
      
      ele.appendTo("#clbContainer");
    
    }
    
    gotoTab('Clubs')

    $('#clbContainer > div').click(function(e){         // highlight clicked row
      $('#clbContainer > div').removeClass('sheet-focus');
      $(e.currentTarget).addClass('sheet-focus')
    });
    
}

async function editClub(objVal) {

    $("#club-modal").modal('show');
    $("#club-form")[0].reset();
    
    $('#clbmIdx').val(objVal.idx)       
    
    $('#clbmClub').val(objVal.club)         
    $('#clbmMfg').val(objVal.mfg) 
    $('#clbmModel').val(objVal.model) 
    $('#clbmLoft').val(objVal.loft) 
    $('#clbmDate').val(objVal.date) 
    $('#clbmLong').val(objVal.long) 
    $('#clbmAvg').val(objVal.avg) 
    $('#clbmShort').val(objVal.short) 
    $('#clbmNbr').val(objVal.nbr) 
    $('#clbmCalcDist').prop('checked', objVal.calcDist)
    $('#clbmLaunch').val(objVal.launchAngle) 
    $('#clbmSpeed').val(objVal.ballSpeed) 
    $('#clbmDistance').val(objVal.distance) 
    
    $('#btnDeleteClub').removeClass('d-none')
    
    $( "#clbmDistance" ).prop( "disabled", true );
    
}

async function btnAddClubHtml () {

    $("#club-modal").modal('show');
    $("#club-form")[0].reset();
    
    $('#btnClub').addClass('d-none')

}


async function btnSubmitClubHtml() {

  if (!$('#club-form').valid()) return
  
  await checkAuth()

  var arrClubs = readOption('Clubs', [])
  
  var idx = $('#clbmIdx').val()
  
  if (idx) {                                                       // update existing golfer
    
    arrClubs[idx].club = $('#clbmClub').val()
    arrClubs[idx].mfg = $('#clbmMfg').val()
    arrClubs[idx].model = $('#clbmModel').val()
    arrClubs[idx].loft = $('#clbmLoft').val()
    arrClubs[idx].date = $('#clbmDate').val()
    arrClubs[idx].long = $('#clbmLong').val()
    arrClubs[idx].avg = $('#clbmAvg').val()
    arrClubs[idx].short = $('#clbmShort').val()
    arrClubs[idx].nbr = $('#clbmNbr').val()
    arrClubs[idx].calcDist = $('#clbmCalcDist').prop( "checked" )
    arrClubs[idx].launchAngle = $('#clbmLaunch').val()
    arrClubs[idx].ballSpeed = $('#clbmSpeed').val()
    arrClubs[idx].distance = $('#clbmDistance').val()
  
  } else {                                                         // add new Club

    var x = arrClubs.find(x => x.club === $('#clbmClub').val())
    if (x) {
      toast("Club already exists")
      return
    }

    arrClubs.push({
      club:        $('#clbmClub').val(),
      mfg:         $('#clbmMfg').val(),
      model:       $('#clbmModel').val(),
      loft:        $('#clbmLoft').val(),
      date:        $('#clbmDate').val(),
      long:        $('#clbmLong').val(),
      avg:         $('#clbmAvg').val(),
      short:       $('#clbmShort').val(),
      nbr:         $('#clbmNbr').val(),
      calcDist:    $('#clbmCalcDist').prop( "checked" ),
      launchAngle: $('#clbmLaunch').val(),
      ballSpeed:   $('#clbmSpeed').val(),
      distance:    $('#clbmDistance').val()
        
    })
  }
  
  console.log(arrClubs)

  arrClubs.sort((a, b) => (a.club > b.club) ? 1 : -1)
  
  arrOptions['Clubs'] = JSON.stringify(arrClubs)

  await updateClubsOption()
  
  $("#club-modal").modal('hide');
  
  btnShowClubsHtml()  

}


async function btnDeleteClubHtml() {

  if (arrOptions['Clubs']) {
  
    var arrClubs = readOption('Clubs', [])
    
    var idx = $('#clbmIdx').val()
        
    arrClubs.splice(idx, 1)
    
    if (arrClubs.length == 0) arrClubs = ''

  } else {
  
    arrClubs = ''
    
  }
  
  arrOptions['Clubs'] = arrClubs  ? JSON.stringify(arrClubs) : ''
  
  await updateClubsOption()
  
  $("#club-modal").modal('hide');
  
  btnShowClubsHtml()  

}

async function updateClubsOption() {

    var clubs = readOption('Clubs', null)
    
    if (clubs) clubs.sort(nameCompare);

    updateOption('Clubs', clubs)

}


function nameCompare(a, b) {
  const A = a.name;
  const B = b.name;

  let comparison = 0;
  if (A > B) {
    comparison = 1;
  } else if (A < B) {
    comparison = -1;
  }
  return comparison;
}


function btnShowClubsHtmlxxx() {

    var clubs = readOption('Clubs', [])
    
    var x = $("#tblClubs").clone();
    $("#clbContainer").empty()
    x.appendTo("#clbContainer");
    
    $("#tblClubs").hide()
    
    for (var j = -1; j<clubs.length;j++) {
    
      var ele = $("#tblClubs").clone();
      
      if (j == -1) {
      
        ele.find('#clbClub')[0].innerHTML = "<strong>Club</strong>"
        ele.find('#clbLong')[0].innerHTML = "<strong>Long</strong>"
        ele.find('#clbShort')[0].innerHTML = "<strong>Short</strong>"
        ele.find('#clbAvg')[0].innerHTML = "<strong>Avg</strong>"
        ele.find('#clbNbr')[0].innerHTML = "<strong>Nbr</strong>"
     
     } else {
     
        ele.find('#clbClub')[0].innerHTML = clubs[j].club
        ele.find('#clbLong')[0].innerHTML = clubs[j].long
        ele.find('#clbShort')[0].innerHTML = clubs[j].short
        ele.find('#clbAvg')[0].innerHTML = clubs[j].avg
        ele.find('#clbNbr')[0].innerHTML = clubs[j].nbr
     
     }
     
      ele.show()
      
      ele.appendTo("#clbContainer");
    
    }
    
//    $('[href="#Clubs"]').trigger('click');
    gotoTab('Clubs')
    
}

function adjustClubParmsHtml(e) {

  var p = e.data.p

  // if (!$('#clbmSpeed').val()) $('#clbmSpeed').val(50)
  
  var launchAngle = $('#clbmLaunch').val();
  var ballSpeed = $('#clbmSpeed').val();
  var distance = $('#clbmDistance').val();
  
  switch (p) {
    
    case 'launch':
    case 'speed':
      var clubDist = calcClubDistance(0, 1.225, launchAngle, ballSpeed);
      $('#clbmDistance').val(clubDist.distance)
      break;
    case 'distance':
      break;
    default:
      break;
    }

 
}

