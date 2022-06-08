import { google, drive_v3, Auth, docs_v1 } from 'googleapis'
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const refresh_token = process.env.REFRESH_TOKEN

const auth: Auth.OAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
auth.setCredentials({ refresh_token })

const drive: drive_v3.Drive = google.drive({
  version: 'v3',
  auth
})

const docs: docs_v1.Docs = google.docs({ version: 'v1', auth })

export { drive, docs }
