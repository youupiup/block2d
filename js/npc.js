//npc
var Npc = function () {
    var talkDiv = document.getElementById('talk'),
    talkMsg = document.getElementById('talkMsg');
    var talk = function (msg) {
        talkDiv.style.display = 'block';
        talkMsg.innerHTML = msg;
    }
    var noTalk = function(){
        talkDiv.style.display = 'none';
    }
    this.talk = talk;
    this.noTalk = noTalk;
}