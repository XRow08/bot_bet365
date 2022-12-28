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
const { retain, TrulySet } = require("./likeKotlin");

const DUZIA_01 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DUZIA_02 = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const DUZIA_03 = [0, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
const COLUNA_01 = [0, 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
const COLUNA_02 = [0, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const COLUNA_03 = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
const PAR = [
  0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
];
const IMPAR = [
  0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35,
];
const VERMELHO = [
  0, 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const PRETO = [
  0, 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];
const BAIXO = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
];
const ALTO = [
  0, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
];
const ZERO = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
];

let balls = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
];
let randomBalls = balls[Math.floor(Math.random() * balls.length)];
let arrayBalls = [randomBalls];
let newRandomBalls = balls[Math.floor(Math.random() * balls.length)];

let antigo1 = analiseStrategy([randomBalls], {
  strategy: {
    oldBalls: [],
  },
});
let novo1 = analiseStrategy([newRandomBalls], {
  strategy: {
    oldBalls: [antigo1],
  },
});

function getStagesCompare(
  stage1,
  stage2,
  result,
  name1,
  name2,
  count1,
  count2
) {
  stage1 = [];
  result = [];
  stage2 = [];
  name1 = [];
  name2 = [];
  count1 = [];
  count2 = [];

  stage2.forEach((s2) => {
    name2.push(s2.name, s2.count);
  });
  stage1.forEach((s1) => {
    name1.push({
      name: s1.name,
      count: s1.count,
    });
  });

  name1.filter((n1) => {
    console.log(n1);
    if (!name2.includes(n1.name)) {
      result.push(n1);
    }
  });
  console.log("Stage1:", stage1);
  console.log("Stage2:", stage2);
  console.log("Result:", result);
  return result;
}

function getDatasStage1() {
  let result = [];

  let balls = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  ];
  let randomBalls = balls[Math.floor(Math.random() * balls.length)];
  let arrayBalls = [randomBalls];

  ALTO.filter((alto) => {
    if (arrayBalls.includes(alto)) {
      result.push("ALTO");
    }
  });
  BAIXO.filter((baixo) => {
    if (arrayBalls.includes(baixo)) {
      result.push("BAIXO");
    }
  });
  PRETO.filter((preto) => {
    if (arrayBalls.includes(preto)) {
      result.push("PRETO");
    }
  });

  VERMELHO.filter((vermelho) => {
    if (arrayBalls.includes(vermelho)) {
      result.push("VERMELHO");
    }
  });

  PAR.filter((par) => {
    if (arrayBalls.includes(par)) {
      result.push("PAR");
    }
  });

  IMPAR.filter((impar) => {
    if (arrayBalls.includes(impar)) {
      result.push("IMPAR");
    }
  });

  COLUNA_01.filter((coluna_01) => {
    if (arrayBalls.includes(coluna_01)) {
      result.push("COLUNA_01");
    }
  });

  COLUNA_02.filter((coluna_02) => {
    if (arrayBalls.includes(coluna_02)) {
      result.push("COLUNA_02");
    }
  });

  COLUNA_03.filter((coluna_03) => {
    if (arrayBalls.includes(coluna_03)) {
      result.push("COLUNA_03");
    }
  });

  DUZIA_01.filter((duzia_01) => {
    if (arrayBalls.includes(duzia_01)) {
      result.push("DUZIA_01");
    }
  });

  DUZIA_02.filter((duzia_02) => {
    if (arrayBalls.includes(duzia_02)) {
      result.push("DUZIA_02");
    }
  });

  DUZIA_03.filter((duzia_03) => {
    if (arrayBalls.includes(duzia_03)) {
      result.push("DUZIA_03");
    }
  });
  console.log(result);
  return result;
}

function getDatasStage2() {
  let result = [];

  let balls = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  ];
  let randomBalls = balls[Math.floor(Math.random() * balls.length)];
  let arrayBalls = [randomBalls];

  ALTO.filter((alto) => {
    if (arrayBalls.includes(alto)) {
      result.push("ALTO");
    }
  });
  BAIXO.filter((baixo) => {
    if (arrayBalls.includes(baixo)) {
      result.push("BAIXO");
    }
  });
  PRETO.filter((preto) => {
    if (arrayBalls.includes(preto)) {
      result.push("PRETO");
    }
  });

  VERMELHO.filter((vermelho) => {
    if (arrayBalls.includes(vermelho)) {
      result.push("VERMELHO");
    }
  });

  PAR.filter((par) => {
    if (arrayBalls.includes(par)) {
      result.push("PAR");
    }
  });

  IMPAR.filter((impar) => {
    if (arrayBalls.includes(impar)) {
      result.push("IMPAR");
    }
  });

  COLUNA_01.filter((coluna_01) => {
    if (arrayBalls.includes(coluna_01)) {
      result.push("COLUNA_01");
    }
  });

  COLUNA_02.filter((coluna_02) => {
    if (arrayBalls.includes(coluna_02)) {
      result.push("COLUNA_02");
    }
  });

  COLUNA_03.filter((coluna_03) => {
    if (arrayBalls.includes(coluna_03)) {
      result.push("COLUNA_03");
    }
  });

  DUZIA_01.filter((duzia_01) => {
    if (arrayBalls.includes(duzia_01)) {
      result.push("DUZIA_01");
    }
  });

  DUZIA_02.filter((duzia_02) => {
    if (arrayBalls.includes(duzia_02)) {
      result.push("DUZIA_02");
    }
  });

  DUZIA_03.filter((duzia_03) => {
    if (arrayBalls.includes(duzia_03)) {
      result.push("DUZIA_03");
    }
  });
  console.log(result);
  return result;
}

//  function getStagesCompare(stage1,stage2, result){
//     stage1 = [getDatasStage1()]

//     stage2 = [getDatasStage2()]

//     result = []
//     stage1[0].filter((stages)=>{
//         if(!stage2[0].includes(stages)){
//             result.push({name:stages, count:''})
//         }
//     })
//     console.log(result)
//     return result
// }

/**
 *
 * @param {[Number]} a
 * @param {[Number]} b
 */
function findGroup(a, b) {
  if (a.length < b.length) {
    // Invert
    return findGroup(b, a);
  }

  for (let i = 0; i < a.length; i++) {
    let equals = true;
    let k = 0;
    for (let ii = i; ii < a.length; ii++) {
      if (a[ii] !== b[k]) {
        equals = false;
        break;
      }

      if (k < b.length) {
        k++;
      }
    }

    if (equals && k === b.length) {
      return i;
    }
  }

  return -1;
}

/**
 *
 * @param {[Number]} ballsA
 * @param {[Number]} ballsB
 * @returns {[Number]}
 */
function diff(ballsA, ballsB) {
  let values = ballsA;

  let start = 0;
  let end = ballsA.length;

  while (end !== start) {
    let nArr = ballsB.slice(0, end);
    // var nArr = CasinoValues[..end];

    let finder = findGroup(values, nArr);

    if (finder !== -1) {
      return values.slice(0, finder);
    }

    end--;
  }

  return [];
}

/**
 *
 * @param {Number} ball
 * @returns {[]}
 */
function findStrategy(ball) {
  /**
   * @type [Strategy]
   */
  let lis = [];

  if (DUZIA_01.contains(ball)) {
    lis.push({
      name: "Duzia 01",
      count: 1,
    });
    lis.push({
      name: "Ausencia Duzia 2",
      count: 1,
    });
    lis.push({
      name: "Ausencia Duzia 3",
      count: 1,
    });
  } else if (DUZIA_02.contains(ball)) {
    lis.push({
      name: "Duzia 02",
      count: 1,
    });
    lis.push({
      name: "Ausencia Duzia 1",
      count: 1,
    });
    lis.push({
      name: "Ausencia Duzia 3",
      count: 1,
    });
  } else if (DUZIA_03.contains(ball)) {
    lis.push({
      name: "Duzia 03",
      count: 1,
    });
    lis.push({
      name: "Ausencia Duzia 1",
      count: 1,
    });
    lis.push({
      name: "Ausencia Duzia 2",
      count: 1,
    });
  }

  if (COLUNA_01.contains(ball)) {
    lis.push({
      name: "Ausencia Coluna 3",
      count: 1,
    });
    lis.push({
      name: "Ausencia Coluna 2",
      count: 1,
    });
  } else if (COLUNA_02.contains(ball)) {
    lis.push({
      name: "Ausencia Coluna 1",
      count: 1,
    });
    lis.push({
      name: "Ausencia Coluna 3",
      count: 1,
    });
  } else if (COLUNA_03.contains(ball)) {
    lis.push({
      name: "Ausencia Coluna 1",
      count: 1,
    });
    lis.push({
      name: "Ausencia Coluna 2",
      count: 1,
    });
  }

  if (PAR.contains(ball)) {
    lis.push({
      name: "Par",
      count: 1,
    });
  } else if (IMPAR.contains(ball)) {
    lis.push({
      name: "Impar",
      count: 1,
    });
  }

  if (PRETO.contains(ball)) {
    lis.push({
      name: "Preto",
      count: 1,
    });
  } else if (VERMELHO.contains(ball)) {
    lis.push({
      name: "Vermelho",
      count: 1,
    });
  }

  if (ALTO.contains(ball)) {
    lis.push({
      name: "Alto",
      count: 1,
    });
  } else if (BAIXO.contains(ball)) {
    lis.push({
      name: "Baixo",
      count: 1,
    });
  }

  if (ZERO.contains(ball)) {
    lis.push({
      name: "Zero",
      count: 1,
    });
  }

  return lis;
}

/**
 *
 * @param {[Number]} balls
 * @param {StrategyCheck} strategy
 * @returns {StrategyCheck|null}
 */
function analiseStrategy(balls, strategy) {
  /**
   * @type {[Number]}
   */
  let dif = [];

  if (strategy.oldBalls !== undefined) {
    dif = diff(balls, strategy.oldBalls).reverse();
  } else {
    dif = balls;
  }

  if (dif.length === 0) {
    return null;
  }

  let strategies = new TrulySet();

  dif.forEach((item) => {
    findStrategy(parseInt(item)).forEach((i) => {
      strategies.add(i);
    });
  });

  if (strategy.strategies === undefined || strategy.strategies.length === 0) {
    strategy.strategies = strategies.toArray();
  } else {
    if (strategies.containsAll(strategy.strategies)) {
      // Se todos existirem, só aumenta o count
      strategy.strategies.forEach((item) => {
        item.count++;
      });
    } else if (strategies.containsOne(strategy.strategies)) {
      // Se houver pelos menos um, atualiza o count e usa retain
      // strategy.strategyCount++
      let arr = strategies.toArray();
      let nList = retain(arr, strategy.strategies);
      nList.forEach((item) => {
        item.count++;
      });

      arr.forEach((item) => {
        if (nList.filter((it) => it.name === item.name).length === 0) {
          nList.push(item);
        }
      });

      strategy.strategies = nList;
    } else {
      strategy.strategies = strategies.toArray();
    }
  }

  strategy.oldBalls = [...balls];
  return strategy;
}

module.exports = {
  analiseStrategy,
  getStagesCompare,
};
