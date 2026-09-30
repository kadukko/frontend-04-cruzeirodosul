// Formatação de datas usando a biblioteca externa Day.js (carregada via CDN em index.html).
// Se a biblioteca não carregar (sem internet, CDN fora do ar), usamos Intl como alternativa,
// garantindo que a aplicação continue funcionando (degradação elegante).

let configurado = false;

function dayjsDisponivel() {
  const dayjs = globalThis.dayjs;
  if (!dayjs) return null;
  if (!configurado) {
    if (globalThis.dayjs_plugin_relativeTime) dayjs.extend(globalThis.dayjs_plugin_relativeTime);
    dayjs.locale('pt-br');
    configurado = true;
  }
  return dayjs;
}

/** "há 5 minutos", "há 2 dias"… */
export function tempoRelativo(iso) {
  const dayjs = dayjsDisponivel();
  if (dayjs && dayjs.prototype.fromNow) return dayjs(iso).fromNow();
  return formatarDataHora(iso);
}

/** "29/09/2026 às 14:30" */
export function formatarDataHora(iso) {
  const dayjs = dayjsDisponivel();
  if (dayjs) return dayjs(iso).format('DD/MM/YYYY [às] HH:mm');
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

/** "1990-05-10" -> "10/05/1990" */
export function formatarData(isoData) {
  if (!isoData) return '';
  const [a, m, d] = isoData.split('-');
  return `${d}/${m}/${a}`;
}

/** Idade completa em anos a partir de "AAAA-MM-DD". */
export function calcularIdade(isoData, hoje = new Date()) {
  const [a, m, d] = isoData.split('-').map(Number);
  let idade = hoje.getFullYear() - a;
  const aindaNaoFez = hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d);
  if (aindaNaoFez) idade -= 1;
  return idade;
}

/** Data (AAAA-MM-DD) de quem completa `anos` hoje; usada no atributo max do campo de nascimento. */
export function dataLimiteIdade(anos, hoje = new Date()) {
  const d = new Date(hoje.getFullYear() - anos, hoje.getMonth(), hoje.getDate());
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
