# A Little Something

A cinematic, mouse-led memory experience made with React and Vite.

## Run locally

1. Install Node.js.
2. In this folder, run `npm install` and then `npm run dev`.
3. Open the local address Vite prints.

## Add photos

Copy image files into `public/photos/`, then edit `src/data/memories.js`. Set each `image` to a path such as `/photos/our-photo.jpg`, and customize its `caption` and `message`. The sequence is data-driven; no component edits are needed to change those details. No personal photos were included at build time, so empty image entries show placeholders.

## Optional music

Place an MP3 at `public/music.mp3`. Sound stays off until the visitor chooses SOUND ON.

## Wording and flow

Edit `src/App.jsx` for the story and final messages. The opening stays mysterious; the apology is only shown after the memory reveal.
