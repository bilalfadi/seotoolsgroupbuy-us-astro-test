/**
 * ChatBox widget — matches components/ChatBox.tsx
 */
(function () {
  'use strict';
  var box = document.getElementById('stgb-chatbox');
  if (!box) return;

  var trigger = box.querySelector('.stgb-chatbox__trigger');
  var panel = box.querySelector('.stgb-chatbox__panel');
  var close = box.querySelector('.stgb-chatbox__close');

  function openChat() {
    box.classList.add('is-open');
    panel.hidden = false;
  }
  function closeChat() {
    box.classList.remove('is-open');
    panel.hidden = true;
  }

  trigger && trigger.addEventListener('click', openChat);
  close && close.addEventListener('click', closeChat);
})();
