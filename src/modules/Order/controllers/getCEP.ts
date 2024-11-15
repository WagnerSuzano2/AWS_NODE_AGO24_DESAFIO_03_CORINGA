import AppError from '../../../shared/errors/AppError';
interface ViaCepResponse {
  cep: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
}

const getData = async (cep: string): Promise<ViaCepResponse> => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  let data: ViaCepResponse = await response.json();
  if (!data) {
    throw new AppError('CEP Not found', 400);
  }
  return (data = {
    uf: data.uf,
    localidade: data.localidade,
    cep: data.cep,
  });
};

export { getData };
