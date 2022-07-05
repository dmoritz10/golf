
function btnTeetimesHtml () {
    
    var teetimes = readOption('teetimes', [])
    
    var $tblTeetimes = $("#ttContainer > .d-none")

    var x = $tblTeetimes.clone();
    $("#ttContainer").empty()
    x.appendTo("#ttContainer");
    
    
    $("#nbrTeetimes")[0].innerHTML = teetimes.length
    
        
    for (var j = 0; j<teetimes.length;j++) {
    
      var ele = $tblTeetimes.clone();
      
      var ttDateTime = formatsmsDateTime (teetimes[j].date, teetimes[j].time)
                                  
      ele.find('#ttCourseName')[0].innerHTML = shortCourseName(teetimes[j].courseName)
      ele.find('#ttTeetime')[0].innerHTML = ttDateTime.date + ' at ' + ttDateTime.time
      ele.find('#ttGolfers')[0].innerHTML = teetimes[j].golfers.map(a => {if (a.state !== 'no') return a.name}).filter(Boolean).join(' | ')

      var course = findCourse(teetimes[j].courseName)
      
      var coursesObj = makeObj(course, arrShts['My Courses'].colHdrs)
      
      var hcpObj = readOption('handicapObj')
      var tsObj = calcTargetScoreDan(hcpObj.mostRecent20HcpDiff, hcpObj.currHandicap*1 -.1, coursesObj['USGA Course Rating'], coursesObj['Slope Rating'], coursesObj['Front 9 Rating'])

      
      var ts = tsObj.score

      Math.round(($('#hpSlope_Rating').html() * hcpObj.currHandicap*1) / 113)

      ele.find('#ttTargetScore')[0].innerHTML = tsObj.score ? tsObj.score : '&nbsp'
      ele.find('#ttTees')[0].innerHTML = coursesObj['Tee Name']
      ele.find('#ttCourseRating')[0].innerHTML = coursesObj['USGA Course Rating']
      ele.find('#ttSlopeRating')[0].innerHTML = coursesObj['Slope Rating']
      ele.find('#ttCourseHandicap')[0].innerHTML = calcCourseHandicap (coursesObj['USGA Course Rating'], coursesObj['Slope Rating'], coursesObj['Par'], hcpObj.currHandicap)

      ele.find('#ttAvgPlayTime')[0].innerHTML = coursesObj['Avg Play Time'] ? coursesObj['Avg Play Time'] : '&nbsp'
     
      setPhoneHref({      
        phone:coursesObj['Phone'],
        element: ele.find('#btnTTDialCourse')
      })
      
      setSmsHref({
        cellNbrs:getGolferCells(teetimes[j].golfers).join(','),
        courseName:shortCourseName(teetimes[j].courseName),
        date: teetimes[j].date,
        time: teetimes[j].time,
        element:ele.find('#btnTTSms')
      })
            
      setWebSiteHref({      
        url:coursesObj['Website'],
        element: ele.find('#btnTTWebSite')
      })
      
      setSwingUHref({      
        url:coursesObj['SxS Course Id'],
        element: ele.find('#btnTTSwingU')
      })

      var weatherUrl = setWeatherHref({
        stationId:coursesObj['Uweather StationId'],
        city:coursesObj['City'],
        state:coursesObj['State'],
        country:'US',
        type:'hourly',
        date:teetimes[j].date,
        element:ele.find('#btnTTWeather')
      })
      
      var tt = teetimes[j]
      
      var objVal = {
            
        idx: j,
        courseName: shortCourseName(tt.courseName),
        date: tt.date,
        time: tt.time,
        golfers: tt.golfers,
        website:coursesObj['Website'],
        weatherUrl:weatherUrl
        
      }
      
      var x = JSON.stringify(objVal)      
      
      ele.find('#ttEditTeetime')[0].setAttribute("onclick", "editTeetime(" + x + ")");
      ele.find('#btnTTGolfer')[0].setAttribute("onclick", "editGolfers(" + j + ")");
      
      ele.removeClass('d-none')
      
      ele.appendTo("#ttContainer");
    
    }
    
    gotoTab('Teetimes')

    $('#ttContainer > div').click(function(e){         // highlight clicked row
      $('#ttContainer > div').removeClass('sheet-focus');
      $(e.currentTarget).addClass('sheet-focus')
    });
    
}

function getGolferCells(gflrArr) {

  var golfers = readOption('Golfers', [])

  var cellNbrs = []

  gflrArr.forEach( glfrIn => {

    if (glfrIn.state == "maybe") {
    
      var glfr = golfers.find( val => val.name === glfrIn.name); 

      if (glfr) cellNbrs.push(glfr.cell)

    }

  })

  return cellNbrs

}

async function editTeetime(objVal) {

console.log('editTeetime')

    await loadCoursesPlayedDropDown('ttmSelectCourse')
    
    // loadGolfersDropDown('ttmGolfers')
    
    $("#teetime-modal").modal('show');
    $("#teetime-form")[0].reset();
    
    $('#ttmIdx').val(objVal.idx)       
    
    $("#ttmSelectCourse option").filter(function() {return $(this).text() == objVal.courseName;})
          .prop('selected', true);
    
    $('#ttmDate').val(objVal.date)         
    $('#ttmTime').val(objVal.time) 
        
    // objVal.golfers ? $('#ttmGolfers').val(objVal.golfers.map(a => JSON.stringify(a))) : ''  // set selected based on array of values, not text
    
    // ttmGolfersChangeHtml()
    await ttmSelectCourseChangeHtml()

    $('#btnDeleteTeetime').removeClass('d-none')
    
}

async function btnAddTeetimeHtml (preSelectCourse) {
console.log('btnAddTeetimeHtml')
    
    await loadCoursesPlayedDropDown('ttmSelectCourse')
    
    // loadGolfersDropDown('ttmGolfers')
    
    $("#teetime-modal").modal('show');
    
    $("#teetime-form")[0].reset();
   
    // $('#btnTextTeetime').prop('disabled', false).prop('href', '')
                      
    $('#btnCallCourse').prop('disabled', false).prop('href', '')
    
    $('#btnWebSite').prop('disabled', false).prop('href', '')
    
    $('#btnDeleteTeetime').addClass('d-none')
    
    if (preSelectCourse) {
    
      $("#ttmSelectCourse option").filter(function() {return $(this).text() == preSelectCourse;})
          .prop('selected', true);
          
       preSelectCourse = null
    
    }
console.log('btnAddTeetimeHtml')
}

// function loadGolfersDropDown(selectGolfers) {

// //    var arrGolfers = getGolfers()

//   var $golfers = $('#' + selectGolfers)
  
//     var arrGolfers = readOption('Golfers', [])
    
//     var s = document.getElementById(selectGolfers)
    
//     $golfers.empty();
    
//     arrGolfers.forEach((val) => {
    
//     $golfers.append($("<option></option>")
//                         .prop("value",val.name)
//                         .text(val.name)); 
//     })
    
// }


async function btnSubmitTeetimeHtml() {

  if (!$('#teetime-form').valid()) return
  
  var arrTeetimes = readOption('teetimes', [])
  
  var idx = $('#ttmIdx').val()
  
  // var prsdGolfers = $('#ttmGolfers').val().map(a => JSON.parse(a.name))
  var prsdGolfers = []

  var course = findCourse( $( "#ttmSelectCourse option:selected" ).text())
  var avgPlayTime = course[arrShts['My Courses'].colHdrs.indexOf('Avg Play Time')]
  
  var secs = avgPlayTime.split(':').reverse().reduce((prev, curr, i) => prev + curr*Math.pow(60, i+1), 0)
  var dt = new Date($('#ttmDate').val() + 'T' + $('#ttmTime').val() + ':00');
  dt.setSeconds( dt.getSeconds() + secs );
  var endDateTime = dt.toLocaleISOString().substring(0,19)
    
  var event = {
  
      'summary': $( "#ttmSelectCourse option:selected" ).text(),
      // 'description': prsdGolfers.map(a => a.name).join(' | '),
      "colorId": "11",
      'start': {
        'dateTime': $('#ttmDate').val() + 'T' + $('#ttmTime').val() + ':00',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': endDateTime,
        'timeZone': 'America/Los_Angeles'
      }
   };
     
  
  if (idx) {                                                       // update existing teetime

    await checkAuth()
    var request = await gapi.client.calendar.events.update({
        'calendarId': 'primary',
        'eventId': (arrTeetimes[idx].eventId ? arrTeetimes[idx].eventId : null),
        'resource': event
    });

    var eventId = request.result.id

    arrTeetimes[idx].courseName = $( "#ttmSelectCourse option:selected" ).text(),
    arrTeetimes[idx].date = $('#ttmDate').val()
    arrTeetimes[idx].time = $('#ttmTime').val()
    
    // arrTeetimes[idx].golfers = prsdGolfers
    // arrTeetimes[idx].golfers = []

    arrTeetimes[idx].eventId = eventId
  
  } else {                                                         // add new teetime

    await checkAuth()
    var request = await gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    });

    var eventId = request.result.id

    arrTeetimes.push({
      courseName: $( "#ttmSelectCourse option:selected" ).text(),
      date:       $('#ttmDate').val(),
      time:       $('#ttmTime').val(),
      golfers:    prsdGolfers,
      eventId:    eventId
      
    })
  }
  
  

  arrOptions['teetimes'] = JSON.stringify(arrTeetimes)

  await updateTeetimesOption()
  
  $("#teetime-modal").modal('hide');
  
  btnTeetimesHtml()  

}


async function btnDeleteTeetimeHtml() {

  if (arrOptions['teetimes']) {

    var arrTeetimes = readOption('teetimes', [])

    var idx = $('#ttmIdx').val()


    var request = await gapi.client.calendar.events.delete({
        'calendarId': 'primary',
        'eventId': arrTeetimes[idx].eventId
    })      
    .then(async function(response) {

      arrTeetimes.splice(idx, 1)

      if (arrTeetimes.length == 0) arrTeetimes = ''  
             
      console.log('teetime deleted')
      // console.log(response.result.updates.updatedRange)
    }, 
    
    function(reason) {
      
      console.error('error deleting course "' + prScore.courseName + '": ' + reason.result.error.message);      
      // bootbox.alert('error deleting course "' + prScore.courseName + '": ' + reason.result.error.message);
    
    });

  } else {
  
    arrTeetimes = ''
    
  }
  
  arrOptions['teetimes'] = arrTeetimes  ? JSON.stringify(arrTeetimes) : ''
  
  await updateTeetimesOption()
  
  $("#teetime-modal").modal('hide');
  
  btnTeetimesHtml()  

}

async function ttmSelectCourseChangeHtml() {

  var idxRow = document.getElementById("ttmSelectCourse").selectedIndex;
  
  var phoneNbr = getCourseVal(idxRow, 'Phone')
  setPhoneHref({      
        phone:phoneNbr,
        element: $('#btnCallCourse')
      })
      
  var sxsUrl = getCourseVal(idxRow, 'Website')
  setWebSiteHref({      
        url:sxsUrl,
        element: $('#btnWebSite')
      })              

}

function getCourseVal(rowIdx, colName) {

  var idxCol = arrShts['My Courses'].colHdrs.indexOf(colName)
  return       arrShts['My Courses'].vals[rowIdx][idxCol]

}



// function ttmGolfersChangeHtml() {

// //  if ($('#ttmGolfers').val().length) return

//   var txtCellNbrs = $('#ttmGolfers').val().map(a => JSON.parse(a)).map(a => a.cell).join(',')

//   // Finish this when implementing golfer lookup in teetime maintenance
//   // getGolferCells(teetimes[j].golfers).join(',')

//   var ttDateTime = formatsmsDateTime ($('#ttmDate').val(), $('#ttmTime').val())

//   setSmsHref({
//     cellNbrs:txtCellNbrs,
//     courseName:$('#ttmSelectCourse option:selected').text(),
//     date:$('#ttmDate').val(),
//     time:$('#ttmTime').val(),
//     element:$('#btnTextTeetime')
//   })

// /*  
//   var txtBody = $('#ttmSelectCourse option:selected').text() + '%0a' + ttDateTime.date + '%0a' + ttDateTime.time
//   $('#btnTextTeetime').prop('disabled', false)
//                       .prop('href', 'sms:' + txtCellNbrs + "?body=" + txtBody  )
// */      

// }

function formatsmsDateTime (date, time) {

  var tt = new Date(date + ' ' + time)
  var dt = tt.toString().substr(0,10)
  
  var options = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  
  var tm = tt.toLocaleString('en-US', options);
  

  return {
  
    date: dt,
    time: tm
    
  }

}

async function updateTeetimesOption() {

    var teetimes = readOption('teetimes', null)
    
    if (teetimes) {

      teetimes.sort(dateCompare);
      
    }

  updateOption('teetimes', teetimes)

}

function dateCompare(a, b) {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);

  let comparison = 0;
  if (dateA > dateB) {
    comparison = 1;
  } else if (dateA < dateB) {
    comparison = -1;
  }
  return comparison;
}

function findCourse(courseName) {

  var courseKey = calcCourseKey(courseName)

  var keyCol = arrShts['My Courses'].colHdrs.indexOf('Key')

  return arrShts['My Courses'].vals.filter(row => row[keyCol] === courseKey)[0];

}

function calcCourseKey(courseName) {
    
  var wrk = courseName.toLowerCase()
  wrk = wrk.replace(/golf/g, "")
  wrk = wrk.replace(/course/g, "")
  wrk = wrk.replace(/country/g, "")
  wrk = wrk.replace(/club/g, "")
  wrk = wrk.replace(/[^a-zA-Z0-9 ]/g, "")
  wrk = wrk.replace( /  +/g, ' ' ) 
  wrk = wrk.trim()
  var wrkArr = wrk.split(' ')
  wrkArr.sort()
  return wrkArr.join(' ')
}


async function editGolfers(idx) {

  var inputOptions = getTTGolfers(idx)

  if (inputOptions.length == 0) return
  
  var golferPrompt = bootbox.dialog({
    
    title: "Select Golfers",
    message: inputOptions,
    buttons: {
      cancel: {
          label: "cancel",
          className: 'btn-light'
      },

      ok: {
        label: "ok",
        className: 'btn-primary',
        callback: async function(result){

          var response = $($.parseHTML(golferPrompt[0].innerHTML));
          
          await updateGolfers(response, idx)

        }
      }

    }
    
  });

  golferPrompt.init(function(){                           // user can clear radio button by clicking on the golfer name

    $( "tr td:nth-child(1)" ).click(function() {
      var $this = $( this );
      var lbls = $this.parent().children().children().children()
      lbls.each(function() { 
        $(this).removeClass('active')
      })

    });
  
  });

}

async function updateGolfers(response, idx){

  var selected = []

  response.each(function(){ 
    var labelData = $(this).find('label')
    labelData.each(function(){
    if ($(this).hasClass("active")) {

      var glfr = $(this).parent().parent().parent().first().text().split('\n')[0]
      var state = $(this).text().replace(/\n/g,'').replace(/ /g,'')

      selected.push({"name":glfr, "state":state})

    }

    })
  });

  // console.log(selected)

  var arrTeetimes = readOption('teetimes', [])

  arrTeetimes[idx].golfers = selected

  arrOptions['teetimes'] = JSON.stringify(arrTeetimes)

  await updateTeetimesOption()

  btnTeetimesHtml ()

}

function getTTGolfers(idx) {

  var html = `<div class="btn-group btn-group-toggle col p-0 m-0" data-toggle="buttons">
  <label class="btn btn-light m-0 p-0 yesState">
      <input class="toggles" type="radio">yes
  </label>
  <label class="btn btn-light m-0 p-0 noState">
      <input class="toggles" type="radio">no
  </label>
  <label class="btn btn-light hidan m-0 p-0 maybeState">
      <input class="toggles" type="radio">maybe
  </label>
</div>`


  var golfers = readOption('Golfers', [])
  var arrTeetimes = readOption('teetimes', [])
  var ttimeGlfrs = arrTeetimes[idx].golfers
  
  var arr = []
  

  golfers.forEach((val,idx) => {

    var x = html

    var glfr = ttimeGlfrs ? ttimeGlfrs.find( glf => glf.name === val.name) : null

    var state = glfr ? glfr.state : false

    switch (state) {

        case "yes":
          x = x.replace(/yesState/,"active")
          x = x.replace(/noState/,"")
          x = x.replace(/maybeState/,"")        
          break;
        case "no":
          x = x.replace(/yesState/,"")
          x = x.replace(/noState/,"active")
          x = x.replace(/maybeState/,"")        
          break;
        case "maybe":
          x = x.replace(/yesState/,"")
          x = x.replace(/noState/,"")
          x = x.replace(/maybeState/,"active")        
          break;

    }

    arr.push([
      '<span class="h5 cursor-pointer">' + val.name  + '</span>' ,
      x
    ])
  })
  

var tbl = new Table();
  
tbl
  .setHeader()
  .setTableHeaderClass()
  .setData(arr)
  .setTableClass('table')
  .setTrClass('')
  .setTcClass(['', 'text-right'])
  .setTdClass('pb-1 pt-1 border-0')
  .build();
  
return tbl.html

}
