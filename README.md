# 🤖 Agent Financier IA — Installation Mac

Une app Mac discrète dans votre barre de menu avec :
- **Chat IA 24/7** avec Claude pour vos questions financières
- **Résumé hebdomadaire automatique** envoyé par email chaque lundi à 8h
- **Conseils personnalisés** basés sur votre portefeuille

---

## 📋 Prérequis

- macOS 12 ou plus récent
- [Node.js](https://nodejs.org) v18 ou plus (téléchargez l'installeur LTS)
- Une clé API Anthropic (voir ci-dessous)

---

## 🚀 Installation en 4 étapes

### Étape 1 — Installer Node.js
Allez sur https://nodejs.org et téléchargez la version LTS.

### Étape 2 — Installer l'app
Ouvrez le Terminal (cherchez "Terminal" dans Spotlight) et tapez :

```bash
cd ~/Desktop/agent-financier
npm install
```

Attendez que l'installation se termine (environ 2 minutes).

### Étape 3 — Lancer l'app
```bash
npm start
```

Une petite icône apparaît dans votre barre de menu en haut à droite.

### Étape 4 — Configurer dans l'app
Cliquez sur l'icône → ⚙️ Paramètres et renseignez :

**Clé API Anthropic :**
1. Allez sur https://console.anthropic.com
2. Créez un compte gratuit
3. Allez dans "API Keys" → "Create Key"
4. Copiez la clé (commence par `sk-ant-`)
5. Rechargez votre compte avec ~10€ (dure plusieurs mois)

**Email (pour le résumé hebdomadaire) :**
1. Utilisez un compte Gmail
2. Activez la validation en 2 étapes : https://myaccount.google.com/security
3. Créez un "mot de passe d'application" : https://myaccount.google.com/apppasswords
4. Sélectionnez "Autre" et nommez-le "Agent Financier"
5. Copiez le mot de passe à 16 caractères

---

## 💡 Utilisation

- **Chat** : posez n'importe quelle question financière
- **Résumé** : générez manuellement ou attendez le lundi 8h
- Clic droit sur l'icône de la barre de menu → accès rapide

---

## 🔄 Lancer automatiquement au démarrage du Mac

Dans Terminal :
```bash
# Créer un agent launchd
cat > ~/Library/LaunchAgents/com.agentfinancier.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.agentfinancier</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/npm</string>
    <string>start</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/VOTRE_NOM/Desktop/agent-financier</string>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.agentfinancier.plist
```
Remplacez VOTRE_NOM par votre nom d'utilisateur Mac.

---

## ❓ Problèmes fréquents

**L'app ne démarre pas** → Vérifiez que Node.js est installé : `node --version`
**Le chat répond "Clé API non configurée"** → Allez dans ⚙️ Paramètres
**L'email n'arrive pas** → Vérifiez le mot de passe d'application Gmail (pas votre vrai mot de passe)
