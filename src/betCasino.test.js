const { retain, diff } = require("./likeKotlin");
const { analiseStrategy } = require("./strategyChecker");

it("Logica da comparação", () => {
  let a = [1, 2, 3, 4, 5];
  let b = [3, 4, 5, 6, 7];

  let dif = diff(b, a);

  expect(dif).toStrictEqual([1, 2]);
});

it("Logica de retain #1 - Logica basica", () => {
  let a = [1, 2, 3, 4, 5]; // sequencia normal
  let b = [2, 4, 6, 8, 10]; // sequencia de numeros pares

  let toBe = [2, 4]; // esperado

  expect(retain(a, b)).toStrictEqual(toBe);
});

it("Logica de retain #2 - Logica com arrays de tamanhos diferentes", () => {
  let a = [3, 7, 15, 31]; // sequencia comecando com 3, depois:  (numero anterior) * 2 + 1
  let b = [1, 3, 5]; // sequencia de numeros impares, a diferença é o tamanho

  let toBe = [3]; // esperado

  expect(retain(b, a)).toStrictEqual(toBe);
});

it("Logica das estrategias #1", () => {
  /**
   * @type {StrategyCheck|null}
   */
  let strategy = {
    roulette: "Testando",
    strategyCount: 0,
  };

  let balls = [2, 4, 6];

  strategy = analiseStrategy(balls, strategy);

  console.log(strategy);
  expect(strategy.strategies).toStrictEqual([{ name: "Par" }]);
  balls.unshift(1);

  strategy = analiseStrategy(balls, strategy);

  console.log(strategy);
  expect(strategy.strategies).toStrictEqual([{ name: "Impar" }]);
});

it("Logica das estrategias #2", () => {
  /**
   * @type {StrategyCheck|Null}
   */
  let strategy = {
    roulette: "Testando",
    strategyCount: 0,
  };

  let balls = [2, 4, 6];

  strategy = analiseStrategy(balls, strategy);
  console.log(strategy);

  expect(strategy.strategies).toStrictEqual([
    { count: 1, name: "Duzia 01" },
    { count: 1, name: "Par" },
  ]);
  balls.unshift(8);
  strategy = analiseStrategy(balls, strategy);
  console.log(strategy);
  expect(strategy.strategies).toStrictEqual([
    { count: 2, name: "Duzia 01" },
    { count: 2, name: "Par" },
  ]);
  balls.unshift(14);
  strategy = analiseStrategy(balls, strategy);
  console.log(strategy);
  expect(strategy.strategies).toStrictEqual([
    { name: "Par", count: 3 },
    { name: "Duzia 02", count: 1 },
  ]);
});

it("Logica das estrategias #3", () => {
  /**
   * @type {StrategyCheck|Null}
   */
  let strategy = {
    roulette: "Testando",
    strategyCount: 0,
  };

  let balls = [1];

  strategy = analiseStrategy(balls, strategy);
  console.log(strategy);

  expect(strategy.strategies).toContainEqual({ count: 1, name: "Zero" });
  balls.unshift(2);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 2, name: "Zero" });
  balls.unshift(3);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 3, name: "Zero" });
  balls.unshift(4);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 4, name: "Zero" });
  balls.unshift(5);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 5, name: "Zero" });
  balls.unshift(6);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 6, name: "Zero" });
  balls.unshift(10);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 7, name: "Zero" });
  balls.unshift(20);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 8, name: "Zero" });
  balls.unshift(30);
  strategy = analiseStrategy(balls, strategy);
  expect(strategy.strategies).toContainEqual({ count: 9, name: "Zero" });
});
