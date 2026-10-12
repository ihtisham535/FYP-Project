/* ============================================================
   GENERIC TABLE FILTER (used on a couple of flagship pages)
   ============================================================ */
function filterGenericTable(term, containerId){
  const container = document.getElementById(containerId);
  if(!container) return;
  term = term.toLowerCase();
  container.querySelectorAll('tbody tr').forEach(tr=>{
    tr.style.display = tr.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}

