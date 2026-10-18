(function(){
  var c = document.getElementById('sky'), x = c.getContext('2d');
  var W, H, stars = [], shoots = [], mx = 0, my = 0, next = 0;
  var COL = ['#ffffff','#ffffff','#e4d4ff','#c9a8ff','#8b3dff'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function size(){
    var d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * d; c.height = H * d;
    x.setTransform(d, 0, 0, d, 0, 0);
    stars = [];
    var n = Math.round(W * H / 9000);
    for (var i = 0; i < n; i++) stars.push({
      x: Math.random() * W, y: Math.random() * H,
      l: Math.random() * .8 + .2,            // capa: mas alto = mas cerca
      r: Math.random() * 1.5 + .4,
      p: Math.random() * 6.28, s: Math.random() * .03 + .01,
      c: COL[(Math.random() * COL.length) | 0],
      big: Math.random() < .12
    });
    if (reduce) draw(0);
  }

  function draw(t){
    x.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++){
      var s = stars[i];
      if (!reduce){ s.y -= s.l * .08; if (s.y < -10) { s.y = H + 10; s.x = Math.random() * W; } }
      var px = s.x + mx * s.l * 18, py = s.y + my * s.l * 18;
      var a = reduce ? .8 : .35 + .65 * Math.abs(Math.sin(s.p + t * s.s * .06));
      x.globalAlpha = a * (.4 + s.l * .6);
      x.fillStyle = x.strokeStyle = s.c;
      x.beginPath(); x.arc(px, py, s.r, 0, 6.283); x.fill();
      if (s.big){                              // destello en cruz
        var L = s.r * 6 * a;
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(px - L, py); x.lineTo(px + L, py);
        x.moveTo(px, py - L); x.lineTo(px, py + L);
        x.stroke();
      }
    }
    x.globalAlpha = 1;
    if (reduce) return;

    if (t > next){                             // estrella fugaz cada 3-7 s
      shoots.push({x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .4, v: 9 + Math.random() * 5, life: 1});
      next = t + 3000 + Math.random() * 4000;
    }
    for (var j = shoots.length - 1; j >= 0; j--){
      var q = shoots[j];
      q.x -= q.v; q.y += q.v * .55; q.life -= .016;
      if (q.life <= 0){ shoots.splice(j, 1); continue; }
      var g = x.createLinearGradient(q.x, q.y, q.x + 120, q.y - 66);
      g.addColorStop(0, 'rgba(255,255,255,' + q.life + ')');
      g.addColorStop(.4, 'rgba(139,61,255,' + q.life * .6 + ')');
      g.addColorStop(1, 'rgba(139,61,255,0)');
      x.strokeStyle = g; x.lineWidth = 2;
      x.beginPath(); x.moveTo(q.x, q.y); x.lineTo(q.x + 120, q.y - 66); x.stroke();
    }
  }

  function loop(t){ draw(t); requestAnimationFrame(loop); }
  addEventListener('resize', size);
  addEventListener('pointermove', function(e){
    mx = e.clientX / W - .5; my = e.clientY / H - .5;
  });
  size();
  if (!reduce) requestAnimationFrame(loop);
})();