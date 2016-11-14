

const $f =  {
  ajax: function (obj){
    obj.headers = {
      "Content-type": "application/json; charset=UTF-8"
    };
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
  }
}

export {$f};
