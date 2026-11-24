# my-notes
Application de prise de notes basé sur des fichiers au format markdown

## Comment ça marche ?
Les données sont persistées localement

| Dossier | Contenu |
|-|-|
| `data/` | Base de données sqlite pour l'utilisateur et sessions |
| `files/` | Fichiers de notes au format markdown |

## Prerequis
- [Docker](https://docs.docker.com/get-docker/) et docker compose (recommandée)
- [Node.js](https://nodejs.org/en/download) 22+ et npm (alternative à docker)

## Lancer l'app
```bash
cp .env.example .env
```

| Variable | Description | Exemple | 
|-|-|-|
| `NODE_ENV` | Environnement : `development` ou `production` | `production` |
| `HTTPS` | Active ou non le HTTPS : `true` ou `false` | `false` |

### Avec Docker (recommandée) 
```bash
docker compose up --build -d
```

Stopper l'application :
```bash
docker compose down
```

### Sans Docker
```bash
# Installer les dependances
npm install

# Init la db SQLite
npx prisma migrate dev --name init

# Build l'app
npm run build

# Demarrer l'app
npm run start
```