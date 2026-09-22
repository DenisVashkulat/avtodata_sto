(() => {
  const params = new URLSearchParams(location.search);
  const amountRaw = (params.get('amount') || '').replace(',', '.');
  const amount = Number(amountRaw);
  const purpose = (params.get('purpose') || 'Оплата за ремонт автомобіля').trim();

  const amountEl = document.getElementById('amount');
  const purposeEl = document.getElementById('purpose');
  const payBtn = document.getElementById('pay');
  const errorEl = document.getElementById('error');

  const money = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const validAmount = Number.isFinite(amount) && amount > 0 && amount <= 100000000;

  if (!validAmount) {
    amountEl.textContent = 'Невірна сума';
    purposeEl.textContent = '';
    payBtn.disabled = true;
    payBtn.style.opacity = '0.5';
    return;
  }

  amountEl.textContent = money.format(amount) + ' ₴';
  purposeEl.textContent = purpose;

  payBtn.addEventListener('click', () => {
    errorEl.textContent = '';

    const paymentUrl = new URL('https://iban.opendatabot.ua/');
    paymentUrl.searchParams.set('amount', amount.toFixed(2));
    paymentUrl.searchParams.set('iban', 'UA483348510000000026003139916');
    paymentUrl.searchParams.set('code', '2576900131');
    paymentUrl.searchParams.set('purpose', purpose);

    // Direct navigation works on both iPhone and Android
    // and avoids popup/blocking issues.
    window.location.assign(paymentUrl.toString());
  });
})();