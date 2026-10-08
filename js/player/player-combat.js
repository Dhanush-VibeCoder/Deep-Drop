function hurt(n){if(P.ph!=='play')return;auHurt();if(IS_TOUCH&&navigator.vibrate)navigator.vibrate(25);P.hp-=n;$('dmg').style.opacity=1;setTimeout(()=>$('dmg').style.opacity=0,160)}
