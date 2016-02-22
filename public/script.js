
var cnt = document.getElementById('cnt');
var btn = document.getElementById('btn');
var progress = document.getElementById('progress');
var snackbar = document.getElementById('snackbar');

progress.addEventListener('mdl-componentupgraded', function() {
    this.MaterialProgress.setProgress(clicks);
});

var nub = PUBNUB.init({
    subscribe_key: subscribeKey,
    ssl: true
});

nub.subscribe({
    channel: 'click',
    message: function(m){
        progress.MaterialProgress.setProgress(m);
    }
});

btn.onclick = function() {
    fetch('/click', { method: 'post' })
        .then(function(response) {
            snackbar.MaterialSnackbar.showSnackbar({
                message: 'Thanks!',
                timeout: 2000
            });
        });
}
