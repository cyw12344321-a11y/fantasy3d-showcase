/* Content-versioned model cache. Player saves and API responses never enter it. */
(function () {
 'use strict';
 const revisions=window.TEMPLE_ASSET_REVISIONS||{},parts=window.TEMPLE_ASSET_PARTS||{},pending=new Map(),queue=[];
 const pieceSizes=new Map(Object.values(parts).flatMap(p=>p.pieces.map(p=>[p.path,p.bytes])));
 const state={hits:0,downloads:0,errors:0,cacheAvailable:true,active:0,peak:0,retries:0};
 const assetBase=new URL('assets/',document.baseURI).pathname;const cacheName='quiet-temple-models-v1:'+assetBase;
 let cachePromise,writesSinceTrim=0,trimPending=false;
 function url(path){const u=new URL(path,location.href),revision=revisions[u.pathname];if(u.origin===location.origin&&revision)u.searchParams.set('v',revision);return u.href;}
 async function cache(){try{const c=await(cachePromise??=(window.isSecureContext&&window.caches?caches.open(cacheName):Promise.resolve(null)));if(!c)state.cacheAvailable=false;return c;}catch(_){state.cacheAvailable=false;return null;}}
 async function trim(c){
  if(trimPending || (writesSinceTrim++ % 32)!==0)return;
  trimPending=true;
  try{const keys=await c.keys();await Promise.all(keys.slice(0,Math.max(0,keys.length-160)).map(key=>c.delete(key)));}catch(_){}finally{trimPending=false;}
 }
 function drain(){while(state.active<4&&queue.length){const job=queue.shift();state.active++;state.peak=Math.max(state.peak,state.active);job.run().then(job.resolve,job.reject).finally(()=>{state.active--;drain();});}}
 function scheduled(run){return new Promise((resolve,reject)=>{queue.push({run,resolve,reject});drain();});}
 async function fetchAsset(path){
  const target=url(path),u=new URL(target);
  // Only our build's immutable assets may use the persistent model cache.
  if(u.origin!==location.origin||!u.pathname.startsWith(assetBase)||!revisions[u.pathname])return fetch(target);
  if(pending.has(target))return(await pending.get(target)).clone();
  const job=(async()=>{
   const c=await cache();
   if(c){try{const hit=await c.match(target);if(hit?.ok){state.hits++;return hit;}}catch(_){state.cacheAvailable=false;}}
   if(parts[u.pathname]){
    const spec=parts[u.pathname],pieces=await Promise.all(spec.pieces.map(async p=>new Uint8Array(await(await fetchAsset(p.path)).arrayBuffer())));
    const bytes=new Uint8Array(spec.bytes);let offset=0;
    for(let i=0;i<pieces.length;i++){if(pieces[i].length!==spec.pieces[i].bytes)throw Error('Incomplete model piece');bytes.set(pieces[i],offset);offset+=pieces[i].length;}
    if(offset!==spec.bytes)throw Error('Incomplete model');
    return new Response(bytes,{headers:{'Content-Type':'application/octet-stream'}});
   }
   return scheduled(async()=>{
    let response,bytes;
    for(let attempt=0;attempt<3;attempt++){
     const controller=new AbortController();let timer;
     const progress=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(new Error('Resource stalled: '+u.pathname)),[30000,45000,60000][attempt]);};
     try{
      // A stalled intermediary cache must not receive the identical retry URL.
      // Successful bytes still use the canonical revision key in our own cache.
      const retryURL=new URL(target);if(attempt){state.retries++;retryURL.searchParams.set('templeRetry',Date.now().toString(36)+'-'+attempt);}
      bytes=null;progress();response=await fetch(retryURL.href,{signal:controller.signal,...(attempt?{cache:'reload'}:{})});
      if(response.ok){
       // A slow but progressing transfer is healthy. Time out stalls, not size.
       if(response.body){const reader=response.body.getReader(),chunks=[];let size=0;
        for(;;){const part=await reader.read();if(part.done)break;chunks.push(part.value);size+=part.value.byteLength;progress();}
        bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
       }else bytes=await response.arrayBuffer();
      }
      clearTimeout(timer);
      if(response.ok&&pieceSizes.has(u.pathname)&&bytes.byteLength!==pieceSizes.get(u.pathname))throw Error('Incomplete model piece: '+u.pathname);
      if(response.status<500||attempt===2)break;
     }catch(error){clearTimeout(timer);if(attempt===2)throw error;}
    }
    if(!response?.ok)throw Error('Resource '+u.pathname+' unavailable ('+(response?.status??'network')+')');
    if(pieceSizes.has(u.pathname)&&bytes.byteLength!==pieceSizes.get(u.pathname))throw Error('Incomplete model piece: '+u.pathname);
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html'))throw Error('Resource returned a page: '+u.pathname);
    // Finish the transfer in the queue so large downloads do not all compete.
    const headers=new Headers(response.headers);headers.delete('content-encoding');headers.delete('content-length');
    const complete=new Response(bytes,{status:response.status,headers});state.downloads++;
    if(c){try{await c.put(target,complete.clone());void trim(c);}catch(_){state.cacheAvailable=false;}}
    return complete;
   });
  })();pending.set(target,job);
  try{return(await job).clone();}catch(error){state.errors++;throw error;}finally{pending.delete(target);}
 }
 async function texture(T,path){const response=await fetchAsset(path);if(!response.ok)throw Error('Texture unavailable: '+path);const blob=URL.createObjectURL(await response.blob());try{return await new T.TextureLoader().loadAsync(blob);}finally{URL.revokeObjectURL(blob);}}
 const yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0));
 window.TempleAssets={url,fetch:fetchAsset,texture,yieldFrame,state};
})();
;
/* Japanese and Korean player-interface translations. No remote language service. */
(function(){'use strict';
 const core={
 'ceiling.look':['藻井を見上げる','조정 천장 올려다보기'],
 'ceiling.return':['人物視点に戻る','캐릭터 시점으로 돌아가기'],
 'exterior.overview':['視点切替：人物・お堂・島・海岸','시점 전환: 캐릭터, 법당, 섬, 해안'],
 'exterior.coastView':['海岸の眺め · 人物視点に戻る','해안 전망 · 캐릭터 시점으로 돌아가기'],
 'exterior.explore':['島を散策 · お堂で礼拝できます','섬 산책 · 법당 안에서 예불할 수 있어요'],
 'exterior.ramp':['草の斜面を歩いて、砂浜と海へ','풀밭을 따라 모래사장과 바다로 걸어가세요'],
 'exterior.path':['草原を歩いて、海辺の休憩所へ','풀밭을 지나 바닷가 쉼터로 가세요'],
 'exterior.shore':['砂浜を散策できます。深い海には入れません','모래사장을 산책하세요. 깊은 바다는 지나갈 수 없어요'],
 'exterior.return':['前庭と山門を通ってお堂へ戻れます','앞마당과 문을 지나 법당으로 돌아가세요'],
 'title':['一念 静心仏堂｜無料の島の仏堂ゲーム','일념 고요한 법당 | 무료 섬 법당 게임'],
 'about.link':['ゲーム紹介・共有','게임 소개 및 공유'],
 'brand':['静心仏堂','고요한 법당'],'seal':['一念','일념'],'subtitle':['ゆっくり、今ここに。','천천히, 지금 이 순간에.'],
 'game.label':['静心仏堂ゲーム','고요한 법당 게임'],'scene.label':['仏堂の3D画面','법당 3D 화면'],
 'sound.toggle':['音声','소리'],'sound.on':['音声をオン','소리 켜기'],'sound.off':['音声をオフ','소리 끄기'],'sound.unavailable':['このブラウザでは音声を再生できません','이 브라우저에서는 소리를 재생할 수 없어요'],
 'help':['遊び方','조작 안내'],'help.label':['操作説明を開く','조작 안내 열기'],'pause':['一時停止','일시 정지'],
 'merit.label':['礼拝の記録','예불 기록'],'merit.eyebrow':['積み重ねた善い心','차곡차곡 쌓인 선한 마음'],'merit':['功徳','공덕'],'worship':['礼拝','예불'],'times':['回','회'],'incense':['お香','향'],
 'identity.loading':['ご縁を結んでいます…','인연을 맺는 중…'],'identity':['あなたの法名は「{name}」· 穏やかに歩みましょう','당신의 법명은 「{name}」 · 평온하게 걸어요'],'player.you':['{name} · あなた','{name} · 나'],'you':['あなた','나'],'guest':['参拝者','참배객'],
 'save.connecting':['修行記録に接続しています…','수행 기록에 연결하는 중…'],'save.saved':['累計の功徳を保存しました','누적 공덕이 저장되었어요'],'save.pending':['このひとときを保存しています…','이 순간을 저장하는 중…'],'save.identityUnavailable':['このブラウザでは識別情報を保持できず、次回記録を復元できない場合があります','이 브라우저는 식별 정보를 보관할 수 없어 다음에 기록을 복원하지 못할 수 있어요'],
 'activities':['お堂でできること','법당 활동'],'practice.icon':['木','목'],'practice':['修行','수행'],'practice.note':['木魚をたたき、心静かに','목탁을 두드리며 마음을 가라앉혀요'],'incense.icon':['香','향'],'offer':['お香','분향'],'offer.note':['お香を供え、手を合わせる','향을 올리고 합장해요'],
 'online.solo':['ひとりで静かに','혼자 조용히'],'online.local':['ひとり用 · 一緒に遊ぶには公開版へ','혼자 플레이 · 함께하려면 공개 게임으로 접속하세요'],'online.mode':['みんなの仏堂','함께하는 법당'],'online.connecting':['みんなの仏堂へ接続中…','법당에 연결하는 중…'],'online.retry':['接続が切れました · 再接続中','연결이 끊겼어요 · 다시 연결하는 중'],'online.counting':['集計中','집계 중'],'online.status':['仏堂 {room} · 同室 {players}/50 · 接続中 {online}','법당 {room} · 같은 방 {players}/50 · 접속 중 {online}'],
 'chat.icon':['言','말'],'chat.label':['小さなお坊さんの頭上に表示する言葉','꼬마 스님 머리 위에 표시할 말'],'chat.placeholder':['やさしいひと言を…','따뜻한 한마디를…'],'chat.send':['言葉を送る','말 보내기'],'chat.wait':['送信できませんでした。接続の回復をお待ちください','메시지를 보내지 못했어요. 다시 연결될 때까지 기다려 주세요'],
 'controls.move':['移動','이동'],'controls.bow':['礼拝','예불'],'controls.camera':['左ドラッグで視点操作','왼쪽 버튼을 누르고 드래그해 시점 조절'],'controls.chat':['チャット','채팅'],'controls.space':['E / スペース','E / 스페이스'],'controls.walk':['自由に歩く','자유롭게 걷기'],'controls.complete':['礼拝を終える','예불 마치기'],'controls.headChat':['頭上に言葉を表示','머리 위에 말 표시'],'controls.forward':['前へ','앞으로'],'controls.left':['左へ','왼쪽으로'],'controls.back':['後ろへ','뒤로'],'controls.right':['右へ','오른쪽으로'],
 'welcome.title':['お堂で、ひと休み。','법당에서 잠시 쉬어 가요.'],'welcome.copy':['木のぬくもり、やわらかな灯り。\n空いた座布団に近づき、手を合わせて礼拝しましょう。','따스한 나무 향과 은은한 등불.\n빈 방석에 다가가 합장하고 예불해 보세요.'],'welcome.enter':['お堂に入る','법당 들어가기'],'welcome.footnote':['アルパカに乗って経蔵の外壁に沿って裏へ回ると、ひまわり畑に出ます。\n功徳はゲーム内の記録です。穏やかなひとときを。','알파카를 타고 장경각 바깥 벽을 따라 뒤로 돌아가면 해바라기밭이 나와요.\n공덕은 게임 내 기록이에요. 평온한 시간을 보내세요.'],
 'help.title':['ひと呼吸ずつ、ゆっくりと。','한 호흡씩, 천천히.'],'pause.title':['ひと休みして、また歩こう。','잠시 쉬고 다시 걸어요.'],
 'help.copy':['パソコンはWASD、スマートフォンは左下のスティックで走ります。離すと止まります。スペースでジャンプ、Cで座る、Zで仰向けに寝ます。移動すると立ち上がります。空いた座布団のそばでEを押すと礼拝します。マウスの左ボタンを押しながらドラッグすると視点を操作できます。カーソルは常に表示されます。ホイールで距離を調整、Escで一時停止。Enterで頭上に表示する言葉を入力できます。','컴퓨터에서는 WASD, 휴대폰에서는 왼쪽 아래 조이스틱으로 달리고 놓으면 멈춥니다. 스페이스로 점프, C로 앉기, Z로 반듯이 눕기. 이동하면 일어납니다. 빈 방석 근처에서 E를 누르면 예불해요. 마우스 왼쪽 버튼을 누르고 드래그해 시점을 조절하세요. 커서는 항상 표시됩니다. 휠로 거리를 조절하고 Esc로 일시 정지해요. Enter를 누르면 머리 위에 표시할 말을 입력할 수 있어요.'],
 'pause.copy':['灯りをともして待っています。準備ができたら、またどうぞ。','등불을 켜 두고 기다릴게요. 준비되면 계속하세요.'],'welcome.resume':['続ける','계속하기'],
 'prompt.save':['功徳を保存中','공덕 저장 중'],'prompt.save.note':['保存が終わるまでお待ちください','기록을 저장할 때까지 기다려 주세요'],'prompt.walking':['仏前へ向かっています','불상 앞으로 가는 중'],'prompt.woodfish':['木魚をたたいています','목탁을 두드리는 중'],'prompt.incense':['お香を供えています','향을 올리는 중'],'prompt.ritual.note':['しばらくお待ちください。作法は自動で終わります','잠시 머물러 주세요. 의식은 자동으로 끝나요'],'prompt.praying':['礼拝中','예불 중'],'prompt.praying.note':['移動するか別の動作を選ぶまで礼拝を続けます','움직이거나 다른 동작을 선택할 때까지 계속 절해요'],'prompt.busy':['この座布団は使用中です','이 방석은 사용 중이에요'],'prompt.busy.note':['空いた座布団を選び、ゆっくり歩きましょう','빈 방석을 골라 천천히 걸어가세요'],'prompt.near':['合掌 · 礼拝','합장 · 예불'],'prompt.near.note':['礼拝を1回終える · 功徳 +10','예불 한 번 완료 · 공덕 +10'],'prompt.find':['空いた座布団へ近づく','빈 방석에 다가가세요'],'prompt.find.note':['中央の列に空いた座布団があります','가운데 줄에 빈 방석이 있어요'],'prompt.initial.note':['仏像の前へ、ゆっくり進みましょう','불상 앞으로 천천히 걸어가세요'],
 'prayer.hands':['手を合わせる','차분히 합장'],'prayer.lower':['ゆっくり礼をする','천천히 절하기'],'prayer.still':['心静かに礼拝','고요히 예불'],'prayer.rise':['ゆっくり立ち上がる','천천히 일어나기'],'prayer.complete':['礼拝を終えました','예불을 마쳤어요'],'prayer.breath':['ひと呼吸、またひと呼吸。心穏やかに。','들이쉬고 내쉬며 마음을 편안하게.'],'prayer.woodfish':['木魚で静かなひととき','목탁 명상'],'prayer.incense':['お香を供え、合掌','분향과 합장'],
 'notice.woodfish':['木魚のそばへ、ゆっくり歩きましょう','목탁 앞으로 천천히 걸어가세요'],'notice.incense':['仏前へ進み、お香を供えましょう','불상 앞으로 가서 향을 올려요'],'notice.saving':['作法を終えました。功徳を保存中','의식을 마쳤어요. 공덕을 저장하는 중'],'notice.prayerSaving':['礼拝を終えました。功徳を保存中','예불을 마쳤어요. 공덕을 저장하는 중'],'notice.saved':['記録しました · {action}','기록했어요 · {action}'],'notice.practiceComplete':['修行を終えました','수행을 마쳤어요'],'notice.incenseComplete':['お香を供えました','향을 올렸어요'],'notice.woodfishReward':['木魚の修行を終えました · 功徳 +8','목탁 수행 완료 · 공덕 +8'],'notice.incenseReward':['お香を供えました · お香 +1 · 功徳 +5','분향 완료 · 향 +1 · 공덕 +5'],'notice.prayerReward':['礼拝を終えました · 功徳 +10 · お香 +1','예불 완료 · 공덕 +10 · 향 +1'],'notice.sessionOnly':['（今回の記録）','(이번 접속 기록)'],'notice.reconnected':['再接続しました。累計の功徳は保持されています','다시 연결되었어요. 누적 공덕은 그대로예요'],'notice.noMat':['まず空いた座布団に近づいてください','먼저 빈 방석에 다가가 주세요'],'notice.matTaken':['この座布団は使用中です。空いた場所を選んでください','이 방석은 사용 중이에요. 빈자리를 골라 주세요'],'notice.noPath':['今は通れません。少し場所を変えてお試しください','지금은 지나갈 수 없어요. 조금 이동한 뒤 다시 시도해 주세요'],
 'error.generic':['今は実行できません。後でもう一度お試しください','지금은 완료할 수 없어요. 잠시 후 다시 시도해 주세요'],'error.invalid_visitor':['ページを再読み込みして、記録に再接続してください。','페이지를 새로고침해 저장 기록에 다시 연결해 주세요.'],'error.invalid_room':['部屋名は英数字・ハイフン・アンダースコアの1〜32文字です。','방 이름은 영문, 숫자, 하이픈, 밑줄을 사용해 1~32자로 입력해 주세요.'],'error.invalid_appearance':['キャラクターの色の形式が正しくありません。','캐릭터 색상 형식이 올바르지 않아요.'],'error.server_full':['仏堂は満員です。しばらくしてからお越しください。','법당이 가득 찼어요. 잠시 후 다시 와 주세요.'],'error.room_full':['このお堂には50人います。自動振り分けをご利用ください。','이 법당에는 50명이 있어요. 자동 방 배정을 이용해 주세요.'],'error.join_retry':['入場が混み合っています。少しお待ちください。','입장이 혼잡해요. 잠시 후 다시 시도해 주세요.'],
 'error.invalid_complete':['礼拝のリクエストが正しくありません。','예불 요청 형식이 올바르지 않아요.'],'error.not_started':['最初から作法を始めてください。','의식을 처음부터 시작해 주세요.'],'error.too_early':['まだ作法の途中です。しばらくお待ちください。','아직 의식이 진행 중이에요. 잠시 기다려 주세요.'],'error.wrong_place':['正しい場所で作法を終えてください。','알맞은 장소에서 의식을 마쳐 주세요.'],'error.already_completed':['この作法は記録済みです。次の作法を始めてください。','이 의식은 이미 기록되었어요. 새로운 의식을 시작해 주세요.'],'error.invalid_state':['移動情報の形式が正しくありません。','이동 정보 형식이 올바르지 않아요.'],'error.speed':['移動が速すぎたため、位置を戻しました。','이동 속도가 너무 빨라 이전 위치로 돌아갔어요.'],'error.busy':['ここでは礼拝中です。お待ちいただくか別の場所へどうぞ。','이곳에서는 예불 중이에요. 기다리거나 다른 곳을 골라 주세요.'],'error.action_position':['まず座布団・木魚・香炉の正しい位置へ近づいてください。','먼저 방석, 목탁 또는 향로의 알맞은 위치로 다가가 주세요.'],
 'error.invalid_chat':['メッセージの形式が正しくありません。','메시지 형식이 올바르지 않아요.'],'error.empty_chat':['やさしいひと言を入力してください。','따뜻한 한마디를 입력해 주세요.'],'error.chat_rate':['次のメッセージまで2秒お待ちください。','다음 메시지를 보내기 전에 2초만 기다려 주세요.'],'error.session_expired':['記録への接続が切れました。もう一度お入りください。','저장 기록 연결이 만료되었어요. 다시 입장해 주세요.'],'error.sync_rate':['操作が多すぎます。少しお待ちください。','조작이 너무 잦아요. 잠시 기다려 주세요.'],'error.invalid_session':['接続情報が正しくありません。','연결 정보가 올바르지 않아요.'],'error.method':['リクエスト方法が正しくありません。','요청 방식이 올바르지 않아요.'],'error.origin':['ゲームのページからお入りください。','게임 페이지에서 접속해 주세요.'],'error.storage_unavailable':['記録に接続できません。もう一度お試しください。','저장 기록에 연결할 수 없어요. 다시 시도해 주세요.'],'error.too_large':['リクエストが大きすぎます。','요청이 너무 커요.'],'error.json':['リクエストの形式が正しくありません。','요청 형식이 올바르지 않아요.'],'error.not_found':['この仏堂の入口はありません。','이 법당 입구는 존재하지 않아요.'],'error.storage_busy':['仏堂が混み合っています。後でもう一度お試しください。','법당이 혼잡해요. 잠시 후 다시 시도해 주세요.'],
 'error.invalid_equip':['僧衣のリクエストが正しくありません。もう一度お試しください。','승복 요청이 올바르지 않아요. 다시 시도해 주세요.'],'error.outfit_locked':['この僧衣を解放するには、さらに功徳が必要です。','이 승복을 해제하려면 공덕이 더 필요해요.'],'error.invalid_rename':['法名の変更リクエストが正しくありません。','법명 변경 요청이 올바르지 않아요.'],'error.invalid_name':['法名は漢字2文字です。空白・数字・絵文字は使えません。','법명은 한자 두 글자여야 해요. 공백, 숫자, 이모지는 사용할 수 없어요.'],'error.rename_used':['法名を変更できる1回の機会は使用済みです。','한 번뿐인 법명 변경 기회를 이미 사용했어요.'],'error.invalid_blessings':['確認リクエストが正しくありません。もう一度お試しください。','확인 요청이 올바르지 않아요. 다시 시도해 주세요.'],
 'fatal.missing':['仏堂を読み込めませんでした。接続を確認して再読み込みしてください。','법당을 불러오지 못했어요. 연결을 확인하고 다시 불러와 주세요.'],'fatal.open':['仏堂を開けませんでした。ブラウザが WebGL 2 に対応していることを確認して再試行してください。詳細：{message}','법당을 열지 못했어요. 브라우저가 WebGL 2를 지원하는지 확인하고 다시 시도해 주세요. 상세: {message}'],
 'welcome.line1':['木のぬくもり、やわらかな灯り。','따스한 나무 향과 은은한 등불.'],'welcome.line2':['空いた座布団に近づき、手を合わせて礼拝しましょう。','빈 방석에 다가가 합장하고 예불해 보세요.'],'welcome.field':['アルパカに乗って経蔵の外壁に沿って裏へ回ると、ひまわり畑に出ます。','알파카를 타고 장경각 바깥 벽을 따라 뒤로 돌아가면 해바라기밭이 나와요.'],'welcome.points':['功徳はゲーム内の記録です。穏やかなひとときを。','공덕은 게임 내 기록이에요. 평온한 시간을 보내세요.'],'meta.description':['小さなお坊さんになって、島の仏堂を散策。礼拝、木魚、お香や読経、お茶を楽しめます。功徳は累計で保存されます。','꼬마 스님이 되어 섬의 법당을 산책해 보세요. 예불, 목탁, 분향, 독경과 차 한 잔을 즐길 수 있어요. 누적 공덕은 저장됩니다.'],
 'room.drinking':['座ってお茶を楽しむ','앉아서 차 마시기'],'room.reading':['心静かに読経','조용히 독경'],'room.activityHelp':['読経・別の経文・立ち上がるボタンをご利用ください','독경, 다른 경전 또는 일어나기 버튼을 이용하세요'],'room.scripture':['蔵経室 · 静かな読経','장경실 · 고요한 독경'],'room.tea':['招福殿 · 財神に礼拝','재물전 · 재신 예불'],'room.return':['開いた扉から本堂へ戻ると、礼拝や修行ができます','열린 문을 지나 큰 법당으로 돌아가면 예불과 수행을 할 수 있어요'],
 'controls.look':['左ドラッグで視点 · ホイールで距離 · Escで一時停止','왼쪽 드래그로 시점 · 휠로 거리 · Esc로 일시 정지'],'language':['言語','언어'],'language.auto':['自動（地域）','자동(지역)'],
 'hud.menu':['メニュー','메뉴'],'hud.admin':['管理画面','관리자'],'hud.privacy':['アクセス統計について','방문 통계 안내'],'hud.metrics.off':['アクセス統計はオフです','방문 통계 꺼짐'],'hud.metrics.disable':['匿名アクセス統計をオフにする','익명 방문 통계 끄기'],'hud.announcement.close':['お知らせを閉じる','공지 닫기'],'hud.names.hide':['頭上の文字と案内を隠す','머리 위 이름과 안내 숨기기'],'hud.names.show':['頭上の文字と案内を表示','머리 위 이름과 안내 표시'],'hud.records':['功徳の記録','공덕 기록'],'hud.chat.open':['チャットを開く','채팅 열기'],'hud.chat.close':['チャットを閉じる','채팅 닫기'],'hud.move':['スティックを動かして移動','조이스틱을 움직여 이동'],'hud.bow':['礼拝','예불']
 };
 Object.assign(core,{'error.invalid_seat':['座席のリクエストが正しくありません。席に近づいてお試しください。','좌석 요청이 올바르지 않아요. 자리로 다가가 다시 시도해 주세요.'],'error.seat_busy':['この席は使用中です。別の空席をお選びください。','이 자리는 사용 중이에요. 다른 빈자리를 골라 주세요.'],'error.seat_required':['先に座ってから読経やお茶をお楽しみください。','먼저 앉은 뒤 경전을 읽거나 차를 마셔 주세요.'],'error.seat_exit_pending':['前の席から離れてから続けてください。','이전 자리에서 나온 뒤 계속해 주세요.'],'error.rest_space':['場所が狭すぎます。平らな空き地へ移動してください。','공간이 부족해요. 넓고 평평한 곳으로 이동해 주세요.']});
 const profile={
 beads:["金色の数珠", "황금 염주"],
 beadEarn:["三回の礼拝を終え、金色の数珠が衣装棚に入りました。", "세 번의 절을 마쳐 황금 염주가 옷장에 들어왔어요."],
 beadNeed:["礼拝を三回終えると獲得（{n}/3）", "절을 세 번 마치면 획득 ({n}/3)"],
 beadStored:["衣装棚に保管中", "옷장에 보관 중"],
 wearBeads:["身につける", "착용"],
 removeBeads:["外す", "벗기"],
 dayPetals:["来訪の蓮の花びら · {n}枚", "방문 연꽃잎 · {n}장"],
 dailyGift:["今日の贈り物は蓮の花びら一枚です。", "오늘의 방문 선물은 연꽃잎 한 장이에요."],
 tryOn:['試着','입어 보기'],fitting:['姿見','피팅 거울'],turnLeft:['左に回る','왼쪽으로 돌기'],turnRight:['右に回る','오른쪽으로 돌기'],walk:['歩く','걷기'],stand:['立ち止まる','멈추기'],loadingRobe:['僧衣を読み込み中…','승복을 불러오는 중…'],previewFailed:['姿見を表示できません。試着を開き直してください。','피팅 거울을 표시할 수 없어요. 다시 열어 주세요.'],
 open:['修行の記録','나의 수행'],close:['閉じる','닫기'],name:['法名','법명'],waiting:['修行記録に接続しています…','수행 기록에 연결하는 중…'],merit:['累計の功徳','누적 공덕'],bows:['礼拝の回数','예불 횟수'],next:['次の僧衣','다음 승복'],left:['あと {n} 功徳','공덕 {n} 더 필요'],all:['すべての僧衣を解放しました','모든 승복을 해제했어요'],wardrobe:['僧衣','나의 승복'],plain:['素心の僧衣','소심 승복'],lotus:['蓮心の僧衣','연심 승복'],cloud:['雲水の僧衣','운수 승복'],golden:['金願の僧衣','금원 승복'],initial:['最初の僧衣','기본 승복'],threshold:['{n} 功徳で解放','공덕 {n}에 해제'],equip:['着る','입기'],equipped:['着用中','착용 중'],locked:['未解放','잠김'],saving:['保存中…','저장 중…'],rename:['法名を変える','법명 변경'],renameHint:['変更は1回のみです。漢字2文字で入力してください。','한 번만 변경할 수 있어요. 한자 두 글자를 입력해 주세요.'],renameUsed:['変更できる機会は使用済みです','변경 기회를 이미 사용했어요'],renameConfirm:['この法名を使います。以後は変更できません。','이 법명을 사용할게요. 이후에는 바꿀 수 없어요.'],renameSubmit:['法名を確定（1回のみ）','법명 확정(한 번만 가능)'],renameInvalid:['漢字2文字を入力し、確認欄にチェックしてください。','한자 두 글자를 입력하고 확인란을 선택해 주세요.'],retry:['保存を確認できませんでした。後でもう一度お試しください。','저장을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'],failed:['完了できませんでした。後でもう一度お試しください。','완료하지 못했어요. 잠시 후 다시 시도해 주세요.'],blessing:['ひとつの善い行い · やさしい蓮の光','작은 선행 · 은은한 연꽃빛'],unlocked:['{robe} を解放しました','{robe} 해제'],note:['僧衣は累計の功徳で解放されます。着用しても功徳は減りません。','승복은 누적 공덕으로 해제돼요. 입어도 공덕은 줄어들지 않아요.'],busy:['作法が終わってから開いてください','의식을 마친 뒤 열어 주세요'],gamePoints:['功徳はゲーム内の記録です','공덕은 게임 내 기록이에요']
 };
 const room={
 read:['読経','독경'],sitRead:['座って読経','앉아서 독경'],sitTea:['座ってお茶','앉아서 차 마시기'],stand:['立ち上がる','일어나기'],library:['蔵経室 · 読書とお茶','장경실 · 독서와 차'],teaRoom:['招福殿 · 財神に礼拝','재물전 · 재신 예불'],garden:['静修の庭 · 読書とお茶','고요한 정원 · 독서와 차'],claiming:['空席を確認しています…','빈자리를 확인하는 중…'],walking:['座る場所へ向かっています…','자리로 천천히 가는 중…'],sitting:['ゆっくり座る','천천히 앉기'],reading:['心静かに読経 · 本を閉じても座ったままです','조용히 독경 · 책을 덮어도 앉아 있어요'],drinking:['お茶をひと口、ひと休み','차 한 모금, 잠시 쉬기'],placing:['湯飲みをそっと戻す','찻잔을 살며시 내려놓기'],standing:['本と湯飲みを片づけ、ゆっくり立ち上がる','책과 찻잔을 정리하고 천천히 일어나기'],exiting:['座席から離れています…','자리에서 나오는 중…'],occupied:['ここは使用中です。ほかの空席をお選びください。','이 자리는 사용 중이에요. 다른 빈자리를 골라 주세요.'],noSeat:['近くに座れる空席がありません。','근처에 알맞은 빈자리가 없어요.'],noPath:['今は通れません。少し場所を変えてお試しください。','지금은 지나갈 수 없어요. 조금 이동한 뒤 다시 시도해 주세요.'],walkBlocked:['出口に人や物があります。少しお待ちください。','앞에 사람이나 물건이 있어요. 잠시 기다린 뒤 일어나 주세요.'],prev:['前のページ','이전 쪽'],next:['次のページ','다음 쪽'],random:['別の経文','다른 경전'],close:['本を閉じる','책 덮기'],source:['原典','원문 출처'],pages:['{a} / {b} ページ','{a} / {b}쪽'],note:['経文は漢文の原典を保持しています。功徳はゲーム内の記録です。','경전은 한문 원문을 그대로 제공합니다. 공덕은 게임 내 기록이에요.'],classical:['漢文の経典を読む','한문 경전 읽기']
 };
 const sky={toggle:['空模様','하늘'],title:['海と空 · 四季','바다와 하늘 · 사계절'],time:['時間帯','시간대'],day:['昼','낮'],sunset:['夕暮れ','해질녘'],night:['夜','밤'],season:['花の季節','꽃의 계절'],spring:['春 · 桜','봄 · 벚꽃'],summer:['夏 · 蓮','여름 · 연꽃'],autumn:['秋 · 金木犀','가을 · 금목서'],winter:['冬 · 梅','겨울 · 매화'],close:['空模様の設定を閉じる','하늘 설정 닫기']};
 const motion={run:['走る','달리기'],jump:['跳ぶ','점프'],sit:['座る','앉기'],lie:['仰向け','눕기'],stand:['立つ','일어나기'],blocked:['狭い場所や急な斜面では休めません。平らな空き地へどうぞ。','이곳은 좁거나 경사가 급해요. 넓고 평평한 곳으로 이동해 주세요.'],greet:['合掌','합장'],lower:['下ろす','내리기'],panel:['キャラクターの動作','캐릭터 동작']};
 const scripture={heart:['般若心経','반야심경'],'diamond-non-abiding':['金剛般若経','금강반야바라밀경'],'diamond-seeing':['金剛般若経','금강반야바라밀경'],'eight-awakenings':['八大人覚経','팔대인각경'],'last-teaching-mind':['仏遺教経','불유교경'],'amitabha-lotus':['阿弥陀経','아미타경']};
 const sections={core,profile,room,sky,motion,scripture};
 const bundles={};for(const [section,rows]of Object.entries(sections)){bundles[section]={ja:{},ko:{}};for(const [key,[ja,ko]]of Object.entries(rows)){bundles[section].ja[key]=ja;bundles[section].ko[key]=ko;}}
 window.TempleLocaleBundles=bundles;
})();
;
/* Small local dictionaries; detection, explicit overrides and fallback follow i18next's documented design. */
(function(){
 'use strict';
 const rows=[
 ['ceiling.look','仰看藻井','仰看藻井','Look up at the caisson'],
 ['ceiling.return','返回角色视角','返回角色視角','Return to player view'],
 ['exterior.overview','切换视角：角色、庙宇、全岛、海岸','切換視角：角色、廟宇、全島、海岸','Cycle views: Player, Temple, Island, Coast'],
 ['exterior.coastView','海岸观景 · 返回角色视角','海岸觀景 · 返回角色視角','Coastal lookout · Return to player view'],
 ['exterior.explore','环岛漫步 · 返回殿内可礼拜','環島漫步 · 返回殿內可禮拜','Island walk · Bow inside the hall'],
 ['exterior.ramp','沿草坡漫步，走向沙滩与大海','沿草坡漫步，走向沙灘與大海','Follow the meadow down to the beach and open sea'],
 ['exterior.path','沿草坡自由漫步，前往海边静修点','沿草坡自由漫步，前往海邊靜修點','Walk across the meadow toward a coastal resting spot'],
 ['exterior.shore','沿沙滩环岛漫步，深水不可通行','沿沙灘環島漫步，深水不可通行','Follow the beach around the island; deep water is blocked'],
 ['exterior.return','穿过石台前院和庙门，即可回到佛堂','穿過石臺前院和廟門，即可回到佛堂','Return through the open forecourt and main entrance'],
 ['title','一念静心佛堂｜免费海岛佛堂小游戏','一念靜心佛堂｜免費海島佛堂小遊戲','Yinian Quiet Temple | Free island temple game'],
 ['about.link','游戏介绍与分享','遊戲介紹與分享','About and share'],
 ['brand','静心佛堂','靜心佛堂','Quiet Temple'],['seal','一念','一念','Still'],['subtitle','慢下来，安住此刻','慢下來，安住此刻','Slow down. Be here.'],
 ['game.label','静心佛堂游戏','靜心佛堂遊戲','Quiet Temple game'],['scene.label','佛堂三维画面','佛堂三維畫面','3D temple hall'],
 ['sound.toggle','声音开关','聲音開關','Sound'],['sound.on','开启声音','開啟聲音','Enable sound'],['sound.off','关闭声音','關閉聲音','Mute sound'],['sound.unavailable','当前浏览器不支持声音','目前瀏覽器不支援聲音','Sound is unavailable in this browser'],
 ['help','操作说明','操作說明','How to play'],['help.label','查看操作说明','查看操作說明','View controls'],['pause','暂停','暫停','Pause'],
 ['merit.label','礼拜计数','禮拜計數','Worship record'],['merit.eyebrow','一路累计的善念','一路累計的善念','Kindness, carried forward'],['merit','功德','功德','Merit'],['worship','礼拜','禮拜','Bows'],['times','次','次',''],['incense','香火','香火','Incense'],
 ['identity.loading','正在结缘…','正在結緣…','Finding your novice monk…'],['identity','你与「{name}」结缘 · 随喜而行','你與「{name}」結緣 · 隨喜而行','You are {name} · Walk with kindness'],['player.you','{name} · 你','{name} · 你','{name} · You'],['you','你','你','You'],['guest','香客','香客','Visitor'],
 ['save.connecting','正在连接累计存档…','正在連接累計存檔…','Connecting to your saved progress…'],['save.saved','累计功德已保存','累計功德已儲存','Cumulative merit saved'],['save.pending','正在保存这份善念…','正在儲存這份善念…','Saving this moment…'],['save.identityUnavailable','当前浏览器无法保留身份，下次可能无法找回','目前瀏覽器無法保留身分，下次可能無法找回','This browser cannot retain your identity; progress may not be recoverable'],
 ['activities','佛堂活动','佛堂活動','Temple activities'],['practice.icon','木','木','♪'],['practice','修行','修行','Practice'],['practice.note','敲木鱼，静心片刻','敲木魚，靜心片刻','Tap the woodfish, find stillness'],['incense.icon','香','香','✧'],['offer','上香','上香','Offer incense'],['offer.note','敬一炷香，合掌礼佛','敬一炷香，合掌禮佛','Offer incense with folded hands'],
 ['online.solo','独自静心','獨自靜心','A quiet moment'],['online.local','独自静心 · 联机请用服务器入口','獨自靜心 · 連線請用伺服器入口','Solo · Use the hosted game to play together'],['online.mode','联网佛堂','連線佛堂','Shared temple'],['online.connecting','正在走入联网佛堂…','正在走入連線佛堂…','Entering the shared temple…'],['online.retry','联机已断开 · 正在重试','連線已中斷 · 正在重試','Disconnected · Reconnecting'],['online.counting','统计中','統計中','counting'],['online.status','佛堂 {room} · 同堂 {players}/50 · 在线 {online}','佛堂 {room} · 同堂 {players}/50 · 線上 {online}','Room {room} · Here {players}/50 · Online {online}'],
 ['chat.icon','言','言','…'],['chat.label','在小沙弥头顶显示的话','在小沙彌頭頂顯示的話','Message above your novice monk'],['chat.placeholder','轻声说一句…','輕聲說一句…','Say something kind…'],['chat.send','显示文字','顯示文字','Send message'],['chat.wait','文字还未发送，请等待连接恢复','文字還未送出，請等待連線恢復','Message not sent. Please wait for the connection.'],
 ['controls.move','移动','移動','Move'],['controls.bow','跪拜','跪拜','Bow'],['controls.camera','左键拖动视角','左鍵拖曳視角','Left-drag to look'],['controls.chat','打字','打字','Chat'],['controls.space','E / 空格','E / 空格','E / Space'],['controls.walk','自由走动','自由走動','Walk freely'],['controls.complete','完成礼拜','完成禮拜','Complete a bow'],['controls.headChat','头顶打字','頭頂打字','Overhead chat'],['controls.forward','向前','向前','Forward'],['controls.left','向左','向左','Left'],['controls.back','向后','向後','Back'],['controls.right','向右','向右','Right'],
 ['welcome.title','来佛堂，歇一歇。','來佛堂，歇一歇。','Rest here for a moment.'],['welcome.copy','木香微暖，灯火长明。\n走近空拜垫，合掌、跪拜，让心慢下来。','木香微暖，燈火長明。\n走近空拜墊，合掌、跪拜，讓心慢下來。','Warm wood, gentle lanterns.\nFind a free cushion, fold your hands and bow.'],['welcome.enter','进入佛堂','進入佛堂','Enter the temple'],['welcome.footnote','骑上羊驼，绕到藏经阁后面，就是向日葵田。\n点数仅为游戏记录，愿每一次停留都平和。','騎上羊駝，繞到藏經閣後面，就是向日葵田。\n點數僅為遊戲紀錄，願每一次停留都平和。','Ride an alpaca around the library to reach the sunflowers behind it.\nPoints are a game record. May your visit be peaceful.'],
 ['help.title','在一呼一吸之间。','在一呼一吸之間。','One breath at a time.'],['pause.title','歇一歇，再出发。','歇一歇，再出發。','Rest, then carry on.'],['help.copy','电脑按 WASD 直接跑步，松键停止；手机拖动左下摇杆直接跑步，松手停止。空格跳跃，C 坐下，Z 仰躺；移动即可起身。走到空拜垫附近按 E 跪拜。按住鼠标左键拖动视角，鼠标始终可见；滚轮调整远近，Esc 暂停。按 Enter 打字，发送后文字会显示在头顶。','電腦按 WASD 直接跑步，鬆鍵停止；手機拖曳左下搖桿直接跑步，鬆手停止。空格跳躍，C 坐下，Z 仰躺；移動即可起身。走到空拜墊附近按 E 跪拜。按住滑鼠左鍵拖曳視角，游標始終可見；滾輪調整遠近，Esc 暫停。按 Enter 打字，送出後文字會顯示在頭頂。','On desktop, WASD runs; release to stop. On mobile, drag the lower-left joystick to run; release to stop. Space to jump, C to sit, Z to lie face up. Move to stand. Press E at a free cushion to bow. Hold the left mouse button and drag to look; the cursor stays visible. Scroll to zoom. Esc pauses. Press Enter to type a message above your novice monk.'],['pause.copy','佛堂为你留了一盏灯。准备好了，就继续。','佛堂為你留了一盞燈。準備好了，就繼續。','A lantern waits for you. Continue when you are ready.'],['welcome.resume','继续礼佛','繼續禮佛','Continue'],
 ['prompt.save','正在保存善念','正在儲存善念','Saving your kindness'],['prompt.save.note','等记录完成，再继续礼佛','等紀錄完成，再繼續禮佛','Please wait for your progress to save'],['prompt.walking','正在前往佛前','正在前往佛前','Walking to the altar'],['prompt.woodfish','正在敲木鱼','正在敲木魚','Tapping the woodfish'],['prompt.incense','正在上香合掌','正在上香合掌','Offering incense'],['prompt.ritual.note','请安住片刻，仪式会自动完成','請安住片刻，儀式會自動完成','Rest a moment; the ritual will finish automatically'],['prompt.praying','礼拜进行中','禮拜進行中','Bowing in progress'],['prompt.praying.note','会一直礼拜，移动或做其他动作即可停下','會一直禮拜，移動或做其他動作即可停下','Bows repeat until you move or choose another action'],['prompt.busy','此处已有香客','此處已有香客','This cushion is occupied'],['prompt.busy.note','请选一方空拜垫，轻声慢行','請選一方空拜墊，輕聲慢行','Choose a free cushion and walk gently'],['prompt.near','合掌 · 跪拜','合掌 · 跪拜','Fold hands · Bow'],['prompt.near.note','完成一次礼拜，功德 +10','完成一次禮拜，功德 +10','Complete a bow · Merit +10'],['prompt.find','走近一方空拜垫','走近一方空拜墊','Approach a free cushion'],['prompt.find.note','中央一列的空拜垫正在等你','中央一列的空拜墊正在等你','Free cushions await in the middle row'],['prompt.initial.note','向佛像前方慢慢走去','向佛像前方慢慢走去','Walk gently towards the Buddha'],
 ['prayer.hands','合掌静心','合掌靜心','Fold your hands'],['prayer.lower','缓缓下拜','緩緩下拜','Bow slowly'],['prayer.still','静心礼拜','靜心禮拜','A quiet bow'],['prayer.rise','缓缓起身','緩緩起身','Rise gently'],['prayer.complete','礼拜圆满','禮拜圓滿','Bow complete'],['prayer.breath','一呼一吸，心念安宁','一呼一吸，心念安寧','Breathe in, breathe out. Be at peace.'],['prayer.woodfish','木鱼静心','木魚靜心','Woodfish meditation'],['prayer.incense','敬香合掌','敬香合掌','Offer incense'],
 ['notice.woodfish','慢慢走向木鱼，静心修行','慢慢走向木魚，靜心修行','Walk gently to the woodfish'],['notice.incense','慢慢走到佛前，敬香合掌','慢慢走到佛前，敬香合掌','Walk gently to offer incense'],['notice.saving','仪式圆满，正在记下这一份善念','儀式圓滿，正在記下這一份善念','Ritual complete. Saving this kindness.'],['notice.prayerSaving','礼拜圆满，正在记下这一份善念','禮拜圓滿，正在記下這一份善念','Bow complete. Saving this kindness.'],['notice.saved','善念已记下 · {action}','善念已記下 · {action}','Kindness saved · {action}'],['notice.practiceComplete','修行圆满','修行圓滿','Practice complete'],['notice.incenseComplete','敬香圆满','敬香圓滿','Incense offered'],['notice.woodfishReward','木鱼修行圆满 · 功德 +8','木魚修行圓滿 · 功德 +8','Woodfish practice complete · Merit +8'],['notice.incenseReward','敬香圆满 · 香火 +1 · 功德 +5','敬香圓滿 · 香火 +1 · 功德 +5','Incense offered · Incense +1 · Merit +5'],['notice.prayerReward','礼拜圆满 · 功德 +10 · 香火 +1','禮拜圓滿 · 功德 +10 · 香火 +1','Bow complete · Merit +10 · Incense +1'],['notice.sessionOnly','（本次记录）','（本次紀錄）',' (this session only)'],['notice.reconnected','已恢复连接，累计功德已保留','已恢復連線，累計功德已保留','Reconnected. Your cumulative merit is safe.'],['notice.noMat','请先走近一方空拜垫','請先走近一方空拜墊','Please approach a free cushion first'],['notice.matTaken','这方拜垫已有香客，请选空位','這方拜墊已有香客，請選空位','This cushion is occupied. Please choose another.'],['notice.noPath','暂时走不过去，请稍微挪开后再试','暫時走不過去，請稍微挪開後再試','The path is blocked. Move a little and try again.'],
 ['error.generic','暂时无法完成，请稍后再试','暫時無法完成，請稍後再試','Unable to complete this now. Please try again.'],['error.invalid_visitor','请刷新页面，重新取得存档身份。','請重新整理頁面，重新取得存檔身分。','Refresh to restore your save identity.'],['error.invalid_room','房间名只支持1至32位字母、数字、短横线或下划线。','房間名稱只支援1至32位字母、數字、短橫線或底線。','Room names use 1–32 letters, numbers, hyphens or underscores.'],['error.invalid_appearance','角色颜色格式不正确。','角色顏色格式不正確。','Invalid character appearance.'],['error.server_full','佛堂目前已满，请稍后再来。','佛堂目前已滿，請稍後再來。','The temple is full. Please visit again shortly.'],['error.room_full','这个佛堂已有50位香客，请使用自动分房。','這個佛堂已有50位香客，請使用自動分房。','This room has 50 visitors. Please use automatic room selection.'],['error.join_retry','入场繁忙，请稍后再试。','入場繁忙，請稍後再試。','The entrance is busy. Please try again.'],['error.invalid_complete','这个礼佛请求格式不正确。','這個禮佛請求格式不正確。','Invalid ritual request.'],['error.not_started','请完整开始这次礼佛。','請完整開始這次禮佛。','Please begin this ritual from the start.'],['error.too_early','这次礼佛尚未完成，请安住片刻。','這次禮佛尚未完成，請安住片刻。','The ritual is still in progress. Please wait a moment.'],['error.wrong_place','请留在对应位置完成礼佛。','請留在對應位置完成禮佛。','Remain at the correct place to complete the ritual.'],['error.already_completed','这次礼佛已经记过分，请开始下一次。','這次禮佛已經記過分，請開始下一次。','This ritual has already been recorded. Begin another when ready.'],['error.invalid_state','移动信息格式不正确。','移動資訊格式不正確。','Invalid movement information.'],['error.speed','移动过快，已保留服务端位置。','移動過快，已保留伺服器位置。','Movement was too fast; your position has been restored.'],['error.busy','这里已有香客正在礼佛，请稍候或换个位置。','這裡已有香客正在禮佛，請稍候或換個位置。','Someone is praying here. Please wait or choose another place.'],['error.action_position','请先走到对应拜垫、木鱼或香炉前。','請先走到對應拜墊、木魚或香爐前。','Approach the correct cushion, woodfish or incense burner first.'],['error.invalid_chat','这句话的格式不正确。','這句話的格式不正確。','Invalid message format.'],['error.empty_chat','请输入一句温和的话。','請輸入一句溫和的話。','Please enter a kind message.'],['error.chat_rate','请隔两秒再说下一句。','請隔兩秒再說下一句。','Please wait two seconds before sending another message.'],['error.session_expired','存档连接已中断，请重新进入。','存檔連線已中斷，請重新進入。','Your save connection expired. Please enter again.'],['error.sync_rate','动作过于频繁，请稍后。','動作過於頻繁，請稍候。','Too many actions. Please wait a moment.'],['error.invalid_session','无效连接。','無效連線。','Invalid connection.'],['error.method','请使用正确的请求方式。','請使用正確的請求方式。','Invalid request method.'],['error.origin','请从游戏本身的页面进入。','請從遊戲本身的頁面進入。','Please enter from the game page.'],['error.storage_unavailable','佛堂存档暂时不可用，请稍后再来。','佛堂存檔暫時無法使用，請稍後再來。','Saved progress is temporarily unavailable. Please try again.'],['error.too_large','请求内容过长。','請求內容過長。','The request is too large.'],['error.json','请求格式不正确。','請求格式不正確。','Invalid request format.'],['error.not_found','这个佛堂入口不存在。','這個佛堂入口不存在。','This temple entrance does not exist.'],['error.storage_busy','佛堂暂时繁忙，请稍后重试。','佛堂暫時繁忙，請稍後重試。','The temple is busy. Please try again shortly.'],
 ['error.invalid_equip','这件僧衣的请求格式不正确。','這件僧衣的請求格式不正確。','This robe request is invalid. Please try again.'],['error.outfit_locked','功德尚未达到这件僧衣的领取条件。','功德尚未達到這件僧衣的領取條件。','Your total merit has not yet unlocked this robe.'],['error.invalid_rename','法号请求格式不正确。','法號請求格式不正確。','The dharma name request is invalid.'],['error.invalid_name','法号须恰好两个汉字，不含空格、数字或表情。','法號須恰好兩個漢字，不含空格、數字或表情。','A dharma name must be exactly two Chinese characters, without spaces, numbers or emoji.'],['error.rename_used','改名机会已经使用。','改名機會已經使用。','Your one name change has already been used.'],['error.invalid_blessings','福缘确认格式不正确。','福緣確認格式不正確。','The blessing acknowledgement is invalid. Please try again.'],
 ['fatal.missing','佛堂场景还没有载入，请检查网络后重新加载。','佛堂場景尚未載入，請檢查網路後重新載入。','The temple scene did not load. Check your connection and reload.'],['fatal.open','佛堂暂时未能打开。请确认浏览器支持 WebGL 2 后重试。详情：{message}','佛堂暫時無法開啟。請確認瀏覽器支援 WebGL 2 後重試。詳情：{message}','The temple could not open. Check that your browser supports WebGL 2 and try again. Details: {message}'],
 ['welcome.line1','木香微暖，灯火长明。','木香微暖，燈火長明。','Warm wood, gentle lanterns.'],['welcome.line2','走近空拜垫，合掌、跪拜，让心慢下来。','走近空拜墊，合掌、跪拜，讓心慢下來。','Find a free cushion, fold your hands and bow.'],['welcome.field','骑上羊驼，绕到藏经阁后面，就是向日葵田。','騎上羊駝，繞到藏經閣後面，就是向日葵田。','Ride an alpaca around the library to reach the sunflowers behind it.'],['welcome.points','点数仅为游戏记录，愿每一次停留都平和。','點數僅為遊戲紀錄，願每一次停留都平和。','Points are a game record. May your visit be peaceful.'],['meta.description','来佛堂歇一歇：随机小沙弥、头顶文字、跪拜、敲木鱼和上香。小沙弥佛堂联机小游戏，功德持续累计保存。','來佛堂歇一歇：隨機小沙彌、頭頂文字、跪拜、敲木魚和上香。小沙彌佛堂連線小遊戲，功德持續累計儲存。','A peaceful shared temple. Walk as a novice monk, bow, tap the woodfish, offer incense and chat. Cumulative merit is saved.'],
 ['room.drinking','静坐品茶','靜坐品茶','Sitting for tea'],['room.reading','静心读经','靜心讀經','Reading quietly'],['room.activityHelp','用读经、换篇或起身按钮继续','用讀經、換篇或起身按鈕繼續','Use the reading, scripture or stand-up buttons'],
 ['room.scripture','藏经室 · 静心阅经','藏經室 · 靜心閱經','Scripture room · Quiet reading'],['room.tea','暴富 · 财神礼拜','暴富 · 財神禮拜','Wealth hall · Prayer'],['room.return','沿敞开的门回到正殿，即可礼拜修行','沿敞開的門回到正殿，即可禮拜修行','Return through the open doorway to bow or practice'],
 ['controls.look','左键拖动视角 · 滚轮远近 · Esc 暂停','左鍵拖曳視角 · 滾輪遠近 · Esc 暫停','Left-drag to look · Scroll to zoom · Esc pauses'],
 ['language','语言','語言','Language'],['language.auto','自动（IP）','自動（IP）','Auto (IP)'],
 ['hud.menu','游戏菜单','遊戲選單','Game menu'],['hud.admin','管理后台','管理後台','Admin'],['hud.privacy','访问统计说明','訪問統計說明','About visit statistics'],['hud.metrics.off','访问统计已关闭','訪問統計已關閉','Visit statistics disabled'],['hud.metrics.disable','关闭匿名访问统计','關閉匿名訪問統計','Disable anonymous visit statistics'],['hud.announcement.close','关闭公告','關閉公告','Close announcement'],['hud.names.hide','隐藏头顶字和提示','隱藏頭頂字和提示','Hide names and hints'],['hud.names.show','显示头顶字和提示','顯示頭頂字和提示','Show names and hints'],['hud.records','功德记录','功德紀錄','Merit record'],['hud.chat.open','打开聊天','開啟聊天','Open chat'],['hud.chat.close','收起聊天','收起聊天','Close chat'],['hud.move','拖动摇杆跑步，松手停止','拖曳搖桿跑步，鬆手停止','Drag joystick to run; release to stop'],['hud.bow','礼拜','禮拜','Bow']
 ];
 rows.push(['error.invalid_seat','座位请求无效，请走近座位后重试。','座位請求無效，請走近座位後重試。','Invalid seat request. Approach the seat and try again.'],['error.seat_busy','这个座位有人，请选择其他空位。','這個座位有人，請選擇其他空位。','This seat is occupied. Choose another seat.'],['error.seat_required','请先入座，再阅读或喝茶。','請先入座，再閱讀或喝茶。','Please sit down before reading or drinking tea.'],['error.seat_exit_pending','请先离开原来的座位，再继续。','請先離開原來的座位，再繼續。','Please leave your previous seat before continuing.'],['error.rest_space','这里空间不足，请换到平坦空地。','這裡空間不足，請換到平坦空地。','There is not enough room. Move to a clear, flat area.']);
 const dictionaries={'zh-CN':{},'zh-TW':{},en:{},ja:{},ko:{}},aliases={};
 for(const [key,cn,tw,en] of rows){dictionaries['zh-CN'][key]=cn;dictionaries['zh-TW'][key]=tw;dictionaries.en[key]=en;aliases[cn]=key;}
 Object.assign(dictionaries,window.TempleLocaleBundles?.core);
 // Preserve translation of an already-open 1.0 welcome label during this update.
 aliases['场景文件不完整，请完整解压后再打开 index.html。']='fatal.missing';
 aliases['正式版 1.0 · 功德持续累计']='welcome.field';
 const KEY='quiet-temple-language-v1',supported=['zh-CN','zh-TW','en','ja','ko'],listeners=new Set();let preferred='auto',locale='en',country=null,source='fallback',requestVersion=0;
 const normalize=value=>/^ja(?:-|$)/i.test(value||'')?'ja':/^ko(?:-|$)/i.test(value||'')?'ko':/^zh(?:-|$)/i.test(value||'')?(/(?:TW|HK|MO|Hant)/i.test(value)?'zh-TW':'zh-CN'):'en';
 const browserLocale=()=>normalize(navigator.languages?.[0]||navigator.language||'en');
 try{const saved=localStorage.getItem(KEY);if(saved==='auto'||supported.includes(saved))preferred=saved;}catch(_){}
 locale=preferred==='auto'?browserLocale():preferred;
 function t(key,args={}){const resolved=aliases[key]||key;const value=dictionaries[locale][resolved]??dictionaries.en[resolved]??key;return String(value).replace(/\{(\w+)\}/g,(all,name)=>Object.hasOwn(args,name)?String(args[name]):all);}
 function apply(){document.documentElement.lang=locale;document.title=t('title');for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);for(const attr of ['title','aria-label','placeholder','content'])for(const el of document.querySelectorAll('[data-i18n-'+attr+']'))el.setAttribute(attr,t(el.getAttribute('data-i18n-'+attr)));const select=document.getElementById('language-select');if(select)select.value=preferred;for(const cb of listeners){try{cb(locale);}catch(e){console.error('Language update failed',e);}}}
 async function detect(){++requestVersion;locale=browserLocale();source='fallback';country=null;apply();return locale;}
 function setLocale(value){if(value!=='auto'&&!supported.includes(value))return Promise.resolve(locale);preferred=value;try{localStorage.setItem(KEY,value);}catch(_){}if(value==='auto')return detect();requestVersion++;locale=value;source='manual';country=null;apply();return Promise.resolve(locale);}
 const api={t,setLocale,onChange(cb){listeners.add(cb);return()=>listeners.delete(cb);},get locale(){return locale;},get country(){return country;},get source(){return source;},get preference(){return preferred;}};
 window.TempleI18n=api;apply();document.getElementById('language-select')?.addEventListener('change',e=>setLocale(e.target.value));api.ready=preferred==='auto'?detect():Promise.resolve(locale);
})();
