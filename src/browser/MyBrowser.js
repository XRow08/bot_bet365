const puppeteer = require("puppeteer")
const fs = require("fs")

class MyBrowser {
    /**
     * @type puppeteer.Browser
     */
    pupBrowser

    /**
     * @type puppeteer.Page
     */
    pupPage

    /**
     * Usa o document.querySelector do JS para obter.
     *
     * @param {String} selector
     * @returns {Promise<puppeteer.UnwrapPromiseLike<puppeteer.EvaluateFnReturnType<Element>>>}
     */
    selectElement(selector) {
        return this.pupPage.evaluate((selector) => {
            return document.querySelector(selector)
        }, selector)
    }

    constructor(browser) {
        this.pupBrowser = browser
    }


    /**
     * Irá iniciar um novo browser.
     *
     * @param { puppeteer.LaunchOptions & puppeteer.BrowserLaunchArgumentOptions & puppeteer.BrowserConnectOptions & {
     *         product?: puppeteer.Product;
     *         extraPrefsFirefox?: Record<string, unknown>;
     *     }} options Configurações para ser passado para o puppeteer.
     * @returns {Promise<MyBrowser>}
     */
    static async launchBrowser(options) {
        let browser = await puppeteer.launch(options)
        let my = new MyBrowser(browser)
        my.pupPage = await my.pupBrowser.newPage()

        return my
    }


    /**
     * Irá se conectar com o browser já aberto.
     *
     * @param {string} ws O link de conexão usado pelo Puppeteer
     * @returns {Promise<MyBrowser>} a Classe MyBrowser com o browser já configurado.
     */
    static async connectBrowser(ws) {
        let browser = await puppeteer.connect({
            browserWSEndpoint: ws
        })
        let my = new MyBrowser(browser)
        my.pupPage = (await my.pupBrowser.pages())[0]

        return my
    }

    /**
     * Salva os dados do browser para poder retornar no mesmo estado que estava antes.
     *
     * O conteúdo principal é:
     * {
     *     'wsUrl': 'url da conexão do puppeteer'
     * }
     * @param {string} fileName O nome do arquivo
     * @param {{}} moreData O
     */
    saveBrowser(fileName, moreData = {}) {
        let saveData = {
            wsUrl: this.pupBrowser.wsEndpoint()
        }

        fs.writeFileSync(fileName, JSON.stringify(Object.assign({}, saveData, moreData)))
    }
}

module.exports = MyBrowser