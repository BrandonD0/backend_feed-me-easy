const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

//////////////////////////////////////////////
const { Connection, Request } = require("tedious");
// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "admin_FME",
      password: "FeMeEaPass123!"
    },
    type: "default"
  },
  server: "si-server.database.windows.net",
  options: {
    database: "FeMeEa_DB", 
    encrypt: true
  }
};

const conn = new Connection(config);

conn.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Funcionando DB.")
  }
});

conn.connect();
//////////////////////////////////////////////

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/getReport/:id', (req, res) => {
    const request = new Request(
      `BEGIN SELECT 'quantity' = R.quantity, 'fecha' = CONVERT(DATE, R.fecha) FROM reportes R WHERE R.idM = '${req.params.id}' END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    var _rows = [];
    request.on("row", columns => {
      var _item = {}; 
      for (var name in columns) {
        _item = columns[name].value;
        _rows.push(_item);
      } 

      
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0)
        res.json({status: 0, valores: _rows});
      else
        res.json({status: 1, valores: _rows});
    });
    conn.execSql(request);  
  })
  .get('/insertReport/:id/:quantity/:fecha', (req, res) => {
    const request = new Request(
      `BEGIN INSERT INTO reportes VALUES ('${req.params.id}', '${req.params.quantity}', '${req.params.fecha}') END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    res.json({status: 1});
    conn.execSql(request);   
  })
  .get('/getPetID/:user/:mascota', (req, res) => {
    const request = new Request(
      `BEGIN SELECT TOP 1 M.id FROM mascotas M WHERE M.username = '${req.params.user}' and M.nombre = '${req.params.mascota}' END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    var _rows = "";
    request.on("row", columns => {
      var _item = {}; 
      for (var name in columns) 
          _rows = columns[name].value;
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0)
        res.json({status: 0, id: _rows});
      else
        res.json({status: 1, id: _rows});
    });
    conn.execSql(request);
  })
  .get('/deleteProduct/:user/:key', (req, res) => {
    const request = new Request(
      `BEGIN DELETE FROM producto 
      WHERE producto.username = '${req.params.user}' and producto.clave = '${req.params.key}' END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    res.json({status: 1});
    conn.execSql(request);   
  })
  .get('/insertProduct/:user/:key', (req, res) => {
    const request = new Request(
      `BEGIN INSERT INTO producto (username, clave) VALUES ('${req.params.user}', '${req.params.key}') END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    res.json({status: 1});
    conn.execSql(request);   
  })
  .get('/getProduct/:user', (req, res) => {
    const request = new Request(
      `BEGIN SELECT TOP 1 P.clave FROM producto P, usuarios U WHERE U.username = '${req.params.user}' and U.username = P.username END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    var _rows = "";
    request.on("row", columns => {
      var _item = {}; 
      for (var name in columns) 
          _rows = columns[name].value;
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0)
        res.json({status: 0, clave: _rows});
      else
        res.json({status: 1, clave: _rows});
    });
    conn.execSql(request);
  })
  .get('/insertMascota/:user/:pet/:idC/:idR/:idP', (req, res) => {
    const request = new Request(
      `BEGIN INSERT INTO mascotas VALUES ('${req.params.user}', '${req.params.pet}', ${req.params.idC}, ${req.params.idR}, ${req.params.idP}) END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    res.json({status: 1});
    conn.execSql(request);   
  })
  .get('/editMascota/:user/:pet/:idP/:old', (req, res) => {
    const request = new Request(
      `BEGIN UPDATE mascotas SET nombre = '${req.params.pet}', idPorcion = '${req.params.idP}' WHERE username = '${req.params.user}' and nombre = '${req.params.old}' END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    res.json({status: 1});
    conn.execSql(request);   
  })
  .get('/deleteMascota/:user/:pet', (req, res) => {
    const request = new Request(
      `BEGIN DELETE FROM mascotas 
      WHERE mascotas.username = '${req.params.user}' and mascotas.nombre = '${req.params.pet}' END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    res.json({status: 1});
    //console.log(request);
    /*var _rows = [];
    var _item = {}; 
    request.on("row", columns => {
      for (var name in columns) 
          _item[name] = columns[name].value;
      _rows.push(_item);
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0) 
        res.json({status: 0, info: _item});
      else
        res.json({status: 1, info: _item});
      });*/
    conn.execSql(request);   
  })
  .get('/getInfo/:user', (req, res) => {
    const request = new Request(
      `BEGIN SELECT TOP 1 'clase' = C.nombre, 'raza' = R.raza, 'peso' = P.peso, 'edad' = P.edad
      FROM usuarios U, mascotas M, razas R, porcion P, clase C
      WHERE U.username = '${req.params.user}' and U.username = M.username and M.idPorcion = P.id and M.idRaza = R.id and M.idClase = C.id END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    //console.log(request);
    var _rows = [];
    var _item = {}; 
    request.on("row", columns => {
      for (var name in columns) 
          _item[name] = columns[name].value;
      _rows.push(_item);
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0) 
        res.json({status: 0, info: _item});
      else
        res.json({status: 1, info: _item});
      });
    conn.execSql(request);   
  })
  .get('/getPorcion/:user', (req, res) => {
    const request = new Request(
      `BEGIN SELECT TOP 1 'porcion' = P.porcion * R.factor
      FROM [dbo].[usuarios] U, [dbo].[mascotas] M, [dbo].[razas] R, [dbo].[porcion] P
      WHERE U.username = '${req.params.user}' and U.username = M.username and M.idPorcion = P.id and M.idRaza = R.id END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    var _rows = "";
    request.on("row", columns => {
      var _item = {}; 
      for (var name in columns) 
          _rows = columns[name].value;
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0)
        res.json({status: 0, porcion: _rows});
      else
        res.json({status: 1, porcion: _rows});
    });
    conn.execSql(request);
  })
  .get('/getPet/:user', (req, res) => {
    const request = new Request(
      `BEGIN SELECT TOP 1 M.nombre FROM usuarios U, mascotas M WHERE U.username = '${req.params.user}' and U.username = M.username END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    var _rows = "";
    request.on("row", columns => {
      var _item = {}; 
      for (var name in columns) 
          _rows = columns[name].value;
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0)
        res.json({status: 0, mascota: _rows});
      else
        res.json({status: 1, mascota: _rows});
    });
    conn.execSql(request);
  })
  .get('/newUser2/:email/:user/:pass', (req, res) => {
    const request = new Request(
      `BEGIN INSERT INTO usuarios (email, username, pass) VALUES ('${req.params.email}', '${req.params.user}', '${req.params.pass}') END`,
        (err, rowCount) => {
            if (err) 
              console.error(err.message);
        }
    );
    res.json({status: 1});
    conn.execSql(request);
    
  })
  .get('/newUser/:email/:user/:pass', (req, res) => {
    var newUserStatus = "";
    const request = new Request(
      `BEGIN SELECT * FROM usuarios WHERE email = '${req.params.email}' or username = '${req.params.user}' END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    var _rows = [];
    request.on("row", columns => {
      var _item = {}; 
      for (var name in columns) 
          _item[name] = columns[name].value;
      _rows.push(_item);
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0) 
        res.json({status: 1});
      else
        res.json({status: 0});
      });
    conn.execSql(request);   
  })
  .get('/check/:user/:pass', (req, res) => {
    const request = new Request(
      `BEGIN SELECT * FROM usuarios WHERE username = '${req.params.user}' and pass = '${req.params.pass}' END`,
        (err, rowCount) => {
            if (err) {
              console.error(err.message);
            }
        }
    );
    var _rows = [];
    request.on("row", columns => {
      var _item = {}; 
      for (var name in columns) 
          _item[name] = columns[name].value;
      _rows.push(_item);
    });
    request.on("doneInProc", (rowCount, more, rows) => {
      if (_rows.length == 0)
        res.json({status: 0});
      else
        res.json({status: 1});
    });
    conn.execSql(request);
  })
  .get('/', (req, res) => {
    const request = new Request(
      `BEGIN SELECT * FROM usuarios END`,
        (err, rowCount) => {
            if (err) {
                console.error(err.message);
            }
        }
    );
    var _rows = [];
    request.on("row", columns => {
        var _item = {}; 
        for (var name in columns) 
            _item[name] = columns[name].value;
        _rows.push(_item);
    });
    request.on("doneInProc", (rowCount, more, rows) => {
        res.json({status: 1, valores: _rows});
    });
    conn.execSql(request);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
