

  function btnShowGolfersHtml () {

    console.log("btnShowGolfersHtml")

    var golfers = readOption('Golfers', [])

    var $tblGolfers = $("#glfContainer > .d-none")

    var x = $tblGolfers.clone();
    $("#glfContainer").empty()
    x.appendTo("#glfContainer");

    $("#nbrGolfers")[0].innerHTML = golfers.length

    for (var j = 0; j<golfers.length;j++) {

      var ele = $tblGolfers.clone();

      var c = golfers[j].cell

      ele.find('#glfName')[0].innerHTML = golfers[j].name
      ele.find('#glfNbr')[0].innerHTML = golfers[j].nbr ? golfers[j].nbr : '&nbsp;'
      ele.find('#btnGlfCallCourse').prop('href', 'tel:' + golfers[j].cell )
      if (!!c) {ele.find('#btnGlfCallCourse').removeClass('d-none')} else {ele.find('#btnGlfCallCourse').addClass('d-none')}

      ele.find('#btnGlfTextTeetime').prop('href', 'sms:' + golfers[j].cell )
      if (!!c) {ele.find('#btnGlfTextTeetime').removeClass('d-none')} else {ele.find('#btnGlfTextTeetime').addClass('d-none')}

      var tt = golfers[j]

      var objVal = {

    idx: j,
        name: tt.name,
        cell: tt.cell

      }

      var x = JSON.stringify(objVal)

      ele.find('#glfEditGolfer')[0].setAttribute("onclick", "editGolfer(" + x + ")");

      ele.removeClass('d-none')

      ele.appendTo("#glfContainer");

    }

    gotoTab('Golfers')

    $('#glfContainer > div').click(function(e){         // highlight clicked row
      $('#glfContainer > div').removeClass('sheet-focus');
      $(e.currentTarget).addClass('sheet-focus')
    });
    

}

async function editGolfer(objVal) {

    $("#golfer-modal").modal('show');
    $("#golfer-form")[0].reset();

    $('#glfmIdx').val(objVal.idx)

    $('#glfmName').val(objVal.name)
    $('#glfmCell').val(objVal.cell)

    $('#btnDeleteGolfer').removeClass('d-none')

}

async function btnAddGolferHtml () {

    $("#golfer-modal").modal('show');
    $("#golfer-form")[0].reset();

    $('#btnDeleteGolfer').addClass('d-none')

}


async function btnSubmitGolferHtml() {

  if (!$('#golfer-form').valid()) return

  var arrGolfers = readOption('Golfers', [])

  var idx = $('#glfmIdx').val()

  if (idx) {                                                       // update existing golfer

    arrGolfers[idx].name = $('#glfmName').val()
    arrGolfers[idx].cell = $('#glfmCell').val()

  } else {                                                         // add new golfer

    var x = arrGolfers.find(x => x.name === $('#glfmName').val())
    if (x) {
      toast("Golfer already exists")
      return
    }

    arrGolfers.push({
      name: $('#glfmName').val(),
      cell: $('#glfmCell').val()

    })
  }

  arrGolfers.sort((a, b) => (a.name > b.name) ? 1 : -1)
  
  arrOptions['Golfers'] = JSON.stringify(arrGolfers)

  await updateGolfersOption()

  $("#golfer-modal").modal('hide');

  btnShowGolfersHtml()

}

async function btnDeleteGolferHtml() {

  if (arrOptions['Golfers']) {

    var arrGolfers = readOption('Golfers')

    var idx = $('#glfmIdx').val()

    arrGolfers.splice(idx, 1)

    if (arrGolfers.length == 0) arrGolfers = ''

  } else {

    arrGolfers = ''

  }

  arrOptions['Golfers'] = arrGolfers  ? JSON.stringify(arrGolfers) : ''

  await updateGolfersOption()

  $("#golfer-modal").modal('hide');

  btnShowGolfersHtml()

}

async function updateGolfersOption() {

    var golfers = readOption('Golfers', null)

    if (golfers) {

    golfers.sort(nameCompare);

    }

  await updateOption('Golfers', golfers)

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


function convertGolferOption() {

    var golfers = readOption('Golfers', [])

    var arr = []

    golfers.forEach((val, idx) => {

    arr.push({ name: val, cell: '' })

  })

    arrOptions.Golfers = JSON.stringify(arr)

    console.log(arrOptions.Golfers)

    updateGolfersOption()

}

