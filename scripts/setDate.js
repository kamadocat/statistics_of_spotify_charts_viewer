const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yyyy = yesterday.getFullYear();
const mm = ("0" + (yesterday.getMonth()+1)).slice(-2);
const dd = ("0" + yesterday.getDate()).slice(-2);
let playlistDate = document.getElementById("playlistDate");
playlistDate.value = `${yyyy}-${mm}-${dd}`;
playlistDate.max = `${yyyy}-${mm}-${dd}`;