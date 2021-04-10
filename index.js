const parseXlsx = require("excel").default;
const fs = require("fs");
var readline = require("readline");
const connect = require("@databases/sqlite");
const { sql } = require("@databases/sqlite");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var filenames = []; // имена файлов excel, которые будем парсить.

var tableNames = ["data1", "data2"];

// Подключаемся к БД.
const db = connect();

async function prepare() {
  await db.query(sql`
    CREATE TABLE IF NOT EXISTS data1 (
      id VARCHAR NOT NULL,
      value REAL NOT NULL
    );
  `);
  await db.query(sql`
    CREATE TABLE IF NOT EXISTS data2 (
      id VARCHAR NOT NULL,
      value REAL NOT NULL
    );
  `);
}

const prepared = prepare();

const filenamesReaded = readfilenames();

async function readfilenames() {
  fs.readdir("./", function (err, items) {
    for (var i = 0; i < items.length; i++) {
      var filename = items[i];
      if (filename.endsWith(".xlsx")) {
        filenames.push(filename);
      }
    }
  });
}

async function set(id, value, tablename) {
  await prepared;
  if (tablename === "data1") {
    await db.query(sql`
    INSERT INTO data1 (id, value)
      VALUES (${id}, ${value});
  `);
  } else {
    await db.query(sql`
    INSERT INTO data2 (id, value)
      VALUES (${id}, ${value});
  `);
  }
}

async function setData(filedata, tablename) {
  await prepared;

  for (var i = 0; i < filedata.length; i++) {
    filedata[i][1] = parseFloat(filedata[i][1]);
    var id = filedata[i][0];
    var value = filedata[i][1];
    await set(id, value, tablename);
  }
}

async function setDataFromFile(filename, tableIndex) {
  filedata = await parseXlsx(filename);
  for (var i = 0; i < filedata.length; i++) {
    filedata[i][1] = parseFloat(filedata[i][1]);
  }
  var tablename = tableNames[tableIndex];
  tableIndex += 1;
  await setData(filedata, tablename);
}

async function run() {
  await prepared;
  await filenamesReaded;
  var tableIndex = 0;
  for (const filename of filenames) {
    await setDataFromFile(filename, tableIndex);
    tableIndex += 1;
  }

  console.log(
    await db.query(sql`
    SELECT id, SUM(value) as value
    FROM
      (
      SELECT id, value AS value FROM data1
      UNION ALL
      SELECT id, -value FROM data2
      )
    GROUP BY id
    HAVING SUM(value) <> 0
    ;
    `)
  );
  rl.question("Нажми Ctrl + C", function (name) {
    console.log("Ну нажми же Ctrl + C");
  });
}

run();
