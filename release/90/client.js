(function () {
  'use strict';
  const species = {
    cat: { file: 'Cow_Cat', scale: .78, distance: 1.35, side: -1 },
    dog: { file: 'Shiba_Inu', scale: .18, distance: 2.45, side: 1 }
  };
  const storageKey = 'quiet-temple-followers-v1';
  const labels = {
    'zh-CN': ['宠物', '奶牛猫', '柴犬', '放出', '收起', '正在加载', '跟随中', '已收起', '加载失败，请重试'],
    'zh-TW': ['寵物', '乳牛貓', '柴犬', '放出', '收起', '正在載入', '跟隨中', '已收起', '載入失敗，請重試'],
    en: ['Pets', 'Piebald cat', 'Shiba Inu', 'Summon', 'Recall', 'Loading', 'Following', 'Recalled', 'Could not load. Try again.'],
    ja: ['ペット', '白黒猫', '柴犬', '呼ぶ', '戻す', '読み込み中', '同行中', '待機中', '再試行してください'],
    ko: ['반려동물', '얼룩 고양이', '시바견', '부르기', '돌려보내기', '불러오는 중', '따라가는 중', '대기 중', '다시 시도하세요']
  };
  const distance = (a, b) => Math.hypot(a.x-b.x, a.z-b.z);

  const models = new Map();

  function create(T, world, nav, canOccupy, {remote = false} = {}) {
    let saved = [];
    if (!remote) try { saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}
    const savedPet = Array.isArray(saved) ? saved.find(id => Object.hasOwn(species, id)) : null;
    const slots = Object.entries(species).map(([id, spec]) => ({
      id, spec, enabled: savedPet === id,
      actor: null, loading: null, error: false, waiting: 0, action: null
    }));
    const listeners = new Set();
    const trail = [];
    let disposed = false;
    const notify = () => listeners.forEach(fn => fn());
    function remember() {
      if (remote) return;
      try { localStorage.setItem(storageKey, JSON.stringify(slots.filter(s => s.enabled).map(s => s.id))); } catch {}
    }
    function hide(slot) {
      if (!slot.actor) return;
      const wasFollowing = !!slot.actor.anchor.parent;
      slot.actor.anchor.removeFromParent();
      slot.actor.mixer.stopAllAction();
      slot.action = null;
      slot.waiting = 0;
      if (wasFollowing && !disposed) notify();
    }
    function load(slot) {
      if (slot.actor || slot.loading || disposed) return;
      if (!models.has(slot.id)) {
        models.set(slot.id, Promise.resolve().then(() => window.TempleGLB.load('assets/companions/'+slot.spec.file+'.glb.gz'))
          .catch(error => { models.delete(slot.id); throw error; }));
      }
      slot.loading = models.get(slot.id)
        .then(({scene, animations}) => {
          if (disposed) return;
          const model = window.TempleGLTFLoader ? window.TempleGLTFLoader.cloneScene(scene) : scene.clone(true);
          const anchor = new T.Group();
          anchor.name = 'Player pet: '+slot.id;
          model.scale.multiplyScalar(slot.spec.scale);
          model.traverse(node => {
            node.layers.set(1);
            if (node.isMesh) { node.castShadow = false; node.receiveShadow = !remote; }
          });
          anchor.add(model);
          const mixer = new T.AnimationMixer(model);
          const actions = new Map(animations.map(clip => [clip.name, mixer.clipAction(clip)]));
          slot.actor = {anchor, model, mixer, actions};
        }).catch(() => {
          if (disposed || !slot.enabled) return;
          slot.enabled = false;
          slot.error = true;
          remember();
        }).finally(() => { slot.loading = null; if (!disposed) notify(); });
      notify();
    }
    function setActive(id, enabled) {
      const slot = slots.find(item => item.id === id);
      if (!slot || disposed || slot.enabled === enabled) return;
      slot.enabled = enabled;
      slot.error = false;
      if (!enabled) hide(slot);
      else {
        for (const other of slots) {
          if (other === slot || !other.enabled) continue;
          other.enabled = false;
          hide(other);
        }
        load(slot);
      }
      remember();
      notify();
    }
    function play(slot, moving, speed = 0) {
      const action = slot.actor.actions.get(moving ? 'Walk' : 'Idle');
      if (!action) return;
      if (action !== slot.action) {
        slot.action?.fadeOut(.16);
        action.reset().fadeIn(.16).play();
        slot.action = action;
      }
      action.setEffectiveTimeScale(moving ? Math.max(.75, Math.min(2.8, speed/.9)) : 1);
    }
    function clear(slot, point) {
      if (!nav.templeCanStand(point.x, point.z) || !canOccupy(point.x, point.z)) return false;
      return slots.every(other => other === slot || !other.actor?.anchor.parent || distance(other.actor.anchor.position, point) >= .65);
    }
    function place(slot, player, preferred) {
      const {position: origin} = player;
      const yaw = player.rotation.y, c = Math.cos(yaw), s = Math.sin(yaw);
      const candidates = [];
      if (preferred) candidates.push(preferred);
      for (const [side, back] of [[slot.spec.side,1],[-slot.spec.side,1],[slot.spec.side,0],[-slot.spec.side,0],[slot.spec.side,-1]]) {
        candidates.push({x: origin.x+side*c-back*s, z: origin.z-side*s-back*c});
      }
      const point = candidates.find(p => distance(p, origin) >= .8 && distance(p, origin) <= 3.3
        && clear(slot, p) && nav.templeCanTravel(origin.x, origin.z, p.x, p.z));
      if (!point) return;
      const {anchor, model} = slot.actor;
      anchor.position.set(point.x, nav.templeGroundHeight(point.x, point.z), point.z);
      model.rotation.y = yaw;
      slot.waiting = 0;
      world.scene.add(anchor);
      play(slot, false);
      notify();
    }
    function update(dt, player) {
      if (disposed) return;
      if (!slots.some(slot => slot.enabled)) { trail.length = 0; return; }
      const origin = player.position;
      const last = trail.at(-1);
      if (last && distance(last, origin) > 9) {
        trail.length = 0;
        slots.forEach(hide);
      }
      if (!trail.length || distance(trail.at(-1), origin) >= .32) {
        trail.push({x: origin.x, z: origin.z});
        if (trail.length > 45) trail.shift();
      }
      for (const slot of slots) {
        if (!slot.enabled) continue;
        if (!slot.actor) { load(slot); continue; }
        const {anchor, model, mixer} = slot.actor, p = anchor.position;
        let goalIndex = -1, gap = 0, next = origin;
        for (let i = trail.length-1; i >= 0; i--) {
          gap += distance(next, trail[i]);
          if (gap >= slot.spec.distance) { goalIndex = i; break; }
          next = trail[i];
        }
        const target = trail[goalIndex];
        if (!anchor.parent || distance(p, origin) > 13 || slot.waiting > 3) {
          hide(slot);
          place(slot, player, target);
          continue;
        }
        // If a corner blocks the direct route, trace the player's prior steps around it.
        let waypoint = target;
        const reachable = point => point && nav.templeCanTravel(p.x, p.z, point.x, point.z);
        if (!reachable(waypoint)) {
          waypoint = null;
          for (let i = goalIndex-1; i >= 0; i--) {
            if (distance(p, trail[i]) > .3 && reachable(trail[i])) { waypoint = trail[i]; break; }
          }
        }
        let moved = false, speed = 0;
        if (waypoint) {
          const remaining = distance(p, waypoint);
          if (remaining > .20) {
            speed = Math.min(5.7, 1.6+Math.max(0, distance(p, origin)-1.4)*1.8);
            const ratio = Math.min(1, speed*dt/remaining);
            const step = {x: p.x+(waypoint.x-p.x)*ratio, z: p.z+(waypoint.z-p.z)*ratio};
            if (distance(step, origin) >= .68 && clear(slot, step)) {
              const yaw = Math.atan2(step.x-p.x, step.z-p.z);
              const turn = yaw-model.rotation.y;
              model.rotation.y += Math.atan2(Math.sin(turn), Math.cos(turn))*Math.min(1, dt*10);
              if (!remote) world.landscape?.trackAnimal?.(anchor,slot.id,p.x,p.z,step.x,step.z);
              p.set(step.x, nav.templeGroundHeight(step.x, step.z), step.z);
              moved = ratio > 0;
            }
          }
        }
        slot.waiting = !moved && distance(p, origin)>3.5 ? slot.waiting+dt : 0;
        play(slot, moved, speed);
        mixer.update(dt);
      }
    }
    function status() {
      return slots.map(slot => ({
        id: slot.id, enabled: slot.enabled, error: slot.error,
        loading: !!slot.loading, following: !!slot.actor?.anchor.parent,
        position: slot.actor?.anchor.parent ? slot.actor.anchor.position.toArray() : null
      }));
    }
    function dispose() {
      disposed = true;
      slots.forEach(hide);
      for (const slot of slots) if (slot.actor) {
        const {model,mixer} = slot.actor;
        mixer.uncacheRoot(model);
        model.traverse(node => { if (node.isSkinnedMesh) node.skeleton.dispose(); });
      }
      listeners.clear();
    }
    return {setActive, update, status, dispose,
      get activeId() { return slots.find(slot => slot.enabled)?.id || ''; },
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
    };
  }

  function mountControls(pets, top) {
    const container = document.createElement('div');
    container.className = 'pet-controls';
    const toggle = document.createElement('button');
    toggle.id = 'pet-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', 'pet-panel');
    const panel = document.createElement('section');
    panel.id = 'pet-panel';
    const title = document.createElement('strong');
    panel.append(title);
    container.append(toggle, panel);
    top.append(container);
    const rows = ['cat', 'dog'].map(id => {
      const row = document.createElement('div');
      row.className = 'pet-row';
      const description = document.createElement('div');
      const name = document.createElement('span');
      const state = document.createElement('small');
      state.setAttribute('aria-live', 'polite');
      const button = document.createElement('button');
      button.type = 'button';
      button.addEventListener('click', () => pets.setActive(id, !pets.status().find(slot => slot.id === id).enabled));
      description.append(name, state);
      row.append(description, button);
      panel.append(row);
      return {name, state, button};
    });
    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        document.exitPointerLock?.();
        document.dispatchEvent(new CustomEvent('temple-ui-open', {detail:'pets'}));
      }
    }
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    container.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); event.preventDefault(); }
      event.stopPropagation();
    });
    document.addEventListener('pointerdown', event => { if (!container.contains(event.target)) setOpen(false); });
    document.addEventListener('temple-ui-open', event => { if (event.detail === 'weather') setOpen(false); });
    document.addEventListener('temple-hud-hidden', () => setOpen(false));
    function render() {
      const names = labels[window.TempleI18n?.locale] || labels['zh-CN'];
      toggle.textContent = names[0];
      panel.setAttribute('aria-label', names[0]);
      title.textContent = names[0];
      pets.status().forEach((slot, i) => {
        const row = rows[i], name = names[i+1];
        row.name.textContent = name;
        row.state.textContent = names[slot.error ? 8 : slot.enabled ? slot.loading || !slot.following ? 5 : 6 : 7];
        row.button.textContent = names[slot.enabled ? 4 : 3];
        row.button.setAttribute('aria-label', name+' · '+row.button.textContent);
        row.button.setAttribute('aria-pressed', String(slot.enabled));
      });
    }
    pets.subscribe(render);
    window.TempleI18n?.onChange(render);
    setOpen(false);
    render();
  }
  window.TemplePets = {create, mountControls};
})();
;
/* Daily invitations and the library novice's fortune sticks. */
(function () {
  const invitations = {
    'zh-CN': ['随我听一声木鱼，等余音散了再走。','今天去海边吧。看一道白浪，从出现到消散。','藏经阁里挑一句喜欢的话，坐一会儿再走。','岛上的猫醒了。走近些，让它先看看你。','去花田走一圈，找一朵朝着光的花。','进茶室坐坐，给自己留一盏茶的工夫。','抬头看看殿里的圆纹，从中心慢慢看到最外圈。'],
    'zh-TW': ['隨我聽一聲木魚，等餘音散了再走。','今天去海邊吧。看一道白浪，從出現到消散。','藏經閣裡挑一句喜歡的話，坐一會兒再走。','島上的貓醒了。走近些，讓牠先看看你。','去花田走一圈，找一朵朝著光的花。','進茶室坐坐，給自己留一盞茶的工夫。','抬頭看看殿裡的圓紋，從中心慢慢看到最外圈。'],
    en: ['Listen to the woodfish until the last note fades.','At the shore, follow one white wave until it disappears.','Choose a line in the scripture hall and sit with it awhile.','The cat is awake. Come close and let it look at you.','Walk the flower path and find a bloom facing the light.','Take a seat in the tea room. Stay for a cup.','Trace a circle on the temple wall, from its heart to its edge.'],
    ja: ['木魚の余韻が消えるまで、耳を澄ませましょう。','浜辺で、白い波が消えるまで見届けましょう。','経蔵で好きな一節を選んで、少し座ってみましょう。','猫が目を覚ましました。そっと近づいてみましょう。','花畑で、光のほうを向いた花を探してみましょう。','茶室で、お茶一杯ぶんの時間を過ごしましょう。','堂内の壁の円を、中心から外側へ目でたどってみましょう。'],
    ko: ['목탁 소리가 잦아들 때까지 귀를 기울여 보세요.','바닷가에서 흰 파도 하나가 사라질 때까지 바라보세요.','경전에서 마음에 드는 한 구절을 골라 잠시 앉아 보세요.','고양이가 깨어났어요. 살며시 다가가 눈을 맞춰 보세요.','꽃길에서 빛을 향해 핀 꽃 한 송이를 찾아보세요.','다실에 앉아 차 한 잔의 여유를 누려 보세요.','법당 벽의 원을 가운데부터 가장자리까지 눈으로 따라가 보세요.']
  };
  const fortunes={
    'zh-CN':{
      title:'求签 · 解签',hint:'从小和尚手中的签筒抽一支签，听他解签。',draw:'抽一支签',close:'合上签册',number:n=>'第 '+n+' 签',
      slips:[
        ['浮云暂遮月，稍候见清光','心里还乱时，给自己一点时间。先做一件小事，等心静下来再决定。'],
        ['春水绕山行，自有入海时','遇到难走的路，可以换个方向。今天先试一步，看看哪里走得通。'],
        ['一灯分千火，光色两相明','若有人与你同路，不妨分一点力气给他。若你累了，也可以开口请人帮忙。'],
        ['竹影疏窗动，茶香一盏长','留一盏茶的工夫给自己。听听窗外的声音，把今天走过的路想一想。']
      ]
    },
    'zh-TW':{
      title:'求籤 · 解籤',hint:'從小和尚手中的籤筒抽一支籤，聽他解籤。',draw:'抽一支籤',close:'闔上籤冊',number:n=>'第 '+n+' 籤',
      slips:[
        ['浮雲暫遮月，稍候見清光','心裡還亂時，給自己一點時間。先做一件小事，等心靜下來再決定。'],
        ['春水繞山行，自有入海時','遇到難走的路，可以換個方向。今天先試一步，看看哪裡走得通。'],
        ['一燈分千火，光色兩相明','若有人與你同路，不妨分一點力氣給他。若你累了，也可以開口請人幫忙。'],
        ['竹影疏窗動，茶香一盞長','留一盞茶的工夫給自己。聽聽窗外的聲音，把今天走過的路想一想。']
      ]
    },
    en:{
      title:'Fortune sticks',hint:'Draw a bamboo slip and hear the novice’s reading.',draw:'Draw a slip',close:'Close',number:n=>'Slip '+n,
      slips:[
        ['A passing cloud hides the moon. Wait for the clear light.','Give yourself a little time. Do one small thing, then decide when your mind settles.'],
        ['Spring water winds through the hills and finds the sea.','If the path gets difficult, try a different direction. Take one step and see where it leads.'],
        ['One lamp lights a thousand flames. Each burns just as bright.','If someone is walking beside you, share the work. If you are tired, ask for a hand.'],
        ['Bamboo shadows cross the lattice. The scent of tea lingers.','Set aside the time it takes to drink a cup of tea. Listen to the world outside and think back over your day.']
      ]
    },
    ja:{
      title:'おみくじ',hint:'小僧の筒から一本引いて、ことばに耳を傾けましょう。',draw:'おみくじを引く',close:'閉じる',number:n=>'第 '+n+' 番',
      slips:[
        ['流れる雲が月を隠す。やがて澄んだ光が差す。','気持ちが落ち着くまで、小さなことを一つだけ。決めるのはそのあとでも大丈夫です。'],
        ['春の水は山を巡り、やがて海にたどり着く。','道が険しければ、別の方角へ。まず一歩、歩いてみましょう。'],
        ['一つの灯から千の灯へ。光はどれも明るい。','道連れには手を貸しましょう。疲れたときは、あなたも手を借りていいのです。'],
        ['格子窓に竹の影。お茶の香りが残る。','お茶一杯の時間を自分に。外の音を聴いて、今日をゆっくり振り返りましょう。']
      ]
    },
    ko:{
      title:'운세 풀이',hint:'동자승의 통에서 대나무 제비를 뽑고 이야기를 들어보세요.',draw:'제비 뽑기',close:'닫기',number:n=>n+'번 제비',
      slips:[
        ['구름이 잠시 달을 가려도, 곧 맑은 빛이 비친다.','마음이 복잡할 때에는 작은 일 하나부터 해보세요. 마음이 가라앉으면 그때 결정하세요.'],
        ['봄물이 산을 돌아 마침내 바다에 이른다.','길이 험하면 방향을 바꿔 보세요. 한 걸음 내딛고 어디로 이어지는지 살펴보세요.'],
        ['등불 하나가 천 개의 불을 밝힌다. 빛은 저마다 환하다.','함께 걷는 사람에게 손을 내밀어 주세요. 지칠 때에는 도움을 청해도 좋습니다.'],
        ['창살에 대나무 그림자가 일렁이고, 차 향이 오래 남는다.','차 한 잔만큼의 시간을 스스로에게 주세요. 바깥 소리에 귀 기울이며 하루를 돌아보세요.']
      ]
    }
  };
  const wording=()=>fortunes[window.TempleI18n?.locale]??fortunes.en;

  function makeFortuneTube(T){
    const tube=new T.Group();
    tube.name='Bamboo fortune-stick tube';
    const lacquer=new T.MeshStandardMaterial({color:0x843b23,roughness:.52});
    const brass=new T.MeshStandardMaterial({color:0xd0a35a,roughness:.36,metalness:.4});
    const inner=new T.MeshStandardMaterial({color:0x3d2718,roughness:.8,side:T.DoubleSide});
    const bamboo=new T.MeshStandardMaterial({color:0xe0bf70,roughness:.75});
    const vermilion=new T.MeshStandardMaterial({color:0xa33926,roughness:.58});
    const place=(geometry,material,y,parent=tube)=>{
      const mesh=new T.Mesh(geometry,material);
      mesh.position.y=y;parent.add(mesh);return mesh;
    };
    place(new T.CylinderGeometry(.052,.047,.166,20,1,true),lacquer,0);
    place(new T.CylinderGeometry(.047,.044,.16,20,1,true),inner,0);
    place(new T.CylinderGeometry(.047,.047,.014,20),lacquer,-.078);
    const rim=new T.TorusGeometry(.048,.0044,7,24);
    for(const y of [-.069,.079])place(rim,brass,y).rotation.x=Math.PI/2;
    const stickShape=new T.BoxGeometry(.008,.133,.005);
    const tipShape=new T.BoxGeometry(.008,.032,.005);
    const sticks=Array.from({length:7},(_,index)=>{
      const stick=new T.Group(),angle=index*Math.PI*2/7;
      stick.position.set(Math.cos(angle)*.029,.065+index%3*.007,Math.sin(angle)*.029);
      stick.rotation.set(Math.sin(angle)*.14,angle,-Math.cos(angle)*.14);
      place(stickShape,bamboo,0,stick);place(tipShape,vermilion,.05,stick);
      tube.add(stick);return stick;
    });
    return {tube,sticks};
  }

  window.TempleGuide = {
    create(T, world, groundHeight, notice) {
      const {templeSceneLayout,templeIndoorArea}=window.TempleNavigation;
      const {x,z,room,yaw}=templeSceneLayout.props.fortuneGuide;
      let model, mixer, idle, bow, loading = false, nextAttempt = 0;
      let accumulated = 0, greeted = false, animationClock = 0, readyToBow = true;
      let hand, fortuneTube, dialog, drawn=-1, lifted=0;
      const guideEye = new T.Vector3(), palm = new T.Vector3();
      function inRoom(position){return templeIndoorArea(position.x,position.z)===room;}
      function near(position){return !!fortuneTube&&Math.hypot(position.x-x,position.z-z)<2.65&&inRoom(position);}
      function clearDraw(){
        if(drawn<0)return;
        fortuneTube.sticks[drawn].position.y-=lifted;
        drawn=-1;lifted=0;
      }
      function open(position){
        if(!near(position)||dialog?.open)return false;
        if(!dialog){
          dialog=document.createElement('dialog');
          dialog.id='fortune-dialog';
          dialog.setAttribute('aria-labelledby','fortune-title');
          dialog.innerHTML='<h2 id="fortune-title"></h2><p class="fortune-hint"></p><div class="fortune-slip" aria-live="polite"><span></span><strong></strong><p></p></div><div class="fortune-buttons"><button type="button" class="fortune-draw"></button><button type="button" class="fortune-close"></button></div>';
          const draw=dialog.querySelector('.fortune-draw'),close=dialog.querySelector('.fortune-close'),slip=dialog.querySelector('.fortune-slip');
          draw.addEventListener('click',()=>{
            const text=wording(),index=Math.floor(Math.random()*text.slips.length),[verse,reading]=text.slips[index];
            drawn=index;slip.children[0].textContent=text.number(index+1);
            slip.children[1].textContent=verse;slip.children[2].textContent=reading;
            close.focus();draw.hidden=true;
          });
          close.addEventListener('click',()=>dialog.close());
          dialog.addEventListener('close',clearDraw);
          document.body.appendChild(dialog);
        }
        clearDraw();
        const text=wording();
        dialog.querySelector('h2').textContent=text.title;
        dialog.querySelector('.fortune-hint').textContent=text.hint;
        for(const line of dialog.querySelector('.fortune-slip').children)line.textContent='';
        const draw=dialog.querySelector('.fortune-draw');
        draw.hidden=false;draw.textContent=text.draw;
        dialog.querySelector('.fortune-close').textContent=text.close;
        model.rotation.y=Math.atan2(position.x-x,position.z-z);
        document.dispatchEvent(new CustomEvent('temple-ui-open',{detail:'fortune'}));
        dialog.showModal();draw.focus();return true;
      }
      function placeTube(dt){
        if(!hand)return;
        hand.getWorldPosition(palm);
        model.worldToLocal(palm);
        fortuneTube.tube.position.copy(palm);
        fortuneTube.tube.position.x-=.021;
        fortuneTube.tube.position.z+=.058;
        if(drawn>=0){
          const rise=Math.min(.043-lifted,dt*.14);
          fortuneTube.sticks[drawn].position.y+=rise;lifted+=rise;
        }
      }
      async function load() {
        loading = true;
        try {
          const asset = await window.TempleGLB.load('assets/monk-guide.glb');
          model = asset.scene;
          model.name = 'Fortune novice in the Scripture library';
          model.scale.setScalar(1.28);
          model.position.set(x, groundHeight(x,z), z);
          model.rotation.y = yaw;
          world.scene.add(model);
          hand=model.getObjectByName('Hand_R');
          if(hand){
            fortuneTube=makeFortuneTube(T);
            model.add(fortuneTube.tube);
            placeTube(0);
          }
          mixer = new T.AnimationMixer(model);
          const clip = name => asset.animations.find(action => action.name === name);
          idle = mixer.clipAction(clip('Idle_Breathing_Loop'));
          const bowClip = clip('Respectful_Bow').clone();
          // The scan faces +Z. Its two spinal keys pitch backward, while the
          // head already nods forward. Reverse just the spine's sagittal pitch.
          for(const track of bowClip.tracks){
            if(track.name==='Spine_01.quaternion'||track.name==='Spine_02.quaternion'){
              for(let i=0;i<track.values.length;i+=4)track.values[i]*=-1;
            }
          }
          bow = mixer.clipAction(bowClip).setLoop(T.LoopRepeat,3);
          mixer.addEventListener('finished', e => { if(e.action === bow) idle.reset().play(); });
          idle.play();
        } catch (error) {
          if(model)world.scene.remove(model);
          model = null; hand=null; fortuneTube=null; nextAttempt = performance.now() + 30000;
          console.warn('Temple guide:', error.message);
        } finally { loading = false; }
      }
      return {near,open,label:()=>wording().title,get isOpen(){return !!dialog?.open;}, update(dt, position, clock, allowGreeting, camera) {
        const dx=position.x-x, dz=position.z-z, d2=dx*dx+dz*dz;
        if(!model) {
          if(clock>2 && d2<22*22 && !loading && performance.now()>=nextAttempt && window.TempleGLB)load();
          return;
        }
        if(d2>=12*12)readyToBow=true;
        model.visible=d2<50*50;
        if(!model.visible)return;
        const canGreet=allowGreeting&&inRoom(position);
        if(readyToBow && d2<=7.5*7.5 && canGreet && !bow.isRunning()){
          guideEye.set(x,model.position.y+1.2,z);
          if(camera)guideEye.project(camera);
          if(!camera||(Math.abs(guideEye.x)<.95 && Math.abs(guideEye.y)<.95 && guideEye.z>=-1 && guideEye.z<=1)){
            readyToBow=false;
            if(d2>.04)model.rotation.y=Math.atan2(dx,dz);
            idle.stop();bow.reset().play();
          }
        }
        accumulated+=dt;
        if(accumulated>=(d2<100?1/30:1/12)){mixer.update(accumulated);placeTube(accumulated);accumulated=0;}
        if(d2<2.8*2.8 && canGreet && !greeted && clock>animationClock) {
          greeted=true; animationClock=clock+15;
          if(!bow.isRunning())model.rotation.y=Math.atan2(dx,dz);
          const messages=invitations[window.TempleI18n?.locale]||invitations.en;
          notice(messages[new Date().getDay()],5);
        }
        if(d2>6*6)greeted=false;
      }};
    }
  };
})();
;
/* Small, deterministic runtime budgets. Assets and game state stay unchanged. */
(function(){
 'use strict';
 const levels=Object.freeze([
  Object.freeze({name:'high',shadows:true,effects:1,scale:1}),
  Object.freeze({name:'balanced',shadows:true,effects:.7,scale:.85}),
  Object.freeze({name:'low',shadows:false,effects:.45,scale:.65})
 ]);
 function createBudget({coarse=false,memory=0,cores=0}={}){
  let level=(memory>0&&memory<=4)||(cores>0&&cores<=4)?2:coarse?1:0;
  let slow=0,nextChange=0;
  return {get level(){return level;},get settings(){return levels[level];},
   sample(fps,now,active=true){
    if(!active||!Number.isFinite(fps)||fps<=0){slow=0;return false;}
    slow=fps<40?slow+1:0;
    if(slow<2||level===2||now<nextChange)return false;
    level++;slow=0;nextChange=now+5000;return true;
   }
  };
 }
 function direction(x,y){const length=Math.hypot(x,y);return length>1e-5?{x:x/length,y:y/length,moving:true}:{x:0,y:0,moving:false};}
 function poseInterval(distanceSquared){return distanceSquared<18*18?0:distanceSquared<35*35?50:distanceSquared<55*55?100:200;}
 const actions={
  'zh-CN':{idle:'静候',walk:'行走',run:'奔跑',jump:'跳跃',sit:'打坐',lie:'仰躺',greet:'合十',pray:'礼拜',read:'读经',tea:'喝茶',woodfish:'木鱼',incense:'上香'},
  'zh-TW':{idle:'靜候',walk:'行走',run:'奔跑',jump:'跳躍',sit:'打坐',lie:'仰躺',greet:'合十',pray:'禮拜',read:'讀經',tea:'喝茶',woodfish:'木魚',incense:'上香'},
  en:{idle:'Idle',walk:'Walking',run:'Running',jump:'Jumping',sit:'Seated',lie:'Resting',greet:'Greeting',pray:'Bowing',read:'Reading',tea:'Tea',woodfish:'Woodfish',incense:'Incense'},
  ja:{idle:'待機',walk:'歩行',run:'走行',jump:'ジャンプ',sit:'座禅',lie:'仰向け',greet:'合掌',pray:'礼拝',read:'読経',tea:'お茶',woodfish:'木魚',incense:'焼香'},
  ko:{idle:'대기',walk:'걷기',run:'달리기',jump:'점프',sit:'참선',lie:'눕기',greet:'합장',pray:'절하기',read:'독경',tea:'차',woodfish:'목탁',incense:'분향'}
 };
 function playerLabel(name,action,distance,locale='zh-CN'){
  const table=actions[locale]||actions.en,unit=locale==='zh-CN'||locale==='zh-TW'?'米':'m';
  return name+' · '+(table[action]||table.idle)+' · '+Math.round(Math.max(0,distance))+unit;
 }
 window.TemplePerformance={createBudget,direction,poseInterval,playerLabel,levels};
})();
;
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const t = (key,args) => window.TempleI18n?.t(key,args) ?? key;
  const fatal = message => { $('fatal').hidden = false; $('fatal').textContent = message; };
  try {
    if (!window.THREE || !window.TempleWorld || !window.TempleActors) throw new Error(t('场景文件不完整，请完整解压后再打开 index.html。'));
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    const gpuBudget=window.TemplePerformance.createBudget({coarse:matchMedia('(pointer: coarse)').matches,memory:navigator.deviceMemory||0,cores:navigator.hardwareConcurrency||0});
    let detailScale=gpuBudget.settings.scale;
    function resizeScene(){
      const ratio=Math.min(devicePixelRatio,matchMedia('(pointer: coarse)').matches?1.15:1.5);
      const pixelBudget=2560*1440;
      const cappedRatio=Math.min(ratio,Math.sqrt(pixelBudget/Math.max(1,innerWidth*innerHeight)));
      const target=cappedRatio*detailScale;
      if(renderer.getPixelRatio()!==target)renderer.setPixelRatio(target);
      renderer.setSize(innerWidth,innerHeight);
    }
    resizeScene();
    renderer.shadowMap.enabled = gpuBudget.settings.shadows;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    $('viewport').appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', t('佛堂三维画面'));
    const world = TempleWorld.create(T);
    const replacementStatue=window.TempleStatue?.create(T,world)||null;
    const exterior=window.TempleExterior?.create(T,world)||null;
    const caisson=window.TempleCeiling?.create(T,world)||null;
    world.architecture.caisson=caisson;
    world.architecture.millwork=window.TempleEnvironment?.interior(T,world)||null;
    world.architecture.forecourt=window.TempleEnvironment?.forecourt(T,world)||null;
    const artState=world.architecture.state;
    artState.ceiling=caisson?.state??null;
    caisson?.ready.then(()=>{$('game').dataset.caisson=caisson.state.plaqueLoaded?'ready':'model';})
      .catch(()=>{$('game').dataset.caisson='model';});
    world.architecture.loadSurfaces?.().then(results=>{artState.surfaceFinishes=results.filter(Boolean).length;});
    const decorCoreReady=Promise.all([world.roofReady,exterior?.ready,replacementStatue?.ready,replacementStatue?.guanyinReady,replacementStatue?.leftStatueReady]);
    const uploadedProps=window.TempleUploadedProps?.create(T,world,Promise.all([exterior?.ready,replacementStatue?.ready]))||null;
    const ambience=window.TempleAmbience?.create(T,world,exterior)||null;
    ambience?.setQuality(gpuBudget.settings.effects);
    const navigation=window.TempleNavigation;
    const companions=window.TempleIslandCompanions.create(T,world,navigation);
    const pets=window.TemplePets.create(T,world,navigation,companions.canOccupy);
    window.TemplePets.mountControls(pets,document.querySelector('.top-actions'));
    const layout=navigation.templeSceneLayout;
    const scriptureBounds=layout.sideHalls.find(h=>h.id==='scripture').bounds;
    const garden=window.TempleIslandGarden?.create(T,world,exterior,navigation)||null;
    const groundHeight=(x,z)=>navigation.templeGroundHeight(x,z)+world.prayerMatLift(x,z);
    const camera = new T.PerspectiveCamera(layout.camera.fov??65, innerWidth / innerHeight, .1, 1200);
    camera.layers.enable(1);
    const audio = window.TempleAudio ? new TempleAudio() : null;
    const audioEnvironment={position:null,indoors:false,active:false,weather:'clear'};
    const names = ['明和', '行愿', '静初', '觉安', '慧宁', '清远', '善然', '圆心', '安之', '知朴', '念初', '澄心'];
    const robes = ['#a1aaa4', '#8e9f9d', '#a4a29a', '#8e969e', '#a7ada1'];
    const sashes = ['#d7bc70', '#c6ae65', '#ddc985', '#cdb77d'];
    const skins = ['#dba77c', '#d1a17b', '#e3b68a', '#c7956e'];
    const randomItem = items => items[Math.floor(Math.random() * items.length)];
    const identity = { name: randomItem(names), robe: randomItem(robes), sash: randomItem(sashes), skin: randomItem(skins) };
    const player = TempleActors.create(T, identity);
    player.root.position.set(layout.spawn.x,groundHeight(layout.spawn.x,layout.spawn.z),layout.spawn.z); player.root.rotation.y=layout.spawn.yaw;
    world.scene.add(player.root);
    $('identity').textContent = t('identity',{name:identity.name});
    const npcs=world.mats.filter(mat=>mat.npc).map((mat,i)=>{
      const actor=TempleActors.create(T,{robe:robes[i%robes.length],sash:sashes[i%sashes.length],skin:skins[i%skins.length]});
      actor.root.name='Worshipper '+(i+1);
      actor.root.position.set(mat.x,groundHeight(mat.x,mat.z),mat.z);
      actor.root.rotation.y=Math.PI;
      const phase=(i*4.83)%12.5;
      world.scene.add(actor.root);
      return {...actor,mat,phase};
    });
    const playerRing = new T.Mesh(new T.RingGeometry(.39, .415, 36), new T.MeshBasicMaterial({ color: '#c8db9b', transparent: true, opacity: .55, depthWrite: false }));
    playerRing.rotation.x = -Math.PI / 2; playerRing.position.y = player.root.position.y+.017; world.scene.add(playerRing);
    const targetRing = new T.Mesh(new T.RingGeometry(.60, .625, 48), new T.MeshBasicMaterial({ color: '#e8c985', transparent: true, opacity: .65, depthWrite: false }));
    targetRing.rotation.x = -Math.PI / 2; targetRing.position.y = (world.floorY??0)+.15; world.scene.add(targetRing);
    const keys = new Set();
    const PRAYER_DURATION = 6.4;
    const PRAYER_ALIGN_DURATION = .64;
    let started = false, paused = true, entryPending = false, prayer = null, nearest = null, isMoving = false;
    let decorCoreLoaded=false;
    let clock = 0, lastTime = performance.now(), footsteps = 0, muted = false, toastUntil = 0;
    let yaw = 0, pitch = layout.camera.pitch??.08, distance = layout.camera.distance, dragging = null;
    let speech = null, audioStarted = false, pageVisible = true;
    let profilePanel=null, profileOpen=false, latestProfile=null,roomActivities=null,motion=null;
    const initialView=new URLSearchParams(location.search).get('view');
    const pavilionCeilings=world.architecture.pavilionCeilings;
    const indoorViews=new Map([['ceiling',caisson],['wealth-ceiling',pavilionCeilings.tea],['scripture-ceiling',pavilionCeilings.scripture]]);
    const initialCeiling=indoorViews.get(initialView);
    let viewedCeiling=initialCeiling??caisson;
    let overview=initialCeiling?4:ambience?.coastalLookout&&initialView==='coast'?3:0,suppressSceneClick=false;
    let reviewCamera=null;
    if(location.hostname==='127.0.0.1'&&location.port==='8782'){
      window.templeReviewCamera=(position,target)=>{reviewCamera=position?{position,target}:null;};
      // Read-only geometry probe for diagnosing visible seams in the QA preview.
      window.templeReviewPick=(u,v)=>{const ray=new T.Raycaster(),meshes=[];ray.layers.enable(1);ray.setFromCamera(new T.Vector2(u*2-1,1-v*2),camera);world.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});return ray.intersectObjects(meshes,false).filter(h=>!h.object.userData.templeInteriorClip?.contains(h.point.x,h.point.y,h.point.z)).slice(0,8).map(h=>{const m=Array.isArray(h.object.material)?h.object.material[h.face.materialIndex]:h.object.material;return{name:h.object.name,parent:h.object.parent?.name,point:h.point.toArray(),distance:h.distance,normal:h.face.normal.toArray(),colour:m?.color?.getHexString(),instance:h.instanceId??null};});};
    }
    function releaseLook(){if(document.pointerLockElement===renderer.domElement)document.exitPointerLock?.();dragging=null;}
    const overviewButton=document.createElement('button');overviewButton.className='icon-button';overviewButton.id='temple-overview';
    const ceilingButton=caisson?document.createElement('button'):null;
    const ceilingExit=caisson?document.createElement('button'):null;
    if(ceilingButton){
      ceilingButton.className='icon-button';ceilingButton.id='ceiling-view';ceilingButton.textContent='◇';
      ceilingExit.type='button';ceilingExit.id='ceiling-exit';
      function toggleCeiling(){
        if(overview!==4)viewedCeiling=pavilionCeilings[navigation.templeIndoorArea(player.root.position.x,player.root.position.z)]??caisson;
        setOverview(overview===4?0:4);keys.clear();releaseLook();$('temple-menu')?.removeAttribute('open');
        (overview===4?ceilingExit:$('temple-menu')?.querySelector('summary'))?.focus({preventScroll:true});
      }
      ceilingButton.addEventListener('click',toggleCeiling);
      ceilingExit.addEventListener('click',toggleCeiling);
      $('game').append(ceilingExit);
      document.querySelector('.top-actions').prepend(ceilingButton);
    }
    function refreshViewButton(){
      const coast=overview===3;
      overviewButton.textContent=coast?'≋':'⌂';
      overviewButton.title=t(coast?'exterior.coastView':'exterior.overview');
      overviewButton.setAttribute('aria-label',overviewButton.title);
      if(ceilingButton){
        ceilingButton.title=t(overview===4?'ceiling.return':'ceiling.look');
        ceilingButton.setAttribute('aria-label',ceilingButton.title);
        ceilingButton.setAttribute('aria-pressed',String(overview===4));
        ceilingExit.textContent=t('ceiling.return');
      }
      $('game').dataset.view=['player','temple','island','coast','ceiling'][overview];
    }
    function setOverview(value){overview=value;refreshViewButton();}
    refreshViewButton();document.querySelector('.top-actions').prepend(overviewButton);
    overviewButton.addEventListener('click',()=>{setOverview(overview===4?0:(overview+1)%(ambience?.coastalLookout?4:3));keys.clear();dragging=null;});
    const SAVE_KEY = window.TEMPLE_CONFIG?.multiplayer ? 'quiet-temple-rooms-v1' : 'quiet-temple-v1';
    let saveAvailable = true;
    let stats = { merit: 0, count: 0, incense: 0, practice: 0, offerings: 0 };
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (saved && Number.isSafeInteger(saved.count) && saved.count >= 0 && saved.count < 1000000) {
        const safe=n=>Number.isSafeInteger(n)&&n>=0?n:0;
        stats={count:saved.count,practice:safe(saved.practice),offerings:safe(saved.offerings),merit:saved.count*10+safe(saved.practice)*8+safe(saved.offerings)*5,incense:saved.count+safe(saved.offerings)};
      }
    } catch (_) { saveAvailable = false; }
    function updateStats() { $('merit').textContent = stats.merit; $('worship-count').textContent = stats.count; $('incense').textContent = stats.incense; if(latestProfile)profilePanel?.update(latestProfile,stats,identity); }
    function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(stats)); } catch (_) { saveAvailable = false; } }
    function toast(text, duration = 3.1) { $('toast').textContent = t(text); $('toast').classList.add('visible'); toastUntil = clock + duration; }
    async function unlockAudio() {
      if (!audio || audioStarted) return;
      try { await audio.unlock(); audioStarted = true; audio.setMuted(muted); updateSoundButton(); } catch (_) { /* Silent play remains usable. */ }
    }
    function updateSoundButton() {
      const status = audio && audio.status;
      $('sound').textContent = muted ? '♪' : '♫';
      $('sound').style.opacity = muted ? '.5' : '1';
      $('sound').setAttribute('aria-label', muted ? t('开启声音') : t('关闭声音'));
      $('sound').title = status && status.available === false ? t('当前浏览器不支持声音') : muted ? t('开启声音') : t('关闭声音');
    }
    const guide=window.TempleGuide.create(T,world,groundHeight,toast);
    const radius = layout.character.radius;
    function blocked(x, z, checkTravel=true,ignoreSeatId=roomActivities?.active?.seat?.id||null,checkNetwork=true) {
      // Shared terrain and collision are built synchronously. Decorative model
      // downloads must never freeze an otherwise navigable position.
      if(checkTravel?!companions.canTravel(player.root.position.x,player.root.position.z,x,z):!companions.canOccupy(x,z))return true;
      if (!navigation?.templeCanStand(x,z,ignoreSeatId)) return true;
      if(checkTravel&&world.architecture.pavilionDoors.some(door=>door.blocksStep(x,z)))return true;
      if(checkTravel&&!navigation.templeCanTravel(player.root.position.x,player.root.position.z,x,z,ignoreSeatId))return true;
      if(checkTravel&&checkNetwork&&network?.canRoam){
        if(network.predictsMovement){if(!network.canAdvance(x,z))return true;}
        else for(const anchor of network.movementAnchors)if(Math.hypot(x-anchor.x,z-anchor.z)>4.5||!navigation.templeCanTravel(anchor.x,anchor.z,x,z,ignoreSeatId))return true;
      }
      for (const npc of npcs) if (npc.mat&&Math.hypot(x - npc.mat.x, z - npc.mat.z) < radius + .37) return true;
      return false;
    }
    function awaitingMovementAck(x,z) {
      const seatId=roomActivities?.active?.seat?.id||null;
      return !!network?.canRoam&&!blocked(x,z,true,seatId,false)&&(network.predictsMovement?!network.canAdvance(x,z):network.movementAnchors.some(anchor=>Math.hypot(x-anchor.x,z-anchor.z)>4.5||!navigation.templeCanTravel(anchor.x,anchor.z,x,z,seatId)));
    }
    const onlineMode = /^https?:$/.test(location.protocol) && window.TEMPLE_CONFIG?.multiplayer !== false;
    let network = null;
    const remotes = new Map();
    const insideRitualHall=()=>navigation.templeIndoorArea(player.root.position.x,player.root.position.z)==='hall';
    const insideWealthHall=()=>navigation.templeIndoorArea(player.root.position.x,player.root.position.z)==='tea';
    const rituals = TempleRituals.create({ THREE:T,world,player,audio,blocked:(x,z)=>blocked(x,z,false),canMove:(x,z)=>!blocked(x,z),isAwaitingMovementAck:awaitingMovementAck,
      canStart:(kind)=>!companions.mountSubject&&started&&!paused&&!profileOpen&&!prayer&&!motion?.busy&&!roomActivities?.isBusy&&(kind==='woodfish'?insideRitualHall():insideRitualHall()||insideWealthHall())&&(!onlineMode||network?.status.connected),
      onStart:kind=>{keys.clear();yaw=kind==='woodfish'?-.28:-.35;pitch=.24;toast(kind==='woodfish'?t('慢慢走向木鱼，静心修行'):t('慢慢走到佛前，敬香合掌'));},
      onComplete:kind=>{
        if(onlineMode){network?.complete(kind);toast(t('仪式圆满，正在记下这一份善念'));}
        else {if(kind==='woodfish'){stats.practice++;stats.merit+=8;}else{stats.offerings++;stats.incense++;stats.merit+=5;}persist();updateStats();toast(kind==='woodfish'?t('木鱼修行圆满 · 功德 +8'):t('敬香圆满 · 香火 +1 · 功德 +5'));}
        audio&&audio.bell('complete');$('prayer-status').hidden=true;
      },onNotice:message=>toast(t(message)) });
    // Crowd figures share geometry and draw calls. The nearest visible guests keep their
    // original scanned outfits; the remaining figures keep their own colors, motion and gear.
    function createRemoteCrowd() {
      const batches = new Map();
      const material = new T.MeshLambertMaterial({vertexColors: true});
      const transform = new T.Object3D(), limb = new T.Object3D();
      const torsoMatrix = new T.Matrix4(), worldMatrix = new T.Matrix4(), outputMatrix = new T.Matrix4();
      const armTop = new T.Vector3(), elbow = new T.Vector3(), palm = new T.Vector3(), direction = new T.Vector3();
      const up = new T.Vector3(0, 1, 0), light = new T.Color();
      const root = new T.Group(); root.name = 'Instanced crowd'; world.scene.add(root);
      function geometryWithParts(parts) {
        const positions=[], normals=[], colors=[];
        for (const [geo,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0] of parts) {
          transform.position.set(x,y,z);transform.rotation.set(rx,ry,rz);transform.scale.set(sx,sy,sz);transform.updateMatrix();
          const g=geo.index?geo.toNonIndexed():geo;
          g.applyMatrix4(transform.matrix);const p=g.getAttribute('position'),n=g.getAttribute('normal');
          light.set(color);
          for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(light.r,light.g,light.b);}
          if(g!==geo)g.dispose();geo.dispose();
        }
        const g=new T.BufferGeometry();
        g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
        g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
        g.setAttribute('color',new T.Float32BufferAttribute(colors,3));return g;
      }
      const white=0xffffff,sphere=()=>new T.SphereGeometry(1,10,7), cylinder=(a,b,h,n=10)=>new T.CylinderGeometry(a,b,h,n);
      const ball=(color,x,y,z,sx,sy,sz)=>[sphere(),color,x,y,z,sx,sy,sz];
      function batch(key,capacity,parts) {
        const mesh=new T.InstancedMesh(geometryWithParts(parts),material,capacity);
        mesh.name='Crowd '+key;mesh.count=0;mesh.frustumCulled=false;
        mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.setColorAt(0,light.set(white));mesh.instanceColor.setUsage(T.DynamicDrawUsage);
        root.add(mesh);batches.set(key,mesh);
      }
      batch('head',50,[ball(white,0,0,0,.332,.348,.31),
        ...[-1,1].flatMap(s=>[ball(white,s*.32,-.02,0,.059,.079,.052),ball(0x382d28,s*.107,-.018,.29,.02,.027,.016)]),
        ball(white,0,-.068,.303,.046,.04,.039),ball(0x8b6253,0,-.12,.287,.041,.009,.008)]);
      batch('robe',50,[[cylinder(.266,.337,.64,14),white,0,.31,0,1,1,1],
        ball(white,0,.58,0,.28,.12,.23)]);
      batch('sash',50,[[cylinder(.326,.332,.052,14),white,0,.095,0,1,1,1],
        [new T.BoxGeometry(.091,.50,.033),white,.018,.374,.28,1,1,1,0,0,-.44]]);
      batch('sleeve',200,[[cylinder(.093,.105,1),white,0,0,0,1,1,1]]);
      batch('hands',100,[ball(white,0,0,0,1,1,1)]);
      batch('legs',100,[[cylinder(.089,.084,1),white,0,0,0,1,1,1]]);
      batch('shoes',100,[ball(white,0,0,0,.103,.065,.17)]);
      batch('round',160,[ball(white,0,0,0,1,1,1)]);
      batch('box',100,[[new T.BoxGeometry(1,1,1),white,0,0,0,1,1,1]]);
      batch('stick',150,[[cylinder(1,1,1,6),white,0,0,0,1,1,1]]);
      const part=(key,color,matrix)=>{const mesh=batches.get(key),i=mesh.count++;mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,color);};
      function put(key,color,base,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0) {
        transform.position.set(x,y,z);transform.scale.set(sx,sy,sz);transform.rotation.set(rx,ry,rz);transform.updateMatrix();
        part(key,color,outputMatrix.multiplyMatrices(base,transform.matrix));
      }
      function segment(key,color,base,a,b,scale=1) {
        direction.subVectors(b,a);const length=direction.length();if(length<1e-5)return;
        limb.position.copy(a).lerp(b,.5);limb.quaternion.setFromUnitVectors(up,direction.multiplyScalar(1/length));
        limb.scale.set(scale,length,scale);limb.updateMatrix();part(key,color,outputMatrix.multiplyMatrices(base,limb.matrix));
      }
      const skinDefault=new T.Color('#d8a476'),shoeBrown=new T.Color('#68594b'),shoeIndigo=new T.Color('#404764');
      const gold=new T.Color('#d8ad59'),wood=new T.Color('#8c603c'),jade=new T.Color('#648b72'),paper=new T.Color('#ded0a5');
      const cloudTrim=new T.Color('#f5dfa0');
      const smooth=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
      let figures=0;
      return {
        begin(){figures=0;for(const mesh of batches.values())mesh.count=0;},
        draw(r,clock,seatHeight,jumpHeight){
          figures++;const a=r.action,c=r.colors,phase=r.phase,wave=Math.sin((clock+phase)*(a==='run'?13.2:8.8));
          const t=a==='pray'?r.progress:0;
          const kneel=a==='woodfish'?1:smooth((t-.18)/.18)*(1-smooth((t-.70)/.18));
          const bow=smooth((t-.30)/.18)*(1-smooth((t-.65)/.20));
          const join=a==='greet'?1:a==='incense'?.9:smooth(t/.16)*(1-smooth((t-.87)/.13));
          const sitting=['sit','read','tea'].includes(a),stride=a==='walk'||a==='run'?wave:0;
          const hip=sitting?seatHeight:.46-.215*kneel+Math.abs(stride)*.024;
          const lean=bow*1.18+(a==='run'?.12:a==='woodfish'?.10:join*.03);
          transform.position.copy(r.anchor.position);transform.position.y+=jumpHeight;transform.quaternion.copy(r.anchor.quaternion);
          if(r.lieBlend){transform.rotateX(-Math.PI*.5*smooth(r.lieBlend));transform.position.y+=.34*smooth(r.lieBlend);}
          transform.scale.setScalar(1);transform.updateMatrix();worldMatrix.copy(transform.matrix);
          transform.position.set(0,hip,0);transform.rotation.set(lean,0,stride*.025);transform.updateMatrix();
          torsoMatrix.multiplyMatrices(worldMatrix,transform.matrix);
          put('robe',c.robe,torsoMatrix,0,0,0);put('sash',c.sash,torsoMatrix,0,0,0);
          if(r.appearance.outfitId==='cloud'||r.appearance.outfitId==='golden')put('box',cloudTrim,torsoMatrix,-.103,.38,.274,.035,.42,.038,0,0,-.44);
          put('head',c.skin||skinDefault,torsoMatrix,0,.974,0,1,1,1,join*.07);
          r.headWorld.set(0,.974,0).applyMatrix4(torsoMatrix);
          const gear=r.appearance.gear||{};
          if(gear.neck==='gold'||r.appearance.goldBeads||gear.neck==='sandal')put('round',gear.neck==='gold'||r.appearance.goldBeads?gold:wood,torsoMatrix,0,.54,.222,.21,.066,.048);
          if(gear.waist==='pouch'||gear.waist==='jade')put('round',gear.waist==='jade'?jade:wood,torsoMatrix,.20,.13,.220,.078,.10,.046);
          for(const side of [-1,1]){
            const swing=side*stride;
            armTop.set(side*.25,.55,.01);
            elbow.set(side*(.31-.09*join),.30+.06*join,.015+.21*join+.07*swing);
            palm.set(side*(.32-.286*join),.12+.395*join,.032+.30*join+.16*swing);
            if(bow){palm.y-=.18*bow;palm.z+=.26*bow;}
            if(sitting){elbow.set(side*.26,.29,.17);palm.set(side*(a==='sit'?.22:.15),a==='sit'?.14:.39,.32);}
            if(a==='tea'&&side===1){palm.y+=.13*(1+Math.sin(clock*1.8));}
            if(a==='woodfish'&&side===1){palm.set(.2,.50+.17*Math.cos(clock*7),.44);}
            segment('sleeve',c.robe,torsoMatrix,armTop,elbow);segment('sleeve',c.robe,torsoMatrix,elbow,palm,.86);
            put('hands',c.skin,torsoMatrix,palm.x,palm.y,palm.z,.058-.026*join,.077,.049);
            if(a==='woodfish'&&side===1){put('stick',wood,torsoMatrix,palm.x,palm.y,palm.z+.17,.018,.34,.018,Math.PI/2);put('round',wood,torsoMatrix,palm.x,palm.y,palm.z+.33,.072,.065,.075);}
            if(a==='tea'&&side===1)put('round',jade,torsoMatrix,palm.x,palm.y+.032,palm.z+.035,.054,.058,.054);
            if(a==='incense'&&side===1&&r.progress<.63)put('stick',gold,torsoMatrix,.015,palm.y+.23,palm.z,.012,.52,.012);
            const angle=sitting?-1.04:kneel*1.05+swing*(a==='run'?.69:.42)-(a==='jump'?.28:0);
            armTop.set(side*.135,hip+.015,0);
            palm.set(side*.135,Math.max(.07,hip-.39*Math.cos(angle)),.045-.36*Math.sin(angle));
            segment('legs',c.robe,worldMatrix,armTop,palm);put('shoes',gear.feet==='indigo'?shoeIndigo:shoeBrown,worldMatrix,palm.x,palm.y,palm.z+.032);
          }
          if(a==='read')put('box',paper,torsoMatrix,0,.40,.38,.38,.028,.24,-.22);
        },
        end(){for(const mesh of batches.values()){mesh.visible=mesh.count>0;if(mesh.visible){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;}}},
        stats(){return {figures,draws:[...batches.values()].filter(m=>m.count>0).length};},
        dispose(){for(const m of batches.values()){m.geometry.dispose();m.dispose();}material.dispose();root.removeFromParent();}
      };
    }
    let crowd=null,nextDetailCheck=0,detailCount=0,nextRemoteLabels=0;
    const remoteView=new T.Frustum(), remoteVP=new T.Matrix4(), remoteBounds=new T.Sphere(new T.Vector3(),1.75);
    function mayShowRemote(r){
      remoteBounds.center.copy(r.anchor.position);remoteBounds.center.y+=.75;
      return remoteView.intersectsSphere(remoteBounds);
    }
    function setRemoteDetail(r,detailed){
      if(detailed===!!r.detail)return;
      if(detailed){
        r.detail=TempleActors.create(T,{...r.appearance,gear:{...r.appearance.gear}});
        r.anchor.add(r.detail.root);
      }else{
        r.detail.root.removeFromParent();r.detail.dispose?.();r.detail=null;
      }
    }
    function chooseRemoteDetail(now) {
      remoteView.setFromProjectionMatrix(remoteVP.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      if(now<nextDetailCheck)return;
      nextDetailCheck=now+500;
      const people=[...remotes.values()], crowded=people.length>6;
      const cameraDistance=r=>camera.position.distanceToSquared(r.anchor.position);
      const candidates=crowded?people.filter(r=>mayShowRemote(r)&&cameraDistance(r)<196).sort((a,b)=>
        (cameraDistance(a)*(a.detail?.78:1))-(cameraDistance(b)*(b.detail?.78:1))):people;
      const selected=new Set(crowded?candidates.slice(0,2):candidates);
      detailCount=selected.size;
      for(const r of people)setRemoteDetail(r,selected.has(r));
    }
    function updateRemoteAppearance(r,p){
      const a=r.appearance,colors=r.colors;
      const changed=['outfitId','robe','sash','skin','goldBeads'].some(k=>p[k]!==a[k])||
        ['feet','neck','waist'].some(k=>p.gear?.[k]!==a.gear?.[k]);
      if(!changed)return;
      for(const k of ['outfitId','robe','sash','skin','goldBeads'])if(p[k]!==undefined)a[k]=p[k];
      if(p.gear)a.gear={...p.gear};
      for(const k of ['robe','sash','skin'])if(typeof a[k]==='string')colors[k].set(a[k]);
      r.detail?.setAppearance?.(a);
    }
    function addRemote(p){
      if(!p||p.id===network?.status.id||remotes.has(p.id))return;
      const x=p.x??0,z=p.z??7.5,y=groundHeight(x,z),anchor=new T.Group();
      anchor.position.set(x,y,z);anchor.rotation.y=p.yaw??Math.PI;world.scene.add(anchor);
      const label=document.createElement('div');label.className='remote-name';label.textContent=p.name||t('香客');$('speech-layer').appendChild(label);
      const colors={robe:new T.Color(p.robe||'#939e98'),sash:new T.Color(p.sash||'#d5b963'),skin:new T.Color(p.skin||'#d8a476')};
      const r={anchor,detail:null,appearance:{...p,gear:{...p.gear}},colors,headWorld:new T.Vector3(),phase:remotes.size*.71,
        label,from:new T.Vector3(x,y,z),fromYaw:p.yaw??Math.PI,motionStart:0,motionMs:0,missingSince:null,streamAt:0,target:new T.Vector3(x,y,z),yaw:p.yaw??Math.PI,action:p.action||'idle',progress:p.progress||0,speech:null,inserted:false};
      remotes.set(p.id,r);nextDetailCheck=0;
    }
    function removeRemote(id){
      const r=remotes.get(id);if(!r)return;
      setRemoteDetail(r,false);r.anchor.removeFromParent();r.label.remove();r.speech?.element.remove();remotes.delete(id);nextDetailCheck=0;
      if(!remotes.size&&crowd){crowd.dispose();crowd=null;}
    }
    let remoteRoom=null;
    function updateRemote(r,p,now,realtime=false){
      r.missingSince=null;
      updateRemoteAppearance(r,p);
      const name=p.name||t('guest');if(r.label.textContent!==name)r.label.textContent=name;
      if(p.x!==r.target.x||p.z!==r.target.z||p.yaw!==r.yaw){
        // Blend from the last displayed transform. Repeated snapshots at the
        // same destination must never rewind or restart an ongoing stride.
        r.from.copy(r.anchor.position);r.fromYaw=r.anchor.rotation.y;
        const elapsed=now-(r.lastPacket??(now-300));
        r.target.set(p.x,groundHeight(p.x,p.z),p.z);r.yaw=p.yaw;r.motionStart=now;
        r.motionMs=realtime?Math.min(120,Math.max(85,elapsed)):Math.min(500,Math.max(120,elapsed));
        if(Math.hypot(r.from.x-p.x,r.from.z-p.z)>6||
           !navigation.templeCanTravel(r.from.x,r.from.z,p.x,p.z))r.motionMs=0;
      }
      r.lastPacket=now;r.action=p.action;r.progress=p.progress;r.receivedAt=clock;
    }
    function syncRemoteRoster(players,room,ownId){
      const now=performance.now();
      if(remoteRoom!==null&&room!==remoteRoom){
        for(const id of [...remotes.keys()])removeRemote(id);
      }
      remoteRoom=room;
      const live=new Set(players.filter(p=>p.id!==ownId).map(p=>p.id));
      const missing=[...remotes].filter(([id])=>!live.has(id));
      // Room snapshots may omit a peer for one poll. Keep the visible model
      // across that gap, but yield its slot immediately to a real replacement.
      let excess=live.size+missing.length-49;
      missing.sort((a,b)=>(a[1].missingSince??now)-(b[1].missingSince??now));
      for(const [id,r] of missing){
        if(excess>0){removeRemote(id);excess--;continue;}
        if(r.missingSince===null)r.missingSince=now;
        else if(now-r.missingSince>=850)removeRemote(id);
      }
      for(const p of players){
        if(p.id===ownId)continue;
        if(!remotes.has(p.id))addRemote(p);
        const r=remotes.get(p.id);if(r){if(now-(r.streamAt||0)<1200){updateRemoteAppearance(r,p);const name=p.name||t('guest');if(r.label.textContent!==name)r.label.textContent=name;}else updateRemote(r,p,now);}
      }
    }
    function reconcilePosition(confirmed,preserve){
      if(!confirmed||![confirmed.x,confirmed.z,confirmed.yaw].every(Number.isFinite))return;
      const position=player.root.position;
      // The local movement journal permits up to 55 metres without acknowledgement.
      const nearby=Math.hypot(confirmed.x-position.x,confirmed.z-position.z)<=55.01;
      position.set(confirmed.x,groundHeight(confirmed.x,confirmed.z),confirmed.z);
      player.root.rotation.y=confirmed.yaw;
      if(companions.mountSubject)companions.reconcileRide(player,preserve&&nearby);
    }
    if(window.TempleNetwork&&onlineMode){
      network=new TempleNetwork({
        onWelcome:msg=>{
          // A network welcome resets server-owned activities, not the keyboard.
          // Keyup, blur and pause remain authoritative for physical input.
          prayer=null;rituals.cancel();roomActivities?.reset({notifyStop:false});motion?.reset({keepRun:msg.resumedPosition});$('prayer-status').hidden=true;document.body.classList.remove('praying');
          const own=msg.players.find(p=>p.id===msg.id);reconcilePosition(own,msg.resumedPosition);
          if(msg.stats){stats={...stats,...msg.stats};persist();updateStats();}
          syncRemoteRoster(msg.players,msg.room,msg.id);
          $('save-status').textContent=t('累计功德已保存');
          if(msg.reconnected)toast(t('已恢复连接，累计功德已保留'),5);
        },
        onSnapshot:msg=>syncRemoteRoster(msg.players,network.status.room,network.status.id),
        onMotion:msg=>{if(!msg||msg.id===network?.status.id)return;const r=remotes.get(msg.id);if(!r)return;const now=performance.now();if(msg.type==='pose'){r.action=msg.lying?'lie':'idle';r.progress=0;r.receivedAt=clock;r.lastPacket=now;r.streamAt=now;return;}updateRemote(r,{...r.appearance,id:msg.id,x:msg.x,z:msg.z,yaw:msg.yaw,action:msg.action,progress:0},now,true);r.streamAt=now;},
        onChat:msg=>{if(msg.id===network.status.id)return;const r=remotes.get(msg.id);if(!r)return;r.speech?.element.remove();const el=document.createElement('div');el.className='speech remote-speech';el.textContent=msg.text;$('speech-layer').appendChild(el);r.speech={element:el,expires:performance.now()+8000};},
        onPresence:()=>{},
        onSeats:seats=>{roomActivities?.setOccupancy(seats.filter(s=>s.sessionId!==network?.status.id));if(!roomActivities?.active&&!network?.status.seatReleasePending&&seats.some(s=>s.sessionId===network?.status.id))network?.releaseSeat();},
        onProfile:msg=>applyProfile(msg.profile,msg.appearance),
        onReward:msg=>{stats={...stats,...msg.stats};persist();updateStats();$('save-status').textContent=t('累计功德已保存');if(!msg.silent)toast(t('notice.saved',{action:msg.action==='woodfish'?t('修行圆满'):msg.action==='incense'?t('敬香圆满'):t('礼拜圆满')}));},
        onStatus:status=>{
          $('save-status').textContent=status.storageAvailable===false?t('当前浏览器无法保留身份，下次可能无法找回'):status.pendingComplete?t('正在保存这份善念…'):status.connected?t('累计功德已保存'):t('正在连接累计存档…');
          if(entryPending)updateEntry(status);
        },
        onError:msg=>{const key='error.'+msg.code;const message=t(key)!==key?t(key):(t(msg.message)||t('error.generic'));toast(message);profilePanel?.setError(message);if((msg.code==='speed'||msg.code==='invalid_state')&&msg.confirmed){roomActivities?.reset({notifyStop:false});motion?.reset({keepRun:true});reconcilePosition(msg.confirmed,true);}if(msg.code==='busy'||msg.code==='action_position'||msg.code==='speed'||(msg.code==='invalid_state'&&msg.confirmed)){prayer=null;rituals.cancel();$('prayer-status').hidden=true;document.body.classList.remove('praying');}}
      });
    }
    function applyProfile(profile,appearance){
      if(!profile)return;latestProfile=profile;
      if(appearance){Object.assign(identity,appearance);player.setAppearance?.(appearance);}
      if(profile.dharmaName)identity.name=profile.dharmaName;
      $('identity').textContent=t('identity',{name:identity.name});
      profilePanel?.update(profile,stats,appearance||identity);
    }
    const beadReward=window.TempleBeadReward.create(T,world.scene,player.root,camera);
    document.addEventListener('temple-gold-beads-earned',()=>beadReward.show(performance.now()));
    profilePanel=window.TempleProfile?.create({THREE:T,scene:world.scene,statue:world.statue,player,t,
      onRewardBlessing:()=>replacementStatue?.beginBlessing?.(player.root),
      onEquip:id=>network?.equip(id),onGear:(slot,item)=>network?.setGear(slot,item),onGoldBeads:on=>network?.setGoldBeads(on),onRename:name=>network?.rename(name),onAcknowledge:thresholds=>network?.acknowledgeBlessings(thresholds),
      onOpenChange:open=>{if(open){stopPrayer();releaseLook();}profileOpen=open;keys.clear();dragging=null;isMoving=false;}
    })||null;
    const findPath=(from,destination,seatId)=>TemplePaths.find(from,destination,{layout,seatId,canStand:(x,z,id)=>!blocked(x,z,false,id),canTravel:navigation.templeCanTravel});
    roomActivities=window.TempleRoomActivities?.create({THREE:T,world,player,layout,navigation,groundHeight,camera,canvas:renderer.domElement,
      findPath,canMove:(x,z)=>!blocked(x,z),isAwaitingMovementAck:awaitingMovementAck,canStart:()=>!companions.mountSubject&&started&&!paused&&!profileOpen&&!prayer&&!motion?.busy&&!rituals.active&&!network?.status.pendingComplete&&(!onlineMode||network?.status.connected),
      onStart:()=>{keys.clear();releaseLook();setOverview(0);const seat=roomActivities?.active?.seat;if(seat)yaw=seat.yaw+Math.PI;pitch=.22;},onStop:()=>{keys.clear();},onNotice:message=>toast(message),releaseLook,
      claimSeat:id=>onlineMode?network?.requestSeat(id):Promise.resolve(true),releaseSeat:id=>onlineMode?network?.releaseSeat(id):Promise.resolve(true)
    })||null;
    motion=window.TemplePlayerMotion.create({player,navigation,isMounted:()=>!!companions.mountSubject,canStart:kind=>(!companions.mountSubject||(kind==='run'&&!companions.transitioning))&&started&&!paused&&!profileOpen&&!rituals.active&&!roomActivities?.isBusy&&!network?.status.pendingComplete&&(!onlineMode||network?.canRoam),onRequest:stopPrayer,notice:toast});
    function locateMat() {
      let result = null, best = 1.35;
      for (const m of world.mats) {
        const d = Math.hypot(player.root.position.x - m.x, player.root.position.z - m.z);
        if (d < best) { best = d; result = m; }
      }
      return result;
    }
    const wishes=TempleWishRibbon.create(T,world.scene,navigation,toast);
    function atWishTree(){
      return started&&!paused&&!profileOpen&&!prayer&&!rituals.active&&!motion?.busy&&!roomActivities?.isBusy&&!companions.mountSubject&&wishes.near(player.root.position);
    }
    function atFortuneGuide(){
      return started&&!paused&&!profileOpen&&!prayer&&!rituals.active&&!motion?.busy&&!roomActivities?.isBusy&&!companions.mountSubject&&guide.near(player.root.position);
    }
    function requestHallDecor(retry=false,inHall=insideRitualHall()){
      const decor=world.architecture?.decor;if(!decor||decor.state.ready||decor.state.disposed)return;
      const context={coreReady:decorCoreLoaded&&player.root.userData.outfitReady===true,entered:started&&!paused&&pageVisible,near:inHall};
      if(retry)decor.retry(context);else decor.request(context);
    }
    function updatePrompt() {
      if(!world.architecture.libraryArtworkReady){
        const {x,z}=player.root.position;
        const [west,east,back,front]=scriptureBounds;
        const distance=Math.hypot(Math.max(west-x,0,x-east),Math.max(back-z,0,z-front));
        if((overview===4&&viewedCeiling===pavilionCeilings.scripture)||(started&&!paused&&distance<20)){
          world.architecture.loadScriptureArtwork?.();
        }
      }
      requestHallDecor();
      nearest = locateMat();
      const busy=!!prayer||!!rituals.active||!!roomActivities?.isBusy||!!network?.status.pendingComplete;
      roomActivities?.setEnabled(!companions.mountSubject&&started&&!paused&&!profileOpen&&!motion?.busy&&!prayer&&!rituals.active&&!network?.status.pendingComplete&&(!nearest||roomActivities.isBusy));
      profilePanel?.setStarted(started&&!paused);profilePanel?.setBusy(busy||!network?.status.connected);
      const disconnected=onlineMode&&!network?.status.connected;
      const animal=companions.mountSubject||(!nearest&&!motion?.busy?companions.nearest(player.root.position):null);
      const petText=animal?companions.nearbyText(animal):null;
      $('interact').dataset.label=petText?.button||t('hud.bow');
      $('interact').disabled = !started || paused || profileOpen || busy || companions.transitioning || (animal?.spec.kind==='alpaca' && onlineMode && !network?.canRoam) || (!animal && (!nearest || nearest.npc || disconnected));
      const ritualBlocked=!!companions.mountSubject||!started||paused||profileOpen||!!rituals.active||!!roomActivities?.isBusy||network?.status.pendingComplete||disconnected;
      $('practice').disabled=ritualBlocked||!insideRitualHall();
      $('offer-incense').disabled=ritualBlocked||!(insideRitualHall()||insideWealthHall());
      $('practice').classList.toggle('active',rituals.active?.kind==='woodfish');
      $('offer-incense').classList.toggle('active',rituals.active?.kind==='incense');
      const statusElement=$('online-status'),status=network?.status;
      const waitingForRoom=!!(started&&!paused&&onlineMode&&status&&!status.canRoam);
      statusElement.classList.toggle('recovering',waitingForRoom);
      const statusText=waitingForRoom?t('联机已断开 · 正在重试'):status?.connected
        ?t('online.status',{room:status.room,players:remotes.size+1,online:Number.isFinite(status.online)?status.online:t('统计中')})
        :status?t(status.connecting?'正在走入联网佛堂…':'联机已断开 · 正在重试'):t(window.TEMPLE_CONFIG?.modeLabel||'online.local');
      if(statusElement.textContent!==statusText)statusElement.textContent=statusText;
      if(network?.status.pendingComplete){$('interaction-label').textContent=t('正在保存善念');$('interaction-note').textContent=t('等记录完成，再继续礼佛');}
      else if(roomActivities?.isBusy){$('interaction-label').textContent=t(roomActivities.active?.kind==='tea'?'room.drinking':'room.reading');$('interaction-note').textContent=t('room.activityHelp');}
      else if(rituals.active){$('interaction-label').textContent=rituals.active.stage==='walking'?t('正在前往佛前'):rituals.active.kind==='woodfish'?t('正在敲木鱼'):t('正在上香合掌');$('interaction-note').textContent=t('请安住片刻，仪式会自动完成');}
      else if (prayer) { $('interaction-label').textContent = t('礼拜进行中'); $('interaction-note').textContent = t('prompt.praying.note'); }
      else if(atFortuneGuide()){
        $('interact').disabled=false;$('interact').dataset.label=guide.label();
        $('interaction-label').textContent=guide.label();$('interaction-note').textContent='';
      }
      else if (nearest && nearest.npc) { $('interaction-label').textContent = t('此处已有香客'); $('interaction-note').textContent = t('请选一方空拜垫，轻声慢行'); }
      else if (nearest) { $('interaction-label').textContent = t('合掌 · 跪拜'); $('interaction-note').textContent = t('完成一次礼拜，功德 +10'); }
      else if (animal) { $('interaction-label').textContent=petText.title; $('interaction-note').textContent=''; }
      else if(atWishTree()){
        $('interact').disabled=false;$('interact').dataset.label=wishes.label();
        $('interaction-label').textContent=wishes.label();$('interaction-note').textContent='';
      }
      else if(['scripture','tea'].includes(navigation?.templeIndoorArea(player.root.position.x,player.root.position.z))){$('interaction-label').textContent=t(player.root.position.x<0?'room.scripture':'room.tea');$('interaction-note').textContent=t('room.return');}
      else if(!navigation?.templeIndoorArea(player.root.position.x,player.root.position.z)&&(player.root.position.z>11||Math.abs(player.root.position.x)>8)){$('interaction-label').textContent=t('exterior.explore');const p=player.root.position;$('interaction-note').textContent=t(Math.abs(p.x)<7&&p.z<74?'exterior.ramp':p.x>=0&&p.x<78&&p.z>73&&p.z<88?'exterior.path':'exterior.shore');}
      else { $('interaction-label').textContent = t('走近一方空拜垫'); $('interaction-note').textContent = t('中央一列的空拜垫正在等你'); }
      targetRing.visible = !!nearest && !nearest.npc && !rituals.active&&!roomActivities?.isBusy;
      if (nearest) { targetRing.position.set(nearest.x,groundHeight(nearest.x,nearest.z)+.007,nearest.z); }
    }
    function startPrayer() {
      if (companions.mountSubject || !started || paused || profileOpen || prayer || motion?.busy || rituals.active || roomActivities?.isBusy || network?.status.pendingComplete || (onlineMode&&!network?.status.connected)) return false;
      const mat = locateMat();
      if (!mat) { toast(t('请先走近一方空拜垫')); return false; }
      if (mat.npc) { toast(t('这方拜垫已有香客，请选空位')); return false; }
      if (blocked(mat.x, mat.z)) return false;
      keys.clear();
      prayer = { time: 0, alignTime: 0, aligning: true, mat, from: player.root.position.clone() };
      $('prayer-status').hidden = false; document.body.classList.add('praying');
      audio && audio.bell('start'); updatePrompt(); return true;
    }
    function stopPrayer() {
      if (!prayer) return;
      prayer = null;
      $('prayer-status').hidden = true;
      document.body.classList.remove('praying');
      updatePrompt();
    }
    function finishPrayer() {
      if(onlineMode)network?.complete('pray');
      else{stats.count++; stats.merit += 10; stats.incense++; persist(); updateStats();}
      prayer.time = 0;
      audio && audio.bell('complete');
      toast(onlineMode?t('礼拜圆满，正在记下这一份善念'):t('notice.prayerReward')+(saveAvailable?'':t('notice.sessionOnly')), 3.6);
      updatePrompt();
    }
    function setOverlay(mode) {
      stopPrayer();
      paused = true; audioEnvironment.active=false;audio?.update(0,false,audioEnvironment); releaseLook(); keys.clear(); dragging = null; $('overlay').hidden = false;
      $('welcome-title').dataset.i18n=mode==='help'?'help.title':'pause.title';
      $('welcome-copy').dataset.i18n=mode==='help'?'help.copy':'pause.copy';
      $('welcome-title').textContent = mode === 'help' ? t('在一呼一吸之间。') : t('歇一歇，再出发。');
      $('welcome-copy').textContent = mode === 'help' ? t('help.copy') : t('佛堂为你留了一盏灯。准备好了，就继续。');
      $('start').firstElementChild.dataset.i18n='welcome.resume';
      $('start').firstElementChild.textContent = t('welcome.resume');
      $('pause').textContent = '▶'; updatePrompt();
    }
    function entryLabel(key,busy){
      const button=$('start'),label=button.firstElementChild;
      button.setAttribute('aria-busy',String(busy));
      label.dataset.i18n=key;label.textContent=t(key);
    }
    function finishEntry() {
      entryPending=false;entryLabel('welcome.resume',false);
      started = true; paused = false; lastTime = performance.now();
      audio?.setHallActive(insideRitualHall());
      $('overlay').hidden = true; $('pause').textContent = 'Ⅱ'; updatePrompt();
    }
    function updateEntry(status){
      if(status.canRoam&&!document.hidden){finishEntry();return;}
      entryLabel(status.error?'online.retry':'online.connecting',true);
    }
    function enter() {
      if(entryPending)return;
      keys.clear();unlockAudio();
      if(!onlineMode||network?.canRoam){finishEntry();return;}
      entryPending=true;
      if(!network){entryPending=false;fatal(t('场景文件不完整，请完整解压后再打开 index.html。'));return;}
      updateEntry(network.status);
      if(!network.status.connecting)network.connect(identity,new URLSearchParams(location.search).get('room')||'auto');
    }
    $('start').addEventListener('click', enter);
    $('help').addEventListener('click', () => { if (started) setOverlay('help'); });
    $('pause').addEventListener('click', () => { if (!started) return; if (paused) enter(); else setOverlay('pause'); });
    $('sound').addEventListener('click', async () => { muted = !muted; await unlockAudio(); if (audio) audio.setMuted(muted); updateSoundButton(); });
    function petNearby() {
      if(!started||paused||profileOpen||motion?.busy||prayer||rituals.active||roomActivities?.isBusy||network?.status.pendingComplete)return false;
      if(companions.mountSubject){
        if(!companions.transitioning&&!companions.dismount(player))toast(companions.nearbyText(companions.mountSubject).blocked);
        keys.clear();return true;
      }
      if(locateMat())return false;
      const subject=companions.nearest(player.root.position);
      if(subject?.spec.kind==='alpaca'){
        if(onlineMode&&!network?.canRoam)return false;
        if(companions.mount(subject,player)){motion.reset();keys.clear();}
        else toast(companions.nearbyText(subject).blocked);
        return true;
      }
      return companions.pet(player.root.position);
    }
    $('interact').addEventListener('click', () => {
      unlockAudio();
      if(atFortuneGuide()){guide.open(player.root.position);return;}
      if(!petNearby()){if(atWishTree())wishes.open();else startPrayer();}
    });
    $('practice').addEventListener('click',()=>{stopPrayer();unlockAudio();rituals.start('woodfish');});
    $('offer-incense').addEventListener('click',()=>{stopPrayer();unlockAudio();rituals.start('incense',insideWealthHall()?'wealth':'hall');});
    $('chat-input').addEventListener('focus', () => {stopPrayer();releaseLook();keys.clear();});
    document.addEventListener('temple-ui-open',()=>{stopPrayer();releaseLook();keys.clear();});
    $('chat-form').addEventListener('submit', event => {
      event.preventDefault();
      if (!started || paused) return;
      const text = Array.from($('chat-input').value.trim()).slice(0, 40).join('');
      if (text) {
        if(onlineMode&&!network?.sendChat(text)){toast(t('文字还未发送，请等待连接恢复'));return;}
        if (speech) speech.element.remove();
        const element = document.createElement('div'); element.className = 'speech'; element.textContent = text;
        $('speech-layer').appendChild(element); speech = { element, expires: clock + 8, text };
        $('chat-input').value = '';
      }
      $('chat-input').blur(); keys.clear();
    });
    addEventListener('keydown', event => {
      if(wishes.isOpen||profileOpen||guide.isOpen)return;
      const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||'');
      if(entryPending&&!typing&&['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(event.code)){
        event.preventDefault();keys.add(event.code);return;
      }
      if (event.code === 'Escape') {
        event.preventDefault();
        if (typing) { $('chat-input').blur(); return; }
        if (started) { if (paused) enter(); else setOverlay('pause'); } return;
      }
      if (typing) return;
      if (!started || paused) return;
      if (prayer && !event.repeat && event.code !== 'KeyE') stopPrayer();
      if (event.code === 'Enter') { event.preventDefault(); releaseLook();keys.clear(); $('chat-input').focus(); return; }
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyE'].includes(event.code)) event.preventDefault();
      if (event.repeat && ['KeyE','Space','KeyC','KeyZ','KeyG'].includes(event.code)) return;
      if(['Space','KeyC','KeyZ','KeyG'].includes(event.code)){event.preventDefault();motion.request({Space:'jump',KeyC:'sit',KeyZ:'lie',KeyG:'greet'}[event.code]);return;}
      if (event.code === 'KeyE') { if(motion?.busy){motion.stand();return;}unlockAudio();if(atFortuneGuide()){guide.open(player.root.position);return;}if(!companions.mountSubject&&locateMat()&&!roomActivities?.isBusy){startPrayer();return;}if(petNearby())return;if(atWishTree()){wishes.open();return;}if(roomActivities?.interact())return; startPrayer(); return; }
      keys.add(event.code);
    });
    addEventListener('keyup', event => keys.delete(event.code));
    addEventListener('blur', () => { keys.clear(); dragging = null; });
    addEventListener('pagehide',()=>{
      if(entryPending){entryPending=false;keys.clear();entryLabel(started?'welcome.resume':'welcome.enter',false);}
      network?.disconnect();
    });
    addEventListener('pageshow',event=>{if(event.persisted&&started)setOverlay('pause');});
    document.addEventListener('visibilitychange', () => {
      pageVisible = !document.hidden; keys.clear();
      if(pageVisible&&entryPending)updateEntry(network.status);
      if (!pageVisible && started && !paused) setOverlay('pause');
    });
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
    renderer.domElement.addEventListener('click',e=>{
      if(e.button!==0||!started||paused||profileOpen||e.pointerType==='touch')return;
      if(suppressSceneClick){suppressSceneClick=false;return;}
      if(roomActivities?.handleSceneClick(e,camera,renderer.domElement)||roomActivities?.isBusy)return;
    });
    // The cursor stays visible. Legacy lock events must never clear held movement.
    document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===renderer.domElement)document.exitPointerLock?.();});
    document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&e.target?.closest?.('#touch-controls,#motion-controls,#interact'))return;if(e.target?.closest?.('button,input,select,textarea'))releaseLook();});
    renderer.domElement.addEventListener('pointerdown', e => {
      if(e.pointerType==='touch'&&(e.clientX<innerWidth*.45||dragging))return;
      if ((e.button === 0 || e.pointerType === 'touch') && started && !paused && !profileOpen&&!roomActivities?.panelOpen) { e.preventDefault();if(overview)setOverview(0);suppressSceneClick=false;dragging = { x: e.clientX, y: e.clientY,startX:e.clientX,startY:e.clientY,moved:false,pointerId:e.pointerId,pointerType:e.pointerType }; renderer.domElement.setPointerCapture(e.pointerId); }
    });
    renderer.domElement.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId!==dragging.pointerId || paused || document.pointerLockElement===renderer.domElement) return;
      if(!dragging.moved&&Math.hypot(e.clientX-dragging.startX,e.clientY-dragging.startY)<4)return;
      yaw -= (e.clientX - dragging.x) * .004;
      pitch = T.MathUtils.clamp(pitch + (e.clientY - dragging.y) * .003, -.28, .95);
      dragging.x=e.clientX;dragging.y=e.clientY;dragging.moved=true;
    });
    const endDrag = e => {if(dragging&&e.pointerId===dragging.pointerId){if(dragging.moved&&dragging.pointerType!=='touch')suppressSceneClick=true;dragging=null;}};
    renderer.domElement.addEventListener('pointerup', endDrag);
    renderer.domElement.addEventListener('pointercancel', endDrag);
    renderer.domElement.addEventListener('lostpointercapture',endDrag);
    renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); distance = T.MathUtils.clamp(distance + e.deltaY * .004, 3.7, 8.5); }, { passive: false });
    document.querySelectorAll('[data-move]').forEach(button => {
      button.addEventListener('pointerdown', e => { e.preventDefault(); if (started && !paused && !profileOpen) { stopPrayer(); keys.add(button.dataset.move); button.setPointerCapture(e.pointerId); } });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, () => keys.delete(button.dataset.move)));
    });
    addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); resizeScene(); });
    const remoteHead=new T.Vector3();
    const target = new T.Vector3(), desiredCamera = new T.Vector3(), projected = new T.Vector3();
    const cameraOffsets=[[0,0,0],[.18,0,0],[-.18,0,0],[0,.18,0],[0,0,.18],[0,0,-.18]].map(p=>new T.Vector3(...p));
    let cameraObstructed=false,cameraAvoidAngle=0;
    const rayStart=new T.Vector3(),rayEnd=new T.Vector3(),rayDirection=new T.Vector3(),roomDirection=new T.Vector3();
    const cameraEye=new T.Vector3(),angleCandidate=new T.Vector3(),bestCandidate=new T.Vector3();
    const predictedView={from:new T.Vector3(),to:new T.Vector3(),result:new T.Vector3(),valid:false,obstructed:false};
    const renderedView={from:new T.Vector3(),to:new T.Vector3(),result:new T.Vector3(),valid:false,obstructed:false};
    const avoidanceAngles=[-.5,.5,-1,1,-1.5,1.5,Math.PI];
    const avoidanceViews=new Map([0,...avoidanceAngles].map(angle=>[angle,{
      from:new T.Vector3(),to:new T.Vector3(),result:new T.Vector3(),valid:false,obstructed:false
    }]));
    let exteriorCameraReady=false;
    const roomCameraRay=new T.Ray(),roomCameraHit=new T.Vector3();
    const roomCameraBoxes=[...navigation.roomColliders.cameraObstacles,...(garden?.cameraObstacles||[])].map(b=>new T.Box3(new T.Vector3(b.x-b.hx,b.y-b.hy,b.z-b.hz),new T.Vector3(b.x+b.hx,b.y+b.hy,b.z+b.hz)));
    const cameraSweep=new T.Box3(),nearbyCameraBoxes=[];
    function roomClearDistance(from,to){const d=roomDirection.subVectors(to,from),length=d.length();if(length<.001)return length;roomCameraRay.set(from,d.divideScalar(length));let safe=length;for(const box of nearbyCameraBoxes){const hit=roomCameraRay.intersectBox(box,roomCameraHit);if(hit){const distance=from.distanceTo(hit);if(distance>.03&&distance<safe)safe=Math.max(.12,distance-.22);}}return safe;}

    function protectCamera(eye,point,cache){
      if(cache?.valid&&cache.from.equals(eye)&&cache.to.equals(point)){
        point.copy(cache.result);cameraObstructed ||= cache.obstructed;return;
      }
      if(cache){cache.from.copy(eye);cache.to.copy(point);}
      const direction=rayDirection.subVectors(point,eye),length=direction.length();
      let safe=length;
      // All six parallel rays stay inside this swept box, including both ends.
      cameraSweep.min.copy(eye).min(point);cameraSweep.max.copy(eye).max(point);
      cameraSweep.expandByScalar(.18);nearbyCameraBoxes.length=0;
      for(const box of roomCameraBoxes)if(cameraSweep.intersectsBox(box))nearbyCameraBoxes.push(box);
      for(const offset of cameraOffsets){
        rayStart.copy(eye).add(offset);rayEnd.copy(point).add(offset);
        safe=Math.min(safe,roomClearDistance(rayStart,rayEnd));
        if(exteriorCameraReady)safe=Math.min(safe,exterior.clearDistance(rayStart,rayEnd));
      }
      if(safe<length){point.copy(eye).addScaledVector(direction.normalize(),safe);cameraObstructed=true;}
      if(cache){cache.result.copy(point);cache.obstructed=safe<length;cache.valid=true;}
    }
    function updateCamera(dt, immediate = false) {
      const p = player.root.position;
      const lookingUp=overview===4,exteriorView=overview>0&&!lookingUp;
      const indoor=lookingUp||!!navigation?.templeIndoorArea(reviewCamera?.position[0]??p.x,reviewCamera?.position[2]??p.z);
      const outside=!indoor&&(p.z>10||Math.abs(p.x)>8);
      world.scene.fog.density=lookingUp?.006:overview===2?.0006:exteriorView?.001:outside?.0015:.010;
      if(ambience&&indoor&&!exteriorView)world.scene.fog.color.set(0x4c3b2c);
      for(const light of world.lights)if(light.isDirectionalLight)light.castShadow=indoor&&!exteriorView&&light.userData?.hallShadow===true;
      for(const light of world.scene.children)if(light.isDirectionalLight&&light.layers.mask===2)light.castShadow=!indoor||exteriorView;
      if(lookingUp&&viewedCeiling&&!reviewCamera){viewedCeiling.aimCamera(camera);return;}
      const fov=layout.camera.fov??65;
      if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
      if(reviewCamera){camera.position.fromArray(reviewCamera.position);camera.lookAt(new T.Vector3().fromArray(reviewCamera.target));camera.updateMatrixWorld();return;}
      if(overview===3){
        const lookout=ambience.coastalLookout;
        camera.position.copy(lookout.position);camera.lookAt(lookout.target);camera.updateMatrixWorld();return;
      }
      if(overview){if(overview===2)desiredCamera.set(270,160+layout.assetOffsetY,440);else{const fit=Math.max(104,68/(Math.tan(camera.fov*Math.PI/360)*camera.aspect));desiredCamera.set(0,11.2+fit*.18,6+fit);}if(immediate)camera.position.copy(desiredCamera);else camera.position.lerp(desiredCamera,1-Math.exp(-dt*4));if(overview===2)camera.lookAt(0,-55+layout.assetOffsetY,135);else camera.lookAt(0,8+layout.assetOffsetY,6);camera.updateMatrixWorld();return;}
      const foyer=Math.abs(p.x)<5.3?T.MathUtils.smoothstep(p.z,9,12)*T.MathUtils.smoothstep(17-p.z,0,2.4):0;
      const availableDistance=distance-foyer*Math.max(0,distance-5.45);
      const cameraDistance=roomActivities?.isBusy?Math.min(availableDistance,4.8):availableDistance;
      const aimHeight=motion?.action==='sit'||motion?.action==='lie'?.65:indoor&&!['scripture','tea'].includes(navigation.templeIndoorArea(p.x,p.z))&&!roomActivities?.isBusy?(layout.camera.hallTargetHeight??2.7):layout.camera.targetHeight;
      desiredCamera.set(p.x + Math.sin(yaw) * cameraDistance * Math.cos(pitch), p.y+layout.camera.eyeHeight + Math.sin(pitch) * cameraDistance, p.z + Math.cos(yaw) * cameraDistance * Math.cos(pitch));
      const cameraFloor=groundHeight(desiredCamera.x,desiredCamera.z);if(Number.isFinite(cameraFloor))desiredCamera.y=Math.max(desiredCamera.y,cameraFloor+.5);
      const terrainBounds=navigation.islandLandscape;
      desiredCamera.x = T.MathUtils.clamp(desiredCamera.x,terrainBounds.x0+5,terrainBounds.x0+(terrainBounds.columns-1)*terrainBounds.step-5);
      desiredCamera.z = T.MathUtils.clamp(desiredCamera.z,terrainBounds.z0+5,terrainBounds.z0+(terrainBounds.rows-1)*terrainBounds.step-5);
      cameraObstructed=false;
      const eye=cameraEye.set(p.x,p.y+1.6,p.z);
      // Room walls/furniture provide camera collision as soon as the scene
      // exists. Refresh stationary-camera results when the exterior index arrives.
      if(!exteriorCameraReady&&exterior?.state.ready){
       exteriorCameraReady=true;predictedView.valid=false;renderedView.valid=false;
      }
      protectCamera(eye,desiredCamera,predictedView);
      if(exteriorCameraReady){
       if(eye.distanceTo(desiredCamera)<3.1){
        let best=null,bestScore=-Infinity;
        for(const angle of [cameraAvoidAngle,...avoidanceAngles]){
         const candidate=angleCandidate.set(p.x+Math.sin(yaw+angle)*cameraDistance*Math.cos(pitch),p.y+1.6+Math.sin(pitch)*cameraDistance,p.z+Math.cos(yaw+angle)*cameraDistance*Math.cos(pitch));
         const anglePenalty=Math.abs(angle)*.5,switchPenalty=angle===cameraAvoidAngle?0:.2;
         // Collision can only shorten a candidate. Its unobstructed score
         // is an upper bound and ties keep the earlier candidate.
         if(eye.distanceTo(candidate)-anglePenalty-switchPenalty<=bestScore)continue;
         protectCamera(eye,candidate,avoidanceViews.get(angle));
         const length=eye.distanceTo(candidate),score=length-anglePenalty-switchPenalty;
         if(score>bestScore){bestScore=score;best={candidate:bestCandidate.copy(candidate),angle,length};}
        }
        if(best&&best.length>eye.distanceTo(desiredCamera)+.4){desiredCamera.copy(best.candidate);cameraAvoidAngle=best.angle;}
       }else cameraAvoidAngle=0;
      }
      if (immediate) camera.position.copy(desiredCamera); else camera.position.lerp(desiredCamera, 1 - Math.exp(-dt * 7));
      protectCamera(eye,camera.position,renderedView);
      if(eye.distanceTo(camera.position)<2.2&&eye.distanceTo(desiredCamera)>3.2)camera.position.copy(desiredCamera);
      const finalFloor=groundHeight(camera.position.x,camera.position.z);if(Number.isFinite(finalFloor))camera.position.y=Math.max(camera.position.y,finalFloor+.5);
      target.set(p.x - Math.sin(yaw) * .8, p.y+aimHeight, p.z - Math.cos(yaw) * .8); camera.lookAt(target);
      camera.updateMatrixWorld();
    }
    function updateLabels() {
      player.head.getWorldPosition(projected);
      projected.y += .48;
      projected.project(camera);
      const visible = projected.z < 1 && projected.z > -1 && camera.position.distanceToSquared(player.root.position)<676;
      $('player-label').style.display = visible && !speech ? '' : 'none';
      $('player-label').style.left = `${(projected.x * .5 + .5) * innerWidth}px`;
      $('player-label').style.top = `${(-projected.y * .5 + .5) * innerHeight}px`;
      $('player-label').textContent = t('player.you',{name:identity.name});
      if (speech) {
        speech.element.style.display = visible ? '' : 'none';
        speech.element.style.left = `${(projected.x * .5 + .5) * innerWidth}px`;
        speech.element.style.top = `${(-projected.y * .5 + .5) * innerHeight - 6}px`;
        if (clock > speech.expires) { speech.element.remove(); speech = null; }
      }
    }
    function updatePlayer(dt) {
      player.root.position.y=groundHeight(player.root.position.x,player.root.position.z);
      const stick = window.TempleTouchInput;
      if (prayer && (stick?.x || stick?.y)) stopPrayer();
      if(onlineMode&&!network?.canRoam){isMoving=false;return;}
      if(companions.transitioning){isMoving=false;return;}
      if(roomActivities?.isBusy){isMoving=false;roomActivities.update(dt,clock);return;}
      if(wishes.isOpen||profileOpen||guide.isOpen){isMoving=false;player.pose(clock,false);return;}
      if(prayer&&network?.status.pendingComplete){isMoving=false;player.hideProps();player.pose(clock,false);return;}
      if(rituals.active){rituals.update(dt,clock);$('prayer-status').hidden=rituals.active?.stage!=='acting';if(rituals.active?.stage==='acting'){$('prayer-word').textContent=rituals.active.kind==='woodfish'?t('木鱼静心'):t('敬香合掌');$('prayer-progress').style.width=`${rituals.progress*100}%`;}return;}
      if (prayer) {
        isMoving = false;
        player.root.rotation.y = Math.PI;
        if (prayer.aligning) {
          prayer.alignTime = Math.min(PRAYER_ALIGN_DURATION, prayer.alignTime + dt);
          const align = T.MathUtils.smoothstep(prayer.alignTime, 0, PRAYER_ALIGN_DURATION);
          player.root.position.x = T.MathUtils.lerp(prayer.from.x, prayer.mat.x, align);
          player.root.position.z = T.MathUtils.lerp(prayer.from.z, prayer.mat.z, align);
          player.root.position.y = groundHeight(player.root.position.x,player.root.position.z);
          player.pose(clock, false, 0);
          $('prayer-progress').style.width = '0%';
          $('prayer-word').textContent = t('合掌静心');
          // Only advertise a prayer once its position is on the authoritative mat.
          if (prayer.alignTime >= PRAYER_ALIGN_DURATION) prayer.aligning = false;
          return;
        }
        prayer.time += dt;
        const p = Math.min(1, prayer.time / PRAYER_DURATION);
        player.pose(clock, false, p);
        $('prayer-progress').style.width = `${p * 100}%`;
        $('prayer-word').textContent = p < .18 ? t('合掌静心') : p < .42 ? t('缓缓下拜') : p < .70 ? t('静心礼拜') : p < .90 ? t('缓缓起身') : t('礼拜圆满');
        if (p >= 1) finishPrayer();
        return;
      }
      let forward = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'));
      let side = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
      forward-=window.TempleTouchInput?.y||0;side+=window.TempleTouchInput?.x||0;
      const length = Math.hypot(forward, side); isMoving = length > 1e-5;
      if(motion.update(dt,clock,isMoving)){isMoving=false;return;}
      const running=isMoving;
      const moveSpeed=companions.mountSubject ? companions.rideSpeed(dt,running,isMoving)
        : navigation.PLAYER_MOTION.runSpeed;
      if (isMoving) {
        if(overview)setOverview(0);
        forward /= length; side /= length;
        const vx = (side * Math.cos(yaw) - forward * Math.sin(yaw)) * moveSpeed * dt;
        const vz = (-forward * Math.cos(yaw) - side * Math.sin(yaw)) * moveSpeed * dt;
        const position = player.root.position;
        const fromX=position.x,fromZ=position.z;
        if (!blocked(position.x + vx, position.z) && companions.canRideTo(position.x+vx,position.z,player.root.rotation.y)) position.x += vx;
        if (!blocked(position.x, position.z + vz) && companions.canRideTo(position.x,position.z+vz,player.root.rotation.y)) position.z += vz;
        const facing = Math.atan2(vx, vz);
        const difference = Math.atan2(Math.sin(facing - player.root.rotation.y), Math.cos(facing - player.root.rotation.y));
        const nextYaw=player.root.rotation.y+difference*Math.min(1,dt*12);
        if(companions.canRideTo(position.x,position.z,nextYaw))player.root.rotation.y=nextYaw;
        isMoving=Math.hypot(position.x-fromX,position.z-fromZ)>1e-7;
        if(isMoving&&!companions.mountSubject&&motion.action!=='jump')world.landscape?.trackWalk(fromX,fromZ,position.x,position.z,clock);
        if(isMoving)footsteps += dt;
        if (footsteps > .40) { footsteps = 0; audio && audio.step(); }
      }
      player.root.position.y=groundHeight(player.root.position.x,player.root.position.z);
      if(companions.mountSubject)return;
      if(!motion.pose(running)){player.hideProps();player.pose(clock,isMoving);}
    }
    let nextBackdropFrame=0, nextWorshipperPose=0;
    let frameCount=0,fpsTime=performance.now(),measuredFPS=0,nextPromptUpdate=0;
    let windowLongest=0,windowOver50=0,lastFrameWindow={longestMs:0,over50ms:0};
    function frame(now) {
      requestAnimationFrame(frame);
      if(!pageVisible)return;
      if(paused && now<nextBackdropFrame)return;
      if(paused)nextBackdropFrame=now+(started?250:100);
      const frameMs=Math.max(0,now-lastTime);
      const dt=Math.min(frameMs/1000,.05);lastTime=now;
      if(started&&!paused){windowLongest=Math.max(windowLongest,frameMs);if(frameMs>50)windowOver50++;}
      if(!pageVisible)return;
      if (!paused && pageVisible) {
        for(const door of world.architecture.pavilionDoors)door.update(dt,player.root.position,remotes.values());
        clock += dt; updatePlayer(dt);
      }
      audioEnvironment.position=player.root.position;audioEnvironment.indoors=!!navigation.templeIndoorArea(player.root.position.x,player.root.position.z);audioEnvironment.active=started&&!paused;audioEnvironment.weather=ambience?.state.weather||'clear';
      audio?.update(dt,audioEnvironment.active&&insideRitualHall(),audioEnvironment);
      if(network?.canRoam){network.sendState({x:player.root.position.x,z:player.root.position.z,yaw:player.root.rotation.y,action:prayer?(prayer.aligning?'walk':'pray'):rituals.active?rituals.action:roomActivities?.active?roomActivities.action:motion?.action||(isMoving&&!paused?'run':'idle'),progress:prayer?Math.min(1,prayer.time/PRAYER_DURATION):roomActivities?.active?roomActivities.progress:motion?.action?motion.progress:rituals.progress});}
      if (!paused && now>=nextWorshipperPose) {
       nextWorshipperPose=now+50;
       npcs.forEach(npc => {
        if(!npc.root.visible)return;
        const cycle = (clock + npc.phase) % 12.5;
        npc.pose(clock + npc.phase, false, cycle < PRAYER_DURATION ? cycle / PRAYER_DURATION : null);
      });
      }
      if(started&&!paused)guide.update(dt,player.root.position,clock,!prayer&&!rituals.active&&!roomActivities?.isBusy&&!profileOpen&&!guide.isOpen,camera);
      const stormEvent=ambience?.update(dt,started?clock:now/1000,player.root.position,camera.position);if(stormEvent?.thunder&&audioEnvironment.active)audio?.thunder(stormEvent.thunder);
      garden?.update(dt,clock,player.root.position);
      if(started&&!paused){
        companions.update(dt,clock,player.root.position);
        companions.updateRide(dt,clock,player,isMoving,isMoving,(x,z)=>(!onlineMode||network?.canRoam)&&!blocked(x,z));
        pets.update(dt,player.root);
      }
      if (!paused || !started) world.update(started ? clock : now / 1000, dt, started ? player.root.position : null,camera.position,gpuBudget.settings.effects);
      if(started&&!paused){rituals.updateIncense?.(dt);replacementStatue?.updateBlessing?.(dt);}
      playerRing.position.x = player.root.position.x; playerRing.position.z = player.root.position.z;
      playerRing.position.y = player.root.position.y+.017;
      playerRing.material.opacity = prayer ? .18 : .45;
      targetRing.material.opacity = .5 + Math.sin(clock * 2) * .14;
      motion?.render();updateCamera(dt); updateLabels();
      if(now>=nextPromptUpdate){updatePrompt();nextPromptUpdate=now+100;}
      exterior?.focusShadows(camera.position);
      world.landscape?.updateView(camera.position);
      for(const npc of npcs)npc.root.visible=camera.position.distanceToSquared(npc.root.position)<2025;
      camera.updateMatrixWorld();
      chooseRemoteDetail(now);
      const refreshRemoteLabels=remotes.size<=6||now>=nextRemoteLabels;
      if(refreshRemoteLabels)nextRemoteLabels=now+100;
      crowd?.begin();
      for(const r of remotes.values()){
        const root=r.anchor,position=root.position;
        const motionT=r.motionMs?Math.min(1,Math.max(0,(now-r.motionStart)/r.motionMs)):1;
        if(position.x!==r.target.x||position.z!==r.target.z){
          position.lerpVectors(r.from,r.target,motionT);
          position.y=groundHeight(position.x,position.z);
        }
        root.rotation.y=r.fromYaw+Math.atan2(Math.sin(r.yaw-r.fromYaw),Math.cos(r.yaw-r.fromYaw))*motionT;
        const lieStep=dt/navigation.PLAYER_MOTION.transitionSeconds;
        if(r.action==='lie')r.lieBlend=Math.min(1,(r.lieBlend||0)+lieStep);
        else r.lieBlend=r.action==='idle'?Math.max(0,(r.lieBlend||0)-lieStep):0;
        if(r.action==='incense'&&r.progress>.63&&!r.inserted){rituals.insertIncense(navigation.templeIndoorArea(r.target.x,r.target.z)==='tea'?world.rituals.wealthIncense.burner:undefined);r.inserted=true;}if(r.action!=='incense')r.inserted=false;
        if(r.speech&&now>r.speech.expires){r.speech.element.remove();r.speech=null;}
        const visible=mayShowRemote(r), actor=r.detail;
        root.visible=visible;
        if(!visible){r.label.hidden=true;if(r.speech)r.speech.element.hidden=true;continue;}
        const jumpHeight=r.action==='jump'?navigation.templeJumpHeight(Math.min(1,r.progress+(clock-(r.receivedAt??clock))/navigation.PLAYER_MOTION.jumpSeconds)):0;
        const lounging=r.action==='read'||r.action==='tea';
        const seat=lounging?layout.seats.find(s=>Math.hypot(s.position[0]-r.target.x,s.position[2]-r.target.z)<.56):null;
        // A freshly created scanned actor deliberately hides its procedural
        // meshes until textures arrive. Keep a colored figure on screen until
        // its actual drawable outfit is ready, including after a reconnect.
        const drawnDetail=actor&&!!actor.root.userData.outfitAsset;
        if(actor){
          actor.root.visible=!!drawnDetail;
          if(!drawnDetail&&now>=(r.pendingRetryAt??0)){r.pendingRetryAt=now+750;actor.pose(0,false);}
        }
        if(drawnDetail){
          actor.root.position.y=jumpHeight;actor.hideProps();
          if(r.action==='woodfish'||r.action==='incense')actor.ritualPose(r.progress*(r.action==='woodfish'?7.2:5.8),r.action,r.progress);
          else if(lounging)actor.loungePose(clock,r.action,r.progress,{seatHeight:seat?.seatHeight??.16});
          else if(r.lieBlend>0)window.TemplePlayerMotion.applySupinePose(actor,clock,r.lieBlend);
          else if(['run','jump','sit','greet'].includes(r.action))actor.freePose(clock,r.action);
          else actor.pose(clock,r.action==='walk',r.action==='pray'?r.progress:null);
          actor.head.getWorldPosition(r.headWorld);
        }else{
          if(!crowd){crowd=createRemoteCrowd();crowd.begin();}
          crowd.draw(r,clock,seat?.seatHeight??.18,jumpHeight);
        }
        if(!refreshRemoteLabels)continue;
        const headPosition=remoteHead.copy(r.headWorld);projected.copy(headPosition);projected.y+=.48;projected.project(camera);headPosition.y+=.25;
        let labelVisible=projected.z<=1&&projected.z>=-1&&Math.abs(projected.x)<.96&&Math.abs(projected.y)<.76&&camera.position.distanceToSquared(headPosition)<676;
        if(labelVisible&&clock>=(r.nextVisibilityCheck||0)){r.nextVisibilityCheck=clock+.20;r.occluded=!!exterior?.state.ready&&exterior.clearDistance(camera.position,headPosition,.08)<camera.position.distanceTo(headPosition)-.12;}
        labelVisible=labelVisible&&!r.occluded;
        if(labelVisible){r.label.style.left=`${(projected.x*.5+.5)*innerWidth}px`;r.label.style.top=`${(-projected.y*.5+.5)*innerHeight}px`;}
        r.label.hidden=!labelVisible||!!r.speech;
        if(r.speech){r.speech.element.hidden=!labelVisible;r.speech.element.style.left=r.label.style.left;r.speech.element.style.top=r.label.style.top;}
      }
      crowd?.end();
      if (toastUntil && clock > toastUntil) { $('toast').classList.remove('visible'); toastUntil = 0; }
      beadReward.update(now);
      if(pageVisible&&!paused)profilePanel?.tick(dt);
      renderer.render(world.scene, camera);
      frameCount++;
      if (now - fpsTime > 1000) { measuredFPS = Math.round(frameCount * 1000 / (now - fpsTime)); frameCount = 0; fpsTime = now;
       lastFrameWindow={longestMs:Math.round(windowLongest),over50ms:windowOver50};
       windowLongest=0;windowOver50=0;
       if(gpuBudget.sample(measuredFPS,now,started&&!paused)){
        const settings=gpuBudget.settings;detailScale=settings.scale;resizeScene();
        renderer.shadowMap.enabled=settings.shadows;
        ambience?.setQuality(settings.effects);
       }
      }
    }
    updateStats(); updateCamera(0, true); updatePrompt(); updateSoundButton();
    // Some loaders settle their Promise after reporting an error. Inspect their
    // real states instead of treating a settled Promise as successful loading.
    decorCoreReady.then(()=>{
      decorCoreLoaded=world.architecture.state.ready===true&&exterior?.state.ready===true&&replacementStatue?.state.ready===true&&replacementStatue.state.guanyinReady===true&&replacementStatue.state.leftStatueReady===true;
      requestHallDecor();
    }).catch(()=>{});
    addEventListener('online',()=>requestHallDecor(true));
    addEventListener('pagehide',event=>{if(!event.persisted){world.architecture?.decor?.dispose();rituals.dispose?.();replacementStatue?.disposeBlessing?.();pets.dispose();}});
    // Read-only diagnostics for reproducible acceptance checks; never alters game state.
    window.templeDiagnostics = () => ({
      motion:motion?.diagnostics(),version:layout.version,groundSource:"shared-mesh-and-structure",
      ready: true, started, paused, identity: { ...identity },floorY:world.floorY??0,
      player: { x: +player.root.position.x.toFixed(3), y:+player.root.position.y.toFixed(3), z: +player.root.position.z.toFixed(3), facing: +player.root.rotation.y.toFixed(3) },
      statue:replacementStatue?{...replacementStatue.state}:null,
      uploadedProps:uploadedProps?{...uploadedProps.state}:null,
      loading:{...TempleAssets.state}, companions:companions.diagnostics(), pets:pets.status(),
      exterior:exterior?{...exterior.state}:null,
      stats: { ...stats }, saveAvailable,
      profile:latestProfile,profileUI:profilePanel?.diagnostics?.(),locale:window.TempleI18n?.locale,roomActivities:roomActivities?.diagnostics?.(),architecture:world.architecture?.state,garden:garden?.state,
      prayer: prayer ? { progress: +(prayer.time / PRAYER_DURATION).toFixed(3), mat: prayer.mat.id } : null,
      ritual:rituals.active?{kind:rituals.active.kind,stage:rituals.active.stage,progress:rituals.progress,strikes:rituals.active.strikes}:null,
      insertedIncense:rituals.inserted,
      network:network?{...network.status,crowd:{detailed:detailCount,...(crowd?.stats()||{figures:0,draws:0})},remotes:[...remotes].map(([id,r])=>({id,x:r.target.x,z:r.target.z,action:r.action,progress:r.progress,speech:r.speech?.element.textContent||null}))}:null,
      nearest: nearest ? { id: nearest.id, npc: nearest.npc } : null,
      mats: world.mats.map(m => ({ id: m.id, x: m.x, z: m.z, npc: m.npc })),
      obstacles: world.obstacles.map(o => ({ ...o })),
      npcCount: npcs.length, worshippers:npcs.map(n=>({mat:n.mat.id,x:n.mat.x,z:n.mat.z})), npcPoses: npcs.map(n => +n.body.rotation.x.toFixed(3)),
      speech: speech ? speech.text : null,
      ambience:ambience?.state,interior:navigation?.templeIndoorArea(player.root.position.x,player.root.position.z),sideRooms:world.sideRooms?.map(r=>r.id),
      camera: { view:['player','temple','island','coast','ceiling'][Number(overview)],mouseLook:dragging?.pointerType==='mouse',lockedPointer:document.pointerLockElement===renderer.domElement,yaw, pitch, distance,obstructed:cameraObstructed,avoidAngle:cameraAvoidAngle,position:camera.position.toArray() },
      audio: audio ? audio.status : null,
      render: { speedMode:'run-only',fps: measuredFPS, frameWindow:lastFrameWindow, pixelRatio:renderer.getPixelRatio(), calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, revision: T.REVISION }
    });
    window.TempleI18n?.onChange(()=>{renderer.domElement.setAttribute('aria-label',t('scene.label'));$('toast').classList.remove('visible');toastUntil=0; refreshViewButton();$('identity').textContent=t('identity',{name:identity.name});updateStats();updatePrompt();updateSoundButton();const n=network?.status;$('save-status').textContent=t(n?.storageAvailable===false?'save.identityUnavailable':n?.pendingComplete?'save.pending':n?.connected?'save.saved':'save.connecting');if(latestProfile)profilePanel?.update(latestProfile,stats,identity); });
    requestAnimationFrame(frame);
  } catch (error) {
    console.error(error);
    fatal(t('fatal.open',{message:error.message}));
  }
})();
;
(function(){'use strict';
 function setup(){
  const game=document.getElementById('game'),motion=document.getElementById('motion-controls');let menu=document.getElementById('temple-menu');
  if(!game||!motion||game.classList.contains('clean-hud'))return;
  if(!menu){menu=document.createElement('details');menu.id='temple-menu';menu.innerHTML='<summary aria-label="游戏菜单">☰</summary><div><a href="https://yinian-quiet-temple.cyw12344321.chatgpt.site/">进入原站联机佛堂</a></div>';const switchMode=menu.querySelector('a');const welcomeMode=document.getElementById('temple-mode-link');switchMode.href=welcomeMode.href;switchMode.target='_top';switchMode.textContent=welcomeMode.textContent;document.querySelector('.top-actions').append(menu);}
  game.classList.add('clean-hud');
  const input=window.TempleTouchInput={x:0,y:0},top=document.querySelector('.top-actions'),content=menu.querySelector(':scope > div');
  const names=document.createElement('button');names.id='player-text-toggle';names.className='icon-button';names.type='button';names.textContent='◉';top.insertBefore(names,menu);
  let showText=false;try{showText=localStorage.getItem('qt_player_text')==='1';}catch{}
  const t=key=>window.TempleI18n?.t(key)||key;
  function renderNames(){game.classList.toggle('hide-player-text',!showText);names.setAttribute('aria-pressed',String(showText));names.setAttribute('aria-label',t(showText?'hud.names.hide':'hud.names.show'));names.title=names.getAttribute('aria-label');}
  names.addEventListener('click',()=>{showText=!showText;renderNames();try{localStorage.setItem('qt_player_text',showText?'1':'0');}catch{}});renderNames();window.TempleI18n?.onChange(renderNames);
  const utility=document.createElement('div');utility.className='clean-menu-utility';
  for(const button of [...top.querySelectorAll(':scope > button')])if(button!==names)utility.append(button);
  const ritual=document.querySelector('.ritual-actions'),stats=document.querySelector('.merit-panel'),language=document.querySelector('.language-picker'),sky=document.querySelector('.ambience-controls');
  const statsDetails=document.createElement('details'),statsTitle=document.createElement('summary');statsTitle.textContent='功德记录';statsDetails.className='clean-menu-stats';statsDetails.append(statsTitle,stats);
  game.append(ritual);content.prepend(utility,statsDetails,language);
  if(sky)top.insertBefore(sky,menu);
  const petControls=top.querySelector('.pet-controls');if(petControls)top.insertBefore(petControls,menu);
  const chat=document.getElementById('chat-form'),chatToggle=document.createElement('button');chatToggle.id='chat-toggle';chatToggle.type='button';chatToggle.textContent='言';chatToggle.setAttribute('aria-label','打开聊天');game.append(chatToggle);
  const chatClose=document.createElement('button');chatClose.id='chat-close';chatClose.type='button';chatClose.textContent='×';chatClose.setAttribute('aria-label','收起聊天');chat.append(chatClose);
  function closeChat(){game.classList.remove('chat-open');document.getElementById('chat-input').blur();}
  chatToggle.addEventListener('click',()=>{game.classList.add('chat-open');document.getElementById('chat-input').focus();});chatClose.addEventListener('click',closeChat);chat.addEventListener('submit',()=>setTimeout(closeChat,0));
  const touch=document.getElementById('touch-controls');touch.replaceChildren();const stick=document.createElement('button');stick.id='touch-joystick';stick.type='button';stick.setAttribute('aria-label','拖动摇杆跑步，松手停止');stick.innerHTML='<span class="stick-up">⌃</span><span class="stick-down">⌄</span><span class="stick-left">‹</span><span class="stick-right">›</span><span class="stick-knob"></span>';touch.append(stick);
  let pointer=null;const reset=()=>{pointer=null;input.x=input.y=0;stick.style.setProperty('--stick-x','0px');stick.style.setProperty('--stick-y','0px');};
  function move(event){const r=stick.getBoundingClientRect(),dx=event.clientX-r.left-r.width/2,dy=event.clientY-r.top-r.height/2,max=r.width*.30,length=Math.hypot(dx,dy),scale=Math.min(1,max/(length||1));stick.style.setProperty('--stick-x',dx*scale+'px');stick.style.setProperty('--stick-y',dy*scale+'px');input.x=length<max*.12?0:dx*scale/max;input.y=length<max*.12?0:dy*scale/max;}
  stick.addEventListener('pointerdown',event=>{if(pointer!==null||!document.getElementById('overlay').hidden)return;event.preventDefault();pointer=event.pointerId;stick.setPointerCapture(pointer);move(event);});
  stick.addEventListener('pointermove',event=>{if(event.pointerId===pointer){event.preventDefault();move(event);}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,event=>{if(event.pointerId===pointer)reset();});
  addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  const overlay=document.getElementById('overlay');function ready(){game.classList.toggle('hud-ready',overlay.hidden);if(!overlay.hidden){reset();document.dispatchEvent(new Event('temple-hud-hidden'));}}
  new MutationObserver(ready).observe(overlay,{attributes:true,attributeFilter:['hidden']});ready();
  menu.addEventListener('toggle',()=>{if(menu.open){reset();document.exitPointerLock?.();}});
  function renderLabels(){menu.querySelector(':scope > summary').setAttribute('aria-label',t('hud.menu'));const admin=menu.querySelector('a[href="/admin.html"]');if(admin)admin.textContent=t('hud.admin');statsTitle.textContent=t('hud.records');chatToggle.textContent=t('chat.icon');chatToggle.setAttribute('aria-label',t('hud.chat.open'));chatClose.setAttribute('aria-label',t('hud.chat.close'));stick.setAttribute('aria-label',t('hud.move'));document.getElementById('interact').dataset.label=t('hud.bow');}
  renderLabels();window.TempleI18n?.onChange(renderLabels);
 }
 if(document.readyState==='interactive'||document.readyState==='complete')setup();
 else document.addEventListener('DOMContentLoaded',setup,{once:true});
})();
