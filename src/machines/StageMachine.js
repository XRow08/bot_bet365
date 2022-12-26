/**
 * @typedef {Object} StrategyCheck
 * @property {String} roulette
 * @property {[Number]} oldBalls
 * @property {[Strategy]} strategies
 */
/**
 * @typedef {Object} Strategy
 * @property {String} name
 * @property {number} count
 */

const MyBrowser = require("../browser/MyBrowser");
var fs = require("fs");
var gracefulFs = require("graceful-fs");
gracefulFs.gracefulify(fs);
// const fs = require("graceful-fs");
const express = require("express");
const app = express();
const path = require("path");
const { analiseStrategy, getStagesCompare } = require("../strategyChecker");
const { Db } = require("mongodb");
const sqlite3 = require("sqlite3").verbose();
const localStorage = require("localStorage");
const jsonDiff = require("json-diff");
const { parse } = require("path");
const { json } = require("express");
const mongoose = require("mongoose");
const { throws } = require("assert");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const createCsvWriterArray = require("csv-writer").createArrayCsvWriter;
const createCsvStringifier = require("csv-writer").createObjectCsvStringifier;
const csvToJSON = require("csvtojson");
var fsExtra = require("fs-extra");
const converter = require("json-2-csv");

mongoose
  .connect("mongodb://localhost:27017/strategies", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 300000,
  })
  .then(function () {
    console.log("connection");
  })
  .catch((error) => {
    console.log(error);
  });

let dbb = mongoose.connection;
dbb.on("error", function () {
  console.log("error");
});
dbb.once("open", function () {
  console.log("open");
});

var strategySchema = new mongoose.Schema({
  strategy: Array,
});
var strategyModel = mongoose.model("strategy", strategySchema);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class StageMachine {
  _prevStrategyDate = {};
  /**
   * @type {sqlite3.Database}
   */
  db;

  constructor(myBrowser, actualStage = Stage.INIT_STAGE) {
    this.actualStage = actualStage;
    this.myBrowser = myBrowser;
    this.db = new sqlite3.Database("./myDb.db3");

    this.db.run(
      "CREATE TABLE IF NOT EXISTS Strategies (id integer primary key autoincrement, roleta varchar(256), contagens INTEGER, estrategia varchar(256), criadoem datetime);"
    );
  }

  _stage_map = {
    0: this.init,
    1: this.login,
    2: this.resolveIndentity,
    3: this.resolveLastLogin,
    4: this.openHallPopup,
    5: this.getData,
    6: this.resolveTimeout,
  };

  /**
   * O estagio atual
   * @type Stage
   */
  actualStage = Stage.INIT_STAGE;

  /**
   * O navegador que será usado para fazer as ações
   * @type MyBrowser
   */
  myBrowser;

  async executeStage() {
    let func = this._stage_map[this.actualStage.actual];
    console.log(`Executing function ${func.name}`);

    if (!func) {
      console.log(`Function ${this.actualStage.actual} not found.`);
      return;
    }

    /**
     *  A função é a ação de cada stage, ele recebe a propria instancia de StageMachine (não sei pq o "this" nao
     *  funciona lá) e irá retornar uma Stage que pode ser a proxima ou a mesma ou qualquer outra.
     * @type {Stage}
     */
    let nextStage = await func(this);

    if (nextStage !== undefined) {
      this.actualStage = nextStage;
    }
  }

  /**
   * Irá ira a pagina inicial do bot, na teoria é pra executar uma unica vez, no começo de tudo.
   * @param {StageMachine} instance
   * @returns {Promise<Stage>}
   */
  async init(instance) {
    await instance.myBrowser.pupPage.goto(
      "https://casino.bet365.com/Play/LiveRoulette"
    );

    return Stage.nextStage(instance.actualStage);
  }

  /**
   * Irá fazer o login, somente isso.
   * @param {StageMachine} instance
   * @returns {Promise<Stage>}
   */
  async login(instance) {
    let tryy = 5;
    let element = await instance.myBrowser.selectElement("#txtUsername");

    for (let i = 0; i < tryy; i++) {
      if (element !== null) {
        break;
      }

      await sleep(2000);
      element = await instance.myBrowser.selectElement("#txtUsername");
    }

    if (element !== null) {
      await instance.myBrowser.pupPage.evaluate(() => {
        document.querySelector("#txtUsername").value = "barbara_lopes1";
        document.querySelector("#txtPassword").value = "2mrqSN4AMGWSVuW";

        document
          .querySelector(".modal__button.login-modal-component__login-button")
          .click();
      });
    }

    return Stage.nextStage(instance.actualStage);
    // return instance.actualStage
  }

  /**
   * Irá resolver o popup, caso apareça
   * @param {StageMachine} instance
   */
  async resolveIndentity(instance) {
    await instance.myBrowser.pupPage.evaluate(() => {
      let frames = Array.from(document.querySelectorAll("iframe")).filter(
        (it) =>
          it.src.indexOf(
            "https://members.bet365.com/members/services/notifications/process"
          ) !== -1
      );
      if (frames.length !== 0) {
        // Frame existe mas pode é bom checar
        let el =
          frames[0].contentWindow.document.querySelector("#verifyIdentity");

        if (el !== null) {
          // botão de verificar existe
          frames[0].contentWindow.document
            .querySelector("#remindLater")
            .click();
        }
      }
    });
    return Stage.nextStage(instance.actualStage);
    // return instance.actualStage
  }

  async resolveLastLogin(instance) {
    await instance.myBrowser.pupPage.evaluate(() => {
      let popup = document.querySelector(".regulatory-last-login-modal");

      if (popup !== null) {
        popup.querySelector("button").click();
        let frames = Array.from(document.querySelectorAll("iframe")).filter(
          (it) =>
            it.src.indexOf(
              "https://dl-com.c365play.com/live_desktop/bundles/"
            ) !== -1
        );

        console.log(frames.length);
      }
    });
    return Stage.nextStage(instance.actualStage);
  }

  /**
   * Acabei descobrindo que existe uma URL que irá levar direto para o hall de entrada e é isso que o metodo faz.
   * Ele redireciona pra uma URL já com o hall de entrada aberto, esse metodo só pode ser usado após o login.
   * @param {StageMachine} instance
   * @returns {Promise<Stage>}
   */
  async openHallPopup(instance) {
    await instance.myBrowser.pupPage.goto(
      "https://dl-com.c365play.com/casinoclient.html?game=rol&preferedmode=real&language=pt&cashierdomain=www.sgla365.com&ngm=1&wmode=opaque"
    );
    return Stage.nextStage(instance.actualStage);
  }

  /**
   * Irá pegar os dados das roletas.
   * @param {StageMachine} instance
   * @returns {Promise<Stage>}
   */
  async getData(instance) {
    if (
      (await instance.myBrowser.pupPage.evaluate(() => {
        return document.querySelector(
          ".modal-container.modal-confirm_desktop.modal-confirm_desktop_with-icon"
        );
      })) !== null
    ) {
      return Stage.nextStage(instance.actualStage);
    }
    console.log("exec");
    let result = await instance.myBrowser.pupPage.evaluate(() => {
      // noinspection JSUnresolvedVariable
      (roulettes = Array.from(
        document.getElementsByClassName("lobby-table__container")
      )),
        (jsonDict = {}),
        roulettes.forEach((e) => {
          // noinspection JSUnresolvedVariable
          if (
            ((rouletteName = e.getElementsByClassName(
              "lobby-table__name-container"
            )[0].textContent),
            "Spread Bet Roulette" === rouletteName)
          )
            return;
          let t = [];
          e
            .querySelectorAll(
              "div[class*=roulette-history-item__value] > div[class*=roulette-history-item__value]"
            )
            .forEach((e) => {
              t.push(e.textContent);
            }),
            (jsonDict[rouletteName] = t);
        });

      return jsonDict;
    });

    Object.keys(result).forEach((item) => {
      let strategy;

      if (item in instance._prevStrategyDate) {
        strategy = instance._prevStrategyDate[item];
      } else {
        strategy = {
          roulette: item,
        };
      }

      let ret = analiseStrategy(result[item], strategy);

      if (ret !== null) {
        instance._prevStrategyDate[item] = ret;
        // console.log(ret.strategies)
        let strategyDocument = new strategyModel({
          strategy: ret.strategies,
        });
        // ret.strategies.forEach(retItem => {

        // const strategyArray = []
        //    async function savemodel(){

        strategyDocument
          .save()
          .then((res) => {
            console.log("salvo");
          })
          .catch((err) => {
            console.log(err);
          });

        strategyModel
          .find({})
          .then((res) => {
            res.forEach((e) => {
              e.strategy.forEach((g) => {
                // console.log(g)
                // console.log(item)
                // console.log(e.strategy.name,'eeeeeeee')
                // console.log(ret.strategies,'reeeeeeeet')
                // let jj =  jsonDiff.diff(e.strategy,ret.strategies)
                //    console.log(jj, 'jjjjjjjjjjj')
                // let fe = jj.filter(k => k[0] !== '+' && k[0] !== ' ' && k[0] !== '~');
                // let fo = jj.filter(k => k[0] !== '-' && k[0] !== ' ');
                // console.log(fe)
                // fe.forEach(e=>{
                // console.log(e[1],'Antigo')

                //    strategyArray.push(e[1])
                //    strategyArray.forEach(arr=>{

                // item.name = arr.name
                // item.count = arr.count

                if (g.name.indexOf("Ausencia") !== -1 && g.count > 5) {
                  //    console.log(g.count)
                  //    console.log(g.name)
                  instance.saveInDb(g, item);

                  //     strategyModel.remove().then(()=>{
                  //         console.log('11111111')
                  //     })
                  //   .catch(err => {
                  //      console.log(err)
                  //    })
                }
                // console.log(item)
                if (g.name === "Zero" && g.count > 30) {
                  instance.saveInDb(g, item);

                  //     strategyModel.remove().then(()=>{
                  //         console.log('22222222222')
                  //     })
                  //   .catch(err => {
                  //      console.log(err)
                  //    })
                }

                ["Baixo", "Alto", "Vermelho", "Preto", "Impar", "Par"].forEach(
                  (item2) => {
                    if (g.name === item2 && g.count > 5) {
                      instance.saveInDb(g, item);

                      //     strategyModel.remove().then(()=>{
                      //         console.log('3333333333')
                      //     })
                      //   .catch(err => {
                      //      console.log(err)
                      //    })
                    }
                  }
                );

                if (g.name.indexOf("Duzia") === 0 && g.count > 5) {
                  instance.saveInDb(g, item);

                  //     strategyModel.remove().then(()=>{
                  //         console.log('44444444444')
                  //     })
                  //   .catch(err => {
                  //      console.log(err)
                  //    })
                }

                // })
                // })
              });
            });
          })
          .catch((err) => {
            console.log(err);
          });

        // })
      }
    });

    //  if(!fs.existsSync('csv/Strategies.csv')){
    //  fs.rmSync('csv', {recursive: true})
    // console.log('Não existe o arquivo csv')
    const ToCsv = require("sqlite-to-csv");
    let filePath = "myDb.db3";
    let outputPath = "csv";
    let logPath = ".";

    let sqliteToCsv = new ToCsv()
      .setFilePath(filePath)
      .setOutputPath(outputPath)
      .setLogPath(logPath);

    sqliteToCsv
      .convert()
      .then((result) => {
        console.log(result);
        console.log("PASTA CSV CRIADA");
      })
      .catch((err) => console.log(err, "error convert"));

    //  }

    if (fs.existsSync("csv/Strategies.csv")) {
      csvToJSON()
        .fromFile("csv/Strategies.csv")
        .then((obj) => {
          obj.forEach((strategies) => {
            //   console.log(strategies.contagens)

            if (strategies.contagens % 2 == 0) {
              console.log(strategies);

              converter.json2csv(strategies, (err, csvPar) => {
                if (err) {
                  throw err;
                }

                fs.writeFileSync("par.csv", csvPar);
              });
            }

            if (strategies.contagens % 2 !== 0) {
              converter.json2csv(strategies, (err, csvImpar) => {
                if (err) {
                  throw err;
                }

                fs.writeFileSync("impar.csv", csvImpar);
              });
            }
          });
          converter.json2csv(obj, (err, csv) => {
            if (err) {
              throw err;
            }
            //  console.log(csv, 'CSVVVVVVVVVVVVV')
            fs.writeFileSync("todos.csv", csv);
          });
        })
        .catch((err) => console.log(err, "error to json"));
    }
    //   else{
    //  fs.rmSync('csv', {recursive: true})
    // }

    Object.keys(instance._prevStrategyDate).forEach((name) => {
      /**
       * @type {StrategyCheck}
       */
      //    console.log(instance._prevStrategyDate[name])
      let strategy = instance._prevStrategyDate[name];

      //     let h = []
      //    strategy.strategies.forEach(e=>{
      //     h.push(e)
      //    })
    });

    // roulettes=Array.from(document.getElementsByClassName('lobby-table__container')),jsonDict={},roulettes.forEach((e=>{if(rouletteName=e.getElementsByClassName('lobby-table__name-container')[0].textContent,'Spread Bet Roulette'===rouletteName)return;let t=[];e.querySelectorAll('div[class*=roulette-history-item__value] > div[class*=roulette-history-item__value]').forEach((e=>{t.push(e.textContent)})),jsonDict[rouletteName]=t})),JSON.stringify(jsonDict);
    return instance.actualStage;
  }

  /**
   * Irá resolver o problema que "vc foi desconetado"
   * @param {StageMachine} instance
   * @returns {Promise<Stage>}
   */
  async resolveTimeout(instance) {
    await instance.myBrowser.pupPage.goto(
      "https://casino.bet365.com/Play/LiveRoulette"
    );

    for (let i = 0; i < 10; i++) {
      let response = await instance.myBrowser.pupPage.evaluate(() => {
        // https://dl-com.c365play.com/live_desktop/loader/index.html#progress=0
        let frame1 = document.querySelector(
          "iframe[class='inline-games-page-component__game-frame '] "
        );
        if (frame1 === null) {
          return false;
        }
        let frames = Array.of(
          frame1.contentDocument.querySelector("#gamecontent")
        );

        if (frames.length !== 0) {
          return (
            frames[0].contentWindow.document.querySelectorAll(
              "li[data-automation-locator='button.lobby']"
            ).length > 0
          );
        } else {
          return false;
        }
      });

      if (response) {
        break;
      }

      await sleep(1000);
    }

    return Stage.valueOf(4);
  }

  // modal-container modal-confirm_desktop modal-confirm_desktop_with-icon -> div
  // data-automation-locator="popup.button.resolve" -> btn

  // passo 1 -> https://casino.bet365.com/Play/LiveRoulette
  // passo 2 -> esperar um tempinho
  // passo 3 -> https://dl-com.c365play.com/casinoclient.html?game=rol&preferedmode=real&language=pt&cashierdomain=www.sgla365.com&ngm=1&wmode=opaque
  /**
   * Irá salvar os dados do bot em um arquivo
   * @param {string} fileName O nome do arquivo
   */
  saveMachine(fileName) {
    this.myBrowser.saveBrowser(fileName, {
      actualStage: this.actualStage.actual,
    });
  }

  /**
   *
   * @param {Strategy} data
   * @param {String} rouletteName
   */
  saveInDb(data, rouletteName) {
    this.db.run(
      `INSERT INTO Strategies(roleta, estrategia, contagens, criadoem) VALUES ('${rouletteName}', '${
        data.name
      }', ${data.count}, ${new Date().getTime()})`
    );

    this.db.parallelize(() => {
      this.db.run("ALTER TABLE Strategies ADD COLUMN data", (err, data) => {
        console.log(data);
      });
      // db.close()
      //   }

      //   function addColumnHora(){
      this.db.run("ALTER TABLE Strategies ADD COLUMN hora", (err, data) => {
        console.log(data);
      });
      this.db.parallelize(() => {
        //    db.run("CREATE TABLE IF NOT EXISTS Strategies (id integer primary key autoincrement, roleta varchar(256), contagens INTEGER, estrategia varchar(256), criadoem datetime);")

        //    addColumnData()
        //    if (addColumnData() == undefined ||  null || addColumnData() == false) {
        //     addColumnData()
        //        console.log('data collumn add')
        //    }

        //    addColumnHora()
        //    if (addColumnHora() == undefined || null || addColumnHora() == false) {
        //     addColumnHora()
        //     console.log('hora collumn add')

        //    }

        //     roleta()
        //     if (roleta() == undefined || null || roleta() == false) {
        //         isNotRoleta()
        //     }

        //     count()
        //     if (count() == undefined || null || count() == false) {
        //         isNotcount()
        //     }

        //     strategy()
        //     if (strategy() == undefined || null || strategy() == false) {
        //         isNotStrategy()
        //     }

        //     criadoem()
        //     if (criadoem == undefined || null || criadoem == false) {
        //         criadoemUndefined()
        //     }

        // function addColumnData(){

        // db.close()
        //   }

        //   function roleta() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN roulette TO roleta;",
          (err, data) => {
            console.log(data);
          }
        );
        // db.close()
        //   }

        //   function isNotRoleta() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN roulette TO roleta;",
          (err, data) => {
            console.log(data);
            //   return roleta
          }
        );
        // db.close()
        //   }

        //   function count() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN countt TO contagens;",
          (err, data) => {
            console.log(data);
          }
        );
        // db.close()
        //   }

        //   function isNotcount() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN countt TO contagens;",
          (err, data) => {
            console.log(data);
            //   return count()
          }
        );
        // db.close()
        //   }

        //   function strategy() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN strategy TO estrategia;",
          (err, data) => {
            console.log(data);
          }
        );
        // db.close()
        //   }

        //   function isNotStrategy() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN strategy TO estrategia;",
          (err, data) => {
            console.log(data);
            //   return strategy()
          }
        );
        // db.close()
        //   }

        //   function criadoemUndefined() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN created TO criadoem;",
          (err, data) => {
            console.log(data);
            //   return criadoem()
          }
        );
        // db.close()
        //   }

        //   function criadoem() {
        this.db.run(
          "ALTER TABLE Strategies RENAME COLUMN created TO criadoem;",
          (err, data) => {
            this.db.run("UPDATE Strategies SET data = criadoem;");
            this.db.run("UPDATE Strategies SET hora = criadoem;");
            this.db.run(
              "UPDATE Strategies SET data = date(data/1000,'unixepoch');"
            );
            this.db.run(
              "UPDATE Strategies SET hora = time(hora/1000,'unixepoch');"
            );
            //    db.close()
          }
        );
        //   }
      });
    });
  }

  /**
   * Irá carregar a maquina através do nome do arquivo. O arquivo deve ser em JSON.
   *
   * Caso aconteça algum erro no load, irá usar a forma tradicional, ou seja irá
   * criar uma nova maquina e usar todas configs padrão.
   * @param {String} fileName O nome do arquivo que deseja carregar as configs da Machine
   * @returns {Promise<StageMachine>} a Machine já carregada.
   */
  static async loadMachine(fileName) {
    let data = JSON.parse(fs.readFileSync(fileName).toString());

    try {
      let browser = await MyBrowser.connectBrowser(data["wsUrl"]);
      let stage = Stage.valueOf(data["actualStage"]);

      if (!stage) stage = Stage.INIT_STAGE;

      return new StageMachine(browser, stage);
    } catch (e) {
      return new StageMachine(
        MyBrowser.launchBrowser({
          headless: false,
        })
      );
    }
  }
}

class Stage {
  /**
   * O valor atual do estagio.
   * @type number
   */
  actual;

  /**
   * O proximo estagio, sendo o numero desse estagio
   * @type number
   */
  next;

  constructor(actual, next) {
    this.actual = actual;
    this.next = next;
  }

  /**
   * Irá transformar o atual valor em um Stage
   * @param {number} actual o actual valor do Stage que deseja.
   * @returns {Stage} O Stage cujo atual valor corresponda.
   */
  static valueOf(actual) {
    return this._map[actual];
  }

  /**
   * Irá pegar o proximo stage
   * @param {Stage} actual o atual stage
   * @return {Stage} O proximo stage
   */
  static nextStage(actual) {
    return this._map[actual.next];
  }

  static INIT_STAGE = new Stage(0, 1);
  static LOGIN_STAGE = new Stage(1, 2);
  static INDENTITY_RESOLVE_STAGE = new Stage(2, 3);
  static RESOLVE_LAST_LOGIN_STAGE = new Stage(3, 4);
  static OPEN_HALL_STAGE = new Stage(4, 5);
  static GET_DATA_STAGE = new Stage(5, 6);
  static RESOLVE_TIMEOUT_STAGE = new Stage(6, 5);

  static _map = {
    0: Stage.INIT_STAGE,
    1: Stage.LOGIN_STAGE,
    2: Stage.INDENTITY_RESOLVE_STAGE,
    3: Stage.RESOLVE_LAST_LOGIN_STAGE,
    4: Stage.OPEN_HALL_STAGE,
    5: Stage.GET_DATA_STAGE,
    6: Stage.RESOLVE_TIMEOUT_STAGE,
  };
}

module.exports = StageMachine;
