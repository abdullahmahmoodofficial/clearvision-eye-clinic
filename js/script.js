(function(){'use strict';var WA='923001234567';
var hb=document.getElementById('hamburger'),nav=document.getElementById('nav');
if(hb&&nav){hb.addEventListener('click',function(){nav.classList.toggle('open');});}
/* Scroll reveal with stagger (via --d) */
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:.12});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});}
else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible');});}
/* Animated counters */
document.querySelectorAll('[data-count]').forEach(function(el){var t=parseFloat(el.getAttribute('data-count')),dec=parseInt(el.getAttribute('data-decimals')||'0',10),suf=el.getAttribute('data-suffix')||'',st=null;function step(ts){if(!st)st=ts;var p=Math.min((ts-st)/1800,1);var v=t*p;el.textContent=(dec?v.toFixed(dec):Math.round(v).toLocaleString('en-PK'))+suf;if(p<1)requestAnimationFrame(step);}function start(){requestAnimationFrame(step);}if('IntersectionObserver' in window){var o2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){start();o2.disconnect();}});});o2.observe(el);}else{start();}});
/* FAQ accordion */
document.querySelectorAll('.faq-item button').forEach(function(b){b.addEventListener('click',function(){b.parentElement.classList.toggle('open');});});
/* Testimonial slider: auto-rotate + dots + arrows */
var slides=document.querySelectorAll('.slide');
if(slides.length){var cur=0,dots=document.querySelectorAll('.dots-row button'),timer=null;
 function show(i){cur=(i+slides.length)%slides.length;slides.forEach(function(s,j){s.classList.toggle('on',j===cur);});dots.forEach(function(d,j){d.classList.toggle('on',j===cur);});}
 function auto(){clearInterval(timer);timer=setInterval(function(){show(cur+1);},6000);}
 var pv=document.getElementById('prevBtn'),nx=document.getElementById('nextBtn');
 if(pv)pv.addEventListener('click',function(){show(cur-1);auto();});
 if(nx)nx.addEventListener('click',function(){show(cur+1);auto();});
 dots.forEach(function(d,j){d.addEventListener('click',function(){show(j);auto();});});
 var sl=document.getElementById('slider');
 if(sl){sl.addEventListener('mouseenter',function(){clearInterval(timer);});sl.addEventListener('mouseleave',auto);}
 show(0);auto();}
/* 3D tilt-on-hover (fine pointers only; disabled under reduced motion) */
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&window.matchMedia('(pointer: fine)').matches){
 document.querySelectorAll('.card,.gallery-grid figure,.step').forEach(function(card){
  card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.classList.add('tilted');card.style.transform='perspective(900px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg) translateY(-4px)';});
  card.addEventListener('mouseleave',function(){card.classList.remove('tilted');card.style.transform='';});
 });
 /* Hero parallax layers */
 var heroPanel=document.getElementById('heroVisual');
 if(heroPanel){heroPanel.addEventListener('mousemove',function(e){var r=heroPanel.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroPanel.querySelectorAll('[data-depth]').forEach(function(layer){var d=parseFloat(layer.getAttribute('data-depth'));layer.style.transform='translate('+(x*d)+'px,'+(y*d)+'px)';});});
 heroPanel.addEventListener('mouseleave',function(){heroPanel.querySelectorAll('[data-depth]').forEach(function(layer){layer.style.transform='';});});}
}
/* Appointment form: validate, then WhatsApp pre-filled; ?t= / ?d= pre-select */
var f=document.getElementById('bookForm');
if(f){var q=new URLSearchParams(location.search);
 var ts=document.getElementById('fTreatment'),ds=document.getElementById('fDoctor');
 if(q.get('t')&&ts)ts.value=q.get('t'); if(q.get('d')&&ds)ds.value=q.get('d');
 f.addEventListener('submit',function(e){e.preventDefault();var ok=true;
  ['fName','fPhone','fTreatment','fDate'].forEach(function(id){var el=document.getElementById(id),er=document.getElementById(id+'Err');var bad=!el.value.trim()||(id==='fPhone'&&el.value.replace(/\D/g,'').length<10);if(er)er.style.display=bad?'block':'none';if(bad)ok=false;});
  if(!ok)return;
  var msg='Assalam-o-Alaikum! I want to book an eye appointment.%0AName: '+encodeURIComponent(document.getElementById('fName').value)+'%0APhone: '+encodeURIComponent(document.getElementById('fPhone').value)+'%0AService: '+encodeURIComponent(ts.options[ts.selectedIndex].text)+'%0ADoctor: '+encodeURIComponent(ds.options[ds.selectedIndex].text)+'%0ADate: '+encodeURIComponent(document.getElementById('fDate').value)+'%0ANotes: '+encodeURIComponent(document.getElementById('fNotes').value);
  document.getElementById('formOk').textContent='Opening WhatsApp with your booking details…';
  window.open('https://wa.me/'+WA+'?text='+msg,'_blank');});}
})();
