'use client'

import { useEffect, useRef, useState } from 'react'
import type { BlocoTexto } from '@/lib/contrato/documento'
import { blocosTextoParaHtml, elementoParaBlocosTexto } from '@/lib/contrato/documento'

interface VarOpt { chave: string; label: string }

interface Props {
  initialBlocos: BlocoTexto[]
  variaveis: VarOpt[]
  onChange: (blocos: BlocoTexto[]) => void
}

export default function RichTextArea({ initialBlocos, variaveis, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRange = useRef<Range | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [popover, setPopover] = useState(false)
  const [busca, setBusca] = useState('')

  const labelDe = (chave: string) => variaveis.find((v) => v.chave === chave)?.label ?? chave

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = blocosTextoParaHtml(initialBlocos, labelDe)
      try { document.execCommand('defaultParagraphSeparator', false, 'p') } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const serializar = () => {
    if (!editorRef.current) return
    onChange(elementoParaBlocosTexto(editorRef.current))
  }

  const onInput = () => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(serializar, 200)
  }

  const salvarSelecao = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const negrito = (e: React.MouseEvent) => {
    e.preventDefault()
    document.execCommand('bold')
    serializar()
  }

  const blocoAtual = (): HTMLElement | null => {
    const sel = window.getSelection()
    if (!sel || !sel.anchorNode || !editorRef.current) return null
    let n: Node | null = sel.anchorNode
    while (n && n.parentNode !== editorRef.current) n = n.parentNode
    return (n as HTMLElement) ?? null
  }

  const alternarTitulo = (e: React.MouseEvent) => {
    e.preventDefault()
    const bloco = blocoAtual()
    if (!bloco || bloco === editorRef.current) return
    const novaTag = bloco.tagName.toLowerCase() === 'h3' ? 'p' : 'h3'
    const novo = document.createElement(novaTag)
    while (bloco.firstChild) novo.appendChild(bloco.firstChild)
    bloco.replaceWith(novo)
    // reposiciona o cursor no novo bloco
    const sel = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(novo)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
    serializar()
  }

  const abrirPopover = (e: React.MouseEvent) => {
    e.preventDefault()
    salvarSelecao()
    setBusca('')
    setPopover((p) => !p)
  }

  const inserirVariavel = (v: VarOpt) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const sel = window.getSelection()
    if (savedRange.current) {
      sel?.removeAllRanges()
      sel?.addRange(savedRange.current)
    }
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null
    const chip = document.createElement('span')
    chip.className = 'chip-var inline-block rounded bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 mx-0.5 align-baseline'
    chip.setAttribute('data-var', v.chave)
    chip.setAttribute('contenteditable', 'false')
    chip.textContent = v.label
    const espaco = document.createTextNode(' ')
    if (range) {
      range.deleteContents()
      range.insertNode(espaco)
      range.insertNode(chip)
      range.setStartAfter(espaco)
      range.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(range)
    } else {
      editor.appendChild(chip)
      editor.appendChild(espaco)
    }
    setPopover(false)
    serializar()
  }

  const filtradas = variaveis.filter((v) => {
    const t = busca.trim().toLowerCase()
    return !t || v.chave.toLowerCase().includes(t) || v.label.toLowerCase().includes(t)
  })

  return (
    <div className="relative">
      <style>{`
        .doc-edit h3 { text-align:center; font-weight:700; text-transform:uppercase; margin:.6rem 0; font-size:.9rem; }
        .doc-edit p { text-align:justify; margin:.45rem 0; font-size:.85rem; }
        .doc-edit:empty:before { content:'Escreva o contrato aqui...'; color:#94a3b8; }
        .doc-edit:focus { outline:none; }
      `}</style>

      <div className="flex items-center gap-1 mb-2">
        <button type="button" onMouseDown={negrito} className="w-8 h-8 rounded border border-slate-200 text-sm font-bold hover:bg-slate-50" title="Negrito">N</button>
        <button type="button" onMouseDown={alternarTitulo} className="h-8 px-2 rounded border border-slate-200 text-xs font-semibold hover:bg-slate-50" title="Alternar título">Título</button>
        <button type="button" onMouseDown={abrirPopover} className="h-8 px-2 rounded border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50" title="Inserir variável">{'{ }'} Variável</button>
      </div>

      {popover && (
        <div className="absolute z-20 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
          <input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar variável..." className="w-full border border-slate-300 rounded px-2 py-1 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="max-h-56 overflow-y-auto">
            {filtradas.length === 0 && <p className="text-xs text-slate-400 px-1 py-2">Nenhuma variável. Semeie o catálogo à direita.</p>}
            {filtradas.map((v) => (
              <button key={v.chave} type="button" onMouseDown={(e) => { e.preventDefault(); inserirVariavel(v) }} className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 text-xs">
                <span className="text-slate-700">{v.label}</span>
                <code className="block text-[10px] text-slate-400">{v.chave}</code>
              </button>
            ))}
          </div>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); setPopover(false) }} className="mt-1 text-[11px] text-slate-500 hover:text-slate-700">Fechar</button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onBlur={serializar}
        className="doc-edit min-h-[80px] bg-white border border-slate-200 rounded-lg p-4 text-slate-800 leading-relaxed"
      />
    </div>
  )
}
