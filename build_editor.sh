#!/bin/bash
# Baut public/editor/index.html: der Tonlinge-Editor (Formen zeichnen, Wackel-Look, Export als Code, PNG, SVG, JSON)
cd "$(dirname "$0")/src"
mkdir -p ../public/editor
{
  echo '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  echo '<title>Tonlinge-Editor</title><meta name="description" content="Zeichne Formen im handgezeichneten Tonlinge-Stil und exportiere sie.">'
  echo '<style>'; sed -n '7,8p' h_head.html; cat editor/editor.css; echo '</style>'
  cat editor/editor.html
  echo '<script>'
  sed -n '/^function sketchCtx/,/^const strSeed/p' r_render.js
  cat editor/ed_core.js editor/ed_ui.js
  echo '</script></html>'
} > ../public/editor/index.html
node -e "const s=require('fs').readFileSync('../public/editor/index.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/)[1];try{new Function(m);console.log('editor syntax ok',Math.round(s.length/1024)+' KB')}catch(e){console.log('EDITOR ERR',e.message)}"
