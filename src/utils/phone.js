const onlyDigits = (value) => String(value || '').replace(/\D+/g, '');

const formatLocalNumber = (value) => {
  if (!value) return '';
  if (value.length <= 4) return value;
  return `${value.slice(0, value.length - 4)} ${value.slice(-4)}`.trim();
};

export function formatArgentinaPhoneInput(rawPhone) {
  const raw = String(rawPhone || '').trim();
  if (!raw) return '';

  let digits = onlyDigits(raw);
  if (!digits) return '';

  if (digits.startsWith('00')) digits = digits.slice(2);

  let national = digits;
  if (digits.startsWith('54')) national = digits.slice(2);
  else if (digits.startsWith('0')) national = digits.slice(1);

  if (!national) return '+54';

  if (national.length >= 11) {
    for (let areaLen = 2; areaLen <= 4; areaLen += 1) {
      if (national.slice(areaLen, areaLen + 2) === '15') {
        national = `${national.slice(0, areaLen)}${national.slice(areaLen + 2)}`;
        break;
      }
    }
  }

  const hasMobilePrefix = national.startsWith('9');
  const numberWithout9 = hasMobilePrefix ? national.slice(1) : national;

  let areaLen = 2;
  if (numberWithout9.length >= 11) areaLen = 3;
  if (numberWithout9.length >= 12) areaLen = 4;

  const area = numberWithout9.slice(0, areaLen);
  const local = numberWithout9.slice(areaLen);
  const localFormatted = formatLocalNumber(local);

  const mobilePart = hasMobilePrefix ? '9 ' : '';
  return `+54 ${mobilePart}${area}${localFormatted ? ` ${localFormatted}` : ''}`.trim();
}

export function normalizeArgentinaPhone(rawPhone) {
  const raw = String(rawPhone || '').trim();
  if (!raw) return { ok: false, e164: '', reason: 'empty' };

  let digits = onlyDigits(raw);
  if (!digits) return { ok: false, e164: '', reason: 'no_digits' };

  if (digits.startsWith('00')) digits = digits.slice(2);

  let national = digits;
  if (digits.startsWith('54')) {
    national = digits.slice(2);
  } else if (digits.startsWith('0')) {
    national = digits.slice(1);
  }

  if (!national) return { ok: false, e164: '', reason: 'empty_national' };

  if (national.length >= 11) {
    for (let areaLen = 2; areaLen <= 4; areaLen += 1) {
      if (national.slice(areaLen, areaLen + 2) === '15') {
        const candidate = `${national.slice(0, areaLen)}${national.slice(areaLen + 2)}`;
        if (candidate.length >= 10 && candidate.length <= 13) {
          national = candidate;
          break;
        }
      }
    }
  }

  if (national.startsWith('549')) national = national.slice(1);
  if (national.startsWith('54')) national = national.slice(2);

  if (national.length < 10 || national.length > 13) {
    return { ok: false, e164: '', reason: 'invalid_length' };
  }

  return { ok: true, e164: `+54${national}` };
}
