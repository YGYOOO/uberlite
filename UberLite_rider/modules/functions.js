

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
        "to": obj.token || 123,
        "data": obj.data || 123
      },
      success: (result) => {
        obj.success(result);
      },
      error: (err) => {
        obj.error(err);
      }
    });
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
