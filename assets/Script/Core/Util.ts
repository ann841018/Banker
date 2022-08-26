import ErrorCode from "../PopUp/ErrorCode";

export let Util = {
  httpRequest(opts) {//Http連線
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 400) {
          if (opts.ok) {
            try { opts.ok(xhr.responseText); }
            catch (err) { console.log(err); }
          }
        } else {
          if (opts.error) {
            opts.error(xhr.status, xhr.statusText);
            let res = JSON.parse(xhr.response);
            ErrorCode.getInstance().ErrorInfo(res.msg, true, false);
          }
        }
      }
    };

    console.log(`${opts.method}: `, opts.url, JSON.stringify(opts.params));

    xhr.timeout = 5000;
    xhr.ontimeout = function (e) { if (opts.error) { opts.error("網路連接錯誤"); } };
    xhr.onerror = function (e) { if (opts.error) { opts.error("網路連接錯誤"); } };
    xhr.open(opts.method, encodeURI(opts.url), true);

    if (opts.method == "POST") { xhr.setRequestHeader("Content-Type", "application/json"); }
    if (opts.params && opts.method == "POST") { xhr.send(JSON.stringify(opts.params)); }
    else { xhr.send(); }
  },
};

