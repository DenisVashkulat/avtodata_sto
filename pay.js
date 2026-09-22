(() => {
  const params = new URLSearchParams(location.search);

  const amountRaw = (params.get('amount') || '').replace(',', '.');
  const amount = Number(amountRaw);

  const purpose =
    (params.get('purpose') || 'Оплата за ремонт автомобіля').trim();

  const amountEl = document.getElementById('amount');
  const purposeEl = document.getElementById('purpose');
  const payBtn = document.getElementById('pay');
  const errorEl = document.getElementById('error');
  const paymentAmount = document.getElementById('paymentAmount');
  const paymentPurpose = document.getElementById('paymentPurpose');

  const money = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const validAmount =
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= 100000000;

  if (!validAmount) {
    amountEl.textContent = 'Невірна сума';
    purposeEl.textContent = '';
    payBtn.disabled = true;
    payBtn.style.opacity = '0.5';

    if (errorEl) {
      errorEl.textContent = 'Перевірте суму оплати.';
    }
    return;
  }

  amountEl.textContent = money.format(amount) + ' ₴';
  purposeEl.textContent = purpose;

  paymentAmount.value = amount.toFixed(2);
  paymentPurpose.value = purpose;

  document.getElementById('paymentForm').addEventListener('submit', () => {
    payBtn.disabled = true;
    payBtn.textContent = 'ВІДКРИВАЄМО ОПЛАТУ…';
  });
})();