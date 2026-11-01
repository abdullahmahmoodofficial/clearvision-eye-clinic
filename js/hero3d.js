/* ClearVision — interactive 3D hero (Three.js, low-poly, graceful fallback).
   If Three.js / WebGL is unavailable, the existing CSS eye graphic stays
   visible and nothing breaks. Exposes window.ClearVisionHero3D for testing. */
(function () {
  'use strict';
  var panel = document.getElementById('heroVisual');
  var container = document.getElementById('hero3d');
  var status = { state: 'idle', reason: '' };
  function showFallback(reason) {
    status.state = 'fallback'; status.reason = reason || 'unavailable';
    if (panel) { panel.classList.remove('has-3d'); panel.classList.add('no-3d'); }
    if (container) { container.innerHTML = ''; }
  }
  function init() {
    if (!panel || !container) { status.state = 'skipped'; status.reason = 'no-hero'; return; }
    if (typeof THREE === 'undefined') { showFallback('cdn-missing'); return; }
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { showFallback('webgl-error'); return; }
    if (!renderer || !renderer.getContext()) { showFallback('webgl-no-context'); return; }
    try {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      panel.classList.add('has-3d');
      status.state = 'active'; status.reason = '';

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 4.4);

      scene.add(new THREE.AmbientLight(0xffffff, 0.95));
      var dir = new THREE.DirectionalLight(0xffffff, 1.1);
      dir.position.set(2, 3, 4); scene.add(dir);
      var fill = new THREE.DirectionalLight(0xff6a55, 0.45);
      fill.position.set(-3, -1, 2); scene.add(fill);

      var eye = new THREE.Group();
      // Sclera: flattened sphere (low-poly: 32x24 segments).
      var sclera = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 24),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.05 })
      );
      sclera.scale.set(1.5, 0.92, 0.55); eye.add(sclera);
      // Iris disc + coral ring + pupil + highlight, facing the viewer (+z).
      var iris = new THREE.Mesh(
        new THREE.CircleGeometry(0.52, 48),
        new THREE.MeshStandardMaterial({ color: 0x1b5b94, roughness: 0.3 })
      );
      iris.position.z = 0.51; eye.add(iris);
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.56, 0.035, 12, 48),
        new THREE.MeshStandardMaterial({ color: 0xff6a55, roughness: 0.4 })
      );
      ring.position.z = 0.51; eye.add(ring);
      var pupil = new THREE.Mesh(
        new THREE.CircleGeometry(0.27, 48),
        new THREE.MeshStandardMaterial({ color: 0x0d1b26, roughness: 0.2 })
      );
      pupil.position.z = 0.53; eye.add(pupil);
      var glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      glint.position.set(0.14, 0.18, 0.58); eye.add(glint);
      scene.add(eye);

      // Floating particles for depth (220 points, one draw call).
      var count = 220, pos = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 7;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 3.6;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2 - 0.5;
      }
      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: 0xffb3a8, size: 0.035, transparent: true, opacity: 0.85, sizeAttenuation: true
      }));
      scene.add(particles);

      function resize() {
        var w = container.clientWidth || 320, h = container.clientHeight || 210;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener('resize', resize);

      var targetY = 0, targetX = 0, curY = 0, curX = 0, dragging = false, lastX = 0, lastY = 0;
      function render() { renderer.render(scene, camera); }
      function onMove(clientX, clientY) {
        var r = container.getBoundingClientRect();
        var nx = (clientX - r.left) / Math.max(r.width, 1) - 0.5;
        var ny = (clientY - r.top) / Math.max(r.height, 1) - 0.5;
        targetY += 0; // drag handled below; hover tilt is additive via hover vars
        hoverY = nx * 0.18; hoverX = -ny * 0.14;
        if (!reduced) render();
      }
      var hoverY = 0, hoverX = 0;
      container.addEventListener('pointerdown', function (e) {
        dragging = true; lastX = e.clientX; lastY = e.clientY;
        container.setPointerCapture && e.pointerId !== undefined && container.setPointerCapture(e.pointerId);
      });
      container.addEventListener('pointermove', function (e) {
        if (dragging) {
          targetY += (e.clientX - lastX) * 0.008;
          targetX = Math.max(-0.7, Math.min(0.7, targetX + (e.clientY - lastY) * 0.006));
          lastX = e.clientX; lastY = e.clientY;
          if (reduced) render();
        } else { onMove(e.clientX, e.clientY); }
      });
      function endDrag(e) {
        dragging = false;
        try { container.releasePointerCapture && e.pointerId !== undefined && container.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
      container.addEventListener('pointerup', endDrag);
      container.addEventListener('pointercancel', endDrag);
      // Touch drag works via Pointer Events above; also allow mouse hover tilt.
      container.addEventListener('mouseleave', function () { hoverY = 0; hoverX = 0; });

      var visible = true, raf = null, start = performance.now();
      function loop(now) {
        raf = null;
        if (!visible) return;
        var t = (now - start) / 1000;
        curY += (targetY + hoverY - curY) * 0.08;
        curX += (targetX + hoverX - curX) * 0.08;
        eye.rotation.y = curY + (reduced ? 0 : Math.sin(t * 0.5) * 0.06);
        eye.rotation.x = curX;
        eye.position.y = reduced ? 0 : Math.sin(t * 0.8) * 0.06;
        particles.rotation.y = t * 0.03;
        render();
        if (!reduced) raf = requestAnimationFrame(loop);
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          if (visible && !reduced && !raf) raf = requestAnimationFrame(loop);
        }).observe(container);
      }
      render();
      if (!reduced) raf = requestAnimationFrame(loop);
    } catch (e) { showFallback('init-error'); }
  }
  window.ClearVisionHero3D = { init: init, showFallback: showFallback, getStatus: function () { return status; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
