//C:\Users\ADM\Documents\GitHub\Bet365CasinoBot\node_modules\puppeteer\.local-chromium\win64-991974\chrome-win\chrome.exe --remote-debugging-port=9222 --user-data-dir=%TMP%\temporary-chrome-profile-dir --disable-web-security --disable-site-isolation-trials
const MyBrowser = require("./browser/MyBrowser");
const fs = require("fs");

const StageMachine = require("./machines/StageMachine");
const { throws } = require("assert");

const FILE_NAME = "bet3casino.json";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  try {
    let machine = await StageMachine.loadMachine(FILE_NAME);

    try {
      while (true) {
        await machine.executeStage();
        await sleep(2000);
      }
    } catch (e) {
      console.log(e);
    }

    machine.saveMachine(FILE_NAME);
  } catch (e1) {
    console.log(e1);
  }

  // if (browser != null && browser instanceof MyBrowser) {
  //     browser.saveBrowser(FILE_NAME)
  // } else {
  //     console.log(`Error: ${browser}`)
  // }
})();
