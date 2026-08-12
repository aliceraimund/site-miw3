-- Configurações simples do sistema (chave/valor), editáveis pela própria tela.
-- Primeiro uso: atalho para a pasta do Google Drive onde ficam os laudos.

create table public.configuracoes (
  chave text primary key,
  valor text,
  atualizado_em timestamptz not null default now()
);

alter table public.configuracoes enable row level security;
create policy "auth_all_configuracoes" on public.configuracoes
  for all to authenticated using (true) with check (true);

insert into public.configuracoes (chave, valor) values ('drive_vistorias_url', null)
on conflict (chave) do nothing;
