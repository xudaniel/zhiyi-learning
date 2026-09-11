// Keep access state separate from the existing learning records.
(()=>{
 const lock=document.getElementById('lockCourse');
 lock.addEventListener('click',()=>{
  try{sessionStorage.removeItem('zhiyi-course-unlock-v1')}catch{}
  try{window.speechSynthesis?.cancel()}catch{}
  location.reload();
 });
})();
