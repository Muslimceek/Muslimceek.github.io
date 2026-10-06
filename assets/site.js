(() => {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  const items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('in'));
  }

  const rateEls = document.querySelectorAll('[data-rate]');
  if (rateEls.length) {
    fetch('https://open.er-api.com/v6/latest/TRY').then(r => r.json()).then(d => {
      const r = d.rates;
      const v = { USD: (1 / r.USD).toFixed(2), EUR: (1 / r.EUR).toFixed(2), UZS: r.UZS.toFixed(1) };
      rateEls.forEach(el => { if (v[el.dataset.rate]) el.textContent = v[el.dataset.rate].replace('.', ','); });
    }).catch(() => {});
  }

  document.querySelectorAll('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); btn.textContent = btn.dataset.done; }
    } catch (e) {}
  }));
})();
