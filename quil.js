<script>
document.addEventListener("DOMContentLoaded", function () {
  var quill = new Quill('#editor-container', {
    theme: 'snow'
  });

  const saveButton = document.getElementById('save-button');
  if (saveButton) {
    saveButton.addEventListener('click', function () {
      const content = quill.root.innerHTML;
      console.log("Editor content:", content);
      alert("Editor content logged to console.");
    });
  }
});
</script>
