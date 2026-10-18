(function(){
  var c = document.getElementById('c'), ctx = c.getContext('2d');
  var W, H, dpr, cx, cy, tx, ty;
  var DEPTH = 1200, F = 500;
  var COLORS = ['#ffffff','#ffffff','#e4d4ff','#c9a8ff','#8b3dff','#8b3dff','#5b1fc4'];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speed = reduce ? 0.3 : 1.2, paused = false, stars = [];

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (cx === undefined){ cx = tx = W / 2; cy = ty = H / 2; }
  }
  addEventListener('resize', resize); resize();

  function spawn(s, initial){
    s.x = (Math.random() - .5) * 2600;
    s.y = (Math.random() - .5) * 2600;
    s.z = initial ? Math.random() * DEPTH + 1 : DEPTH;
    s.pz = s.z;
    s.col = COLORS[(Math.random() * COLORS.length) | 0];
    s.size = Math.random() * 14 + 8;
    s.rot = Math.random() * 6.283;
    s.spin = (Math.random() - .5) * .05;
    s.star = Math.random() < .6;
    return s;
  }
  function setCount(n){
    while (stars.length < n) stars.push(spawn({}, true));
    stars.length = n;
  }
  setCount(260);

  function drawStar(x, y, r, rot){
    ctx.beginPath();
    for (var i = 0; i < 10; i++){
      var a = rot + i * Math.PI / 5 - Math.PI / 2;
      var rr = i % 2 === 0 ? r : r * .45;
      var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }

  function frame(){
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

    // brillo morado sutil al fondo, en el punto de fuga
    cx += (tx - cx) * .05; cy += (ty - cy) * .05;
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .6);
    g.addColorStop(0, 'rgba(60,15,130,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++){
      var s = stars[i];
      if (!paused){ s.pz = s.z; s.z -= speed * 6; s.rot += s.spin * speed; }
      if (s.z < 2){ spawn(s, false); continue; }

      var k = F / s.z, sx = cx + s.x * k, sy = cy + s.y * k;
      if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60){ spawn(s, false); continue; }

      var depth = 1 - s.z / DEPTH;               // 0 lejos, 1 cerca
      var r = Math.min(s.size * k * .5, 44);
      ctx.globalAlpha = Math.min(1, depth * 1.6 + .1);

      // estela
      var pk = F / s.pz, px = cx + s.x * pk, py = cy + s.y * pk;
      ctx.strokeStyle = s.col; ctx.lineWidth = Math.max(.5, r * .18);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();

      ctx.fillStyle = s.col;
      if (depth > .45 && s.col !== '#ffffff'){ ctx.shadowColor = s.col; ctx.shadowBlur = 14; }
      if (s.star && r > 2.5) drawStar(sx, sy, r, s.rot);
      else { ctx.beginPath(); ctx.arc(sx, sy, Math.max(.7, r * .4), 0, 6.283); ctx.fill(); }
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function point(e){
    var t = e.touches ? e.touches[0] : e;
    tx = t.clientX; ty = t.clientY;
  }
  addEventListener('pointermove', point);
  addEventListener('touchmove', point, {passive:true});

  document.getElementById('speed').value = speed;
  document.getElementById('speed').addEventListener('input', function(e){ speed = +e.target.value; });
  document.getElementById('count').addEventListener('input', function(e){ setCount(+e.target.value); });
  var pb = document.getElementById('pause');
  pb.addEventListener('click', function(){
    paused = !paused; pb.textContent = paused ? 'Reanudar' : 'Pausar';
  });
})();