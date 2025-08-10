// 1. Retrieve the string from localStorage
const dataString = localStorage.getItem('yourKeyName');

// 2. (Optional) Parse it back to object to validate it's correct
const dataObject = JSON.parse(dataString); 

// 3. Convert it back to a pretty JSON string (formatted)
const jsonString = JSON.stringify(dataObject, null, 2);

// 4. Create a Blob (a file-like object of immutable raw data)
const blob = new Blob([jsonString], { type: 'application/json' });

// 5. Create a link element
const link = document.createElement('a');

// 6. Create a URL for the Blob and set it as href
link.href = URL.createObjectURL(blob);

// 7. Set the download attribute to name your file
link.download = 'data.json';

// 8. Append the link to the body
document.body.appendChild(link);

// 9. Programmatically click the link to trigger download
link.click();

// 10. Cleanup: remove the link
document.body.removeChild(link);
