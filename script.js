
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Quill editor
  var quill = new Quill('#editor-container', {
    theme: 'snow'
  });

  // Save button listener
  const saveButton = document.getElementById('save-button');
  if (saveButton) {
    saveButton.addEventListener('click', function () {
      const content = quill.root.innerHTML;
      console.log("Editor content:", content);
      alert("Editor content has been logged to the console.");
    });
  }
});
