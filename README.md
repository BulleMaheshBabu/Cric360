# Cric360

Hub + Auction Tracker 360 + Cric360 Live

## Files on this repo

- `index.html` — tool selection hub (Google sign-in)
- `auctiontracker360.html` — upload full file if missing
- `cric360live.html` — upload full file if missing  
- `sounds/` — MP3 assets

## Deploy (GitHub Pages)

1. Settings → Pages → Source: **Deploy from a branch**
2. Branch: **main** / folder: **/ (root)** → Save
3. Site: `https://bullemaheshbabu.github.io/Cric360/`
4. Firebase Auth → Authorized domains → add `bullemaheshbabu.github.io`

## Upload remaining files from PC

```bash
cd folder-with-index-and-sounds
git clone https://github.com/BulleMaheshBabu/Cric360.git
cd Cric360
# copy auctiontracker360.html cric360live.html sounds/ into this folder
git add .
git commit -m "Add full app and sounds"
git push origin main
```
