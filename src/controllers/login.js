const pathCookieAccount = `${__dirname}/../../tmp`
const { url, layout } = require('../../config/config')
const { consoleMessage } = require('../helpers/console')
const { getAccount } = require('./accounts')
const { getGroup, saveLog, checkLog } = require('./groups')
const fs = require('fs')
const moment = require('moment')

var userFb;

const init = async ({ page }) => {
    try {
        userFb = await getAccount()
        const cookiFileAccount = `${pathCookieAccount}/${userFb._id}.json`
        consoleMessage('Starting puppeter', 'blueBright')

        if (fs.existsSync(cookiFileAccount)) {
            fs.unlinkSync(cookiFileAccount);
            consoleMessage('Delete cookie  found ✔', 'green')

        }
        const cookies = await page.cookies();
        fs.writeFileSync(cookiFileAccount, JSON.stringify(cookies, null, 2));
        consoleMessage(`Cookie ${userFb.email} file created ✔`, 'yellow')
        Promise.resolve(true)
    } catch (e) {
        Promise.reject(e)
    }
};

// Check ✔
const login = async ({ page }) => {
    /**
       * Cookie banner
       */
    const cookiFileAccount = `${pathCookieAccount}/${userFb._id}.json`
    try {

        consoleMessage(`Chek Login ${userFb.email}`, 'yellow')
        const cookiesString = fs.readFileSync(cookiFileAccount, 'utf-8');
        const cookiesParse = JSON.parse(cookiesString.toString())
        if (fs.existsSync(cookiFileAccount) && cookiesParse.length) {
            consoleMessage('Cookie valid', 'yellow')
            return true
        }

    } catch (e) {
        new Error('ERROR_UNDEFINED')
    }


    try {
        consoleMessage('Starting new login', 'yellow')
        await page.goto(url);
        await page.waitForXPath('//a[@data-cookiebanner="accept_button"]');
        const acceptCookiesButton = (await page.$x('//a[@data-cookiebanner="accept_button"]'))[0];
        await page.evaluate((el) => {
            el.focus();
            el.click();
        }, acceptCookiesButton);

    } catch (e) {
        new Error('ERROR_WAIT_BANNER_COOKIE')
        console.log('Error esperando banner cookie');
    }

    try {
        /**
            * Esperando por el boton de login
            */

        await page.waitForSelector(layout.login_form.parent);
        // Focusing to the email input
        await page.focus(layout.login_form.email);
        // Clicking on the email form input to be able to type on input
        await page.focus(layout.login_form.email);
        // Typing on the email input the email address
        await page.keyboard.type(userFb.email);
        // Focusing on the password input
        await page.focus(layout.login_form.password);
        // Typing the facebook password on password input
        await page.keyboard.type(userFb.password);
        // Clicking on the submit button
        await page.waitForXPath(`//button[@name="login"]`)
        const [loginButton] = await page.$x(`//button[@name="login"]`);
        await page.evaluate((el) => {
            el.click();
        }, loginButton);
        const languageAccount = userFb.language || 'en'
        const layoutLanguage = languageAccount === 'en' ? '//button[@value="OK"]' : '//button[@value="Aceptar"]'
        await page.waitForXPath(layoutLanguage) // ✅
        const [touchLoginButton] = await page.$x(layoutLanguage); // Si el FB esta en español "Aceptar"
        await page.evaluate((el) => {
            el.click();
        }, touchLoginButton);

        const cookies = await page.cookies();
        fs.writeFileSync(cookiFileAccount, JSON.stringify(cookies, null, 2));
        consoleMessage('New cookie valid', 'yellow')
    } catch (e) {
        consoleMessage('Suspicious blocked', 'yellow')
    }

    try {
        consoleMessage('Starting check blocked login', 'yellow')
        //TODO: Revisar si esta bloqueado
        const layoutBlocked = (userFb.language === 'en')
            ? '//a[contains(.,"Temporarily Blocked")]' : '//*[contains(.,"Se necesita una aprobación de inicio de sesión")]';

        await page.waitForXPath(layoutBlocked)
        const btnBlocked = (await page.$x(layoutBlocked))[0];
        if (btnBlocked) {
            consoleMessage(`IMPORTANT! Need action by user blocked`, 'magentaBright')
        }
    } catch (e) {
        consoleMessage(`Not blocked`, 'yellow')
    }

}


const checkFb = async ({ page, data }) => {
    await init({ page })
    await login({ page })
}


module.exports = { checkFb }