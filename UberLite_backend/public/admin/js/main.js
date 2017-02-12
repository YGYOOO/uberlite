function pageRedirect(url){
  location.replace(url);
}

function login(){
  var data = {};
  data.username = $('#username').val();
  data.password = $('#password').val();
  $.ajax({
    url: "/adminLogin",
    method: "POST",
    data: data
  }).done(function(result){
    console.log(result);
    if(result.success)
      pageRedirect('/management/driver');
  }).fail(function(result){
    pageRedirect('/login');
  })
}

function getDriverInfo($ele, id){
  $.ajax({
    url: "/driver/" + id,
    method: "GET",
  }).done(function(result){
    fillDriverInfo(result.data, $ele);
  }).fail(function(result){

  });
}

function fillDriverInfo(driver, $ele){
  $ele.find('input').each(function(index, e){
    var id = $(e).attr('id');
    var val = driver[id];
    $(e).val(val);
  });
  if(!driver.authorized){
    $('.approve').css('display', 'block');
  }
}

function getAllDrivers($ele, callback){
  $.ajax({
    url: "/drivers",
    method: "GET",
  }).done(function(result){
    listAllDrivers(result.data, $ele);
    callback();
  }).fail(function(result){

  });
}

function searchDrivers($ele, name, callback){
  $.ajax({
    url: "/drivers?full_name=" + name,
    method: "GET",
  }).done(function(result){
    listAllDrivers(result.data, $ele);
    callback();
  }).fail(function(result){

  });
}

function listAllDrivers(drivers, $ele){
  $ele.html('');
  var rawHtmlAuthorized, rawHtmlActive, htmlAuthorized, htmlActive;
  rawHtmlAuthorized = '<input type="checkbox" id="driver_authorized_{}" checked="checked" disabled/><label for="driver_authorized_{}"></label>';
  rawHtmlActive = '<input type="checkbox" id="driver_active_{}" checked="checked"/><label for="driver_active_{}"></label>';
  drivers.forEach(function(e){
    htmlAuthorized = rawHtmlAuthorized.replace(/{}/g,e._id);
    htmlActive = rawHtmlActive.replace(/{}/g,e._id);
    if(!e.authorized){
      htmlAuthorized = htmlAuthorized.replace(/checked="checked"/, "");
    }
    if(!e.active){
      htmlActive = htmlActive.replace(/checked="checked"/, "");
    }
    $ele.append(
      '<tr><td>'+ e.full_name + '</td>' +
      '<td>'+ e.email + '</td>' +
      '<td>********</td>' +
      '<td>'+ e.score + '</td>' +
      '<td class="authorized">'+ htmlAuthorized + '</td>' +
      '<td class="active">'+ htmlActive +'</td><td><i class="info fa fa-info-circle fa-lg" aria-hidden="true"></i></td></tr>'
    );
  });
}

function getRiderInfo($ele, id){
  $.ajax({
    url: "/rider/" + id,
    method: "GET",
  }).done(function(result){
    fillRiderInfo(result.data, $ele);
  }).fail(function(result){

  });
}

function fillRiderInfo(rider, $ele){
  $ele.find('input').each(function(index, e){
    var id = $(e).attr('id');
    var val = rider[id];
    $(e).val(val);
  });
}

function getAllRiders($ele, callback){
  $.ajax({
    url: "/riders",
    method: "GET",
  }).done(function(result){
    listAllRiders(result.data, $ele);
    callback();
  }).fail(function(result){

  });
}

function listAllRiders(riders, $ele){
  var rawHtmlActive, htmlActive;
  rawHtmlActive = '<input type="checkbox" id="driver_active_{}" checked="checked"/><label for="driver_active_{}"></label>';
  riders.forEach(function(e){
    htmlActive = rawHtmlActive.replace(/{}/g,e._id);
    if(!e.active){
      htmlActive = htmlActive.replace(/checked="checked"/, "");
    }
    $ele.append(
      '<tr><td>'+ e.full_name + '</td>' +
      '<td>'+ e.email + '</td>' +
      '<td>********</td>' +
      '<td class="active">'+ htmlActive +'</td><td><i class="info fa fa-info-circle fa-lg" aria-hidden="true"></i></td></tr>'
    );
  });
}

function approveRegistration(id){
  var data = {authorized: true, active: true};
  $.ajax({
    url: "/driver/" + id,
    method: "PUT",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8"
  }).done(function(result){
    window.close();
    $(window.opener.document).find('#driver_authorized_' + id).attr('checked', true);
    $(window.opener.document).find('#driver_active_' + id).attr('checked', true);
  }).fail(function(result){
    //---------------之后再写-------------
  });
}

function active($ele, id, active){
  var data = {active: active};
  $.ajax({
    url: "/driver/" + id,
    method: "PUT",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8"
  }).done(function(result){

  }).fail(function(result){
    //---------------之后再写-------------
  });
}
