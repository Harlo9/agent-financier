const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron')
const path = require('path')
const cron = require('node-cron')
const nodemailer = require('nodemailer')
const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')

// ─── CONFIGURATION ─────────────────────────────────────────────────────────
// Modifiez ces valeurs dans config.json après installation
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json')

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  }
  return {
    anthropicKey: '',
    emailFrom: '',
    emailTo: '',
    emailPassword: '',
    investmentAmount: 300,
    portfolio: [
      { name: 'ETF MSCI World (CW8)', allocation: 50, currentValue: 6000 },
      { name: 'ETF S&P 500 (PE500)', allocation: 30, currentValue: 4000 },
      { name: 'Fonds euros / Obligations', allocation: 20, currentValue: 2450 }
    ],
    weeklyReportDay: 'monday' // jour d'envoi du résumé
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

// ─── ÉTAT DE L'APP ──────────────────────────────────────────────────────────
let mainWindow = null
let tray = null
let config = loadConfig()
let anthropic = null

function initAnthropic() {
  if (config.anthropicKey) {
    anthropic = new Anthropic({ apiKey: config.anthropicKey })
  }
}
initAnthropic()

// ─── FENÊTRE PRINCIPALE ──────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 380,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Minimiser dans la barre de menu au lieu de fermer
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

// ─── ICÔNE BARRE DE MENU ────────────────────────────────────────────────────
function createTray() {
  // Icône simple en base64 (petit graphique €)
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAACa0awAAAA9SURBVDgRY2AYBdQHAAACAAGAWjR+AAAAAElFTkSuQmCC'
  )

  tray = new Tray(icon)
  tray.setToolTip('Agent Financier IA')

  const contextMenu = Menu.buildFromTemplate([
    { label: '💬 Ouvrir le chat', click: () => { mainWindow.show(); mainWindow.focus() } },
    { label: '📊 Résumé maintenant', click: () => sendWeeklyReport() },
    { type: 'separator' },
    { label: '⚙️ Paramètres', click: () => { mainWindow.show(); mainWindow.webContents.send('open-settings') } },
    { type: 'separator' },
    { label: 'Quitter', click: () => { app.isQuitting = true; app.quit() } }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => { mainWindow.show(); mainWindow.focus() })
}

// ─── RÉSUMÉ HEBDOMADAIRE ────────────────────────────────────────────────────
async function generateWeeklySummary() {
  if (!anthropic) return "⚠️ Clé API Anthropic non configurée."

  const totalValue = config.portfolio.reduce((sum, p) => sum + p.currentValue, 0)
  const portfolioText = config.portfolio
    .map(p => `- ${p.name}: ${p.currentValue}€ (${p.allocation}%)`)
    .join('\n')

  const prompt = `Tu es mon conseiller financier IA personnel. Voici un résumé de mon portefeuille cette semaine :

Valeur totale : ${totalValue}€
Montant investi chaque mois : ${config.investmentAmount}€

Composition du portefeuille :
${portfolioText}

Génère un résumé hebdomadaire en français structuré ainsi :
1. 📊 Performance de la semaine (analyse générale des marchés ETF)
2. 💡 3 conseils concrets et actionnables pour ce mois
3. ⚠️ Points de vigilance éventuels
4. ✅ Action recommandée pour ce mois

Sois concis, pratique et bienveillant. Rappelle que tu n'es pas un conseiller agréé.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  return message.content[0].text
}

async function sendWeeklyReport() {
  try {
    const summary = await generateWeeklySummary()

    // Envoyer l'email si configuré
    if (config.emailFrom && config.emailTo && config.emailPassword) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: config.emailFrom, pass: config.emailPassword }
      })

      const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

      await transporter.sendMail({
        from: `"Agent Financier IA" <${config.emailFrom}>`,
        to: config.emailTo,
        subject: `📈 Résumé financier du ${date}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2 style="color:#1a1a1a;border-bottom:2px solid #1D9E75;padding-bottom:8px">
              📈 Votre résumé financier hebdomadaire
            </h2>
            <div style="white-space:pre-wrap;line-height:1.7;color:#333;font-size:15px">
              ${summary.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin-top:24px;border:none;border-top:1px solid #eee">
            <p style="color:#999;font-size:12px">Généré par votre Agent Financier IA personnel • ${date}</p>
          </div>
        `
      })
    }

    // Notifier l'interface
    if (mainWindow) {
      mainWindow.webContents.send('weekly-report', summary)
    }

    return summary
  } catch (err) {
    console.error('Erreur résumé hebdomadaire:', err)
    return `Erreur lors de la génération du résumé : ${err.message}`
  }
}

// ─── CRON HEBDOMADAIRE (tous les lundis à 8h) ────────────────────────────────
cron.schedule('0 8 * * 1', () => {
  sendWeeklyReport()
})

// ─── IPC HANDLERS ────────────────────────────────────────────────────────────
ipcMain.handle('chat-message', async (event, messages) => {
  if (!anthropic) return { error: 'Clé API non configurée. Allez dans Paramètres.' }

  try {
    const totalValue = config.portfolio.reduce((sum, p) => sum + p.currentValue, 0)
    const systemPrompt = `Tu es un conseiller financier IA personnel, expert en investissement passif (ETF, DCA, diversification). 
    
Contexte du portefeuille de l'utilisateur :
- Valeur totale : ${totalValue}€
- Investissement mensuel : ${config.investmentAmount}€
- Allocation : ${config.portfolio.map(p => `${p.name} ${p.allocation}%`).join(', ')}

Réponds en français, de façon concise et pratique. Rappelle si nécessaire que tu n'es pas un conseiller financier agréé pour les décisions importantes.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages
    })

    return { text: response.content[0].text }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('get-config', () => config)

ipcMain.handle('save-config', (event, newConfig) => {
  config = { ...config, ...newConfig }
  saveConfig(config)
  initAnthropic()
  return { success: true }
})

ipcMain.handle('trigger-report', async () => {
  return await sendWeeklyReport()
})

// ─── DÉMARRAGE ───────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()
  createTray()
  app.dock.hide() // Masquer du dock macOS (accessible via barre de menu)
})

app.on('window-all-closed', (e) => {
  e.preventDefault() // Ne pas quitter quand on ferme la fenêtre
})
