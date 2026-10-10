/* ============================================================
   Interactive visuals for the Fibonacci post.
   Every <figure data-fib-viz="tree|dp|pow|doubling"> emitted by
   the fib-viz shortcode is initialised on load. Container, label,
   state bar and controls reuse the .tx-anim styles (ACID post).
   ============================================================ */
(function(){
'use strict';

function h(tag,cls,txt){
  var e=document.createElement(tag);
  if(cls)e.className=cls;
  if(txt!=null)e.textContent=txt;
  return e;
}

function s(tag,attrs){
  var e=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(var k in attrs)e.setAttribute(k,attrs[k]);
  return e;
}

function fmt(x){return x.toLocaleString('en-US')}

/* x^k as HTML (k is always a number we computed) */
function pw(k){return 'x<sup>'+k+'</sup>'}

function label(root,text){
  var l=h('div','tx-anim__label');
  l.innerHTML='<span class="tx-anim__label-dot"></span> '+text;
  root.appendChild(l);
}

/* State bar: [{key, val}] → {key: valueSpan} */
function stateBar(root,keys){
  var bar=h('div','tx-anim__db'), out={};
  keys.forEach(function(k){
    var cell=h('span','tx-anim__db-cell');
    cell.appendChild(h('span','tx-anim__db-key',k+': '));
    out[k]=cell.appendChild(h('span','tx-anim__db-val'));
    bar.appendChild(cell);
  });
  root.appendChild(bar);
  return out;
}

function setVal(el,v){
  if(el.innerHTML===String(v))return;
  el.innerHTML=v;
  el.classList.remove('tx-anim__db-val--flash');
  void el.offsetWidth;
  el.classList.add('tx-anim__db-val--flash');
}

function numberInput(min,max,val){
  var i=h('input','fib-viz__input');
  i.type='number';i.min=min;i.max=max;i.value=val;i.inputMode='numeric';
  return i;
}

function readInput(i,min,max,fallback){
  var v=parseInt(i.value,10);
  if(isNaN(v))v=fallback;
  v=Math.max(min,Math.min(max,v));
  i.value=v;
  return v;
}

/* Reset / progress / Next / Play — render(step) must be idempotent */
function stepper(root,total,render){
  var cur=0,tmr=null;
  var ctrl=h('div','tx-anim__controls');
  var rb=h('button','tx-anim__btn','↺');rb.type='button';rb.title='Reset';
  var pg=h('span','tx-anim__progress');
  var nb=h('button','tx-anim__btn tx-anim__btn--next','Next →');nb.type='button';
  var pb=h('button','tx-anim__btn','▶ Play');pb.type='button';
  ctrl.appendChild(rb);ctrl.appendChild(pg);ctrl.appendChild(nb);ctrl.appendChild(pb);
  root.appendChild(ctrl);

  function stop(){
    if(tmr){clearInterval(tmr);tmr=null}
    pb.textContent='▶ Play';
  }
  function show(){
    render(cur);
    pg.textContent='Step '+cur+' / '+total;
    nb.disabled=pb.disabled=cur>=total;
    if(cur>=total)stop();
  }
  function next(){if(cur<total){cur++;show()}}

  rb.addEventListener('click',function(){stop();cur=0;show()});
  nb.addEventListener('click',next);
  pb.addEventListener('click',function(){
    if(tmr){stop();return}
    pb.textContent='⏸ Pause';
    next();
    tmr=setInterval(next,1100);
  });
  show();
  return {restart:function(t){stop();total=t;cur=0;show()}};
}

/* ============================================================
   1. Recursion tree — naive vs memoized
   ============================================================ */
var HUES=[200,145,35,280,340,175,55,0];  /* one hue per k ≥ 2; base cases stay neutral */

function buildTree(n,memo){
  var seen={},calls=0;
  function rec(k){
    var node={k:k,kids:[],hit:false};
    calls++;
    if(k>=2){
      if(memo&&seen[k])node.hit=true;
      else{node.kids=[rec(k-1),rec(k-2)];seen[k]=true}
    }
    return node;
  }
  var t=rec(n);
  t.calls=calls;
  return t;
}

function fibNum(n){var a=0,b=1;for(var i=0;i<n;i++){var t=a+b;a=b;b=t}return a}

function initTree(root){
  var MIN=2,MAX=7,BIG=40;
  var n=Math.max(MIN,Math.min(MAX,+root.dataset.n||6)),memo=false;
  label(root,'Interactive · call tree');

  var st=stateBar(root,['fib(n) calls','at n = '+BIG]);

  var canvas=h('div','fib-tree__canvas');
  root.appendChild(canvas);
  var info=h('div','fib-viz__note');
  root.appendChild(info);

  var ctrl=h('div','tx-anim__controls');
  var lab=h('label','fib-viz__field');
  lab.appendChild(h('span',null,'n ='));
  var range=h('input','fib-viz__range');
  range.type='range';range.min=MIN;range.max=MAX;range.value=n;
  var rv=h('span','fib-viz__range-val',String(n));
  lab.appendChild(range);lab.appendChild(rv);
  var mb=h('button','tx-anim__btn tx-anim__btn--next','Memoize: off');mb.type='button';
  mb.setAttribute('aria-pressed','false');
  ctrl.appendChild(lab);ctrl.appendChild(h('span','tx-anim__progress'));ctrl.appendChild(mb);
  root.appendChild(ctrl);

  var hint='Same colour = same input. Hover or tap a call to highlight its duplicates.';

  function focus(k,nodes){
    var computed=0,hits=0;
    nodes.forEach(function(nd){
      var match=nd.k===k;
      nd.el.classList.toggle('is-match',match);
      if(match){if(nd.hit)hits++;else computed++}
    });
    canvas.classList.add('is-focus');
    var msg='fib('+k+') is computed '+computed+(computed===1?' time':' times');
    if(hits)msg+=', and answered from memo[] '+hits+(hits===1?' time':' times');
    info.textContent=msg+'.';
  }

  function blur(){
    canvas.classList.remove('is-focus');
    info.textContent=hint;
  }

  function draw(){
    var t=buildTree(n,memo),nodes=[],slot=0,depth=0;
    (function walk(nd,d){
      nd.d=d;if(d>depth)depth=d;nodes.push(nd);
      if(!nd.kids.length)nd.x=slot++;
      else{
        nd.kids.forEach(function(c){walk(c,d+1)});
        nd.x=(nd.kids[0].x+nd.kids[nd.kids.length-1].x)/2;
      }
    })(t,0);

    var DX=36,DY=50,R=14,P=R+6;
    var W=(slot-1)*DX+2*P,H=depth*DY+2*P;
    var g=s('svg',{width:W,height:H,viewBox:'0 0 '+W+' '+H,role:'img',
      'aria-label':'Call tree of fib('+n+') with '+t.calls+' calls'});
    function px(nd){return P+nd.x*DX}
    function py(nd){return P+nd.d*DY}

    nodes.forEach(function(nd){
      nd.kids.forEach(function(c){
        g.appendChild(s('line',{x1:px(nd),y1:py(nd),x2:px(c),y2:py(c),
          'class':'fib-tree__edge'+(c.hit?' fib-tree__edge--hit':'')}));
      });
    });
    nodes.forEach(function(nd){
      var cls='fib-tree__node'+(nd.k<2?' fib-tree__node--base':'')+(nd.hit?' fib-tree__node--hit':'');
      var el=s('g',{'class':cls,tabindex:0,transform:'translate('+px(nd)+','+py(nd)+')'});
      if(nd.k>=2)el.style.setProperty('--c','hsl('+HUES[(nd.k-2)%HUES.length]+' 70% 55%)');
      el.appendChild(s('circle',{r:R}));
      var tx=s('text',{'text-anchor':'middle',dy:'0.35em'});
      tx.textContent=nd.k;
      el.appendChild(tx);
      var title=s('title',{});
      title.textContent='fib('+nd.k+')'+(nd.hit?' — from memo[]':nd.k<2?' — base case':'');
      el.appendChild(title);
      el.addEventListener('mouseenter',function(){focus(nd.k,nodes)});
      el.addEventListener('focus',function(){focus(nd.k,nodes)});
      el.addEventListener('click',function(){focus(nd.k,nodes)});
      el.addEventListener('mouseleave',blur);
      el.addEventListener('blur',blur);
      nd.el=el;
      g.appendChild(el);
    });

    canvas.innerHTML='';
    canvas.appendChild(g);
    blur();
    if(memo)info.textContent='Dashed calls return straight from memo[] — their whole subtree disappears.';

    setVal(st['fib(n) calls'],fmt(t.calls));
    setVal(st['at n = '+BIG],fmt(memo?2*BIG-1:2*fibNum(BIG+1)-1));
  }

  range.addEventListener('input',function(){n=+range.value;rv.textContent=n;draw()});
  mb.addEventListener('click',function(){
    memo=!memo;
    mb.textContent='Memoize: '+(memo?'on':'off');
    mb.setAttribute('aria-pressed',String(memo));
    draw();
  });
  draw();
}

/* ============================================================
   2. Bottom-up table fill → two variables
   ============================================================ */
function initDp(root){
  var n=Math.max(4,Math.min(16,+root.dataset.n||10));
  var f=[0,1];
  for(var i=2;i<=n;i++)f[i]=f[i-1]+f[i-2];
  label(root,'Interactive · bottom-up dp[]');

  var grid=h('div','fib-dp'),cols=[];
  for(var j=0;j<=n;j++){
    var col=h('div','fib-dp__col');
    col.appendChild(h('span','fib-dp__idx',String(j)));
    var cell=col.appendChild(h('span','fib-dp__cell'));
    var tag=col.appendChild(h('span','fib-dp__tag'));
    grid.appendChild(col);
    cols.push({col:col,cell:cell,tag:tag});
  }
  var wrap=h('div','fib-dp__wrap');
  wrap.appendChild(grid);
  root.appendChild(wrap);
  var note=h('div','fib-viz__note');
  root.appendChild(note);

  /* steps: 1 = allocate, 2 = dp[1] = 1, 3..n+1 = fill dp[2..n], n+2 = collapse to two variables */
  var total=n+2;
  function setAt(i,step){return step>=1&&(i===0||(i===1&&step>=2)||step>=i+1)}

  function render(step){
    var cur=step>=3&&step<=n+1?step-1:-1,last=step===total;
    cols.forEach(function(c,i){
      var set=setAt(i,step);
      c.cell.textContent=step<1?'':set?f[i]:0;
      c.col.className='fib-dp__col'+
        (step>=1&&!set?' is-zero':'')+
        (i===cur?' is-target':'')+
        (cur>=0&&(i===cur-1||i===cur-2)?' is-source':'')+
        (step===2&&i===1?' is-target':'')+
        (last&&i<n-1?' is-faded':'')+
        (last&&i>=n-1?' is-kept':'');
      c.tag.textContent=last&&i===n-1?'prev':last&&i===n?'curr':'';
    });
    if(step===0)note.textContent='Press Next to fill dp[] from the bottom up.';
    else if(step===1)note.textContent='dp[] = [0] * (n+1) — '+(n+1)+' cells reserved up front.';
    else if(step===2)note.textContent='dp[1] = 1';
    else if(!last)note.textContent='dp['+cur+'] = dp['+(cur-1)+'] + dp['+(cur-2)+'] = '+f[cur-1]+' + '+f[cur-2]+' = '+f[cur]+(cur===n?'  →  fib('+n+') = '+f[n]:'');
    else note.textContent='Every step only read the two cells right before it. Keep just those two in variables and the space drops from O(n) to O(1).';
  }
  stepper(root,total,render);
}

/* ============================================================
   3. Binary exponentiation of x^e
   ============================================================ */
function powSteps(e){
  var steps=[],r=0,b=1,m=0,i=0;
  while(e>0){
    if(e&1){
      if(r===0){
        r=b;
        steps.push({bit:i,kind:'take',text:'bit '+i+' = 1 → result = '+pw(b),note:'first set bit, nothing to multiply yet',r:r,b:b,m:m});
      }else{
        m++;
        steps.push({bit:i,kind:'take',text:'bit '+i+' = 1 → result = '+pw(r)+' · '+pw(b)+' = '+pw(r+b),note:'multiply',r:r+b,b:b,m:m});
        r+=b;
      }
    }else{
      steps.push({bit:i,kind:'skip',text:'bit '+i+' = 0 → skip',note:pw(b)+' is not needed',r:r,b:b,m:m});
    }
    e=Math.floor(e/2);i++;
    if(e>0){
      b*=2;m++;
      steps.push({bit:i,kind:'square',text:'square → base = '+pw(b),note:'multiply',r:r,b:b,m:m});
    }
  }
  return steps;
}

function initPow(root){
  var MAX=1000000,e=Math.max(1,Math.min(MAX,+root.dataset.n||13)),steps;
  label(root,'Interactive · binary exponentiation');

  var top=h('div','fib-pow__top');
  var lab=h('label','fib-viz__field');
  lab.appendChild(h('span',null,'compute x^'));
  var inp=numberInput(1,MAX,e);
  lab.appendChild(inp);
  top.appendChild(lab);
  var bits=h('div','fib-pow__bits');
  top.appendChild(bits);
  root.appendChild(top);

  var st=stateBar(root,['result','base','multiplications']);
  var list=h('ol','fib-steps');
  root.appendChild(list);
  var res=h('div','tx-anim__result tx-anim__result--success');
  res.appendChild(h('span','tx-anim__result-icon','✅'));
  var resText=res.appendChild(h('span','tx-anim__result-text'));
  root.appendChild(res);

  var bitEls=[],rows=[];
  function build(){
    steps=powSteps(e);
    var bin=e.toString(2);
    bits.innerHTML='';bitEls=[];
    for(var i=0;i<bin.length;i++){
      var b=bits.appendChild(h('span','fib-pow__bit',bin[i]));
      bitEls.unshift(b);  /* bitEls[k] = bit k, counted from the right */
    }
    list.innerHTML='';rows=[];
    steps.forEach(function(sp,i){
      var li=h('li','fib-steps__item fib-steps__item--'+sp.kind);
      li.appendChild(h('span','tx-anim__num',String(i+1)));
      var body=li.appendChild(h('div','tx-anim__body'));
      var code=body.appendChild(h('code','tx-anim__sql'));
      code.innerHTML=sp.text;
      var nt=body.appendChild(h('span','tx-anim__note'));
      nt.innerHTML=sp.note;
      list.appendChild(li);
      rows.push(li);
    });
    var m=steps[steps.length-1].m;
    resText.innerHTML=pw(e)+' in '+fmt(m)+' multiplication'+(m===1?'':'s')+' instead of '+fmt(e-1)+'.';
  }

  function render(step){
    rows.forEach(function(li,i){
      var show=i<step;
      if(show&&li.hidden)li.classList.remove('is-in');
      li.hidden=!show;
      if(show){void li.offsetWidth;li.classList.add('is-in')}
      li.classList.toggle('is-latest',i===step-1);
    });
    var cur=step>0?steps[step-1]:null;
    bitEls.forEach(function(b,k){
      b.classList.toggle('is-active',!!cur&&k===cur.bit&&cur.kind!=='square');
      b.classList.toggle('is-done',!!cur&&(k<cur.bit||(k===cur.bit&&cur.kind!=='square')));
    });
    setVal(st.result,cur&&cur.r?pw(cur.r):'1');
    setVal(st.base,pw(cur?cur.b:1));
    setVal(st.multiplications,cur?cur.m:0);
    res.hidden=step<steps.length;
    res.classList.toggle('tx-anim__result--visible',step>=steps.length);
  }

  build();
  var ctl=stepper(root,steps.length,render);
  inp.addEventListener('change',function(){
    e=readInput(inp,1,MAX,13);
    build();
    ctl.restart(steps.length);
  });
}

/* ============================================================
   5. Fast doubling — halve down, combine back up
   ============================================================ */
function initDoubling(root){
  var MAX=90,n=Math.max(1,Math.min(MAX,+root.dataset.n||13));
  label(root,'Interactive · fast doubling path');

  var top=h('div','fib-pow__top');
  var lab=h('label','fib-viz__field');
  lab.appendChild(h('span',null,'n ='));
  var inp=numberInput(1,MAX,n);
  lab.appendChild(inp);
  top.appendChild(lab);
  root.appendChild(top);

  var head=h('div','fib-dbl__row fib-dbl__row--head');
  head.appendChild(h('span',null,'↓ halve n'));
  head.appendChild(h('span',null,'rule'));
  head.appendChild(h('span',null,'↑ (fib(n), fib(n+1))'));
  var table=h('div','fib-dbl');
  root.appendChild(table);
  var note=h('div','fib-viz__note');
  root.appendChild(note);

  function draw(){
    var ns=[n];
    while(ns[ns.length-1]>0)ns.push(ns[ns.length-1]>>1);
    /* combine bottom-up; Number is exact up to fib(91) */
    var pairs={0:[0,1]},calc={};
    for(var i=ns.length-2;i>=0;i--){
      var k=ns[i+1],a=pairs[k][0],b=pairs[k][1];
      var c=a*(2*b-a),d=a*a+b*b;
      pairs[ns[i]]=ns[i]&1?[d,c+d]:[c,d];
      calc[ns[i]]='c = '+a+'·(2·'+b+' − '+a+') = '+c+',  d = '+a+'² + '+b+'² = '+d;
    }
    table.innerHTML='';
    table.appendChild(head);
    ns.forEach(function(v,i){
      var row=h('div','fib-dbl__row');
      var nc=row.appendChild(h('span','fib-dbl__n'));
      nc.appendChild(h('strong',null,String(v)));
      if(v>0)nc.appendChild(h('span','fib-dbl__bin',v.toString(2)));
      var rule=row.appendChild(h('span','fib-dbl__rule'));
      if(v===0)rule.appendChild(h('span','fib-dbl__badge fib-dbl__badge--base','base'));
      else{
        rule.appendChild(h('span','fib-dbl__badge fib-dbl__badge--'+(v&1?'odd':'even'),v&1?'odd':'even'));
        rule.appendChild(h('span','fib-dbl__formula',v&1?'(d, c+d)':'(c, d)'));
      }
      var out=row.appendChild(h('span','fib-dbl__pair'));
      out.appendChild(h('strong',null,'('+pairs[v][0]+', '+pairs[v][1]+')'));
      if(calc[v])out.appendChild(h('span','fib-dbl__calc',calc[v]));
      if(i===0)row.classList.add('is-answer');
      table.appendChild(row);
    });
    var bits=ns.slice(0,-1).map(function(v){return v&1}).reverse().join('');
    note.textContent='fib('+n+') = '+pairs[n][0]+' after '+(ns.length-1)+' doubling steps. '+
      'Read the odd/even marks bottom-up and you get '+n+' in binary: '+bits+'.';
  }

  inp.addEventListener('change',function(){n=readInput(inp,1,MAX,13);draw()});
  draw();
}

var INIT={tree:initTree,dp:initDp,pow:initPow,doubling:initDoubling};

function boot(){
  var figs=document.querySelectorAll('[data-fib-viz]');
  for(var i=0;i<figs.length;i++){
    var f=figs[i],fn=INIT[f.dataset.fibViz];
    if(!fn||f.dataset.ready)continue;
    f.dataset.ready='1';
    f.innerHTML='';
    fn(f);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
})();
