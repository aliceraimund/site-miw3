import { type Imovel } from '@/types/imovel'
import { formatCurrency } from '@/lib/utils'

interface Props {
  imovel: Pick<Imovel, 'disponivel_para' | 'preco_venda' | 'preco_locacao' | 'iptu' | 'valor_livre'>
  compact?: boolean
}

export default function PriceDisplay({ imovel, compact = false }: Props) {
  const { disponivel_para, preco_venda, preco_locacao, iptu, valor_livre } = imovel

  if (compact) {
    return (
      <div className="space-y-1">
        {(disponivel_para === 'venda' || disponivel_para === 'ambos') && preco_venda && (
          <p className="text-slate-900 font-semibold">
            <span className="text-xs font-normal text-slate-500 mr-1">Venda</span>
            {formatCurrency(preco_venda)}
          </p>
        )}
        {(disponivel_para === 'locacao' || disponivel_para === 'ambos') && preco_locacao && (
          <p className="text-slate-900 font-semibold">
            <span className="text-xs font-normal text-slate-500 mr-1">Locação</span>
            {formatCurrency(preco_locacao)}/mês
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(disponivel_para === 'venda' || disponivel_para === 'ambos') && (
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Venda</p>
          {preco_venda ? (
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(preco_venda)}</p>
          ) : (
            <p className="text-slate-500 italic">Consultar</p>
          )}
        </div>
      )}

      {(disponivel_para === 'locacao' || disponivel_para === 'ambos') && (
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Locação</p>
          {preco_locacao ? (
            <>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(preco_locacao)}
                <span className="text-base font-normal text-slate-500">/mês</span>
              </p>
              {valor_livre && (
                <p className="text-xs text-slate-400 mt-1 italic">
                  Valor livre ao proprietário — comissão de administração a acrescer
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-500 italic">Consultar</p>
          )}
          {iptu && (
            <p className="text-sm text-slate-600 mt-2">
              IPTU: <span className="font-medium">{formatCurrency(iptu)}/mês</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
