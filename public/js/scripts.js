$(document).ready(function() {$('#summernote').summernote( {  // Customization Options: https://summernote.org/deep-dive/
    height: 300,
    minHeight: 200,             
    maxHeight: 800,
    toolbar: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['insert', ['link']],
        ['view', ['codeview']]
    ]
})});