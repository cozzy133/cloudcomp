FilePond.registerPlugin(
    FilePondPluginFileValidateType,
    FilePondPluginFileEncode,
);

FilePond.setOptions({
    stylePanelAspectRatio: 0.1,
});

// const inputElement = document.querySelector('input[type="file"]');
//
// // create a FilePond instance at the input element location
// const pond = FilePond.create( inputElement, {
//     maxFiles: 3,
//     allowBrowse: true
// });

FilePond.parse(document.body);