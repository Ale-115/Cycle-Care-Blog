// Simple WYSIWYG editor logic

function execCmd(command, value) {
  if (value) {
    document.execCommand(command, false, value);
  } else {
    document.execCommand(command, false, null);
  }
  document.getElementById('editor').focus();
}

// Auto-generate slug from title
var titleInput = document.getElementById('title');
var slugInput  = document.getElementById('slug');
var slugPreview = document.getElementById('slug-preview');

if (titleInput && slugInput) {
  titleInput.addEventListener('input', function() {
    // Only auto-fill slug if it's empty (don't overwrite on edit page)
    if (slugInput.getAttribute('data-manual') !== 'true') {
      var slug = titleInput.value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      slugInput.value = slug;
      if (slugPreview) slugPreview.textContent = slug;
    }
  });

  slugInput.addEventListener('input', function() {
    slugInput.setAttribute('data-manual', 'true');
    if (slugPreview) slugPreview.textContent = slugInput.value;
  });
}

// When form submits, copy editor HTML into the hidden textarea
var form = document.querySelector('form');
if (form) {
  form.addEventListener('submit', function() {
    var editor  = document.getElementById('editor');
    var textarea = document.getElementById('content');
    if (editor && textarea) {
      textarea.value = editor.innerHTML;
    }
  });
}

// Pre-fill editor on edit page
window.addEventListener('DOMContentLoaded', function() {
  var editor = document.getElementById('editor');
  if (!editor) return;

  // If editing an existing post, load its content
  if (typeof window._existingContent !== 'undefined' && window._existingContent.trim() !== '') {
    editor.innerHTML = window._existingContent;
  }
});
