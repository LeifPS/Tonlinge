#!/bin/bash
# Baut public/editor.html (Weltbauer) aus den Spielquellen und den Editor-Skripten
cd "$(dirname "$0")"
mkdir -p public
python3 - <<'PY'
import re
head=open("editor/ed_head.html").read().replace("@@FONTS@@",open("editor/fonts.css").read())
S="src/"
game=["d1_data.js","d2_quests.js","d3_story.js","d4_songs.js"]
rest=["d_audio.js","w_world.js","c_core.js","r_render.js","e_tiles.js","p_poses.js"]
parts=[open("editor/ed_stub.js").read()]
for f in game: parts.append(open(S+f).read())
for f in rest: parts.append(open(S+f).read())
parts.append(open(S+"e_project.js").read())
for f in ["ed_core.js","ed_world.js","ed_tabs.js","ed_tabs2.js"]: parts.append(open("editor/"+f).read())
out='<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+head+"<script>\n"+"\n".join(parts)+"\n</script>"
open("public/editor.html","w").write(out)
open("public/editor.artifact.html","w").write(head+"<script>\n"+"\n".join(parts)+"\n</script>")
PY
node -e "const s=require('fs').readFileSync('public/editor.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/)[1];try{new Function(m);console.log('syntax ok', s.length)}catch(e){console.log('ERR',e.message)}"
