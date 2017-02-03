

const $f =  {
  ajax: function (obj){
    if(!obj.headers) obj.headers = {"Content-type": "application/json; charset=UTF-8"};
    if(obj.body) obj.body = JSON.stringify(obj.body);
    var status;
    fetch(obj.url, obj)
    .then((res) => {
      status = res.status;
      return res.json();
    })
    .then((resJson) => {
      obj.success.call(this, resJson, status);
     })
    .catch((error) => {
      console.error(error);
      obj.error.call(this, error);
    });
  },
  gcm: function(obj){
    this.ajax({
      url: 'https://gcm-http.googleapis.com/gcm/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=' + obj.key
      },
      body: {
        "to": obj.token,
        "data": obj.data
      },
      success: (result) => {
        obj.success(result);
      },
      error: (err) => {
        obj.error(err);
      }
    });
  },
  distance: function(lat1, lon1, lat2, lon2, unit) {
  	var radlat1 = Math.PI * lat1/180
  	var radlat2 = Math.PI * lat2/180
  	var theta = lon1-lon2
  	var radtheta = Math.PI * theta/180
  	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  	dist = Math.acos(dist)
  	dist = dist * 180/Math.PI
  	dist = dist * 60 * 1.1515
  	if (unit=="K") { dist = dist * 1.609344 }
  	if (unit=="N") { dist = dist * 0.8684 }
  	return dist
  },
  debounce: function(fn, delay){
    let timeOut;
    return function(){
      clearTimeout(timeOut);
      timeOut = setTimeout(() => {
        fn(arguments);
      }, delay);
    }
  }
}

export {$f};
