const $ = id => document.getElementById(id);

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

function val(v) {
  const n = Number(String(v).replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

$('create').onclick = () => {
  const a = val($('amount').value);
  const fop = FOPS[$('fop').value];

  if (!a) {
    $('status').textContent = 'Введи правильну суму.';
    return;
  }

  const u = new URL('pay.html', location.href);
  u.searchParams.set('amount', a.toFixed(2));
  u.searchParams.set('purpose', $('purpose').value.trim() || 'Оплата згідно накладної');
  u.searchParams.set('fop', $('fop').value);

  $('link').value = u.href;
  $('result').classList.remove('hidden');
  $('status').textContent = 'Отримувач: ' + fop.name;
};

$('copy').onclick = async () => {
  try {
    await navigator.clipboard.writeText($('link').value);
    $('status').textContent = 'Посилання скопійовано.';
  } catch {
    $('link').select();
    document.execCommand('copy');
    $('status').textContent = 'Посилання скопійовано.';
  }
};

$('open').onclick = () => location.href = $('link').value;