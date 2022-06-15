import { exec } from 'child_process'
import fs from 'fs'
import stripJsonComments from 'strip-json-comments'

const main = async () => {
  const extensionsRaw = fs.readFileSync('.vscode/extensions.json', 'utf8')
  const extensionsJson = JSON.parse(stripJsonComments(extensionsRaw))
  const recommendations = extensionsJson.recommendations ?? []

  const installCmd = recommendations.map(extension => `code --force --install-extension ${extension}`).join(' && ')
  exec(installCmd, (err, stdout, stderr) => {
    console.info(stdout)
    if (stderr) console.error(stderr)
    if (err) console.error(err)
  })
}

await main()
