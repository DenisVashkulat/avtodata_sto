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

  const money = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Проверяем сумму
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

  // Показываем сумму
  amountEl.textContent = money.format(amount) + ' ₴';

  // Показываем назначение
  purposeEl.textContent = purpose;

  payBtn.addEventListener('click', () => {
    if (errorEl) {
      errorEl.textContent = '';
    }

    payBtn.disabled = true;
    payBtn.textContent = 'ВІДКРИВАЄМО ОПЛАТУ…';

    /*
      Opendatabot API.

      responseMode=page означает:
      создать счёт и открыть полноценную
      страницу оплаты с выбором банка.
    */

    const form = document.createElement('form');

    form.method = 'POST';
    form.action = 'https://iban.opendatabot.ua/api/invoice';

    /*
      Не используем fetch().
      Обычная HTML POST-форма надёжнее работает
      с редиректом на страницу Opendatabot.
    */

    const fields = {
      code: '2576900131',

      iban: 'UA483348510000000026003139916',

      amount: amount.toFixed(2),

      purpose: purpose,

      responseMode: 'page',

      'x-client-key':
        'BCJvJtx/9OOtsqvPrW8ay9z2yEezLZrIZf6S+rdB6eQ=',

      'x-client-name': 'public'
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');

      input.type = 'hidden';
      input.name = name;
      input.value = value;

      form.appendChild(input);
    });

    document.body.appendChild(form);

    // Отправляем запрос
    form.submit();
  });
})();
