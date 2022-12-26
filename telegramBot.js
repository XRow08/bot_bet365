const env = require('./.env');
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')
const Router = require('telegraf/router')
const fs = require('fs');
const fss = require('fs').promises
const csvToJSON = require('csvtojson')
const puppeteer = require('puppeteer')
// const pageScraper = require('./pageScraper')
const apostaController = require('./apostaController')
const Apify = require('apify');



// https://www.bet365.com/#/HO/ login? 
// roulette-table-cell roulette-table-cell_straight-10 roulette-table-cell_group-straight roulette-table-cell_color-black
// classe que contém o ''straight-10 o 10 indica o numero da casa
// pesquisar o passo a passo de como apostar no bet365
const bot = new Telegraf(env.token)

const browserObject = require('./browser');
const scraperController = require('./pageController');
// const scraperObject = require('./pageScraper');
// const { scraper } = require('./pageScraper');
const aposta = require('./aposta')



const buttons = Markup.inlineKeyboard(
  [
    Markup.callbackButton('⬇️ Download(CSV)', 'csv'),
    Markup.callbackButton('📒 Ùltimas 5 sequências registradas', 'last'),
    Markup.callbackButton('🎰 apostar', 'apostar')
  ], {
    columns: 3
  }

).extra()

const buttonsApostar = Markup.inlineKeyboard(
  [
    Markup.callbackButton('🔒 LOGIN', 'login'),
    // Markup.callbackButton('📒 Ùltimas 5 sequências registradas', 'last'),
    // Markup.callbackButton('🎰 apostar', 'apostar')
  ], {
    columns: 1
  }

).extra()

const apostar = Markup.inlineKeyboard(
  [
    Markup.callbackButton('🔒 Faça sua aposta', 'bet'),
    // Markup.callbackButton('📒 Ùltimas 5 sequências registradas', 'last'),
    // Markup.callbackButton('🎰 apostar', 'apostar')
  ], {
    columns: 1
  }

).extra()



bot.use(session())



bot.start(async content => {
  const name = content.update.message.from.first_name
  // const from = content.update.message.from
  console.log(name)
  await content.reply(`Bem-vindo, ${name}!`)
})

bot.on('message', (ctx) => {

  ctx.telegram.sendMessage(
    ctx.from.id,
    'Escolha uma das opções',
    buttons
  )


})



bot.action('csv', (ctx) => {
  async function readFile(filePath) {
    try {
      const data = await fss.readFile(filePath);
      return data
    } catch (error) {
      console.error(`Got an error trying to read the file: ${error.message}`);
    }
  }

  readFile('csv/Strategies.csv').then(e => {
    if (e) {
      ctx.telegram.sendDocument(
        ctx.from.id, {
          source: e,
          filename: 'strategies.csv'
        }, {
          caption: 'Clique no arquivo para download',
          parse_mode: 'MarkdownV2',
          reply_markup: buttons,
        }

      )
      bot.telegram.sendMessage(ctx.from.id, 'escolha uma das opções', buttons)

    } else {
      ctx.telegram.sendMessage(
        ctx.from.id,
        `<b>Arquivo Excel ainda não gerado</b>`, {
          parse_mode: 'HTML'
        },
      )
      bot.telegram.sendMessage(ctx.from.id, 'escolha uma das opções', buttons)

    }



  })
})

bot.action('last', (ctx) => {
  if (fs.existsSync('csv/Strategies.csv')) {
    csvToJSON().fromFile('csv/Strategies.csv').then(obj => {
      for (var j = obj.length - 5; j < obj.length; j++) {


        bot.telegram.sendMessage(
          ctx.from.id,
          `<b>Roleta</b>: <i>${obj[j].roleta}</i> \n
       <b>Contagens</b>: <i>${obj[j].contagens}</i> \n
       <b>Estratégia</b>: <i>${obj[j].estrategia}</i> \n
       <b>data</b>: <i>${obj[j].data}</i> \n
       <b>hora</b>: <i>${obj[j].hora}</i> \n
       `, {
            parse_mode: 'HTML'
          },

        )

      }

    }).then(() => {
      ctx.telegram.sendMessage(ctx.from.id, 'escolha uma das opções', buttons)
    })

  } else {
    ctx.telegram.sendMessage(
      ctx.from.id,
      '<b>Arquivo não gerado pelo sistema ou ainda não temos as 5 últimas estratégias registradas</b>', {
        parse_mode: 'HTML'
      }
    )

    bot.telegram.sendMessage(ctx.from.id, 'escolha uma das opções', buttons)

  }


})

bot.action('apostar', (ctx) => {
  bot.telegram.sendMessage(ctx.from.id, 'escolha uma das opções', buttonsApostar)
})

bot.action('login', async (ctx) => {
  (async () => {
    const browser = await puppeteer.launch({
      headless: false,
      // defaultViewport: null,
      ignoreHTTPSErrors: true,
      devtools: false,
      timeout: 600000,
      args: ['--no-sandbox']
    });
    //  const user='barbara_lopes1';
    //  const password='2mrqSN4AMGWSVuW';
    //   '--use-gl=egl'
    // '--no-zygote','--no-sandbox','--allow-file-access-from-files', '--headless, '--single-process'
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36')

    await page.goto('https://livecasino.bet365.com/Play/LiveRoulette');
    await page.$eval('#txtUsername', el => el.value = 'barbara_lopes1')
    await page.$eval('#txtPassword', el => el.value = '2mrqSN4AMGWSVuW')
    await page.click('.login-modal-component__login-button')
    await page.setCookie()
    console.log('login')
    await page.waitForFrame('https://members.bet365.com/members/services/notifications/process?em=1&prdid=11', {
      visible: true
    })
    console.log('frame')
    const frame = await page.frames().find(f => f.url('https://members.bet365.com/members/services/notifications/process?em=1&prdid=11'));
    if (!frame) {
      console.log("iFrame not found with the specified url");
      process.exit(0);
    }

    await page.$('iframe[src="https://members.bet365.com/members/services/notifications/process?em=1&prdid=11"]')
    await page.goto('https://members.bet365.com/members/services/notifications/process?em=1&prdid=11')
    await page.waitForSelector('#remindLater')
    await page.click('button[id="remindLater"]')
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36')
    console.log('remindLater')
    await page.setCookie()
    await page.waitForTimeout(5000)
    await page.goto('https://livecasino.bet365.com/Play/LiveRoulette');
    // await page.waitForSelector('#main-video-player-105632')
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36')
    await page.setCookie()
    await page.waitForTimeout(5000)
    await page.goto('https://dl-com.c365play.com/casinoclient.html?game=rol&preferedmode=real&language=pt&cashierdomain=www.sgla365.com&ngm=1&wmode=opaque')
    console.log('Roulletes')
    await page.waitForNavigation()
    await page.waitForSelector('.lobby-table__name-container')
    let nameContainer = await page.$$('.lobby-table__name-container')
    await page.waitForTimeout(3000)
    // nameContainer[0].click()
    // await page.waitForSelector('div[data-automation-locator="element.closePopup"]')
    // console.log('button meet')
    // let buttonClose = await page.$$('div[data-automation-locator="element.closePopup"]')

    // let buttonClose = await page.$$('.close-button')
    // buttonClose[0].click()

    // await page.click('div[class=close-button game-tutorial__close-buttonvoI4pu9XqNQ2VHkfTWq7]')

    // console.log('button close')

    await page.emit()
    //events

    //"client_start" / "runtime_resolved",  runtime: {name:"standAloneMode"}  / "session_restore_start", "restore-session":type:"Refresh"/ 

    console.log(page.url())
    const elementss = await page.evaluateHandle(() => {
      const allOccurances = [...document.querySelectorAll(".lobby-table__name-container")];
      const data = allOccurances.map((node) => node.innerHTML);
      return data;
    });
    const response = await elementss.jsonValue();
    // console.log(response)

    const elements = await page.evaluateHandle(() => {
      const allOccurances = [...document.querySelectorAll(".lobby-tables__item")];
      const data = allOccurances.map((node) => node.innerHTML);

      return data;
    });

    console.log('roulletes render')
    await page.waitForSelector('.roulette-table-cell_straight-0')
    const numbers = await page.$$('g[class="roulette-table-cell_straight-0"]')
    const number0 = await page.$$('.roulette-table-cell_straight-0')
    const number1 = await page.$$('.roulette-table-cell_straight-1')
    const number2 = await page.$$('.roulette-table-cell_straight-2')
    const number3 = await page.$$('.roulette-table-cell_straight-3')
    const number4 = await page.$$('.roulette-table-cell_straight-4')
    const number5 = await page.$$('.roulette-table-cell_straight-5')
    const number6 = await page.$$('.roulette-table-cell_straight-6')
    const number7 = await page.$$('.roulette-table-cell_straight-7')
    const number8 = await page.$$('.roulette-table-cell_straight-8')
    const number9 = await page.$$('.roulette-table-cell_straight-9')
    const number10 = await page.$$('.roulette-table-cell_straight-10')
    const number11 = await page.$$('.roulette-table-cell_straight-11')
    const number12 = await page.$$('.roulette-table-cell_straight-12')
    const number13 = await page.$$('.roulette-table-cell_straight-13')
    const number14 = await page.$$('.roulette-table-cell_straight-14')
    const number15 = await page.$$('.roulette-table-cell_straight-15')
    const number16 = await page.$$('.roulette-table-cell_straight-16')
    const number17 = await page.$$('.roulette-table-cell_straight-17')
    const number18 = await page.$$('.roulette-table-cell_straight-18')
    const number19 = await page.$$('.roulette-table-cell_straight-19')
    const number20 = await page.$$('.roulette-table-cell_straight-20')
    const number21 = await page.$$('.roulette-table-cell_straight-21')
    const number22 = await page.$$('.roulette-table-cell_straight-22')
    const number23 = await page.$$('.roulette-table-cell_straight-23')
    const number24 = await page.$$('.roulette-table-cell_straight-24')
    const number25 = await page.$$('.roulette-table-cell_straight-25')
    const number26 = await page.$$('.roulette-table-cell_straight-26')
    const number27 = await page.$$('.roulette-table-cell_straight-27')
    const number28 = await page.$$('.roulette-table-cell_straight-28')
    const number29 = await page.$$('.roulette-table-cell_straight-29')
    const number30 = await page.$$('.roulette-table-cell_straight-30')
    const number31 = await page.$$('.roulette-table-cell_straight-31')
    const number32 = await page.$$('.roulette-table-cell_straight-32')
    const number33 = await page.$$('.roulette-table-cell_straight-33')
    const number34 = await page.$$('.roulette-table-cell_straight-34')
    const number35 = await page.$$('.roulette-table-cell_straight-35')
    const stfirst12 = await page.$$('.roulette-table-cell_side-first-dozen')
    const stfirst12mid = await page.$$('.roulette-table-cell_side-second-dozen')
    const stfirst12last = await page.$$('.roulette-table-cell_side-third-dozen')
    const one18 = await page.$$('.roulette-table-cell_side-low')
    const par = await page.$$('.roulette-table-cell_side-even')
    const impar = await page.$$('.roulette-table-cell_side-odd')
    const red = await page.$$('.roulette-table-cell_side-red')
    const black = await page.$$('.roulette-table-cell_side-black')
    const eightteen36 = await page.$$('.roulette-table-cell_side-high')
    const firstCollumn = await page.$$('.roulette-table-cell_side-top-column')
    const midCollumn = await page.$$('.roulette-table-cell_side-middle-column')
    const lastCollumn = await page.$$('.roulette-table-cell_side-bottom-column')
    let ficha = await page.$$('.chip-animation-wrapper')
    const ficha01 = ficha[0]
    const ficha25 = ficha[1]
    const ficha5 = ficha[2]
    const ficha20 = ficha[3]
    const ficha50 = ficha[4]
    const ficha100 = ficha[5]
    const ficha500 = ficha[6]
    const ficha2k = ficha[7]
    const ficha5k = ficha[8]




















    let title = await page.title();
    console.log("title:" + title);
    //  await browser.close();
  })();

})








bot.startPolling()