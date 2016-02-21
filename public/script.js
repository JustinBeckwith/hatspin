
var cnt = document.getElementById('cnt');
var btn = document.getElementById('btn');

var nub = PUBNUB.init({
    subscribe_key: subscribeKey
});

nub.subscribe({
    channel: 'click',
    message: function(m){
        console.log(m);
        cnt.innerText = m;
        cnt.style.width = m + "%";
    }
});

btn.onclick = function() {
    fetch('/click', { method: 'post' });
}
