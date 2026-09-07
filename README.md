# Agent Financier

Application macOS de bureau qui vit dans la barre de menu. Elle permet de discuter avec un assistant financier conscient de votre portefeuille, et envoie chaque semaine un résumé par email.

## Fonctionnalités

- Chat avec l'API Anthropic, enrichi du contexte de votre portefeuille
- Résumé hebdomadaire généré automatiquement et envoyé par email
- Application en barre de menu (tray), sans icône dans le Dock
- Configuration persistée en local, sur votre machine uniquement

## Stack

- Electron (application de bureau)
- API Anthropic (modèle de langage)
- node-cron (planification du résumé hebdomadaire)
- nodemailer (envoi de l'email via Gmail)

## Installation

```bash
git clone https://github.com/Harlo9/agent-financier.git
cd agent-financier
npm install
npm start
```

## Configuration

Tout se configure depuis l'application, dans l'écran Réglages.

**Clé API Anthropic**

1. Créez un compte sur https://console.anthropic.com
2. Allez dans API Keys, puis Create Key
3. Copiez la clé (elle commence par `sk-ant-`) et collez-la dans les réglages

**Envoi des emails (Gmail)**

1. Activez la validation en deux étapes sur votre compte Google
2. Créez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Renseignez votre adresse Gmail et ce mot de passe d'application dans les réglages

## Structure du projet

```
src/
  main.js      processus principal Electron : fenêtre, tray, cron, envoi email
  preload.js   pont sécurisé entre l'interface et le processus principal
  index.html   interface de l'application (chat et réglages)
```

## Sécurité

- `contextIsolation` est activé et les échanges passent par un bridge preload : l'interface n'a pas d'accès direct à Node
- La clé API et le mot de passe d'application sont stockés en local et exclus du dépôt via `.gitignore`
- Aucune donnée de portefeuille n'est envoyée ailleurs que vers l'API Anthropic

