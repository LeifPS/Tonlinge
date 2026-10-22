#!/bin/bash
# Baut public/wiki/index.html: das Tonlinge-Wiki mit denselben Daten, Grafiken und Stilen wie das Spiel
cd "$(dirname "$0")/src"
mkdir -p ../public/wiki
cat d5_tracks.js d5b_himmel.js d_audio.js d9_reveal.js > ../public/wiki/audio.js   # Klänge werden erst bei der ersten Vorschau nachgeladen
LOG=$(git -C .. log --date=short --pretty=format:'%ad%x09%s' -n 150 2>/dev/null | node -e "const l=require('fs').readFileSync(0,'utf8').split('\n').filter(Boolean).map(x=>x.split('\t')).filter(x=>x[1]&&!/^(Merge|Revert|Build)/.test(x[1]));console.log(JSON.stringify(l))" 2>/dev/null || echo '[]')
{
  echo '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  echo '<title>Tonlinge-Wiki</title><meta name="description" content="Das Wiki zu Tonlinge: alle Tonlinge, Instrumente, Mutationen, Orte, Quests, Titel und Rechner.">'
  echo '<style>'; sed -n '/^<style>/,/^<\/style>/p' h_head.html | sed '1d;$d'; cat wiki/wiki.css; echo '</style>'
  cat wiki/wiki_shell.html
  grep '^<svg width="0"' h_head.html
  echo '<script>var curArea=1,WIKI_LITE=1;'
  cat d1_data.js wx_core.js wx_weather.js d2_quests.js d3_story.js d4_songs.js d6_area5.js wx_totem.js d7_npcs5.js d7b_text.js d8_sk_quests.js w_world.js w_layers.js w_sanktum.js c_core.js e_scene.js r_render.js r_forms4.js r_glor.js r_forms5.js r_sanktum.js wx_totem_art.js p_poses.js z_npcs5.js t_titles.js
  echo "const WIKI_LOG = $LOG;"
  cat wiki/wiki_engine.js wiki/wiki_icons.js wiki/wiki_core.js wiki/wiki_pages_a.js wiki/wiki_pages_b.js wiki/wiki_tools.js wiki/wiki_guide.js wiki/wiki_audio.js
  echo 'wikiBoot();'
  echo '</script></html>'
} > ../public/wiki/index.html
node -e "const s=require('fs').readFileSync('../public/wiki/index.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/)[1];try{new Function(m);console.log('wiki syntax ok',Math.round(s.length/1024)+' KB')}catch(e){console.log('WIKI ERR',e.message)}"
