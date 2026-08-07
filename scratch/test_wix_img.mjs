import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

const wixClient = createClient({
    modules: { items },
    auth: ApiKeyStrategy({
        siteId: 'eb570f22-c7fd-4816-9a7a-68911d31ff7b',
        apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcImE4Y2UzMzY3LWI0YzQtNDBhMC04OTA1LTFlNmFhNjA2YjY1NFwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjBjYjUyMGUwLTY1NDEtNDNmNi1hY2VhLTc1OTQ1ZGY1YmJmY1wifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCI2OWZjYzExNi0yMzlhLTRhMDItOWQ5NC04Y2M1YjY5MTRkZWRcIn19IiwiaWF0IjoxNzc2ODkxMzk3fQ.lsUzC7nlKpdSnRrGoG9YK1F7dp4vDMyMGlKf4QTyrmMq7E7trqt7uUYWY-uDbddl_VzAkG-VLYSHMsoQpv6gSLv-0-gfA6IaWsNKqWFiBMIqfmQ96W2mEVk0ttNk6nVxQwYyMMUycHLwARRhdicrs0lYbpOLbkt0eeAh5hHB2K35n8DizBEt_zRBaElUstg6Vd6UgSt-u8Eu_ZuCMdocGnXqCNGQFwO3q2Xnl36J3cZqSkt_OXXhUb2OPZDiWxVhuWzYL9ni-r_PLAwrWt_LhGQgYQ61g53inbN-4uSDhJU-94uq1DXE8kHiinuTewbNuhcUUVFax2Qb2xNyXLhyNQ',
    }),
})

function formatWixImageUrl(wixUrl) {
    if (!wixUrl) return ''
    if (wixUrl.startsWith('http://') || wixUrl.startsWith('https://')) return wixUrl
    if (wixUrl.startsWith('wix:image://v1/')) {
        const match = wixUrl.match(/wix:image:\/\/v1\/([^/#]+)/)
        if (match && match[1]) {
            return `https://static.wixstatic.com/media/${match[1]}`
        }
    }
    return wixUrl
}

async function testImages() {
    const res = await wixClient.items.query('TourIndividuales').limit(5).find()
    res.items.forEach(it => {
        console.log(`Original: ${it.image}`)
        console.log(`Formatted: ${formatWixImageUrl(it.image)}`)
        console.log('---')
    })
}

testImages()
