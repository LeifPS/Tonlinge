#!/bin/bash
# Baut public/index.html aus den Quelldateien in src/
cd "$(dirname "$0")/src"
mkdir -p ../public
{ echo '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'; cat h_head.html; echo "<script>"; cat d1_data.js d2_quests.js d3_story.js d4_songs.js d5_tracks.js d_audio.js w_world.js w_layers.js w_sanktum.js c_core.js r_render.js r_forms4.js r_glor.js r_sanktum.js p_poses.js e_scene.js g_game.js k_map.js t_titles.js m_net.js; echo "</script>"; } > ../public/index.html
node -e "const s=require('fs').readFileSync('../public/index.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/)[1];try{new Function(m);console.log('syntax ok')}catch(e){console.log('ERR',e.message)}"
