/**
 * Script de mesure d'audience des sites clients (inséré uniquement en production).
 * Sans cookie et sans identifiant : il envoie le chemin de la page, le référent et un indicateur
 * « nouvelle visite » (sessionStorage, effacé à la fermeture de l'onglet), plus les clics sur les
 * liens téléphone / e-mail. Le serveur n'en conserve que des compteurs journaliers.
 */
export function analyticsScript(endpoint: string): string {
  const e = JSON.stringify(endpoint);
  return `(function(){try{if(navigator.webdriver)return;var E=${e};
function send(k,x){var d=JSON.stringify(Object.assign({k:k,p:location.pathname,r:document.referrer},x||{}));
if(navigator.sendBeacon){navigator.sendBeacon(E,d)}else{fetch(E,{method:"POST",body:d,keepalive:true})}}
var n=true;try{n=!sessionStorage.getItem("_v");sessionStorage.setItem("_v","1")}catch(_){}
send("pageview",{n:n});
document.addEventListener("click",function(ev){var a=ev.target&&ev.target.closest?ev.target.closest("a"):null;if(!a)return;
var h=a.getAttribute("href")||"";if(h.indexOf("tel:")===0)send("call");else if(h.indexOf("mailto:")===0)send("email")},true)
}catch(_){}})();`;
}
