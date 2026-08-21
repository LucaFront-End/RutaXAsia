import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { members } from '@wix/members'

/**
 * POST /api/user-register
 * Creates a new traveler member account in Wix Members
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.status(200).end()

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' })
    }

    const { fullName, email, phone } = req.body || {}
    const trimmedEmail = (email || '').trim().toLowerCase()
    const trimmedName = (fullName || '').trim()
    const trimmedPhone = (phone || '').trim()

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
        return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' })
    }
    if (!trimmedName) {
        return res.status(400).json({ error: 'Ingresa tu nombre completo.' })
    }

    try {
        const apiKey = process.env.VITE_WIX_API_KEY
        const siteId = process.env.VITE_WIX_SITE_ID

        const nameParts = trimmedName.split(' ')
        const firstName = nameParts[0] || 'Viajero'
        const lastName = nameParts.slice(1).join(' ') || ''

        let memberId = ''
        let memberName = trimmedName

        // 1. Create or fetch existing member via Wix REST API
        try {
            const memberCreateRes = await fetch('https://www.wixapis.com/members/v1/members', {
                method: 'POST',
                headers: {
                    'Authorization': apiKey,
                    'wix-site-id': siteId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    member: {
                        loginEmail: trimmedEmail,
                        profile: {
                            nickname: trimmedName,
                            firstName: firstName,
                            lastName: lastName,
                            phones: trimmedPhone ? [trimmedPhone] : []
                        }
                    }
                })
            })

            const memberData = await memberCreateRes.json().catch(() => null)
            if (memberData && memberData.member) {
                memberId = memberData.member.id
                memberName = memberData.member.profile?.nickname || trimmedName
                console.log(`[UserRegister API] ✅ Created new member: ${trimmedName} (${trimmedEmail}) ID: ${memberId}`)
            } else {
                // If member already exists, query member
                const queryRes = await fetch(`https://www.wixapis.com/members/v1/members?filter=${encodeURIComponent(JSON.stringify({ "loginEmail": trimmedEmail }))}`, {
                    headers: { 'Authorization': apiKey, 'wix-site-id': siteId }
                })
                const queryData = await queryRes.json().catch(() => null)
                if (queryData?.members?.length > 0) {
                    memberId = queryData.members[0].id
                    memberName = queryData.members[0].profile?.nickname || trimmedName
                    console.log(`[UserRegister API] ℹ️ Existing member found: ${memberName} (${trimmedEmail}) ID: ${memberId}`)
                }
            }
        } catch (memberErr) {
            console.error('[UserRegister API] Member creation warning:', memberErr.message)
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta creada con éxito.',
            user: {
                memberId: memberId,
                email: trimmedEmail,
                name: memberName,
                phone: trimmedPhone
            }
        })
    } catch (error) {
        console.error('[UserRegister API] Error:', error)
        return res.status(500).json({ error: error.message || 'Error al registrar la cuenta' })
    }
}
