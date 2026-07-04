export type ExtractedBoletoData = {
  linhaDigitavel: string | null;
  valorCentavos: number | null;
  vencimento: string | null;
};

/**
 * Extração heurística via regex — NÃO é um parser certificado de boletos.
 * Só funciona com PDFs que tenham texto selecionável (a maioria dos boletos
 * gerados digitalmente); um boleto escaneado/foto vira texto vazio e todos
 * os campos saem `null`. Por isso a conta criada a partir daqui SEMPRE fica
 * com status 'rascunho' — o usuário confirma/corrige manualmente antes de
 * qualquer valor ser tratado como definitivo.
 */
export function extractBoletoData(text: string): ExtractedBoletoData {
  const digitsOnly = text.replace(/\D/g, "");

  const linhaDigitavel =
    text.match(/\d{5}\.\d{5}\s?\d{5}\.\d{6}\s?\d{5}\.\d{6}\s?\d\s?\d{14}/)?.[0]?.replace(/\s/g, "") ??
    digitsOnly.match(/\d{47,48}/)?.[0] ??
    null;

  const valorMatch = text.match(/R\$\s*([\d.]+,\d{2})/);
  const valorCentavos = valorMatch
    ? Math.round(parseFloat(valorMatch[1].replace(/\./g, "").replace(",", ".")) * 100)
    : null;

  const dataMatch = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const vencimento = dataMatch ? `${dataMatch[3]}-${dataMatch[2]}-${dataMatch[1]}` : null;

  return { linhaDigitavel, valorCentavos, vencimento };
}
