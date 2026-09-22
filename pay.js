(() => {
  const params = new URLSearchParams(location.search);

  const FOPS = {
    fop1: {
      name: 'Авто Фортуна',
      code: '2576900131',
      iban: 'UA483348510000000026003139916'
    },
    fop2: {
      name: 'ФОП Вашкулат Олександр Васильович',
      code: '2554204414',
      iban: 'UA973348510000000026004270636'
    }
  };

  const fop = FOPS[params.get('fop') || 'fop1'];

  const amountRaw = (params.get('amount') || '').replace(',', '.');
  const amount = Number(amountRaw);
  const purpose = (params.get('purpose') || 'Оплата згідно накладної').trim();

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
    errorEl.textContent = 'Перевірте суму оплати.';
    return;
  }

  amountEl.textContent = money.format(amount) + ' ₴';
  purposeEl.textContent = purpose;

  document.getElementById('recipient').textContent = fop.name;
  document.getElementById('ibanDisplay').textContent =
    fop.iban.replace(/^(.{4})(?=.)/, '$1 ');

  document.getElementById('paymentCode').value = fop.code;
  document.getElementById('paymentIban').value = fop.iban;
  document.getElementById('paymentAmount').value = amount.toFixed(2);
  document.getElementById('paymentPurpose').value = purpose;

  document.getElementById('paymentForm').addEventListener('submit', () => {
    payBtn.disabled = true;
    payBtn.textContent = 'ВІДКРИВАЄМО ОПЛАТУ…';
  });
})();