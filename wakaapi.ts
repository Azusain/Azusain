import * as moment from "moment-timezone"

// refer to wakatime api documentation when needed: https://wakatime.com/developers
const resource_url_prefix = 'https://wakatime.com/api/v1/users/current'

// prepare base64-encoded api_key for authntication
const API_KEY = process.env.API_KEY as string         // set your API key in certain github repository
const api_key_b64_encoded = Buffer.from(API_KEY).toString('base64')

var top_3: Array<JSON> = []
var time_total = null
var time_7_days = null

// top 3 languages
const p0 = fetch(`${resource_url_prefix}/stats`, {
    headers: {
        'Authorization': `Basic ${api_key_b64_encoded}`
    }
}).then(
    resp => resp.json()
).then((json) => {
    for(let i = 0; i < 3; i++) {
        top_3.push(json['data']['languages'][i])
    }
})

// total coding time over last 7 days
const params = new URLSearchParams()
params.append('range', 'Last 7 Days')

const p1 = fetch(`${resource_url_prefix}/summaries?${params.toString()}`, {
    headers: {
        'Authorization': `Basic ${api_key_b64_encoded}`
    },
}).then(
    resp => resp.json()
).then((json) => {
    time_7_days = json['cumulative_total']['text']
})

// total time spent with wakatime
const p2 = fetch(`${resource_url_prefix}/all_time_since_today`, {
    headers: {
        'Authorization': `Basic ${api_key_b64_encoded}`
    },
}).then(
    resp => resp.json()
).then((json) => {
    time_total = json['data']['text']
})

Promise.all([p0, p1, p2]).then(() => {
    console.log(moment().tz("Asia/Shanghai").format('YYYY-MM-DD, HH:mm:ss'))
    console.log(time_7_days)
    console.log(time_total)
    console.log(top_3)
})