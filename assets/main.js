// Build ticker content twice for a seamless infinite loop
  const items = [
    {name:'IHSG', price:'7.412,58', chg:'+0,84%', up:true},
    {name:'LQ45', price:'972,14', chg:'+0,61%', up:true},
    {name:'USD/IDR', price:'16.185', chg:'-0,21%', up:false},
    {name:'EUR/USD', price:'1,0842', chg:'-0,08%', up:false},
    {name:'BTC/IDR', price:'1,71 M', chg:'+2,37%', up:true},
    {name:'ETH/IDR', price:'58,9 jt', chg:'-1,20%', up:false},
    {name:'EMAS (XAU)', price:'2.412,60', chg:'+0,45%', up:true},
    {name:'SOL/IDR', price:'3,42 jt', chg:'+7,80%', up:true},
  ];
  const track = document.getElementById('tickerTrack');
  function renderSet(){
    return items.map(i => `
      <span class="ticker-item">
        <span class="name">${i.name}</span>
        <span class="price mono">${i.price}</span>
        <span class="${i.up ? 'arrow-up' : 'arrow-down'} mono">${i.up ? '▲' : '▼'} ${i.chg}</span>
      </span>`).join('');
  }
  track.innerHTML = renderSet() + renderSet();

  // Tab filter (visual only in this mockup)
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
