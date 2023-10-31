/**
 * run this command if vscode cannot find the declaration of the packages below 
 * npm install @types/node --save
 */
import * as crypto from 'crypto';  
import * as http from 'http';

// +------------------------------ global variables ----------------------------------+
const waka_app_id = ''
const waka_app_serect = ''

// +----------------------------- authorization step ---------------------------------+
const randomBytes = crypto.randomBytes(40)
const hex_sha1_hash = crypto.createHash('sha1').update(randomBytes).digest('hex');
const url_params = new URLSearchParams();
url_params.append('scope', 'email,read_stats')
url_params.append('response_type', 'code')
url_params.append('state', hex_sha1_hash)
url_params.append('redirect_uri', 'https://wakatime.com/oauth/test')
url_params.append('client_id', waka_app_id)

const authorize_url = `https://wakatime.com/oauth/authorize?${url_params.toString()}`

console.log(authorize_url)

const req = http.request({
    method: 'GET',
    host: 'wakatime.com',
    path: '/oauth/authorize',
    searchParams: url_params
}, (res) => {
    if(res.statusCode === 200) {
        res.setEncoding('utf-8')
        res.on('data', (chunk) => {
            console.log(chunk)
        })
        res.on('end', () => {
            console.log('no more new data in...')
        })
    } else {
        console.log(res.statusCode)    // if success, you may see status code is 301, meaning redirecting to another page
    }
})

req.end()


