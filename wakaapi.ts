import * as moment from "moment-timezone"
import * as fs from 'fs'

// refer to wakatime api documentation when needed: https://wakatime.com/developers
const resource_url_prefix = 'https://wakatime.com/api/v1/users/current'

// prepare base64-encoded api_key for authntication
const API_KEY = process.env.API_KEY as string         // set your API key in certain github repository
if(!API_KEY) {
    console.error('API_KEY is empty, please check your environment variable')
    process.exit(1)
}

const api_key_b64_encoded = Buffer.from(API_KEY).toString('base64')

var top_3: Array<{name: string, progress_bar_len: number, hrs: string}> = []
var max_lang_name_len: number = 0
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
    var max_hrs: number = NaN
    for(let i = 0; i < 3; i++) {
        const lang_json = json['data']['languages'][i]
        if(!i) {
            max_hrs = Number(lang_json['decimal'])
        }
        max_lang_name_len = Math.max(max_lang_name_len, lang_json['name'].length)
        top_3.push({
            name: lang_json['name'] as string,
            progress_bar_len: Math.floor(Number(lang_json['decimal']) / max_hrs * 34),
            hrs: lang_json['text'] as string
        })
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

// save results to README.md
Promise.all([p0, p1, p2]).then(() => {
    fs.readFile('./README_template.md', 'utf-8', (err, data) => {
        data = data.replace(
            '${UPDATE_TIME}', 
            moment().tz("Asia/Shanghai").format('YYYY-MM-DD, HH:mm:ss')
        ).replace(
            '${TOTAL_TIME}', 
            time_total? time_total: ''
        ).replace(
            '${LAST_7_DAYS}', 
            time_7_days? time_7_days: ''
        )
        
        var top_lang_field: string = ''

        for(let i = 0; i < top_3.length; i++) {
            const lang_name = top_3[i].name
            const lang_name_field = `${lang_name}${' '.repeat(max_lang_name_len - lang_name.length)}` 
            const progress_bar_field = `|${'='.repeat(top_3[i].progress_bar_len)}|`
            const hrs_field = top_3[i].hrs

            top_lang_field += 
                `${' '.repeat(12)}${lang_name_field} 
                ${progress_bar_field} ${hrs_field}${i != 2 ?'\n\n': '\n'}`
        }

        data = data.replace('${TOP_3_LANGUAGES}', top_lang_field)

        fs.writeFile('./README.md', data, (err) => {})
    })
})