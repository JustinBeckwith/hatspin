
var cnt = document.getElementById('cnt');
var btn = document.getElementById('btn');
var progress = document.getElementById('progress');

progress.addEventListener('mdl-componentupgraded', function() {
    this.MaterialProgress.setProgress(clicks);
});

var nub = PUBNUB.init({
    subscribe_key: subscribeKey
});

nub.subscribe({
    channel: 'click',
    message: function(m){
        progress.MaterialProgress.setProgress(m);
    }
});

btn.onclick = function() {
    fetch('/click', { method: 'post' });
}
