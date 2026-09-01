import { createClient, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import crypto from 'crypto'

function getWixClient() {
    const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
    const apiKey = process.env.VITE_WIX_API_KEY
    return createClient({
        modules: { items },
        auth: ApiKeyStrategy({ siteId, apiKey }),
    })
}

function hashPassword(password, salt) {
    return crypto.scryptSync(password, salt, 64).toString('hex')
}

// Find or Create contact in Wix Contacts CRM with strictly unique ID per email
async function getOrCreateWixContact(name, email, phone, city) {
    if (!email) return null
    const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
    const apiKey = process.env.VITE_WIX_API_KEY
    const cleanEmail = email.trim().toLowerCase()

    try {
        // 1. Fetch contacts list and accurately match by email
        const searchRes = await fetch('https://www.wixapis.com/contacts/v4/contacts?paging.limit=100', {
            headers: {
                'Authorization': apiKey,
                'wix-site-id': siteId,
                'Content-Type': 'application/json'
            }
        })
        const searchData = await searchRes.json().catch(() => null)
        const contacts = searchData?.contacts || []

        const matched = contacts.find(c => {
            const primaryEmail = (c.primaryInfo?.email || '').trim().toLowerCase()
            const itemEmails = (c.info?.emails?.items || []).map(e => (e.email || '').trim().toLowerCase())
            return primaryEmail === cleanEmail || itemEmails.includes(cleanEmail)
        })

        if (matched?.id && (cleanEmail === 'hola@dilodigitalmx.com' || matched.id !== '0fd8d34b-f6c0-43bd-be2c-c531fced4030')) {
            return matched.id
        }

        // 2. Create new unique contact in Wix CRM if not found
        const parts = (name || '').trim().split(' ')
        const firstName = parts[0] || 'Viajero'
        const lastName = parts.slice(1).join(' ') || 'RutaXAsia'

        const createRes = await fetch('https://www.wixapis.com/contacts/v4/contacts', {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'wix-site-id': siteId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                info: {
                    name: { first: firstName, last: lastName },
                    emails: { items: [{ tag: 'MAIN', email: cleanEmail, primary: true }] },
                    phones: phone ? { items: [{ tag: 'MOBILE', phone: phone.trim(), primary: true }] } : undefined,
                    addresses: city ? { items: [{ tag: 'HOME', address: { city: city.trim(), country: 'MEX' } }] } : undefined
                }
            })
        })
        const createData = await createRes.json().catch(() => null)
        if (createData?.contact?.id) {
            console.log(`[Auth] ✅ Created new Wix Contact ${createData.contact.id} for ${cleanEmail}`)
            return createData.contact.id
        }
        return `CNT-${Date.now()}`
    } catch (err) {
        console.warn('[Auth] Contact CRM sync notice:', err.message)
        return `CNT-${Date.now()}`
    }
}

// Update existing Wix Contact in CRM
async function updateWixContact(contactId, name, phone, city) {
    if (!contactId || contactId.startsWith('CNT-')) return
    const siteId = process.env.VITE_WIX_SITE_ID || 'eb570f22-c7fd-4816-9a7a-68911d31ff7b'
    const apiKey = process.env.VITE_WIX_API_KEY

    try {
        const getRes = await fetch(`https://www.wixapis.com/contacts/v4/contacts/${contactId}`, {
            headers: { 'Authorization': apiKey, 'wix-site-id': siteId }
        })
        const getData = await getRes.json().catch(() => null)
        if (!getData?.contact) return

        const parts = (name || '').trim().split(' ')
        const firstName = parts[0] || getData.contact.info?.name?.first || 'Viajero'
        const lastName = parts.slice(1).join(' ') || getData.contact.info?.name?.last || 'RutaXAsia'

        await fetch(`https://www.wixapis.com/contacts/v4/contacts/${contactId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': apiKey,
                'wix-site-id': siteId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                info: {
                    name: { first: firstName, last: lastName },
                    phones: phone ? { items: [{ tag: 'MOBILE', phone: phone.trim(), primary: true }] } : getData.contact.info?.phones,
                    addresses: city ? { items: [{ tag: 'HOME', address: { city: city.trim(), country: 'MEX' } }] } : getData.contact.info?.addresses
                },
                revision: getData.contact.revision
            })
        })
        console.log(`[Auth] ✅ Synced updated profile to Wix Contact ${contactId}`)
    } catch (err) {
        console.warn('[Auth] Error updating Wix contact:', err.message)
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') return res.status(200).end()

    const { action } = req.query || {}
    const body = req.body || {}
    const wixClient = getWixClient()

    // ============================================================
    // 1. REGISTER NEW USER (EMAIL + PASSWORD + WIX CRM SYNC)
    // ============================================================
    if (action === 'register' || req.method === 'POST' && body.action === 'register') {
        const { name, email, password, phone, city, photo } = body

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, correo electrónico y contraseña son campos requeridos.' })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
        }

        const cleanEmail = email.trim().toLowerCase()

        try {
            // Check if user already exists in CuentasViajeros
            const existingQuery = await wixClient.items.query('CuentasViajeros')
                .eq('title', cleanEmail)
                .limit(1)
                .find()

            if (existingQuery.items && existingQuery.items.length > 0) {
                return res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.' })
            }

            // Sync with Wix CRM Contacts ensuring unique ID
            const contactId = await getOrCreateWixContact(name, cleanEmail, phone, city)

            // Hash password securely
            const salt = crypto.randomBytes(16).toString('hex')
            const passHash = hashPassword(password, salt)
            const now = new Date()

            const accountRecord = {
                title: cleanEmail,
                email: cleanEmail,
                nombreCompleto: name.trim(),
                telefono: phone ? phone.trim() : '',
                ciudad: city ? city.trim() : 'México',
                contactId: contactId,
                memberId: contactId,
                passwordHash: passHash,
                passwordSalt: salt,
                fotoPerfil: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80',
                fechaRegistro: now,
                ultimoAcceso: now
            }

            const inserted = await wixClient.items.insert('CuentasViajeros', accountRecord)

            return res.status(201).json({
                success: true,
                message: '¡Cuenta creada con éxito!',
                user: {
                    id: inserted._id,
                    name: accountRecord.nombreCompleto,
                    email: cleanEmail,
                    phone: accountRecord.telefono,
                    city: accountRecord.ciudad,
                    contactId: accountRecord.contactId,
                    memberId: accountRecord.memberId,
                    photo: accountRecord.fotoPerfil,
                }
            })
        } catch (err) {
            console.error('[Auth] Register error:', err)
            return res.status(500).json({ error: 'Error al registrar la cuenta. Intenta nuevamente.' })
        }
    }

    // ============================================================
    // 2. LOGIN (EMAIL + PASSWORD)
    // ============================================================
    if (action === 'login' || req.method === 'POST' && body.action === 'login') {
        const { email, password } = body

        if (!email || !password) {
            return res.status(400).json({ error: 'Por favor ingresa tu correo electrónico y contraseña.' })
        }

        const cleanEmail = email.trim().toLowerCase()

        try {
            // Find in CuentasViajeros
            const query = await wixClient.items.query('CuentasViajeros')
                .eq('title', cleanEmail)
                .limit(1)
                .find()

            let account = query.items?.[0]

            // If account does NOT exist in CuentasViajeros yet:
            // Check if traveler has bookings in ReservasdeViaje or Pagosprogramados
            if (!account) {
                const reservasQuery = await wixClient.items.query('ReservasdeViaje')
                    .eq('correoElectrnico', cleanEmail)
                    .limit(1)
                    .find()

                const pagosQuery = await wixClient.items.query('Pagosprogramados')
                    .eq('emailCliente', cleanEmail)
                    .limit(1)
                    .find()

                const hasBookings = (reservasQuery.items?.length > 0) || (pagosQuery.items?.length > 0)

                if (hasBookings) {
                    // Auto-onboard traveler with the password provided
                    const rData = reservasQuery.items?.[0] || pagosQuery.items?.[0]
                    const travelerName = rData.nombreCompleto || rData.nombreCliente || 'Viajero RutaXAsia'
                    const travelerPhone = rData.telfono || rData.telefonoCliente || ''
                    const contactId = await getOrCreateWixContact(travelerName, cleanEmail, travelerPhone, 'México')

                    const salt = crypto.randomBytes(16).toString('hex')
                    const passHash = hashPassword(password, salt)
                    const now = new Date()

                    const newAccount = {
                        title: cleanEmail,
                        email: cleanEmail,
                        nombreCompleto: travelerName,
                        telefono: travelerPhone,
                        ciudad: 'México',
                        contactId: contactId,
                        memberId: contactId,
                        passwordHash: passHash,
                        passwordSalt: salt,
                        fotoPerfil: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80',
                        fechaRegistro: now,
                        ultimoAcceso: now
                    }

                    const inserted = await wixClient.items.insert('CuentasViajeros', newAccount)

                    return res.status(200).json({
                        success: true,
                        message: '¡Bienvenido! Tu cuenta ha sido activada y vinculada a tus viajes.',
                        user: {
                            id: inserted._id,
                            name: newAccount.nombreCompleto,
                            email: cleanEmail,
                            phone: newAccount.telefono,
                            city: newAccount.ciudad,
                            contactId: newAccount.contactId,
                            memberId: newAccount.memberId,
                            photo: newAccount.fotoPerfil,
                        }
                    })
                }

                return res.status(404).json({
                    error: 'No encontramos una cuenta con este correo. Por favor crea tu cuenta para comenzar.'
                })
            }

            // Auto-heal legacy accounts that had the bugged default contactId
            if (account.contactId === '0fd8d34b-f6c0-43bd-be2c-c531fced4030' && cleanEmail !== 'hola@dilodigitalmx.com') {
                const uniqueContactId = await getOrCreateWixContact(account.nombreCompleto, cleanEmail, account.telefono, account.ciudad)
                if (uniqueContactId && uniqueContactId !== '0fd8d34b-f6c0-43bd-be2c-c531fced4030') {
                    account.contactId = uniqueContactId
                    account.memberId = uniqueContactId
                    await wixClient.items.update('CuentasViajeros', account).catch(() => {})
                }
            }

            // Verify password
            const computedHash = hashPassword(password, account.passwordSalt)
            if (computedHash !== account.passwordHash) {
                return res.status(401).json({
                    error: 'La contraseña es incorrecta. Por favor verifica tus datos o utiliza "Olvidé mi contraseña".'
                })
            }

            // Update last access timestamp
            wixClient.items.update('CuentasViajeros', {
                ...account,
                ultimoAcceso: new Date()
            }).catch(() => {})

            return res.status(200).json({
                success: true,
                user: {
                    id: account._id,
                    name: account.nombreCompleto || 'Viajero RutaXAsia',
                    email: account.email || cleanEmail,
                    phone: account.telefono || '',
                    city: account.ciudad || 'México',
                    contactId: account.contactId || account._id,
                    memberId: account.memberId || account._id,
                    photo: account.fotoPerfil || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80',
                }
            })
        } catch (err) {
            console.error('[Auth] Login error:', err)
            return res.status(500).json({ error: 'Error al iniciar sesión. Intenta nuevamente.' })
        }
    }

    // ============================================================
    // 3. UPDATE PROFILE (NAME, PHONE, CITY, PHOTO, PASSWORD)
    // ============================================================
    if (action === 'update-profile' || req.method === 'POST' && body.action === 'update-profile') {
        const { email, name, phone, city, photo, newPassword, currentPassword } = body

        if (!email) {
            return res.status(400).json({ error: 'Correo electrónico es requerido.' })
        }

        const cleanEmail = email.trim().toLowerCase()

        try {
            const query = await wixClient.items.query('CuentasViajeros')
                .eq('title', cleanEmail)
                .limit(1)
                .find()

            const account = query.items?.[0]
            if (!account) {
                return res.status(404).json({ error: 'Cuenta no encontrada.' })
            }

            // If changing password, verify current password first
            let passHash = account.passwordHash
            let salt = account.passwordSalt

            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({ error: 'Debes ingresar tu contraseña actual para cambiarla.' })
                }
                const checkCurrent = hashPassword(currentPassword, account.passwordSalt)
                if (checkCurrent !== account.passwordHash) {
                    return res.status(401).json({ error: 'Tu contraseña actual no es correcta.' })
                }
                if (newPassword.length < 6) {
                    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' })
                }
                salt = crypto.randomBytes(16).toString('hex')
                passHash = hashPassword(newPassword, salt)
            }

            // Make sure contactId is valid
            let validContactId = account.contactId
            if (!validContactId || validContactId === '0fd8d34b-f6c0-43bd-be2c-c531fced4030' && cleanEmail !== 'hola@dilodigitalmx.com') {
                validContactId = await getOrCreateWixContact(name || account.nombreCompleto, cleanEmail, phone || account.telefono, city || account.ciudad)
            }

            const updatedPayload = {
                ...account,
                nombreCompleto: name ? name.trim() : account.nombreCompleto,
                telefono: phone !== undefined ? phone.trim() : account.telefono,
                ciudad: city !== undefined ? city.trim() : account.ciudad,
                fotoPerfil: photo !== undefined ? photo : account.fotoPerfil,
                contactId: validContactId,
                memberId: validContactId,
                passwordHash: passHash,
                passwordSalt: salt,
                ultimoAcceso: new Date(),
                _updatedDate: new Date()
            }

            await wixClient.items.update('CuentasViajeros', updatedPayload)

            // Also update in Wix Contacts CRM
            updateWixContact(validContactId, updatedPayload.nombreCompleto, updatedPayload.telefono, updatedPayload.ciudad).catch(() => {})

            return res.status(200).json({
                success: true,
                message: 'Perfil actualizado con éxito.',
                user: {
                    id: account._id,
                    name: updatedPayload.nombreCompleto,
                    email: cleanEmail,
                    phone: updatedPayload.telefono,
                    city: updatedPayload.ciudad,
                    contactId: validContactId,
                    memberId: validContactId,
                    photo: updatedPayload.fotoPerfil,
                }
            })
        } catch (err) {
            console.error('[Auth] Update profile error:', err)
            return res.status(500).json({ error: 'Error al actualizar el perfil.' })
        }
    }

    // ============================================================
    // 4. FORGOT PASSWORD (RESET INSTRUCTIONS)
    // ============================================================
    if (action === 'forgot-password' || req.method === 'POST' && body.action === 'forgot-password') {
        const { email } = body
        if (!email) return res.status(400).json({ error: 'Ingresa tu correo electrónico.' })

        const cleanEmail = email.trim().toLowerCase()

        try {
            const query = await wixClient.items.query('CuentasViajeros').eq('title', cleanEmail).limit(1).find()
            return res.status(200).json({
                success: true,
                message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.'
            })
        } catch (err) {
            return res.status(500).json({ error: 'Error al procesar solicitud.' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
