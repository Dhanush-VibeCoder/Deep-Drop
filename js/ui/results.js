// Match results presentation. Match state, save, and audio remain owned by core/loop.js.
function resultClock(sec){const s=Math.max(0,Math.floor(sec)),m=Math.floor(s/60),r=s%60;return String(m).padStart(2,'0')+':'+String(r).padStart(2,'0')}
function showResults(win){
 const mode=win?'victory':'defeat',diff=['EASY','NORMAL','HARD'][cfg.diff]||'NORMAL';
 $('ov').dataset.mode=mode;$('resultBanner').textContent=win?'LAST DIVER AFLOAT':'DIVER DOWN';$('ovt').textContent=win?'VICTORY':'DEFEAT';$('resultPlace').textContent=win?'1ST PLACE':'ELIMINATED';
 $('ovs').textContent=win?'You outlasted every rival in the deep.':'Your dive is over. Return to the lobby and try again.';
 $('resultKills').textContent=P.kills;$('resultCoins').textContent='+'+P.coins;$('resultTime').textContent=resultClock(T+30);$('resultDifficulty').textContent=diff;$('resultRivals').textContent=cfg.bots;
 $('ctl').style.display='none';$('go').textContent='PLAY AGAIN';$('quit').textContent='BACK TO LOBBY';$('quit').style.display='inline-block';$('setBtn2').style.display='none';$('ov').style.display='flex'
}
