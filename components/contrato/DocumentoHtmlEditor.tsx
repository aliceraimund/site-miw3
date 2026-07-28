'use client'

import { useEffect, useRef, useState } from 'react'
import TagsPanel from './TagsPanel'
import type { ContratoTagSistema } from '@/types/contrato-tag'

interface Props {
  htmlInicial: string
  tags: ContratoTagSistema[]
  disabled?: boolean
  onChange: (html: string) => void
}

const TAMANHOS = [
  { label: 'Pequeno', valor: '2' },
  { label: 'Normal', valor: '3' },
  { label: 'Médio', valor: '4' },
  { label: 'Grande', valor: '5' },
]

function Btn({ onAction, title, children, ativo }: { onAction: () => void; title: string; children: React.ReactNode; ativo?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onAction() }}
      className={`h-8 min-w-8 px-2 rounded border text-sm transition-colors ${ativo ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  )
}

export default function DocumentoHtmlEditor({ htmlInicial, tags, disabled, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRange = useRef<Range | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [visualizar, setVisualizar] = useState(false)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = htmlInicial || '<p><br></p>'
      try { document.execCommand('defaultParagraphSeparator', false, 'p') } catch {}
      try { document.execCommand('styleWithCSS', false, 'false') } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const serializar = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  const onInput = () => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(serializar, 250)
  }

  const cmd = (comando: string, valor?: string) => {
    editorRef.current?.focus()
    if (savedRange.current) {
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(savedRange.current)
    }
    document.execCommand(comando, false, valor)
    serializar()
  }

  const salvarSelecao = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const inserirTag = (tag: ContratoTagSistema) => {
    const editor = editorRef.current
    if (!editor || disabled) return
    editor.focus()
    const sel = window.getSelection()
    if (savedRange.current) {
      sel?.removeAllRanges()
      sel?.addRange(savedRange.current)
    }
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null
    const chip = document.createElement('span')
    chip.setAttribute('data-tag', tag.chave)
    chip.setAttribute('contenteditable', 'false')
    chip.className = 'doc-chip'
    chip.textContent = `{${tag.chave}}`
    const espaco = document.createTextNode(' ')
    if (range) {
      range.deleteContents()
      range.insertNode(espaco)
      range.insertNode(chip)
      range.setStartAfter(espaco)
      range.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(range)
      savedRange.current = range.cloneRange()
    } else {
      editor.appendChild(chip)
      editor.appendChild(espaco)
    }
    serializar()
  }

  const inserirPreencher = () => {
    cmd('insertText', '{PREENCHER descreva aqui}')
  }

  const remover = () => {
    if (!editorRef.current) return
    if (!confirm('Remover todo o conteúdo do documento?')) return
    editorRef.current.innerHTML = '<p><br></p>'
    serializar()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <style>{`
        .doc-html h1 { font-size:1.15rem; font-weight:700; text-align:center; margin:.7rem 0; }
        .doc-html h2 { font-size:1rem; font-weight:700; margin:.6rem 0; }
        .doc-html p { text-align:justify; margin:.45rem 0; }
        .doc-html ul { list-style:disc; padding-left:1.4rem; margin:.4rem 0; }
        .doc-html ol { list-style:decimal; padding-left:1.4rem; margin:.4rem 0; }
        .doc-html .doc-chip, .doc-html span[data-tag] {
          background:#dbeafe; color:#1e40af; border-radius:4px; padding:1px 5px;
          font-size:.8em; white-space:nowrap;
        }
        .doc-html:focus { outline:none; }
      `}</style>

      <div className="lg:col-span-3 space-y-2">
        {!disabled && (
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-2">
            <select
              onMouseDown={salvarSelecao}
              onChange={(e) => { cmd('fontSize', e.target.value); e.target.selectedIndex = 0 }}
              className="h-8 border border-slate-200 rounded px-2 text-xs text-slate-600"
              defaultValue=""
            >
              <option value="" disabled>Tamanho</option>
              {TAMANHOS.map((t) => <option key={t.valor} value={t.valor}>{t.label}</option>)}
            </select>
            <Btn onAction={() => cmd('formatBlock', '<h1>')} title="Título">T1</Btn>
            <Btn onAction={() => cmd('formatBlock', '<h2>')} title="Subtítulo">T2</Btn>
            <Btn onAction={() => cmd('formatBlock', '<p>')} title="Parágrafo">¶</Btn>
            <span className="w-px h-6 bg-slate-200 mx-1" />
            <Btn onAction={() => cmd('bold')} title="Negrito"><b>N</b></Btn>
            <Btn onAction={() => cmd('italic')} title="Itálico"><i>I</i></Btn>
            <Btn onAction={() => cmd('underline')} title="Sublinhado"><u>S</u></Btn>
            <span className="w-px h-6 bg-slate-200 mx-1" />
            <Btn onAction={() => cmd('justifyLeft')} title="Alinhar à esquerda">⯇</Btn>
            <Btn onAction={() => cmd('justifyCenter')} title="Centralizar">≡</Btn>
            <Btn onAction={() => cmd('justifyFull')} title="Justificar">▤</Btn>
            <span className="w-px h-6 bg-slate-200 mx-1" />
            <Btn onAction={() => cmd('insertUnorderedList')} title="Lista com marcadores">• —</Btn>
            <Btn onAction={() => cmd('insertOrderedList')} title="Lista numerada">1.</Btn>
            <span className="w-px h-6 bg-slate-200 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); inserirPreencher() }}
              className="h-8 px-2 rounded border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-50"
              title="Inserir marcador manual"
            >
              {'{PREENCHER}'}
            </button>
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={onInput}
          onBlur={() => { salvarSelecao(); serializar() }}
          onKeyUp={salvarSelecao}
          onMouseUp={salvarSelecao}
          className="doc-html min-h-[420px] bg-white border border-slate-200 rounded-lg p-8 text-slate-800 text-sm leading-relaxed shadow-sm"
        />

        {!disabled && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setVisualizar(true)} className="text-xs text-slate-700 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50">
              Visualizar documento
            </button>
            <button type="button" onClick={remover} className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
              Remover documento
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <TagsPanel tags={tags} onInserir={inserirTag} disabled={disabled} />
      </div>

      {visualizar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setVisualizar(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-10" onClick={(e) => e.stopPropagation()}>
            <div className="doc-html text-sm text-slate-800" dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML ?? '' }} />
          </div>
        </div>
      )}
    </div>
  )
}
