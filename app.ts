import fs from 'fs'
import path from 'path'
import { drive, docs } from './googleapis'
import util from 'node:util'
import process from 'node:child_process'
const exec = util.promisify(process.exec)

const handleFile = async () => {
  const res = await drive.files.copy({
    fileId: '1sdhp_izYEYMgTLuVsjGJclfA_9k2Vjs2JwGsFZQXgik', // docx檔案的 id
    resource: {
      name: `卡羅網路_服務合約.docx`,
      parents: ['1U4Oe_urVhQ14KoEwjlEh5ipx0Z2COMOM'] // 檔案要放置的位置
    }
  } as any)

  const id = res.data.id
  console.log('id!!!', id)

  const docsRes = await docs.documents.batchUpdate({
    documentId: id,
    requestBody: {
      requests: [
        {
          replaceAllText: {
            containsText: {
              text: '{{user}}',
              matchCase: true
            },
            replaceText: '卡羅網路'
          }
        }
      ]
    }
  } as any)

  const updatedId = docsRes.data.documentId
  console.log('updatedId!!!', updatedId)

  return updatedId
}

const downloadPdf = async (fileId: string) => {
  try {
    const dest = fs.createWriteStream('large.pdf')
    const res = await drive.files.export(
      {
        fileId,
        mimeType: 'application/pdf',
        alt: 'media'
      },
      { responseType: 'stream' }
    )
    res.data
      .on('end', async () => {
        console.log('downloadPdf done')
        // 壓縮 large.pdf
        await execShell()
        // 上傳 small.pdf
        uploadPdf()
      })
      .on('error', (error) => {
        console.log('[ERROR-downloadPdf] ', error)
      })
      .pipe(dest)
  } catch (err) {
    console.log('[ERROR-downloadPdf] ', err)
  }
}

const execShell = async () => {
  try {
    const data = await exec('./shrinkpdf.sh large.pdf > small.pdf')
    console.log('data: ', data)
  } catch (err) {
    console.log('[ERROR-execShell] ', err)
  }
}

const uploadPdf = async () => {
  try {
    const filePath = path.join(__dirname, 'small.pdf')
    const file = await drive.files.create({
      requestBody: {
        name: 'small.pdf',
        parents: ['1U4Oe_urVhQ14KoEwjlEh5ipx0Z2COMOM'] // 上傳檔案的位置
      },
      media: {
        mimeType: 'application/pdf',
        body: fs.createReadStream(filePath)
      },
      fields: 'id,name'
    })
    console.log('file: ', file.data)
  } catch (err) {
    console.log('[ERROR-uploadPdf] ', err)
  }
}

async function run() {
  try {
    // copy docx
    const id = await handleFile()
    // 把 docx 導出成 pdf 並下載 => large.pdf
    await downloadPdf(id!)
  } catch (err) {
    console.log('[ERROR-run] ', err)
  }
}

run()
