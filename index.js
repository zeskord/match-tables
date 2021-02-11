const parseXlsx = require("excel").default;
const fs = require("fs");

var filenames = []; // имена файлов excel, которые будем парсить.
var data = [];

fs.readdir("./", function (err, items) {
  for (var i = 0; i < items.length; i++) {
    var filename = items[i];
    if (filename.endsWith(".xlsx")) {
      filenames.push(filename);
    }
  }

  parseFiles(filenames);
});

function parseFiles(filenames) {
  filenames.forEach((element) => {
    parseXlsx(element).then((filedata) => {
      for (var i = 0; i < filedata.length; i++) {
        filedata[i][1] = parseFloat(filedata[i][1]);
      }
      data.push(filedata);
      checkParseComplete();
    });
  });
}

function checkParseComplete() {
  // Сравнение выполняется, когда все файлы прочитаны.
  if (data.length === filenames.length) {
    compareData(data);
  }
}

function compareData(data) {
  var result = new Map(); // Ассоциативный массив, куда будем складывать результат.

  for (var i = 0; i < data.length; i++) {
    var sheet = data[i];

    for (var j = 0; j < sheet.length; j++) {
      // Пробуем найти элемент
      key = sheet[j][0];
      val = sheet[j][1];

      var summ = 0;
      //   console.log(summ);

      //var res = result.get(key);

      if (result.has(key)) {
        summ = result.get(key);
      } else {
        result.set(key, 0);
        summ = 0;
      }

      if (i === 0) {
        var modifier = -1;
      } else {
        var modifier = 1;
      }

      //summ = result.get(key)

      summ = summ + val * modifier;
      //console.log(summ);

      result.set(key, summ);
    }
  }

  for (let entry of result) {
    if (entry[1] !== 0) {
      console.log(entry[0], entry[1]);
    }
  }
}
