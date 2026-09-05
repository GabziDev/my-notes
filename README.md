# my-notes
Cette application sert à la prise de notes avec des fichiers au format Markdown.

## Lancer l'app
Build l'image :
```bash
docker build -t my-notes .
```

Lancer le container :
```bash
docker run -p 3000:3000 -v ./data:/app/data -v ./files:/app/files my-notes
```

Les données SQLite et fichiers Markdown sont conservés dans les dossier `data/` et `files/`