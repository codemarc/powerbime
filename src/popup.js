'use strict';
var skey = "PowerBIMe";

$(window).on('load', function () {

  $('#qmrefresh').on('click', (e) => { localStorage.removeItem(skey); chrome.runtime.reload(); });

  $('#qmsettings').on('click', (e) => {
    if ($('#settings').hasClass('uk-hidden')) {
      let s=localStorage.getItem(surl);
      if (s != null)$('#surl').val(s);
      $('#bookmarks').addClass('uk-hidden');
      $('#settings').removeClass('uk-hidden');
    } else {
      $('#bookmarks').removeClass('uk-hidden');
      $('#settings').addClass('uk-hidden');
    }
  });

  $('#qmset').on('click', (e) => {
    localStorage.setItem(surl,$('#surl').val());
  });

  $('#qmclear').on('click', (e) => {
    e.preventDefault();
    $('#surl').val(localStorage.removeItem(surl));
    return false;
  });

  Vue.component('card-item', {
    props: ['card'],
    computed: {
      prefixed: function () {
        let s=localStorage.getItem(surl);
        return ((s==null || s=='')?'http://localhost':s)+this.card.url;
    }
  },
    template: `
      <li>
        <a v-if="card.offsite" :href="prefixed" target="_new">
            {{card.name}}
        </a>
        <a v-else :href="card.url" target="_new">
          {{card.name}}
        </a>
      </li>`
  });

  Vue.component('card', {
    props: ['title', 'content', 'cat'],
    template: `
      <div>
        <div class="uk-card uk-card-default uk-card-body">
          <span v-bind:class="'uk-card-title '+this.cat">{{this.title}}</span>
          <ul class="uk-list">
            <card-item v-for="bookmark in content" :key="bookmark.name" v-bind:card="bookmark"></card-item>
          </ul>
        </div>
      </div>
      `
  });

  new Vue({
    data: {
      name: chrome.runtime.getManifest().name,
      url: chrome.runtime.getManifest().author.info.web,
    }, el: '#identity'
  });

  new Vue({
    data: {
      name: chrome.runtime.getManifest().version,
      url: 'https://chrome.google.com/webstore/detail/qlikme-links/hpbpclohalginomgpnnnalelfnjaeiac',
    }, el: '#version'
  });

  var lsData = localStorage.getItem(skey);
  if (lsData != null) {

    new Vue({
      data: function () { return JSON.parse(lsData); },
      el: '#bookmarks'
    });

  } else {

    firebase.initializeApp(chrome.runtime.getManifest().author.firebase.config);
    firebase.database().ref('/').once('value').then(function (snapshot) {
      new Vue({
        data: function () { return (localStorage.setItem(skey, JSON.stringify(lsData = snapshot.val())), lsData); },
        el: '#bookmarks'
      });
    });

  }

});
