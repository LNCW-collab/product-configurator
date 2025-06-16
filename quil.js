<script>
  var quill = new Quill('#editor-container', {
    theme: 'snow'
  });

  document.addEventListener("DOMContentLoaded", function () {
  // Your existing code (e.g., for the configurator) goes here...

  // 🔽 Add this block to initialize Quill
  var quill = new Quill('#editor-container', {
    theme: 'snow'
  });

  // Optional: Add a save button listener
  const saveButton = document.getElementById('save-button');
  if (saveButton) {
    saveButton.addEventListener('click', function () {
      const content = quill.root.innerHTML;
      console.log("Editor content:", content);
    });
  }
});

</script>
