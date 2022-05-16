function canHandleRequest(request) {
  vals = [];
  let workingSeg = request.url;
  for (let i = 0; i < this._segments.length; i++) {
    const seg = this._segments[i];
    const pos = workingSeg.lastIndexOf(seg);
    if (pos == -1) return { _status: false };
    let val = workingSeg.substr(0, pos);
    if (pos == 0) {
      val = undefined;
    }
    if (val && val.indexOf("/") > 0) return { _status: false };
    workingSeg = workingSeg.substr(pos + seg.length);
    const paramIndex = i - 1;
    if (paramIndex >= 0) {
      vals[paramIndex] = val;
    }
  }
  if (this._lastSeg) {
    vals[this.params.length - 1] = workingSeg;
  } else {
    if (workingSeg && workingSeg.trim().length > 0) {
      return { _status: false };
    }
  }
  return { _status: true, params: vals };
}
function handleRequest(request, response, contentType) {
  const theRequest = request;
  const theResponse = response;

  if (!contentType) contentType = "application/json";
  const canHandle = canHandleRequest.bind(this)(request);
  if (!canHandle._status) throw "Invalid request";
  try {
    const params = JSON.parse(
      JSON.stringify(canHandle.params ? canHandle.params : [])
    );
    const contentType = request.headers["Content-Type"];
    if (request.method == "POST" && contentType == "application/json") {
      var receivedData = request.read();
      try {
        const parsed = JSON.parse(receivedData);
        request["json"] = parsed;
        params.push(parsed);
      } catch (parseError) {}
    }

    const proc =
      params.length > 0 ? this._func.apply(null, params) : this._func();
    theResponse.writeHead(200, { "Content-Type": this._mime });
    if (proc instanceof StorageFile) {
      //is a storage file
      const chunkSize = 1800;
      var index = chunkSize;
      var writing = true;
      theResponse.on("drain", () => {
        if (writing) {
          const chunk = storage.read(proc.name, index, chunkSize);
          index += chunkSize;
          if (chunk == undefined) {
            theResponse.end(); //
            return;
          } else {
            if (chunk.length < chunkSize) {
              theResponse.end(chunk);
              return;
            } else {
              theResponse.write(chunk);
            }
          }
        }
      });
      const chunk = storage.read(proc.name, 0, chunkSize);
      chunk.length == chunkSize
        ? theResponse.write(chunk)
        : theResponse.end(chunk);
    } else if (
      this._mime == "application.JSON" ||
      !(typeof proc === "string" || proc instanceof String)
    ) {
      theResponse.end(JSON.stringify(proc));
    } else {
      // spit out strings and non=objects
      theResponse.end(proc);
      return;
    }
  } catch (err) {
    console.log(`error:${err}`);
    try {
      theResponse.writeHead(500);
      theResponse.end(JSON.stringify({ status: "error", msg: err }));
      return;
    } catch (respErr) {
      console.log(`error:${respErr}`);
    }
  }
}

const parent = {
  calls: [],
};
function HandleRequest(request, response) {
  const theRequest = request;
  const theResponse = response;
  for (var i = 0; i < parent.calls.length; i++) {
    const handler = parent.calls[i];
    const canHandle = canHandleRequest.bind(handler)(theRequest);
    if (canHandle._status) {
      return handleRequest.bind(handler)(theRequest, theResponse);
    }
  }
  theResponse.writeHead(404);
  theResponse.end();
}
function RestRelax(path, func, mime) {
  if (!path || !func) throw "illegal rest initializer";
  this._path = path;
  this._mime = mime;
  if (this._mime == undefined) this._mime = "application/json";
  this._func = func;
  this.params = [];
  this._regex = "";
  this._lastSeg = this._path.charAt(this._path.length - 1) == ">"; //likely will usually be true
  if (path.charAt(0) == "<") throw "Illegal path format";
  const segs = this._path.split("<");
  this._segments = [];
  this._segments.push(segs[0]);

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    const pair = seg.split(">");
    if (seg.charAt(0) == ">") {
      throw "Illegal path format";
    }
    if (i > 0) {
      this.params.push(pair[0]);
    }
    if (pair.length == 2 && pair[1].length > 0) {
      this._segments.push(pair[1]);
    }
  }
  return this;
}
const mimeTypes = {
  aac: "audio/aac",
  abw: "application/x-abiword",
  arc: "application/x-freearc",
  avif: "image/avif",
  avi: "video/x-msvideo",
  azw: "application/vnd.amazon.ebook",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  bz: "application/x-bzip",
  bz2: "application/x-bzip2",
  cda: "application/x-cdf",
  csh: "application/x-csh",
  css: "text/css",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  eot: "application/vnd.ms-fontobject",
  epub: "application/epub+zip",
  gz: "application/gzip",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/vnd.microsoft.icon",
  ics: "text/calendar",
  jar: "application/java-archive",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  mid: "audio/x-midi",
  midi: "audio/x-midi",
  mjs: "text/javascript",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mpkg: "application/vnd.apple.installer+xml",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  opus: "audio/opus",
  otf: "font/otf",
  png: "image/png",
  pdf: "application/pdf",
  php: "application/x-httpd-php",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  rar: "application/vnd.rar",
  rtf: "application/rtf",
  sh: "application/x-sh",
  svg: "image/svg+xml",
  swf: "application/x-shockwave-flash",
  tar: "application/x-tar",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "video/mp2t",
  ttf: "font/ttf",
  txt: "text/plain",
  vsd: "application/vnd.visio",
  wav: "audio/wav",
  weba: "audio/webm",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml",
  xul: "application/vnd.mozilla.xul+xml",
  zip: "application/zip",
  "3gp": "video/3gpp; audio/3gpp",
  "3g2": "video/3gpp2; audio/3gpp2",
  "7z": "application/x-7z-compressed",
};

module.exports = function (path, func, mime) {
  if (!parent.handleRequest) parent.handleRequest = HandleRequest;
  if (func == undefined) {
    if (
      path instanceof StorageFile &&
      storage.read(path.name, 0, 100) != undefined
    ) {
      func = path;
      path = "/" + func.name;
    } else if (
      path instanceof String &&
      storage.read(path, 0, 100) != undefined
    ) {
      func = storage.open(path, "r");
      path = "/" + path;
    } else {
      throw `illegal rest relax configuration:${path}`;
    }
  }
  this.server = parent.server;
  if (func instanceof StorageFile) {
    const theFile = func;
    const ending =
      theFile.name.lastIndexOf(".") > -1
        ? theFile.name.substr(theFile.name.lastIndexOf(".") + 1)
        : "txt";
    func = () => {
      return theFile;
    };
    mime = mime
      ? mime
      : mimeTypes[ending] != undefined
      ? mimeTypes[ending]
      : "application/json";
    const restCall = new RestRelax(path, func, mime);
    restCall.globalHandler = parent.handleRequest;
    restCall.listen = (port) => {
      http.createServer(HandleRequest).listen(port);
    };
    restCall.server = parent.server;
    parent.calls.push(restCall);
    return restCall;
  } else {
    const restCall = new RestRelax(
      path,
      func,
      mime ? mime : "application/json"
    );
    restCall.server = parent.server;
    restCall.listen = (port) => {
      http.createServer(HandleRequest).listen(port);
    };
    restCall.globalHandler = parent.handleRequest;
    parent.calls.push(restCall);
    return restCall;
  }
};
