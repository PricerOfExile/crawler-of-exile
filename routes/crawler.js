var express = require('express');
var router = express.Router();
const axios = require('axios');
const Path = require('path');
const Fs = require('fs');
const debug = require('debug')('crawler-of-exile:server');

const dumpFolder = Path.resolve(__dirname, 'dump');
if (!Fs.existsSync(dumpFolder)) {
    Fs.mkdirSync(dumpFolder);
}

function saveResponse(response, fileName) {
    const path = Path.resolve(dumpFolder, `${fileName}.json`)
    Fs.writeFileSync(path, JSON.stringify(response.data), 'utf8')
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

router.get('/', async function (_, res) {

    let poeResponse;
    let nextChangeId = '';
    const PREFIX = 'PUBLIC_STASHES_';

    let n = 0;
    do {
        await delay(550);
        try {
            poeResponse = await axios.get('https://api.pathofexile.com/public-stash-tabs',
                {
                    // Please update this values with correct headers : https://www.pathofexile.com/developer/docs/authorization
                    headers: {},
                    params: {
                        id: nextChangeId
                    },
                });
            saveResponse(poeResponse, PREFIX + (++n));
            nextChangeId = poeResponse.data.next_change_id;
        } catch (err) {
            debug("Cannot execute things", err);
            res.send(err);
        }
    } while (poeResponse?.data?.stashes?.length > 0)
    res.send(`Loading ${n} pages of public stashes`);
});

module.exports = router;
