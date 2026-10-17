#!/bin/bash
# Baut public/index.html aus den Quelldateien in src/
cd "$(dirname "$0")/src"
mkdir -p ../public
{ cat h_head.html; echo "<script>"; cat d1_data.js d2_quests.js d3_story.js d_audio.js w_world.js c_core.js r_render.js g_game.js m_net.js; echo "</script>"; } > ../public/index.html
node -e "const s=require('fs').readFileSync('../public/index.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/)[1];try{new Function(m);console.log('syntax ok')}catch(e){console.log('ERR',e.message)}"
