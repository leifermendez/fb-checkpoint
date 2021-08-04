require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const { Cluster } = require('puppeteer-cluster');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { dbConnect } = require('../config/mongo')
puppeteer.use(StealthPlugin())
const cron = require('node-cron')
const { consoleMessage } = require('./helpers/console')
const { puppeterConfig } = require('../config/config')
const { checkFb } = require('./controllers/login')
const moment = require('moment')


/**
 * //TODO: Iniciamos cola de proceso de puppeter
 */


const initCheck = async () => {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        puppeteerOptions: puppeterConfig,
        retryLimit: 0,
        timeout: 60000
    });


    cluster.queue({}, checkFb);
    await cluster.idle();
    await cluster.close();


}


const cronStart = async () => {
    const now = moment().format('DD/MM/YYYY hh:mm')
    const timezone = process.env.TIMEZONE || "Europe/Madrid"
    const minutes = process.env.MINUTES || 59

    consoleMessage(`Check fb security`, 'cyan')
    consoleMessage(`Timezone: ${timezone}`, 'cyan')
    consoleMessage(`Hour: ${now}`, 'cyan')

    const optionsCron = {
        scheduled: true,
        timezone
    }

    consoleMessage(`📆 Cron every ${minutes} minutes ...`, 'greenBright')

    cron.schedule(`*/${minutes} * * * *`, () => {
        initCheck()
    }, optionsCron);

}


cronStart()
dbConnect()


